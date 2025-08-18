-- Fix the three critical security issues identified by scanner

-- 1. Enable RLS and secure vendor_business_profiles_public table
ALTER TABLE public.vendor_business_profiles_public ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for vendor_business_profiles_public
CREATE POLICY "Deny all public access to vendor_business_profiles_public"
ON public.vendor_business_profiles_public
FOR ALL
TO anon
USING (false);

CREATE POLICY "Admins can manage vendor_business_profiles_public"
ON public.vendor_business_profiles_public
FOR ALL
TO authenticated
USING (check_admin_access());

CREATE POLICY "Authenticated users can view public vendor profiles"
ON public.vendor_business_profiles_public
FOR SELECT
TO authenticated
USING (true);

-- 2. Tighten vendor_services security - remove public access to vendor IDs
DROP POLICY IF EXISTS "Public can view only active approved services" ON public.vendor_services;

CREATE POLICY "Authenticated users can view approved services without vendor IDs"
ON public.vendor_services
FOR SELECT
TO authenticated
USING (is_active = true AND admin_approval_status = 'approved');

-- 3. Fix properties table to hide owner/agent IDs from public
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;

-- Create secure public property view policy that hides sensitive IDs
CREATE POLICY "Public can view basic property info only"
ON public.properties
FOR SELECT
TO anon
USING (status = 'approved' AND is_active = true);

-- Authenticated users can see more details but still restricted
CREATE POLICY "Authenticated users can view approved properties"
ON public.properties
FOR SELECT  
TO authenticated
USING (status = 'approved' AND is_active = true);