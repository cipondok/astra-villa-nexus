
-- Create vr-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vr-media', 'vr-media', true, 524288000,
  ARRAY['image/jpeg','image/png','image/webp','model/gltf-binary','model/gltf+json',
        'application/octet-stream','video/mp4','video/webm','video/quicktime']);

-- RLS: Public read access
CREATE POLICY "Public read access for vr-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'vr-media');

-- RLS: Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload vr-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vr-media'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can update their own uploads
CREATE POLICY "Users can update own vr-media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vr-media'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can delete their own uploads
CREATE POLICY "Users can delete own vr-media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vr-media'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
