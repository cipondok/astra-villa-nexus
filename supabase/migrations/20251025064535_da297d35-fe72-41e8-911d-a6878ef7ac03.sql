-- Admin-safe property deletion function
CREATE OR REPLACE FUNCTION public.delete_property_admin_property(p_property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins or super admins can delete properties
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  -- Delete property row
  DELETE FROM public.properties WHERE id = p_property_id;
END;
$$;

-- Storage policies for property-images bucket to allow authenticated uploads to user folder and admin management
DO $$ BEGIN
  -- Insert policy for user uploads to own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload to own folder in property-images'
  ) THEN
    CREATE POLICY "Users can upload to own folder in property-images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Update policy for own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own images in property-images'
  ) THEN
    CREATE POLICY "Users can update own images in property-images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Delete policy for admins to manage all objects in bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete any in property-images'
  ) THEN
    CREATE POLICY "Admins can delete any in property-images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'property-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
    );
  END IF;
END $$;