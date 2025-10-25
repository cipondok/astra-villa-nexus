-- Ensure property-images bucket exists and is public
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'property-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
  ELSE
    UPDATE storage.buckets SET public = true WHERE id = 'property-images';
  END IF;
END$$;

-- Allow users to delete own images in property-images bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own images in property-images'
  ) THEN
    CREATE POLICY "Users can delete own images in property-images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;