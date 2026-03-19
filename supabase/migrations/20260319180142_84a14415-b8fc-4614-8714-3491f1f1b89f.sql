-- Suppressed emails table (bounces, complaints, unsubscribes)
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  reason text NOT NULL DEFAULT 'unsubscribe',
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, reason)
);

CREATE INDEX idx_suppressed_emails_email ON public.suppressed_emails(email);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on suppressed_emails"
ON public.suppressed_emails
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can read suppressed_emails"
ON public.suppressed_emails
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Unsubscribe tokens table (one token per email)
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_unsubscribe_tokens"
ON public.email_unsubscribe_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to get or create unsubscribe token for an email
CREATE OR REPLACE FUNCTION public.get_unsubscribe_token(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  SELECT token INTO v_token FROM email_unsubscribe_tokens WHERE email = p_email;
  IF v_token IS NULL THEN
    INSERT INTO email_unsubscribe_tokens (email)
    VALUES (p_email)
    ON CONFLICT (email) DO NOTHING
    RETURNING token INTO v_token;
    IF v_token IS NULL THEN
      SELECT token INTO v_token FROM email_unsubscribe_tokens WHERE email = p_email;
    END IF;
  END IF;
  RETURN v_token;
END;
$$;

-- Function to check if an email is suppressed
CREATE OR REPLACE FUNCTION public.is_email_suppressed(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM suppressed_emails WHERE email = p_email
  );
$$;