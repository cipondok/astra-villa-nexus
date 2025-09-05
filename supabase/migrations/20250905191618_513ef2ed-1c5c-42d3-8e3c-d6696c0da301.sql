-- Fix vendor business profiles table security vulnerabilities
-- Protect sensitive business data from competitors and unauthorized access

-- Clean up duplicate and overlapping policies first
DROP POLICY IF EXISTS "admin_management_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admins_full_access_to_vendor_profiles" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "admins_full_vendor_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_owner_only_access" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_manage_own_profile" ON public.vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_own_profile_full_access" ON public.vendor_business_profiles;

-- Ensure no anonymous access to any vendor business data
CREATE POLICY "vendor_profiles_block_all_anonymous_access"
ON public.vendor_business_profiles
FOR ALL
TO anon
USING (false);

-- Create secure policies for authenticated users
-- Vendors can only access their own profiles (full access to own data)
CREATE POLICY "vendor_profiles_vendors_own_full_access"
ON public.vendor_business_profiles
FOR ALL
TO authenticated
USING (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);

-- Admin policies for management with enhanced security
CREATE POLICY "vendor_profiles_admin_full_access"
ON public.vendor_business_profiles
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Create audit function for vendor profile access with sensitive data protection
CREATE OR REPLACE FUNCTION public.audit_vendor_business_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive vendor business data
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    PERFORM log_security_event(
      auth.uid(),
      'vendor_business_profile_' || lower(TG_OP),
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'vendor_id', COALESCE(NEW.vendor_id, OLD.vendor_id),
        'business_name', COALESCE(NEW.business_name, OLD.business_name),
        'operation', TG_OP,
        'has_sensitive_financial_data', (
          COALESCE(NEW.tarif_harian_min, OLD.tarif_harian_min) IS NOT NULL OR
          COALESCE(NEW.tarif_harian_max, OLD.tarif_harian_max) IS NOT NULL
        ),
        'has_sensitive_contact_data', (
          COALESCE(NEW.business_phone, OLD.business_phone) IS NOT NULL OR
          COALESCE(NEW.business_email, OLD.business_email) IS NOT NULL OR
          COALESCE(NEW.business_address, OLD.business_address) IS NOT NULL
        ),
        'has_sensitive_legal_data', (
          COALESCE(NEW.tax_id, OLD.tax_id) IS NOT NULL OR
          COALESCE(NEW.license_number, OLD.license_number) IS NOT NULL
        ),
        'is_self_access', (auth.uid() = COALESCE(NEW.vendor_id, OLD.vendor_id))
      ),
      CASE 
        WHEN auth.uid() = COALESCE(NEW.vendor_id, OLD.vendor_id) THEN 10  -- Low risk for self-access
        WHEN check_admin_access() THEN 25  -- Medium risk for admin access
        ELSE 70  -- High risk for other access (should not happen due to RLS)
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_vendor_business_profile_access_trigger ON public.vendor_business_profiles;
CREATE TRIGGER audit_vendor_business_profile_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_vendor_business_profile_access();

-- Create secure function for minimal public vendor information (for legitimate business directory needs)
CREATE OR REPLACE FUNCTION public.get_public_vendor_directory()
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
  social_media jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return minimal, non-sensitive information for verified active vendors
  -- Log the directory access attempt
  PERFORM log_security_event(
    auth.uid(),
    'public_vendor_directory_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('access_time', now()),
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
    vbp.is_verified,
    vbp.logo_url,
    vbp.banner_url,
    vbp.service_areas,
    vbp.social_media
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true 
    AND vbp.is_verified = true
  ORDER BY vbp.rating DESC NULLS LAST
  LIMIT 50; -- Prevent bulk data extraction
  -- Note: Sensitive data like business_phone, business_email, tax_id, 
  -- license_number, tarif_harian_min/max, business_address are excluded
END;
$$;

-- Create secure function for vendor contact information (admin only)
CREATE OR REPLACE FUNCTION public.get_vendor_sensitive_contact_info(vendor_profile_id uuid)
RETURNS TABLE(
  business_phone text,
  business_email text,
  business_address text,
  tax_id text,
  license_number text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access sensitive contact and legal information
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Insufficient permissions to access sensitive vendor contact information';
  END IF;

  -- Log the sensitive data access
  PERFORM log_security_event(
    auth.uid(),
    'vendor_sensitive_contact_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('vendor_profile_id', vendor_profile_id),
    40  -- High risk score for sensitive data access
  );

  RETURN QUERY
  SELECT 
    vbp.business_phone,
    vbp.business_email,
    vbp.business_address,
    vbp.tax_id,
    vbp.license_number
  FROM public.vendor_business_profiles vbp
  WHERE vbp.id = vendor_profile_id;
END;
$$;