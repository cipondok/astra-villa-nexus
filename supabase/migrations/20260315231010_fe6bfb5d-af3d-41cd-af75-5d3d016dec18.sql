CREATE TABLE IF NOT EXISTS public.ai_scheduled_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  job_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  cron_expression text NOT NULL,
  cron_label text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 5,
  max_retries integer NOT NULL DEFAULT 3,
  retry_count integer NOT NULL DEFAULT 0,
  last_error text,
  last_status text NOT NULL DEFAULT 'idle',
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled jobs" ON public.ai_scheduled_jobs
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);