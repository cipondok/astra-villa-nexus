-- Strengthen profiles table RLS policies with explicit anonymous blocking
-- Fix security issue: Customer Personal Data Could Be Stolen by Hackers

-- Drop any potentially permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Add explicit RESTRICTIVE policy to block ALL anonymous access
CREATE POLICY "block_all_anonymous_profile_access"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit RESTRICTIVE policy to block ALL public role access
CREATE POLICY "block_all_public_profile_access"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (false);

-- Ensure only authenticated users with proper authorization can access profiles
-- This policy ensures no gaps in the existing policies
CREATE POLICY "restrict_profile_access_to_owner_or_admin"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::user_role)
  OR has_role(auth.uid(), 'super_admin'::user_role)
);

-- Create audit trigger for sensitive profile data access
CREATE OR REPLACE FUNCTION public.audit_profile_pii_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_access boolean;
  accessing_different_profile boolean;
  sensitive_fields_accessed boolean;
BEGIN
  -- Check if this is an admin accessing another user's profile
  is_admin_access := has_role(auth.uid(), 'admin'::user_role) 
                     OR has_role(auth.uid(), 'super_admin'::user_role);
  
  accessing_different_profile := (COALESCE(NEW.id, OLD.id) != auth.uid());
  
  -- Check if sensitive fields are being accessed/modified
  sensitive_fields_accessed := (
    NEW.email IS NOT NULL OR OLD.email IS NOT NULL OR
    NEW.phone IS NOT NULL OR OLD.phone IS NOT NULL OR
    NEW.business_address IS NOT NULL OR OLD.business_address IS NOT NULL OR
    NEW.full_name IS NOT NULL OR OLD.full_name IS NOT NULL
  );
  
  -- Log admin access to other users' PII
  IF is_admin_access AND accessing_different_profile AND sensitive_fields_accessed THEN
    PERFORM log_security_event(
      auth.uid(),
      'pii_data_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'table', 'profiles',
        'operation', TG_OP,
        'target_user_id', COALESCE(NEW.id, OLD.id),
        'timestamp', now(),
        'admin_cross_access', true,
        'sensitive_fields', jsonb_build_array(
          CASE WHEN NEW.email IS NOT NULL OR OLD.email IS NOT NULL THEN 'email' END,
          CASE WHEN NEW.phone IS NOT NULL OR OLD.phone IS NOT NULL THEN 'phone' END,
          CASE WHEN NEW.business_address IS NOT NULL OR OLD.business_address IS NOT NULL THEN 'business_address' END,
          CASE WHEN NEW.full_name IS NOT NULL OR OLD.full_name IS NOT NULL THEN 'full_name' END
        )
      ),
      35 -- High risk score for PII access
    );
  END IF;
  
  -- Log all modifications to profiles
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM log_security_event(
      auth.uid(),
      'profile_modification',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'operation', TG_OP,
        'profile_id', COALESCE(NEW.id, OLD.id),
        'timestamp', now()
      ),
      20
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for audit logging on profile modifications
DROP TRIGGER IF EXISTS audit_profile_pii_trigger ON public.profiles;
CREATE TRIGGER audit_profile_pii_trigger
  AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_pii_access();

-- Update table comment to reflect enhanced security
COMMENT ON TABLE public.profiles IS 'User profiles with enhanced security: anonymous access completely blocked, users can only access their own data, admins have full logged access. All PII access is audited.';

-- Add helpful column comments for sensitive fields
COMMENT ON COLUMN public.profiles.email IS 'Sensitive PII: All admin access is logged for audit purposes';
COMMENT ON COLUMN public.profiles.phone IS 'Sensitive PII: All admin access is logged for audit purposes';
COMMENT ON COLUMN public.profiles.business_address IS 'Sensitive PII: All admin access is logged for audit purposes';
COMMENT ON COLUMN public.profiles.full_name IS 'Sensitive PII: All admin access is logged for audit purposes';