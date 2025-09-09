-- Comprehensive Security Fix - Fixed Function Conflict Issue

-- First drop existing function that conflicts
DROP FUNCTION IF EXISTS public.log_financial_access(text, text, uuid);

-- Fix 1: Enhanced Vendor Business Profiles Security
CREATE OR REPLACE FUNCTION public.audit_vendor_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log modifications to sensitive vendor business data
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    PERFORM log_security_event(
      auth.uid(),
      'vendor_business_profile_' || lower(TG_OP),
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'vendor_id', COALESCE(NEW.vendor_id, OLD.vendor_id),
        'operation', TG_OP,
        'contains_sensitive_data', (
          COALESCE(NEW.business_phone, OLD.business_phone) IS NOT NULL OR
          COALESCE(NEW.business_email, OLD.business_email) IS NOT NULL OR
          COALESCE(NEW.tax_id, OLD.tax_id) IS NOT NULL OR
          COALESCE(NEW.license_number, OLD.license_number) IS NOT NULL OR
          COALESCE(NEW.tarif_harian_min, OLD.tarif_harian_min) IS NOT NULL
        ),
        'is_self_access', (auth.uid() = COALESCE(NEW.vendor_id, OLD.vendor_id)),
        'timestamp', now()
      ),
      CASE 
        WHEN auth.uid() = COALESCE(NEW.vendor_id, OLD.vendor_id) THEN 20
        WHEN check_admin_access() THEN 35
        ELSE 85
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for vendor business profiles modifications
DROP TRIGGER IF EXISTS audit_vendor_business_profile_changes ON public.vendor_business_profiles;
CREATE TRIGGER audit_vendor_business_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_vendor_profile_changes();

-- Fix 2: Enhanced Financial Data Security
CREATE OR REPLACE FUNCTION public.check_financial_admin_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email = 'mycode103@gmail.com' THEN
    RETURN true;
  END IF;
  
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Recreate financial access logging function with correct signature
CREATE OR REPLACE FUNCTION public.log_financial_access(
  p_table_name text,
  p_operation text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_security_logs (
    user_id, 
    event_type, 
    ip_address,
    metadata
  ) VALUES (
    p_user_id,
    'financial_data_access',
    inet_client_addr(),
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'timestamp', now(),
      'risk_level', CASE 
        WHEN p_operation LIKE '%ALL%' THEN 'high'
        WHEN check_financial_admin_access() THEN 'medium'
        ELSE 'low'
      END
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fix 3: Enhanced User Profile Data Protection
CREATE OR REPLACE FUNCTION public.audit_profile_modifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    PERFORM log_security_event(
      auth.uid(),
      'profile_' || lower(TG_OP),
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'profile_id', COALESCE(NEW.id, OLD.id),
        'operation', TG_OP,
        'contains_pii', (
          COALESCE(NEW.phone, OLD.phone) IS NOT NULL OR
          COALESCE(NEW.business_address, OLD.business_address) IS NOT NULL OR
          COALESCE(NEW.license_number, OLD.license_number) IS NOT NULL OR
          COALESCE(NEW.npwp_number, OLD.npwp_number) IS NOT NULL
        ),
        'is_self_access', (auth.uid() = COALESCE(NEW.id, OLD.id)),
        'timestamp', now()
      ),
      CASE 
        WHEN auth.uid() = COALESCE(NEW.id, OLD.id) THEN 15
        WHEN check_admin_access() THEN 30
        ELSE 75
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_profile_modifications ON public.profiles;
CREATE TRIGGER audit_profile_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_modifications();

-- Fix 4: System Configuration Security
CREATE OR REPLACE FUNCTION public.audit_api_settings_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    PERFORM log_security_event(
      auth.uid(),
      'api_settings_' || lower(TG_OP),
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'api_name', COALESCE(NEW.api_name, OLD.api_name),
        'operation', TG_OP,
        'contains_credentials', (COALESCE(NEW.api_key, OLD.api_key) IS NOT NULL),
        'timestamp', now()
      ),
      70
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_api_settings_changes ON public.api_settings;
CREATE TRIGGER audit_api_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.api_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_api_settings_changes();

-- Fix 5: Security Indexes and Constraints
CREATE INDEX IF NOT EXISTS idx_user_security_logs_high_risk 
ON public.user_security_logs (risk_score DESC, created_at DESC) 
WHERE risk_score > 50;

CREATE INDEX IF NOT EXISTS idx_user_security_logs_financial_access 
ON public.user_security_logs (event_type, created_at DESC) 
WHERE event_type = 'financial_data_access';

CREATE INDEX IF NOT EXISTS idx_vendor_business_profiles_security 
ON public.vendor_business_profiles (vendor_id, updated_at DESC);

-- Data integrity constraints
ALTER TABLE public.vendor_business_profiles 
DROP CONSTRAINT IF EXISTS check_business_name_length;

ALTER TABLE public.vendor_business_profiles 
ADD CONSTRAINT check_business_name_length 
CHECK (length(trim(business_name)) >= 2);

ALTER TABLE public.vendor_business_profiles 
DROP CONSTRAINT IF EXISTS check_tax_id_format;

ALTER TABLE public.vendor_business_profiles 
ADD CONSTRAINT check_tax_id_format 
CHECK (tax_id IS NULL OR length(regexp_replace(tax_id, '[^0-9]', '', 'g')) >= 8);

-- Secure vendor profile summary function
CREATE OR REPLACE FUNCTION public.get_vendor_profile_summary(p_vendor_id uuid)
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  is_verified boolean,
  logo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM log_security_event(
    auth.uid(),
    'vendor_profile_summary_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('target_vendor_id', p_vendor_id),
    20
  );

  RETURN QUERY
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_verified,
    vbp.logo_url
  FROM public.vendor_business_profiles vbp
  WHERE vbp.vendor_id = p_vendor_id 
    AND vbp.is_active = true
    AND vbp.is_verified = true;
END;
$$;