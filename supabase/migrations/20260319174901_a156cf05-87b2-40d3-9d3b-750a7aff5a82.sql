-- Email send log for tracking all transactional and auth email delivery
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text,
  template_name text,
  recipient_email text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_send_log_message_id ON public.email_send_log(message_id);
CREATE INDEX idx_email_send_log_created_at ON public.email_send_log(created_at DESC);
CREATE INDEX idx_email_send_log_status ON public.email_send_log(status);
CREATE INDEX idx_email_send_log_template ON public.email_send_log(template_name);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_send_log"
ON public.email_send_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can read email_send_log"
ON public.email_send_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);