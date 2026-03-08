
-- Add priority to ai_jobs
ALTER TABLE public.ai_jobs ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 5;

-- Add retry_count to ai_job_tasks
ALTER TABLE public.ai_job_tasks ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0;

-- Create ai_job_logs table
CREATE TABLE IF NOT EXISTS public.ai_job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.ai_jobs(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES public.ai_job_tasks(id) ON DELETE SET NULL,
  message text NOT NULL,
  level text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_job_logs_job_id ON public.ai_job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_job_logs_created_at ON public.ai_job_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_priority_status ON public.ai_jobs(priority ASC, created_at ASC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_ai_jobs_stalled ON public.ai_jobs(started_at) WHERE status = 'running';

-- Enable RLS
ALTER TABLE public.ai_job_logs ENABLE ROW LEVEL SECURITY;

-- RLS: service role can do everything, authenticated can read
CREATE POLICY "Service role full access on ai_job_logs"
  ON public.ai_job_logs FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read ai_job_logs"
  ON public.ai_job_logs FOR SELECT
  TO authenticated USING (true);

-- Function to recover stalled jobs (called by worker)
CREATE OR REPLACE FUNCTION public.recover_stalled_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recovered integer;
BEGIN
  WITH stalled AS (
    UPDATE ai_jobs
    SET status = 'pending', started_at = NULL
    WHERE status = 'running'
      AND started_at < now() - interval '30 minutes'
    RETURNING id
  )
  SELECT count(*) INTO recovered FROM stalled;

  -- Also reset running tasks from stalled jobs
  UPDATE ai_job_tasks
  SET status = 'pending'
  WHERE status = 'running'
    AND job_id IN (
      SELECT id FROM ai_jobs WHERE status = 'pending' AND started_at IS NULL
    );

  RETURN recovered;
END;
$$;

-- Function to claim next job with SKIP LOCKED
CREATE OR REPLACE FUNCTION public.claim_next_job()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_id uuid;
BEGIN
  SELECT id INTO claimed_id
  FROM ai_jobs
  WHERE status = 'pending'
  ORDER BY priority ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF claimed_id IS NOT NULL THEN
    UPDATE ai_jobs
    SET status = 'running', started_at = now()
    WHERE id = claimed_id;
  END IF;

  RETURN claimed_id;
END;
$$;
