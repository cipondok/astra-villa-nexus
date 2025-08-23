-- Secure vendor_business_profiles table to protect sensitive business data
-- This prevents competitors from stealing business information

-- First ensure RLS is enabled
ALTER TABLE public.vendor_business_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with tighter security
DROP POLICY IF EXISTS "admins_manage_all_vendor_profiles" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "block_anonymous_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_profiles_restricted_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_manage_own_profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "public_can_view_vendor_profiles" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "authenticated_can_view_vendor_profiles" ON public.vendor_business_profiles;

-- Create comprehensive security policies

-- Explicit deny for anonymous users
CREATE POLICY "block_all_anonymous_access_vendor_profiles"
ON public.vendor_business_profiles
FOR ALL
TO anon
USING (false);

-- Vendors can only view and manage their own profile data
CREATE POLICY "vendors_can_view_own_profile_only"
ON public.vendor_business_profiles
FOR SELECT
TO authenticated
USING (vendor_id = auth.uid());

CREATE POLICY "vendors_can_insert_own_profile_only"
ON public.vendor_business_profiles
FOR INSERT
TO authenticated
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "vendors_can_update_own_profile_only"
ON public.vendor_business_profiles
FOR UPDATE
TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "vendors_can_delete_own_profile_only"
ON public.vendor_business_profiles
FOR DELETE
TO authenticated
USING (vendor_id = auth.uid());

-- Admins have full access for management purposes
CREATE POLICY "admins_full_access_vendor_profiles"
ON public.vendor_business_profiles
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Update the public vendor profiles function to be more secure
-- This function should only return non-sensitive data for public viewing
CREATE OR REPLACE FUNCTION public.get_public_vendor_profiles_secure()
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  is_active boolean,
  logo_url text,
  banner_url text,
  social_media jsonb,
  gallery_images jsonb,
  service_areas jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_active,
    vbp.logo_url,
    vbp.banner_url,
    vbp.social_media,
    vbp.gallery_images,
    vbp.service_areas
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true;
    -- Note: Sensitive data like phone, email, tax_id, license_number, 
    -- financial info (tarif_harian_min/max) are excluded from public view
$$;

-- Add security comments to document the protection measures
COMMENT ON TABLE public.vendor_business_profiles IS 'Contains sensitive vendor business data. Access restricted via RLS to vendor owners and admins only.';
COMMENT ON COLUMN public.vendor_business_profiles.business_phone IS 'Sensitive - restricted access via RLS';
COMMENT ON COLUMN public.vendor_business_profiles.business_email IS 'Sensitive - restricted access via RLS';
COMMENT ON COLUMN public.vendor_business_profiles.tax_id IS 'Sensitive - restricted access via RLS';
COMMENT ON COLUMN public.vendor_business_profiles.license_number IS 'Sensitive - restricted access via RLS';
COMMENT ON COLUMN public.vendor_business_profiles.tarif_harian_min IS 'Sensitive financial data - restricted access via RLS';
COMMENT ON COLUMN public.vendor_business_profiles.tarif_harian_max IS 'Sensitive financial data - restricted access via RLS';
COMMENT ON COLUMN public.vendor_business_profiles.business_address IS 'Sensitive location data - restricted access via RLS';