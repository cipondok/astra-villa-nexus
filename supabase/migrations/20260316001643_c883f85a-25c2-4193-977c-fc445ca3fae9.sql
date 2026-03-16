
-- Fix overly permissive RLS
DROP POLICY IF EXISTS "Authenticated users can manage roadmap phases" ON public.launch_roadmap_phases;
DROP POLICY IF EXISTS "Authenticated users can manage roadmap tasks" ON public.launch_roadmap_tasks;

-- Only admins can manage
CREATE POLICY "Admins can manage roadmap phases" ON public.launch_roadmap_phases
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage roadmap tasks" ON public.launch_roadmap_tasks
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid())
  );
