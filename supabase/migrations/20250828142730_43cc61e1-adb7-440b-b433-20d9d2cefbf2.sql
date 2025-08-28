-- Fix vendor business profiles security vulnerabilities
-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Deny anonymous access to vendor profiles" ON vendor_business_profiles;
DROP POLICY IF EXISTS "admin_full_vendor_profiles_access" ON vendor_business_profiles;
DROP POLICY IF EXISTS "admins_full_access_vendor_profiles" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_delete_own_profile_secure" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_insert_own_profile_secure" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_update_own_profile_secure" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_view_own_profile_secure" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_can_delete_own_profile_only" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_can_insert_own_profile_only" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_can_update_own_profile_only" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_can_view_own_profile_only" ON vendor_business_profiles;

-- Create secure function to check if user can access business profile
CREATE OR REPLACE FUNCTION public.can_access_vendor_business_profile(profile_vendor_id uuid, operation text DEFAULT 'SELECT')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
BEGIN
  current_user_id := auth.uid();
  
  -- Deny anonymous access completely
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  -- Admin users have full access
  IF user_role = 'admin' OR check_admin_access() THEN
    RETURN true;
  END IF;
  
  -- Vendors can only access their own profiles
  IF profile_vendor_id = current_user_id THEN
    RETURN true;
  END IF;
  
  -- For SELECT operations, allow authenticated users to view basic public info
  -- This is handled by specific secure functions, not direct table access
  IF operation = 'SELECT_PUBLIC' THEN
    RETURN true;
  END IF;
  
  -- Deny all other access
  RETURN false;
END;
$$;

-- Create comprehensive RLS policies for vendor business profiles
-- Policy 1: Vendors can view and manage their own profiles
CREATE POLICY "vendors_own_profile_access" 
ON vendor_business_profiles 
FOR ALL 
USING (can_access_vendor_business_profile(vendor_id, 'ALL'))
WITH CHECK (can_access_vendor_business_profile(vendor_id, 'ALL'));

-- Policy 2: Admins have full access
CREATE POLICY "admin_full_access_vendor_profiles" 
ON vendor_business_profiles 
FOR ALL 
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Policy 3: Deny all anonymous access explicitly
CREATE POLICY "deny_anonymous_vendor_profiles" 
ON vendor_business_profiles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create secure function for public vendor profile access (limited fields)
CREATE OR REPLACE FUNCTION public.get_vendor_public_info_secure()
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
  created_at timestamp with time zone
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
    vbp.is_verified,
    vbp.logo_url,
    vbp.banner_url,
    vbp.service_areas,
    vbp.business_hours,
    vbp.created_at
  FROM public.vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND auth.uid() IS NOT NULL  -- Require authentication
  ORDER BY vbp.rating DESC, vbp.total_reviews DESC;
  -- Note: Sensitive data like phone, email, tax_id, license_number, 
  -- business_address, and financial info (tarif_harian_min/max) are excluded
$$;

-- Create function for vendor to access their own complete profile
CREATE OR REPLACE FUNCTION public.get_own_vendor_profile_secure()
RETURNS TABLE(
  id uuid,
  vendor_id uuid,
  business_name text,
  business_type text,
  business_description text,
  business_address text,
  business_phone text,
  business_email text,
  business_website text,
  license_number text,
  tax_id text,
  rating numeric,
  total_reviews integer,
  is_verified boolean,
  is_active boolean,
  logo_url text,
  banner_url text,
  service_areas jsonb,
  business_hours jsonb,
  certifications jsonb,
  insurance_info jsonb,
  gallery_images jsonb,
  social_media jsonb,
  compliance_documents jsonb,
  tarif_harian_min numeric,
  tarif_harian_max numeric,
  profile_completion_percentage integer,
  business_nature_id uuid,
  business_finalized_at timestamp with time zone,
  can_change_nature boolean,
  bpjs_kesehatan_status character varying,
  bpjs_ketenagakerjaan_status character varying,
  bpjs_verification_complete boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    vbp.id,
    vbp.vendor_id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.business_address,
    vbp.business_phone,
    vbp.business_email,
    vbp.business_website,
    vbp.license_number,
    vbp.tax_id,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_verified,
    vbp.is_active,
    vbp.logo_url,
    vbp.banner_url,
    vbp.service_areas,
    vbp.business_hours,
    vbp.certifications,
    vbp.insurance_info,
    vbp.gallery_images,
    vbp.social_media,
    vbp.compliance_documents,
    vbp.tarif_harian_min,
    vbp.tarif_harian_max,
    vbp.profile_completion_percentage,
    vbp.business_nature_id,
    vbp.business_finalized_at,
    vbp.can_change_nature,
    vbp.bpjs_kesehatan_status,
    vbp.bpjs_ketenagakerjaan_status,
    vbp.bpjs_verification_complete,
    vbp.created_at,
    vbp.updated_at
  FROM public.vendor_business_profiles vbp
  WHERE vbp.vendor_id = auth.uid()
  LIMIT 1;
$$;

-- Log security access to vendor profiles
CREATE OR REPLACE FUNCTION public.log_vendor_profile_access(
  p_vendor_id uuid,
  p_operation text,
  p_accessor_id uuid DEFAULT auth.uid()
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log vendor profile access for security monitoring
  INSERT INTO public.user_security_logs (
    user_id, 
    event_type, 
    ip_address,
    metadata
  ) VALUES (
    p_accessor_id,
    'vendor_profile_access',
    inet_client_addr(),
    jsonb_build_object(
      'target_vendor_id', p_vendor_id,
      'operation', p_operation,
      'timestamp', now()
    )
  );
  
  RETURN 'logged';
END;
$$;