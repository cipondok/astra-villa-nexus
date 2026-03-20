-- Fix 1: featured_ads - restrict write access to admins only
DROP POLICY IF EXISTS "Authenticated users can manage featured ads" ON public.featured_ads;

CREATE POLICY "Admins can manage featured ads"
  ON public.featured_ads FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- Public can view active ads
CREATE POLICY "Anyone can view active featured ads"
  ON public.featured_ads FOR SELECT TO public
  USING (is_active = true);

-- Fix 2: social_commerce_platforms - remove public access to sensitive columns
DROP POLICY IF EXISTS "Anyone can view enabled platforms" ON public.social_commerce_platforms;

-- Create a safe public view excluding sensitive columns
CREATE OR REPLACE VIEW public.public_social_platforms
WITH (security_invoker = on)
AS SELECT id, platform_name, display_name, is_enabled, sync_status, settings
FROM public.social_commerce_platforms
WHERE is_enabled = true;

-- Admin-only full access policy
CREATE POLICY "Admins can manage social platforms"
  ON public.social_commerce_platforms FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- Public can view non-sensitive columns via the view
GRANT SELECT ON public.public_social_platforms TO anon, authenticated;