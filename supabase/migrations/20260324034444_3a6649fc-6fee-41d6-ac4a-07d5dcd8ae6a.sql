-- Fix ai_jobs RLS policy: replace ALL policy with separate policies that have proper WITH CHECK
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.ai_jobs;

CREATE POLICY "Admins can read jobs"
ON public.ai_jobs FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can insert jobs"
ON public.ai_jobs FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can update jobs"
ON public.ai_jobs FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete jobs"
ON public.ai_jobs FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));