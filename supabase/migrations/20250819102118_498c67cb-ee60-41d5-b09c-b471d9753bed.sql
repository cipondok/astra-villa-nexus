-- Fix vendor_business_profiles access issues
-- The current policies are too restrictive and breaking legitimate access

-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "vendors_own_profile_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admins_full_access_vendor_profiles" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "deny_anonymous_access_vendor_profiles" ON public.vendor_business_profiles;

-- Create more balanced policies that maintain security but allow proper functionality

-- 1. Vendors can manage their own profiles (more permissive for their own data)
CREATE POLICY "vendors_manage_own_profile"
ON public.vendor_business_profiles
FOR ALL
TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- 2. Admins can manage all profiles
CREATE POLICY "admins_manage_all_vendor_profiles"
ON public.vendor_business_profiles
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- 3. Allow authenticated users to view active vendor profiles (for public listings)
CREATE POLICY "public_view_active_vendor_profiles"
ON public.vendor_business_profiles
FOR SELECT
TO authenticated
USING (is_active = true AND is_verified = true);

-- 4. Explicitly block anonymous access (security requirement)
CREATE POLICY "block_anonymous_access"
ON public.vendor_business_profiles
FOR ALL
TO anon
USING (false);