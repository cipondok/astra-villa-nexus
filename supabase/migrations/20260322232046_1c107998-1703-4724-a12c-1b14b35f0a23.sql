
-- Login activity log table for security monitoring
CREATE TABLE IF NOT EXISTS public.login_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  ip_address text,
  country text,
  device_fingerprint text,
  device_type text,
  browser text,
  os text,
  login_timestamp timestamptz NOT NULL DEFAULT now(),
  login_success boolean NOT NULL DEFAULT false,
  failure_reason text,
  risk_score integer DEFAULT 0,
  is_suspicious boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_login_activity_user_id ON public.login_activity_log(user_id);
CREATE INDEX idx_login_activity_email ON public.login_activity_log(email);
CREATE INDEX idx_login_activity_timestamp ON public.login_activity_log(login_timestamp DESC);
CREATE INDEX idx_login_activity_suspicious ON public.login_activity_log(is_suspicious) WHERE is_suspicious = true;

-- RLS
ALTER TABLE public.login_activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all via has_role
CREATE POLICY "Admins can view all login activity"
  ON public.login_activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own login activity
CREATE POLICY "Users can view own login activity"
  ON public.login_activity_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Insert allowed for authenticated (edge function uses service role anyway)
CREATE POLICY "Allow insert login activity"
  ON public.login_activity_log FOR INSERT TO authenticated
  WITH CHECK (true);

-- Disposable email domains table
CREATE TABLE IF NOT EXISTS public.disposable_email_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disposable_email_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read disposable domains"
  ON public.disposable_email_domains FOR SELECT
  USING (true);

-- Seed common disposable email domains
INSERT INTO public.disposable_email_domains (domain) VALUES
  ('tempmail.com'), ('throwaway.email'), ('guerrillamail.com'), ('mailinator.com'),
  ('yopmail.com'), ('10minutemail.com'), ('trashmail.com'), ('fakeinbox.com'),
  ('sharklasers.com'), ('guerrillamailblock.com'), ('grr.la'), ('dispostable.com'),
  ('temp-mail.org'), ('tempail.com'), ('mohmal.com'), ('maildrop.cc'),
  ('mailnesia.com'), ('getnada.com'), ('emailondeck.com'), ('33mail.com')
ON CONFLICT (domain) DO NOTHING;

-- Consent log table for compliance
CREATE TABLE IF NOT EXISTS public.consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type text NOT NULL,
  consent_given boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent"
  ON public.consent_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consent"
  ON public.consent_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
