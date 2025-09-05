-- Fix profiles table security vulnerabilities
-- Clean up duplicate and overlapping policies first

-- Remove duplicate policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;

-- Ensure no anonymous access to any user profile data
CREATE POLICY "profiles_block_all_anonymous_access"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Create secure policies for authenticated users
-- Users can only access their own profiles (full access to own data)
CREATE POLICY "profiles_users_own_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_users_own_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Restricted INSERT - only allow creation of own profile
CREATE POLICY "profiles_users_own_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile (GDPR compliance)
CREATE POLICY "profiles_users_own_delete"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Admin policies for management
CREATE POLICY "profiles_admin_full_access"
ON public.profiles
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- Create audit function for profile access with sensitive data protection
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive profile data
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
        'email', COALESCE(NEW.email, OLD.email),
        'has_sensitive_data', (
          COALESCE(NEW.phone, OLD.phone) IS NOT NULL OR
          COALESCE(NEW.business_address, OLD.business_address) IS NOT NULL OR
          COALESCE(NEW.license_number, OLD.license_number) IS NOT NULL OR
          COALESCE(NEW.npwp_number, OLD.npwp_number) IS NOT NULL
        ),
        'is_self_access', (auth.uid() = COALESCE(NEW.id, OLD.id))
      ),
      CASE 
        WHEN auth.uid() = COALESCE(NEW.id, OLD.id) THEN 10  -- Low risk for self-access
        WHEN check_admin_access() THEN 25  -- Medium risk for admin access
        ELSE 60  -- High risk for other access
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_profile_access_trigger ON public.profiles;
CREATE TRIGGER audit_profile_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();

-- Create secure function for minimal public profile access (for legitimate business needs)
CREATE OR REPLACE FUNCTION public.get_public_profile_minimal(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  role user_role,
  avatar_url text,
  company_name text,
  verification_status text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return minimal, non-sensitive information for verified profiles
  -- Log the access attempt
  PERFORM log_security_event(
    auth.uid(),
    'public_profile_minimal_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('requested_profile_id', profile_user_id),
    15
  );

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.role,
    p.avatar_url,
    p.company_name,
    p.verification_status
  FROM public.profiles p
  WHERE p.id = profile_user_id 
    AND p.verification_status = 'approved'
    AND p.is_suspended IS NOT TRUE;
END;
$$;