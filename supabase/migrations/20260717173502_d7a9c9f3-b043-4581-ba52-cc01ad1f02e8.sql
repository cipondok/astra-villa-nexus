
-- Phase 7 hardening: tighten permissive write policies and public-bucket listing

-- 1) Tighten "USING(true)" writes on public tables
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe with valid email"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 254
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Public can submit valid lead"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 254
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (name IS NULL OR length(name) BETWEEN 1 AND 200)
);

-- 2) Tighten public bucket SELECT: require authenticated role for listing.
--    Public asset URLs continue to work (they bypass RLS via signed public URLs).
DROP POLICY IF EXISTS "Anyone can view checkin photos" ON storage.objects;
CREATE POLICY "Authenticated can list checkin photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'checkin-photos');

DROP POLICY IF EXISTS "Anyone can view inspection photos" ON storage.objects;
CREATE POLICY "Authenticated can list inspection photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'inspection-photos');

DROP POLICY IF EXISTS "Anyone can view review photos in storage" ON storage.objects;
CREATE POLICY "Authenticated can list review photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Anyone can view vendor assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read vendor-assets" ON storage.objects;
CREATE POLICY "Authenticated can list vendor assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vendor-assets');

DROP POLICY IF EXISTS "Public read access for vr-media" ON storage.objects;
CREATE POLICY "Authenticated can list vr-media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vr-media');
