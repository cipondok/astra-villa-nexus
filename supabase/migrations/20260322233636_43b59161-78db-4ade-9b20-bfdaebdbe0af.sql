
-- Server-side login attempts with geo and risk scoring
CREATE TABLE IF NOT EXISTS public.server_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  device_fingerprint text,
  country text,
  city text,
  user_agent text,
  success boolean NOT NULL DEFAULT false,
  failure_reason text,
  risk_score integer DEFAULT 0,
  is_suspicious boolean DEFAULT false,
  geo_anomaly boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_server_login_attempts_email_time ON public.server_login_attempts(email, created_at DESC);
CREATE INDEX idx_server_login_attempts_ip ON public.server_login_attempts(ip_address, created_at DESC);

-- Server-side lockout tracking (persistent across devices)
CREATE TABLE IF NOT EXISTS public.server_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now(),
  unlock_at timestamptz NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  lockout_tier integer NOT NULL DEFAULT 1,
  ip_address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_server_lockouts_email_active ON public.server_lockouts(email, is_active) WHERE is_active = true;

-- User security events for the security activity page
CREATE TABLE IF NOT EXISTS public.user_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text,
  ip_address text,
  country text,
  city text,
  device_info text,
  risk_level text DEFAULT 'low',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_security_events_user ON public.user_security_events(user_id, created_at DESC);

-- RLS policies
ALTER TABLE public.server_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_events ENABLE ROW LEVEL SECURITY;

-- server_login_attempts: service role only (edge function)
CREATE POLICY "Service role only" ON public.server_login_attempts FOR ALL USING (false);

-- server_lockouts: service role only
CREATE POLICY "Service role only" ON public.server_lockouts FOR ALL USING (false);

-- user_security_events: users can read their own events
CREATE POLICY "Users can view own security events"
  ON public.user_security_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Signup rate limiting table
CREATE TABLE IF NOT EXISTS public.signup_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email_domain text,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  is_blocked boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signup_rate_ip ON public.signup_rate_limits(ip_address, window_start DESC);

ALTER TABLE public.signup_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.signup_rate_limits FOR ALL USING (false);
