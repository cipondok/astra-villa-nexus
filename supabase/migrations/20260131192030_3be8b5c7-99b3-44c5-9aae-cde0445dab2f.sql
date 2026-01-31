-- =============================================
-- COMPREHENSIVE API RATE LIMITING SYSTEM
-- =============================================

-- Rate limit configuration per endpoint
CREATE TABLE public.rate_limit_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_pattern TEXT NOT NULL UNIQUE,
  endpoint_name TEXT NOT NULL,
  requests_per_window INTEGER NOT NULL DEFAULT 100,
  window_seconds INTEGER NOT NULL DEFAULT 60,
  burst_limit INTEGER DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'authenticated', 'anonymous', 'api_key')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate limit entries (sliding window tracking)
CREATE TABLE public.rate_limit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user', 'api_key')),
  endpoint_pattern TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_entries_lookup ON public.rate_limit_entries(identifier, endpoint_pattern, window_end);
CREATE INDEX idx_rate_limit_entries_cleanup ON public.rate_limit_entries(window_end);

-- Rate limit violations log
CREATE TABLE public.rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user', 'api_key')),
  endpoint_pattern TEXT NOT NULL,
  violation_count INTEGER NOT NULL DEFAULT 1,
  first_violation_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_violation_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  request_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_violations_identifier ON public.rate_limit_violations(identifier, identifier_type);
CREATE INDEX idx_rate_limit_violations_time ON public.rate_limit_violations(last_violation_at DESC);

-- Blocked IPs table
CREATE TABLE public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  violation_count INTEGER NOT NULL DEFAULT 0,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  blocked_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blocked_ips_address ON public.blocked_ips(ip_address);

-- Partner API keys
CREATE TABLE public.partner_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL UNIQUE,
  partner_name TEXT NOT NULL,
  partner_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_whitelisted BOOLEAN NOT NULL DEFAULT false,
  rate_limit_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  custom_limits JSONB DEFAULT '{}',
  allowed_endpoints TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_requests BIGINT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_api_keys_active ON public.partner_api_keys(api_key, is_active);

-- Whitelisted IPs (bypass rate limiting)
CREATE TABLE public.whitelisted_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate limit analytics (hourly aggregations)
CREATE TABLE public.rate_limit_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hour_bucket TIMESTAMPTZ NOT NULL,
  endpoint_pattern TEXT NOT NULL,
  total_requests BIGINT NOT NULL DEFAULT 0,
  blocked_requests BIGINT NOT NULL DEFAULT 0,
  unique_ips INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  avg_requests_per_ip DECIMAL(10,2),
  top_ips JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hour_bucket, endpoint_pattern)
);

CREATE INDEX idx_rate_limit_analytics_time ON public.rate_limit_analytics(hour_bucket DESC);

-- Enable RLS
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelisted_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only
CREATE POLICY "Admins can manage rate limit config"
  ON public.rate_limit_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view rate limit entries"
  ON public.rate_limit_entries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage violations"
  ON public.rate_limit_violations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blocked IPs"
  ON public.blocked_ips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage API keys"
  ON public.partner_api_keys FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage whitelisted IPs"
  ON public.whitelisted_ips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view analytics"
  ON public.rate_limit_analytics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default rate limit configurations
INSERT INTO public.rate_limit_config (endpoint_pattern, endpoint_name, requests_per_window, window_seconds, burst_limit) VALUES
  ('search', 'Property Search', 100, 60, 20),
  ('listings', 'Property Listings', 20, 60, 5),
  ('messages', 'Messaging', 50, 60, 10),
  ('auth', 'Authentication', 10, 60, 3),
  ('upload', 'File Upload', 10, 60, 2),
  ('ai', 'AI Features', 20, 60, 5),
  ('default', 'Default', 60, 60, 15);

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_ips
    WHERE ip_address = check_ip
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to check if IP is whitelisted
CREATE OR REPLACE FUNCTION public.is_ip_whitelisted(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.whitelisted_ips
    WHERE ip_address = check_ip
  )
$$;

-- Function to auto-block IP after violations threshold
CREATE OR REPLACE FUNCTION public.auto_block_ip_on_violations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_violations INTEGER;
  violation_threshold INTEGER := 5;
BEGIN
  -- Count violations in last hour
  SELECT COUNT(*) INTO total_violations
  FROM public.rate_limit_violations
  WHERE identifier = NEW.identifier
    AND identifier_type = 'ip'
    AND last_violation_at > now() - INTERVAL '1 hour';
  
  -- Auto-block if threshold exceeded
  IF total_violations >= violation_threshold THEN
    INSERT INTO public.blocked_ips (ip_address, reason, violation_count)
    VALUES (NEW.identifier, 'Auto-blocked: exceeded ' || violation_threshold || ' violations in 1 hour', total_violations)
    ON CONFLICT (ip_address) DO UPDATE SET
      violation_count = EXCLUDED.violation_count,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_block_ip
  AFTER INSERT ON public.rate_limit_violations
  FOR EACH ROW
  WHEN (NEW.identifier_type = 'ip')
  EXECUTE FUNCTION public.auto_block_ip_on_violations();

-- Cleanup function for old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_entries
  WHERE window_end < now() - INTERVAL '1 hour';
END;
$$;