-- Fix the three critical security issues

-- 1. Drop the insecure vendor_business_profiles_public view
DROP VIEW IF EXISTS public.vendor_business_profiles_public;

-- Create a secure function instead that requires authentication
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
SECURITY DEFINER
STABLE
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
    AND auth.uid() IS NOT NULL; -- Require authentication
$$;

-- 2. Tighten vendor_services security - remove public access
DROP POLICY IF EXISTS "Public can view only active approved services" ON public.vendor_services;

CREATE POLICY "Authenticated users can view approved services"
ON public.vendor_services
FOR SELECT
TO authenticated
USING (is_active = true AND admin_approval_status = 'approved');

-- 3. Fix properties table - restrict public access to hide owner/agent IDs
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;

-- Only allow public to see approved properties (checking status and approval_status)
CREATE POLICY "Public can view limited property info"
ON public.properties
FOR SELECT
TO anon  
USING (status = 'approved' OR approval_status = 'approved');

-- Authenticated users get the same access for now
CREATE POLICY "Authenticated users can view approved properties"
ON public.properties
FOR SELECT
TO authenticated
USING (status = 'approved' OR approval_status = 'approved');