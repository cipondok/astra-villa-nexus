
-- 1. Fix verification-documents INSERT policy: enforce folder ownership
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;

CREATE POLICY "Users can upload verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Fix rental-documents SELECT policy: enforce folder ownership
DROP POLICY IF EXISTS "Authenticated users can read rental docs" ON storage.objects;

CREATE POLICY "Users can read own rental documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'rental-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Fix business_partners public exposure: require authentication
DROP POLICY IF EXISTS "Anyone can view active partners" ON public.business_partners;

CREATE POLICY "Authenticated users can view active partners"
ON public.business_partners FOR SELECT
TO authenticated
USING (status = 'active');
