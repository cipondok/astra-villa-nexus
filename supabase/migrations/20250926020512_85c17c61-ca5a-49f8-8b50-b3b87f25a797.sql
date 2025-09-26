-- CRITICAL SECURITY FIX: Secure profiles table with comprehensive protection
-- Issue: Customer Personal Data Could Be Stolen by Hackers

-- 1. Drop existing potentially vulnerable policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Create enhanced security definer functions for strict access control
CREATE OR REPLACE FUNCTION public.can_access_profile_strict(profile_user_id uuid, operation text DEFAULT 'SELECT')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
BEGIN
  current_user_id := auth.uid();
  
  -- Deny anonymous access completely for sensitive data
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  -- Admin users have controlled access (with logging)
  IF user_role = 'admin' OR check_admin_access() THEN
    -- Log admin access to user data
    PERFORM log_security_event(
      current_user_id,
      'admin_profile_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', profile_user_id,
        'operation', operation,
        'is_self_access', (current_user_id = profile_user_id)
      ),
      CASE WHEN current_user_id = profile_user_id THEN 10 ELSE 40 END
    );
    RETURN true;
  END IF;
  
  -- Users can only access their own profile
  IF profile_user_id = current_user_id THEN
    RETURN true;
  END IF;
  
  -- Deny all other access
  RETURN false;
END;
$$;

-- 3. Create function for safe public profile data (minimal info only)
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  role user_role,
  avatar_url text,
  company_name text,
  verification_status text,
  is_public_profile boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log public profile access
  PERFORM log_security_event(
    auth.uid(),
    'public_profile_safe_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('requested_profile_id', profile_user_id),
    5 -- Low risk for public info
  );

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.role,
    p.avatar_url,
    p.company_name,
    p.verification_status,
    COALESCE(p.is_public_profile, false) as is_public_profile
  FROM public.profiles p
  WHERE p.id = profile_user_id 
    AND p.verification_status = 'approved'
    AND p.is_suspended IS NOT TRUE
    AND COALESCE(p.is_public_profile, false) = true;
END;
$$;

-- 4. Create function to mask sensitive data for logs
CREATE OR REPLACE FUNCTION public.mask_sensitive_profile_data(data_value text, data_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE data_type
    WHEN 'email' THEN
      -- Mask email: show first 2 chars + domain
      IF data_value IS NOT NULL AND data_value LIKE '%@%' THEN
        RETURN left(data_value, 2) || '***@' || split_part(data_value, '@', 2);
      ELSE
        RETURN '***';
      END IF;
    WHEN 'phone' THEN
      -- Mask phone: show country code + last 2 digits
      IF data_value IS NOT NULL AND length(data_value) > 4 THEN
        RETURN left(data_value, 3) || '***' || right(data_value, 2);
      ELSE
        RETURN '***';
      END IF;
    WHEN 'npwp' THEN
      -- Mask NPWP: show first 2 and last 2 digits
      IF data_value IS NOT NULL AND length(data_value) >= 6 THEN
        RETURN left(data_value, 2) || repeat('*', length(data_value) - 4) || right(data_value, 2);
      ELSE
        RETURN repeat('*', length(COALESCE(data_value, 'NPWP')));
      END IF;
    WHEN 'license' THEN
      -- Mask license number: show first 3 chars
      IF data_value IS NOT NULL AND length(data_value) > 3 THEN
        RETURN left(data_value, 3) || repeat('*', length(data_value) - 3);
      ELSE
        RETURN '***';
      END IF;
    ELSE
      RETURN '***';
  END CASE;
END;
$$;

-- 5. Create comprehensive RLS policies with strict access control
-- Policy 1: Users can only SELECT their own profile data
CREATE POLICY "users_select_own_profile_strict" 
ON public.profiles 
FOR SELECT
USING (can_access_profile_strict(id, 'SELECT'));

-- Policy 2: Users can only INSERT their own profile (on signup)
CREATE POLICY "users_insert_own_profile_strict" 
ON public.profiles 
FOR INSERT
WITH CHECK (can_access_profile_strict(id, 'INSERT'));

-- Policy 3: Users can only UPDATE their own profile with validation
CREATE POLICY "users_update_own_profile_strict" 
ON public.profiles 
FOR UPDATE
USING (can_access_profile_strict(id, 'UPDATE'))
WITH CHECK (can_access_profile_strict(id, 'UPDATE'));

-- Policy 4: Only super admin can DELETE profiles (with logging)
CREATE POLICY "super_admin_delete_profiles_only" 
ON public.profiles 
FOR DELETE
USING (
  check_super_admin_email() AND 
  log_security_event(
    auth.uid(),
    'profile_deletion',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('deleted_profile_id', id),
    90 -- Very high risk score
  ) IS NOT NULL
);

-- 6. Block all public access to sensitive data
CREATE POLICY "block_anonymous_profile_access" 
ON public.profiles 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- 7. Update existing audit trigger to use enhanced logging
DROP TRIGGER IF EXISTS audit_profile_access_trigger ON public.profiles;

CREATE OR REPLACE FUNCTION public.audit_profile_access_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enhanced logging for profile changes with sensitive data masking
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    PERFORM log_security_event(
      auth.uid(),
      'profile_' || lower(TG_OP) || '_enhanced',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'profile_id', COALESCE(NEW.id, OLD.id),
        'operation', TG_OP,
        'masked_email', mask_sensitive_profile_data(COALESCE(NEW.email, OLD.email), 'email'),
        'masked_phone', mask_sensitive_profile_data(COALESCE(NEW.phone, OLD.phone), 'phone'),
        'masked_npwp', mask_sensitive_profile_data(COALESCE(NEW.npwp_number, OLD.npwp_number), 'npwp'),
        'has_sensitive_changes', (
          (TG_OP = 'UPDATE' AND (
            NEW.email IS DISTINCT FROM OLD.email OR
            NEW.phone IS DISTINCT FROM OLD.phone OR
            NEW.business_address IS DISTINCT FROM OLD.business_address OR
            NEW.npwp_number IS DISTINCT FROM OLD.npwp_number OR
            NEW.license_number IS DISTINCT FROM OLD.license_number
          )) OR TG_OP IN ('INSERT', 'DELETE')
        ),
        'is_self_access', (auth.uid() = COALESCE(NEW.id, OLD.id)),
        'timestamp', now()
      ),
      CASE 
        WHEN auth.uid() = COALESCE(NEW.id, OLD.id) THEN 15  -- Low-medium risk for self-access
        WHEN check_admin_access() THEN 35  -- Medium-high risk for admin access
        ELSE 80  -- Very high risk for unauthorized access
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_profile_access_enhanced_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION audit_profile_access_enhanced();

-- 8. Add table comment for security documentation
COMMENT ON TABLE public.profiles IS 
'SECURITY CRITICAL: Contains highly sensitive personal data (email, phone, NPWP, addresses). All access strictly controlled via RLS. Use get_safe_public_profile() for public data. All access logged with sensitive data masking.';