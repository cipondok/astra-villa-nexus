-- Secure vendor_business_profiles: restrict base table access and expose only safe fields via a view
BEGIN;

-- 1) Ensure RLS is enabled (it already is, but keep for safety)
ALTER TABLE public.vendor_business_profiles ENABLE ROW LEVEL SECURITY;

-- 2) Remove broad SELECT access for authenticated users on the base table
DROP POLICY IF EXISTS "Authenticated users can view active vendor profiles" ON public.vendor_business_profiles;

-- Keep existing admin and vendor-own policies intact
--   "Admins can manage vendor business profiles" (ALL via check_admin_access())
--   "Vendors can view and manage their own business profile" (ALL when vendor_id = auth.uid())

-- 3) Create a safe, read-only view with non-sensitive fields only
--    Excludes: phone, email, address, tax_id, license_number, daily rates, compliance flags
CREATE OR REPLACE VIEW public.vendor_business_profiles_public AS
SELECT 
  id,
  business_name,
  business_type,
  business_description,
  rating,
  total_reviews,
  is_active,
  logo_url,
  banner_url,
  social_media,
  gallery_images
FROM public.vendor_business_profiles
WHERE is_active = true;

-- 4) Lock down privileges on the view: allow only authenticated users to read
REVOKE ALL ON TABLE public.vendor_business_profiles_public FROM PUBLIC;
REVOKE ALL ON TABLE public.vendor_business_profiles_public FROM anon;
REVOKE ALL ON TABLE public.vendor_business_profiles_public FROM authenticated;
GRANT SELECT ON TABLE public.vendor_business_profiles_public TO authenticated;

COMMIT;