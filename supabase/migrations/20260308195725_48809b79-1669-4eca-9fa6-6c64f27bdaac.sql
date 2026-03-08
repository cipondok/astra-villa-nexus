
-- AI Job Queue System
CREATE TABLE public.ai_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL CHECK (job_type IN ('seo_optimize', 'seo_scan', 'investment_analysis')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  payload jsonb DEFAULT '{}'::jsonb,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_tasks integer NOT NULL DEFAULT 0,
  completed_tasks integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text
);

CREATE TABLE public.ai_job_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.ai_jobs(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_ai_jobs_status ON public.ai_jobs(status);
CREATE INDEX idx_ai_jobs_created_by ON public.ai_jobs(created_by);
CREATE INDEX idx_ai_job_tasks_job_id ON public.ai_job_tasks(job_id);
CREATE INDEX idx_ai_job_tasks_status ON public.ai_job_tasks(status);

ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_job_tasks ENABLE ROW LEVEL SECURITY;

-- Admin-only access via admin_users table
CREATE POLICY "Admins can manage jobs" ON public.ai_jobs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage job tasks" ON public.ai_job_tasks
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Service role needs full access for the worker
CREATE POLICY "Service role full access jobs" ON public.ai_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access tasks" ON public.ai_job_tasks
  FOR ALL TO service_role USING (true) WITH CHECK (true);
