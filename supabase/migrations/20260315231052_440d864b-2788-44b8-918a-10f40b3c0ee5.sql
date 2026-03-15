DROP POLICY IF EXISTS "Admins can manage scheduled jobs" ON public.ai_scheduled_jobs;

CREATE POLICY "Admin read scheduled jobs" ON public.ai_scheduled_jobs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin write scheduled jobs" ON public.ai_scheduled_jobs
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin update scheduled jobs" ON public.ai_scheduled_jobs
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin delete scheduled jobs" ON public.ai_scheduled_jobs
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );