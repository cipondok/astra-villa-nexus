-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can insert social media settings" ON public.social_media_settings;
DROP POLICY IF EXISTS "Admins can manage social media settings" ON public.social_media_settings;

-- Allow admins to insert social media settings
CREATE POLICY "Admins can insert social media settings"
ON public.social_media_settings
FOR INSERT
TO authenticated
WITH CHECK (check_admin_access());

-- Allow admins to manage all social media settings
CREATE POLICY "Admins can manage social media settings"
ON public.social_media_settings
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());