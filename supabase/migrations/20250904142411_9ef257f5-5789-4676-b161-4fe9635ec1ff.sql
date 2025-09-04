-- Final security hardening for vendor business profiles
-- Remove all public access to sensitive vendor data

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "vendors_own_profile_access_only" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admins_only_full_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_own_profile_full_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admins_full_access_to_vendor_profiles" ON public.vendor_business_profiles; 
DROP POLICY IF EXISTS "admins_full_vendor_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_manage_own_profile" ON public.vendor_business_profiles;

-- Create the most restrictive policies - only vendor owners and admins can access data
CREATE POLICY "vendor_owns_profile" 
ON public.vendor_business_profiles 
FOR ALL 
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "admin_full_access" 
ON public.vendor_business_profiles 
FOR ALL 
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- No other policies exist - this means NO other access is possible

-- Update all public functions to return only minimal, non-sensitive data
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
  service_areas jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Require authentication to prevent anonymous scraping
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to access vendor directory';
  END IF;

  -- Log access for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'public_vendor_directory_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('function', 'get_public_vendor_profiles'),
    10
  );

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
    vbp.service_areas
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
  ORDER BY vbp.rating DESC NULLS LAST
  LIMIT 20; -- Strict limit to prevent bulk data extraction
END;
$$;

-- Update search function with minimal data return
CREATE OR REPLACE FUNCTION public.search_vendor_profiles(search_term text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  is_active boolean,
  is_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to search vendor profiles';
  END IF;

  -- Log search for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'vendor_profile_search',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('search_term', search_term),
    15
  );

  RETURN QUERY
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_active,
    vbp.is_verified
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND (
      search_term IS NULL OR 
      vbp.business_name ILIKE '%' || search_term || '%' OR
      vbp.business_type ILIKE '%' || search_term || '%'
    )
  ORDER BY vbp.rating DESC NULLS LAST
  LIMIT 10; -- Very strict limit for searches
END;
$$;