
-- Fix permissive INSERT policy: restrict to admin users
DROP POLICY IF EXISTS "Service role can insert seo_ai_actions" ON public.seo_ai_actions;

CREATE POLICY "Admins can insert seo_ai_actions"
  ON public.seo_ai_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- Also allow service role (edge functions bypass RLS by default with service key)
-- No additional policy needed — service_role bypasses RLS
