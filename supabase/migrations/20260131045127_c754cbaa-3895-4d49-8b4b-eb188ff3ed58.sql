-- Create storage buckets for video verification
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('verification-recordings', 'verification-recordings', false, 104857600, ARRAY['video/webm', 'video/mp4', 'video/quicktime']),
  ('verification-documents', 'verification-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for verification-recordings bucket
CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-recordings' 
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS policies for verification-documents bucket
CREATE POLICY "Users can upload verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents'
);

CREATE POLICY "Users can view own verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage verification documents"
ON storage.objects FOR ALL
USING (
  bucket_id IN ('verification-recordings', 'verification-documents')
  AND public.has_role(auth.uid(), 'admin')
);