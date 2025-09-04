-- Drop existing functions first to allow recreation with different signatures
DROP FUNCTION IF EXISTS public.get_public_vendor_profiles();
DROP FUNCTION IF EXISTS public.search_vendor_profiles(text);

-- Drop existing policies to create the most restrictive ones
DROP POLICY IF EXISTS "vendor_owns_profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admin_full_access" ON public.vendor_business_profiles;

-- Create ultra-restrictive policies - ONLY vendor owner and admin access
CREATE POLICY "vendor_owner_only_access" 
ON public.vendor_business_profiles 
FOR ALL 
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "admin_management_access" 
ON public.vendor_business_profiles 
FOR ALL 
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Create secure public function that returns minimal data only
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
  -- Require authentication to prevent scraping
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Log directory access
  PERFORM log_security_event(
    auth.uid(),
    'vendor_directory_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    10
  );

  -- Return only basic, non-sensitive vendor information
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
  LIMIT 20; -- Prevent bulk extraction
END;
$$;

-- Create secure search function
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
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Log search attempt
  PERFORM log_security_event(
    auth.uid(),
    'vendor_search',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('search_term', search_term),
    15
  );

  -- Return minimal search results
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
  LIMIT 10;
END;
$$;