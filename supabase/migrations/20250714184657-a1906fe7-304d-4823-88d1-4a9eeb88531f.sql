-- Create storage policies for property images
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);