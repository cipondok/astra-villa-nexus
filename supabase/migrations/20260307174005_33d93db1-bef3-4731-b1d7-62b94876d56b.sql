
-- Tighten insert policy to require auth.uid() match on property ownership
DROP POLICY "Authenticated users can insert features" ON public.property_image_features;

CREATE POLICY "Property owners can insert features"
  ON public.property_image_features FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_image_features.property_id
      AND owner_id = auth.uid()
    )
  );
