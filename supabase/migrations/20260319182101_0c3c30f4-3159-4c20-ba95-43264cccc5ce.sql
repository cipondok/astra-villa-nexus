-- Enable pgmq extension
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create email queues
SELECT pgmq.create('auth_emails');
SELECT pgmq.create('transactional_emails');

-- Create email_send_state table for rate-limit state and throughput settings
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id integer PRIMARY KEY DEFAULT 1,
  is_rate_limited boolean DEFAULT false,
  rate_limited_until timestamptz,
  batch_size integer DEFAULT 10,
  send_delay_ms integer DEFAULT 200,
  auth_email_ttl_minutes integer DEFAULT 15,
  transactional_email_ttl_minutes integer DEFAULT 60,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create enqueue_email RPC function
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pgmq.send(queue_name, payload);
END;
$$;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;

-- RLS on email_send_state
ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.email_send_state
  FOR SELECT TO authenticated USING (true);