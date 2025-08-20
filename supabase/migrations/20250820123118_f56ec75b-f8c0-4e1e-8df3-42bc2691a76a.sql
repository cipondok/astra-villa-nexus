-- Fix the Security Definer View issue by removing the problematic view
-- The get_public_vendor_profiles() function is sufficient for secure public access

DROP VIEW IF EXISTS public.public_vendor_profiles;

-- Fix the search path issue in the get_public_vendor_profiles function
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
SET search_path = public
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

-- Update the restrictive policy to be even more secure
DROP POLICY IF EXISTS "public_can_view_safe_vendor_data" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "restricted_public_vendor_access" ON public.vendor_business_profiles;

-- Create the most restrictive policy - only vendors can see their own data, admins can see all
CREATE POLICY "secure_vendor_access_only"
ON public.vendor_business_profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow vendors to see their own profile OR admins to see all
  vendor_id = auth.uid() OR check_admin_access()
);

-- For public vendor listings, applications should use the get_public_vendor_profiles() function
-- This ensures only safe, non-sensitive data is exposed

COMMENT ON POLICY "secure_vendor_access_only" ON public.vendor_business_profiles IS 'Highly restrictive policy: vendors can only access their own profiles, admins can access all. Public access must use get_public_vendor_profiles() function';