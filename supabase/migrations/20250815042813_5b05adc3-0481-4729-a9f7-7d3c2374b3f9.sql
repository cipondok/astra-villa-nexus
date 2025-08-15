-- Secure vendor_business_profiles against public reads while preserving admin/vendor access via existing RLS policies
BEGIN;

-- 1) Ensure RLS is enabled and enforced
ALTER TABLE public.vendor_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_business_profiles FORCE ROW LEVEL SECURITY;

-- 2) Revoke any blanket privileges that could expose data
REVOKE ALL ON TABLE public.vendor_business_profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.vendor_business_profiles FROM anon;
REVOKE ALL ON TABLE public.vendor_business_profiles FROM authenticated;

-- 3) Document the restriction for future maintainers
COMMENT ON TABLE public.vendor_business_profiles IS 'Sensitive vendor business data protected by RLS. Access limited to admins (check_admin_access()) and owning vendors (vendor_id = auth.uid()).';

COMMIT;