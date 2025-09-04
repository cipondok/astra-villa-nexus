-- Fix vendor business information security vulnerability
-- Remove public access to sensitive vendor business data

-- First, drop any existing problematic policies
DROP POLICY IF EXISTS "authenticated_users_limited_public_view" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "public_vendor_profiles_authenticated_access" ON public.vendor_business_profiles;

-- Drop existing functions to recreate them with proper signatures
DROP FUNCTION IF EXISTS public.search_vendor_profiles(text);
DROP FUNCTION IF EXISTS public.get_public_vendor_profiles();

-- Create strict RLS policies that protect sensitive data
CREATE POLICY "vendors_own_profile_full_access" 
ON public.vendor_business_profiles 
FOR ALL 
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "admins_full_access_to_vendor_profiles" 
ON public.vendor_business_profiles 
FOR ALL 
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Create secure search function that only returns non-sensitive data
CREATE OR REPLACE FUNCTION public.search_vendor_profiles(search_term text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text, 
  business_description text,
  rating numeric,
  total_reviews integer,
  is_active boolean,
  is_verified boolean,
  logo_url text,
  banner_url text,
  service_areas jsonb,
  business_hours jsonb,
  gallery_images jsonb,
  social_media jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only authenticated users can search vendor profiles
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to access vendor profiles';
  END IF;

  -- Log the search for security monitoring
  PERFORM log_vendor_profile_access(NULL, 'SEARCH', auth.uid());

  RETURN QUERY
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_active,
    vbp.is_verified,
    vbp.logo_url,
    vbp.banner_url,
    vbp.service_areas,
    vbp.business_hours,
    vbp.gallery_images,
    vbp.social_media,
    vbp.created_at,
    vbp.updated_at
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND (
      search_term IS NULL OR 
      vbp.business_name ILIKE '%' || search_term || '%' OR
      vbp.business_type ILIKE '%' || search_term || '%' OR
      vbp.business_description ILIKE '%' || search_term || '%'
    )
  ORDER BY vbp.rating DESC NULLS LAST, vbp.total_reviews DESC
  LIMIT 100; -- Prevent excessive data extraction
END;
$$;

-- Create secure public directory function
CREATE OR REPLACE FUNCTION public.get_public_vendor_profiles()
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  is_active boolean,
  is_verified boolean,
  logo_url text,
  banner_url text,
  service_areas jsonb,
  business_hours jsonb,
  gallery_images jsonb,
  social_media jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Require authentication to access vendor directory
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to access vendor directory';
  END IF;

  -- Log directory access for monitoring
  PERFORM log_vendor_profile_access(NULL, 'DIRECTORY_ACCESS', auth.uid());

  RETURN QUERY
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_active,
    vbp.is_verified,
    vbp.logo_url,
    vbp.banner_url,
    vbp.service_areas,
    vbp.business_hours,
    vbp.gallery_images,
    vbp.social_media,
    vbp.created_at,
    vbp.updated_at
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
  ORDER BY vbp.rating DESC NULLS LAST, vbp.total_reviews DESC
  LIMIT 50; -- Limit results to prevent bulk data extraction
END;
$$;

-- Create admin-only function for sensitive vendor contact info
CREATE OR REPLACE FUNCTION public.get_vendor_contact_info(vendor_profile_id uuid)
RETURNS TABLE(
  business_phone text,
  business_email text,
  business_address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can access sensitive contact information
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Insufficient permissions to access vendor contact information';
  END IF;

  -- Log the sensitive data access
  PERFORM log_vendor_profile_access(vendor_profile_id, 'CONTACT_INFO_ACCESS', auth.uid());

  RETURN QUERY
  SELECT 
    vbp.business_phone,
    vbp.business_email,
    vbp.business_address
  FROM public.vendor_business_profiles vbp
  WHERE vbp.id = vendor_profile_id;
END;
$$;