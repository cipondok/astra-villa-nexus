-- Fix vendor business profiles security vulnerability
-- Remove overly permissive public access and implement secure data access

-- 1. Drop the overly permissive public select policy
DROP POLICY IF EXISTS "public_select_verified_profiles" ON public.vendor_business_profiles;

-- 2. Create a more secure public access policy that completely blocks direct table access
CREATE POLICY "block_direct_public_access_to_vendor_profiles" 
ON public.vendor_business_profiles
FOR SELECT 
USING (false); -- Completely block direct public access

-- 3. Update the existing secure function to ensure it only returns safe data
CREATE OR REPLACE FUNCTION public.get_public_vendor_profiles_safe()
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
  service_areas jsonb,
  created_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log public access for monitoring
  PERFORM log_security_event(
    auth.uid(),
    'public_vendor_directory_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    10
  );

  -- Return only safe, non-sensitive vendor information
  RETURN QUERY
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
    vbp.service_areas,
    vbp.created_at
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
  ORDER BY vbp.rating DESC NULLS LAST, vbp.created_at DESC
  LIMIT 50; -- Prevent bulk scraping
END;
$$;

-- 4. Create a function for authenticated users to get limited contact info (for legitimate customer inquiries)
CREATE OR REPLACE FUNCTION public.get_vendor_contact_for_inquiry(vendor_profile_id uuid)
RETURNS TABLE(
  business_phone text,
  business_email text,
  business_website text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to access vendor contact information';
  END IF;

  -- Log the contact info access for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'vendor_contact_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'vendor_id', vendor_profile_id,
      'timestamp', now()
    ),
    25 -- Medium risk for contact access
  );

  -- Return limited contact information for legitimate customer inquiries
  RETURN QUERY
  SELECT 
    vbp.business_phone,
    vbp.business_email,
    vbp.business_website
  FROM public.vendor_business_profiles vbp
  WHERE vbp.id = vendor_profile_id
    AND vbp.is_active = true
    AND vbp.is_verified = true;
END;
$$;

-- 5. Create function for vendor search with minimal data exposure
CREATE OR REPLACE FUNCTION public.search_vendors_secure(
  p_search_text text DEFAULT NULL,
  p_business_type text DEFAULT NULL,
  p_service_area text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  logo_url text,
  service_areas jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log search activity
  PERFORM log_security_event(
    auth.uid(),
    'vendor_search',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'search_text', p_search_text,
      'business_type', p_business_type,
      'timestamp', now()
    ),
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
    vbp.logo_url,
    vbp.service_areas
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND (p_search_text IS NULL OR 
         to_tsvector('english', vbp.business_name || ' ' || COALESCE(vbp.business_description, '')) @@ plainto_tsquery('english', p_search_text))
    AND (p_business_type IS NULL OR vbp.business_type = p_business_type)
    AND (p_service_area IS NULL OR vbp.service_areas ? p_service_area)
  ORDER BY vbp.rating DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 6. Add documentation comments
COMMENT ON FUNCTION public.get_public_vendor_profiles_safe() IS 
'Secure function to get basic vendor information for public directory. Does not expose sensitive business data like contact details, financial info, or tax IDs.';

COMMENT ON FUNCTION public.get_vendor_contact_for_inquiry(uuid) IS 
'Allows authenticated users to get limited contact information for legitimate customer inquiries. All access is logged for security monitoring.';

COMMENT ON FUNCTION public.search_vendors_secure(text, text, text, integer, integer) IS 
'Secure vendor search function that only exposes safe, non-sensitive business information.';

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_vendor_profiles_safe() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_contact_for_inquiry(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_vendors_secure(text, text, text, integer, integer) TO anon, authenticated;