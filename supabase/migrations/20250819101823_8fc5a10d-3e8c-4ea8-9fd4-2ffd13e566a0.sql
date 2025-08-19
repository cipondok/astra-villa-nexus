-- Fix vendor business profiles security issue
-- Drop existing policies that might have gaps
DROP POLICY IF EXISTS "Deny public access to vendor business profiles" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "Vendors can view and manage their own business profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "Admins can manage vendor business profiles" ON public.vendor_business_profiles;

-- Create strict new policies with proper access control
-- 1. Only vendors can access their own business profile
CREATE POLICY "vendors_own_profile_access" 
ON public.vendor_business_profiles
FOR ALL 
TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- 2. Only admins can access all vendor business profiles
CREATE POLICY "admins_full_access_vendor_profiles"
ON public.vendor_business_profiles  
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- 3. Explicitly deny all access to anonymous users
CREATE POLICY "deny_anonymous_access_vendor_profiles"
ON public.vendor_business_profiles
FOR ALL
TO anon
USING (false);

-- Ensure RLS is enabled
ALTER TABLE public.vendor_business_profiles ENABLE ROW LEVEL SECURITY;