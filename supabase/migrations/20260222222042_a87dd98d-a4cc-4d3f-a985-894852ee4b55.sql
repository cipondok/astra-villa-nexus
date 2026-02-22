-- Create storage bucket for hero banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-banners', 'hero-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view hero banner images
CREATE POLICY "Hero banners are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-banners');

-- Allow authenticated admins to upload/update/delete hero banners
CREATE POLICY "Admins can upload hero banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update hero banners"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete hero banners"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-banners' AND auth.role() = 'authenticated');