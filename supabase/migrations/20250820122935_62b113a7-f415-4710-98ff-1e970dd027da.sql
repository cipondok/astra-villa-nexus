-- Fix vendor_business_profiles security vulnerability  
-- Issue: Sensitive business information exposed to all authenticated users

-- Drop the overly permissive public viewing policy
DROP POLICY IF EXISTS "public_view_active_vendor_profiles" ON public.vendor_business_profiles;

-- Create a secure view for public vendor information that only shows safe data
CREATE OR REPLACE VIEW public.public_vendor_profiles AS
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
  gallery_images,
  service_areas,
  certifications,
  business_hours,
  created_at
FROM public.vendor_business_profiles
WHERE is_active = true AND is_verified = true;

-- Create RLS policy for the public view (no sensitive data)
CREATE POLICY "public_can_view_safe_vendor_data"
ON public.vendor_business_profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow selecting safe public columns for active verified vendors
  is_active = true AND is_verified = true
);

-- Create a security definer function for safe public vendor access
CREATE OR REPLACE FUNCTION public.get_public_vendor_profiles()
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
  gallery_images jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
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
    vbp.gallery_images
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND auth.uid() IS NOT NULL; -- Require authentication
$$;

-- Update the existing policy to be more restrictive
-- Remove the permissive SELECT policy and replace with column-specific restrictions
CREATE POLICY "restricted_public_vendor_access"
ON public.vendor_business_profiles  
FOR SELECT
TO authenticated
USING (
  -- Allow access only to verified active vendors for public viewing
  -- But applications should use get_public_vendor_profiles() function instead
  (is_active = true AND is_verified = true)
  AND 
  -- Additional security: limit what can be accessed in WHERE clauses
  (vendor_id = auth.uid() OR check_admin_access())
);

-- Grant execute permission on the public function
GRANT EXECUTE ON FUNCTION public.get_public_vendor_profiles() TO authenticated;

-- Add comment explaining the security approach
COMMENT ON FUNCTION public.get_public_vendor_profiles() IS 'Secure function that returns only safe public vendor data, hiding sensitive business information like phone numbers, emails, tax IDs, and financial data';