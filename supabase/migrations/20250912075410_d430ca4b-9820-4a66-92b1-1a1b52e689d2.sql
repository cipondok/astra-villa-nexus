-- Create storage bucket for vendor assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendor-assets', 'vendor-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vendor assets
CREATE POLICY "Anyone can view vendor assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'vendor-assets');

CREATE POLICY "Authenticated users can upload vendor assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'vendor-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own vendor assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'vendor-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own vendor assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'vendor-assets' AND auth.uid() IS NOT NULL);