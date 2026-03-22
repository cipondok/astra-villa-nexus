DO $$ BEGIN
  ALTER TABLE public.server_login_attempts ADD COLUMN continent_code text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email text,
  device_fingerprint text,
  signup_risk_score integer DEFAULT 0,
  is_blocked boolean DEFAULT false,
  block_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for signup_attempts"
  ON public.signup_attempts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip_created
  ON public.signup_attempts (ip_address, created_at DESC);

CREATE TABLE IF NOT EXISTS public.trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  device_name text,
  device_type text,
  browser text,
  os text,
  trusted_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(user_id, device_fingerprint)
);

ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own trusted devices"
  ON public.trusted_devices FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.kyc_provider_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL UNIQUE,
  provider_type text NOT NULL DEFAULT 'manual',
  is_active boolean DEFAULT false,
  api_endpoint text,
  webhook_endpoint text,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.kyc_provider_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for kyc_provider_config"
  ON public.kyc_provider_config FOR ALL TO service_role
  USING (true) WITH CHECK (true);

INSERT INTO public.kyc_provider_config (provider_name, provider_type, is_active)
VALUES ('manual', 'manual', true)
ON CONFLICT (provider_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text,
  metadata jsonb DEFAULT '{}',
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own alerts"
  ON public.security_alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages alerts"
  ON public.security_alerts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_created
  ON public.security_alerts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_alerts_unresolved
  ON public.security_alerts (is_resolved, created_at DESC);