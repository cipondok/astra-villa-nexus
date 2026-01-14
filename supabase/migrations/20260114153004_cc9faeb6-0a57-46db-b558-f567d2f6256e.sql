-- Create storage bucket for system branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'system-assets',
  'system-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon'];

-- Create storage policies for system-assets bucket
DO $$
BEGIN
  -- Public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for system assets'
  ) THEN
    CREATE POLICY "Public read access for system assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'system-assets');
  END IF;

  -- Admin upload
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can upload system assets'
  ) THEN
    CREATE POLICY "Admins can upload system assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'system-assets' 
      AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );
  END IF;

  -- Admin update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can update system assets'
  ) THEN
    CREATE POLICY "Admins can update system assets"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'system-assets' 
      AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );
  END IF;

  -- Admin delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can delete system assets'
  ) THEN
    CREATE POLICY "Admins can delete system assets"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'system-assets' 
      AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );
  END IF;
END $$;