-- Ensure RLS is enabled on the sensitive table
ALTER TABLE public.vendor_business_profiles ENABLE ROW LEVEL SECURITY;

-- 1) Explicitly block ALL anonymous access to vendor_business_profiles
DROP POLICY IF EXISTS block_anonymous_access_vendor_profiles_all ON public.vendor_business_profiles;
CREATE POLICY "block_anonymous_access_vendor_profiles_all"
ON public.vendor_business_profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2) Ensure only authenticated vendors (row owners) or admins can SELECT rows
--    This is RESTRICTIVE to guarantee no other permissive policy can widen access
DROP POLICY IF EXISTS restrict_vendor_profiles_select_to_owner_or_admin ON public.vendor_business_profiles;
CREATE POLICY "restrict_vendor_profiles_select_to_owner_or_admin"
ON public.vendor_business_profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  (vendor_id = auth.uid()) OR has_role(auth.uid(), 'admin'::user_role)
);

-- Optional documentation for future maintainers
COMMENT ON TABLE public.vendor_business_profiles IS
  'Contains sensitive vendor business details (phone, email, tax_id, license_number, pricing). Anonymous access explicitly denied. Authenticated access restricted to owner (vendor_id = auth.uid()) or admin via RESTRICTIVE policies.';