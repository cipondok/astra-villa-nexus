
CREATE TABLE public.property_image_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  detected_features TEXT[] NOT NULL DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}',
  analysis_metadata JSONB DEFAULT '{}',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_image_features_property_id ON public.property_image_features(property_id);

ALTER TABLE public.property_image_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property image features"
  ON public.property_image_features FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert features"
  ON public.property_image_features FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Property owners can delete features"
  ON public.property_image_features FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_image_features.property_id
      AND owner_id = auth.uid()
    )
  );
