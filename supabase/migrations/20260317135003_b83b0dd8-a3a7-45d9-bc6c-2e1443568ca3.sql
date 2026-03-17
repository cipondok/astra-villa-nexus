
-- Add tag categories to property_reviews
ALTER TABLE public.property_reviews
  ADD COLUMN IF NOT EXISTS tag_categories TEXT[] DEFAULT '{}';

-- Create review_photos table for service review photo uploads
CREATE TABLE IF NOT EXISTS public.review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type TEXT NOT NULL CHECK (review_type IN ('property', 'vendor')),
  review_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view review photos"
ON public.review_photos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload review photos"
ON public.review_photos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review photos"
ON public.review_photos FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_review_photos_review ON public.review_photos(review_type, review_id);

-- Create storage bucket for review photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload review photos to storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view review photos in storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-photos');

CREATE POLICY "Users can delete own review photos in storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
