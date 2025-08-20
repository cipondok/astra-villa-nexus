-- Fix the policy name conflict and complete the security hardening

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "public_can_view_safe_vendor_data" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "restricted_public_vendor_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "secure_vendor_access_only" ON public.vendor_business_profiles;

-- Create the final restrictive policy with a unique name
CREATE POLICY "vendor_profiles_restricted_access"
ON public.vendor_business_profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow vendors to see their own profile OR admins to see all
  vendor_id = auth.uid() OR check_admin_access()
);

-- Verify the current policies
SELECT policyname, cmd, permissive, roles 
FROM pg_policies 
WHERE tablename = 'vendor_business_profiles';

COMMENT ON POLICY "vendor_profiles_restricted_access" ON public.vendor_business_profiles IS 'Security hardened: vendors can only access their own profiles, admins can access all. Public access must use get_public_vendor_profiles() function to avoid exposing sensitive data like phone numbers, emails, tax IDs, and financial information';