-- Final security hardening for vendor business profiles
-- Ensure NO access to sensitive fields except for owner and admin

-- First, let's check what policies exist and drop any problematic ones
DROP POLICY IF EXISTS "vendors_own_profile_full_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admins_full_access_to_vendor_profiles" ON public.vendor_business_profiles; 
DROP POLICY IF EXISTS "admins_full_vendor_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_manage_own_profile" ON public.vendor_business_profiles;

-- Create the most restrictive policies possible
-- Vendors can only manage their own profiles
CREATE POLICY "vendors_own_profile_access_only" 
ON public.vendor_business_profiles 
FOR ALL 
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- Admins have full access (for management purposes)
CREATE POLICY "admins_only_full_access" 
ON public.vendor_business_profiles 
FOR ALL 
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Absolutely no other access is allowed - all public queries must use secure functions

-- Add additional security audit trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_vendor_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any access to sensitive vendor data
  IF TG_OP = 'SELECT' THEN
    PERFORM log_security_event(
      auth.uid(),
      'vendor_profile_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'vendor_id', COALESCE(NEW.vendor_id, OLD.vendor_id),
        'operation', TG_OP,
        'table', TG_TABLE_NAME,
        'timestamp', now()
      ),
      CASE 
        WHEN auth.uid() = COALESCE(NEW.vendor_id, OLD.vendor_id) THEN 10  -- Low risk for own data
        WHEN check_admin_access() THEN 20  -- Medium risk for admin access
        ELSE 90  -- High risk for unauthorized access
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the audit trigger
DROP TRIGGER IF EXISTS vendor_profile_access_audit ON public.vendor_business_profiles;
CREATE TRIGGER vendor_profile_access_audit
  AFTER SELECT ON public.vendor_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_vendor_access();

-- Update search function to be even more restrictive
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
  service_areas jsonb,
  created_at timestamp with time zone
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

  -- Log the search attempt
  PERFORM log_security_event(
    auth.uid(),
    'vendor_search',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('search_term', search_term),
    10
  );

  -- Return only basic, non-sensitive information
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
    vbp.service_areas,
    vbp.created_at
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND (
      search_term IS NULL OR 
      vbp.business_name ILIKE '%' || search_term || '%' OR
      vbp.business_type ILIKE '%' || search_term || '%'
    )
  ORDER BY vbp.rating DESC NULLS LAST
  LIMIT 50; -- Strict limit to prevent bulk extraction
END;
$$;