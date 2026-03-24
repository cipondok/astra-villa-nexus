-- 1) Fix RLS on the CORRECT table: ai_image_jobs (not ai_jobs)
DROP POLICY IF EXISTS "Service role full access on ai_image_jobs" ON public.ai_image_jobs;

CREATE POLICY "Admins can read image jobs"
ON public.ai_image_jobs FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert image jobs"
ON public.ai_image_jobs FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update image jobs"
ON public.ai_image_jobs FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete image jobs"
ON public.ai_image_jobs FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ai_image_jobs_stuck 
ON public.ai_image_jobs (status, started_at) 
WHERE status = 'processing';

CREATE OR REPLACE FUNCTION public.reset_stuck_image_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reset_count integer;
BEGIN
  UPDATE ai_image_jobs
  SET status = 'pending', 
      worker_id = NULL, 
      started_at = NULL, 
      error_message = 'Auto-reset: stuck in processing > 15 min',
      updated_at = now()
  WHERE status = 'processing' 
    AND started_at < now() - interval '15 minutes';
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$;