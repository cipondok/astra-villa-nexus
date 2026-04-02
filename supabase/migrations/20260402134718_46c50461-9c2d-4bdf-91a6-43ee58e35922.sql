
-- Drop old permissive policies for system-assets
DROP POLICY IF EXISTS "Authenticated can delete system assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update system assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload system assets" ON storage.objects;

-- Drop existing admin policies that may have wrong conditions
DROP POLICY IF EXISTS "Admins can upload system assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update system assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete system assets" ON storage.objects;

-- Recreate with proper admin checks
CREATE POLICY "Admins can upload system assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'system-assets'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

CREATE POLICY "Admins can update system assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'system-assets'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

CREATE POLICY "Admins can delete system assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'system-assets'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Drop old permissive policies for hero-banners
DROP POLICY IF EXISTS "Admins can delete hero banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload hero banners" ON storage.objects;

-- Recreate with proper admin checks
CREATE POLICY "Admins can upload hero banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-banners'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

CREATE POLICY "Admins can update hero banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-banners'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

CREATE POLICY "Admins can delete hero banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-banners'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);
