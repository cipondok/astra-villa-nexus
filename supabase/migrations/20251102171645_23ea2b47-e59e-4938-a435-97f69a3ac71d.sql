-- Allow public read access to locations table
-- This is safe since locations are just geographic data (provinces, cities, districts)
-- and need to be accessible for search filters to work

CREATE POLICY "allow_public_read_locations"
ON public.locations
FOR SELECT
TO anon, authenticated
USING (true);