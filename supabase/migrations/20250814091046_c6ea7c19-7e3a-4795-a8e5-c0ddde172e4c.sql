-- Lock down the public-facing view completely; rely on base table RLS for controlled access
BEGIN;

-- Revoke any remaining privileges so the view is not readable by anon or authenticated users
REVOKE ALL ON TABLE public.vendor_business_profiles_public FROM PUBLIC;
REVOKE ALL ON TABLE public.vendor_business_profiles_public FROM anon;
REVOKE ALL ON TABLE public.vendor_business_profiles_public FROM authenticated;

-- Optional: Add a comment documenting why the view is locked down
COMMENT ON VIEW public.vendor_business_profiles_public IS 'Locked down: use base table vendor_business_profiles with RLS (admins or owning vendor only).';

COMMIT;