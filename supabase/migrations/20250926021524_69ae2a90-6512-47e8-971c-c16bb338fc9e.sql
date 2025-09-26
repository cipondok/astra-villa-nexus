-- CRITICAL SECURITY FIX: Secure rejection codes table to prevent security bypass
-- Issue: Application Rejection Logic Exposed to Bad Actors

-- 1. Enable Row Level Security on indonesian_rejection_codes table  
ALTER TABLE public.indonesian_rejection_codes ENABLE ROW LEVEL SECURITY;

-- 2. Also secure the validation rules table (contains validation logic)
ALTER TABLE public.indonesian_validation_rules ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function for controlled access to rejection codes
CREATE OR REPLACE FUNCTION public.can_access_rejection_codes_strict(operation text DEFAULT 'SELECT')
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
  
  -- Deny anonymous access completely (critical for security)
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  -- Only admins and customer service can access rejection logic
  IF user_role IN ('admin', 'customer_service') OR check_admin_access() THEN
    -- Log access to sensitive rejection data
    PERFORM log_security_event(
      current_user_id,
      'rejection_codes_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'operation', operation,
        'timestamp', now(),
        'access_type', 'full_rejection_logic'
      ),
      25 -- Medium-high risk for accessing rejection logic
    );
    RETURN true;
  END IF;
  
  -- Deny all other access to prevent security bypass
  RETURN false;
END;
$$;

-- 4. Create secure function for legitimate user error context (minimal info only)
CREATE OR REPLACE FUNCTION public.get_safe_rejection_context(rejection_code text)
RETURNS TABLE(
  code varchar,
  category varchar,
  reason_en text,
  reason_id text,
  estimated_fix_hours integer,
  is_auto_resubmit_allowed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for rejection context';
  END IF;
  
  -- Log the controlled access
  PERFORM log_security_event(
    auth.uid(),
    'safe_rejection_context_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'rejection_code', rejection_code,
      'access_type', 'safe_context_only'
    ),
    10 -- Low risk for safe context access
  );

  RETURN QUERY
  SELECT 
    irc.code,
    irc.category,
    irc.reason_en,
    irc.reason_id,
    irc.estimated_fix_time_hours,
    irc.auto_resubmit_allowed
  FROM public.indonesian_rejection_codes irc
  WHERE irc.code = rejection_code
    AND irc.is_active = true
  LIMIT 1;
  -- Note: Resolution steps are NOT included to prevent security bypass
END;
$$;

-- 5. Create admin-only function for full rejection management
CREATE OR REPLACE FUNCTION public.get_full_rejection_data(rejection_code text DEFAULT NULL)
RETURNS TABLE(
  code varchar,
  category varchar,
  reason_en text,
  reason_id text,
  description_en text,
  description_id text,
  resolution_steps_en jsonb,
  resolution_steps_id jsonb,
  estimated_fix_time_hours integer,
  auto_resubmit_allowed boolean,
  requires_document_upload boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access full rejection logic
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Insufficient permissions: Admin access required for rejection management';
  END IF;

  -- Log admin access to full rejection data
  PERFORM log_security_event(
    auth.uid(),
    'full_rejection_data_admin_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'rejection_code', rejection_code,
      'access_type', 'full_admin_access',
      'security_sensitive', true
    ),
    40 -- High risk for full rejection logic access
  );

  RETURN QUERY
  SELECT 
    irc.code,
    irc.category,
    irc.reason_en,
    irc.reason_id,
    irc.description_en,
    irc.description_id,
    irc.resolution_steps_en,
    irc.resolution_steps_id,
    irc.estimated_fix_time_hours,
    irc.auto_resubmit_allowed,
    irc.requires_document_upload
  FROM public.indonesian_rejection_codes irc
  WHERE (rejection_code IS NULL OR irc.code = rejection_code)
    AND irc.is_active = true;
END;
$$;

-- 6. Create restrictive RLS policies for indonesian_rejection_codes
-- Policy 1: Block all direct access to rejection codes table
CREATE POLICY "block_direct_access_to_rejection_codes" 
ON public.indonesian_rejection_codes 
FOR ALL
USING (false);

-- Policy 2: Admin-only access with strict validation
CREATE POLICY "admin_only_rejection_codes_access" 
ON public.indonesian_rejection_codes 
FOR ALL
USING (can_access_rejection_codes_strict());

-- 7. Create restrictive RLS policies for indonesian_validation_rules  
-- Policy 1: Block all direct access to validation rules
CREATE POLICY "block_direct_access_to_validation_rules" 
ON public.indonesian_validation_rules 
FOR ALL
USING (false);

-- Policy 2: Admin-only access to validation rules
CREATE POLICY "admin_only_validation_rules_access" 
ON public.indonesian_validation_rules 
FOR ALL
USING (can_access_rejection_codes_strict());

-- 8. Create audit trigger for rejection codes access
CREATE OR REPLACE FUNCTION public.audit_rejection_codes_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access attempts to sensitive rejection logic
  PERFORM log_security_event(
    auth.uid(),
    'rejection_codes_' || lower(TG_OP),
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'rejection_code', COALESCE(NEW.code, OLD.code),
      'operation', TG_OP,
      'category', COALESCE(NEW.category, OLD.category),
      'has_resolution_steps', (
        COALESCE(NEW.resolution_steps_en, OLD.resolution_steps_en) IS NOT NULL
      ),
      'security_critical', true,
      'timestamp', now()
    ),
    CASE WHEN check_admin_access() THEN 30 ELSE 90 END -- Very high risk for non-admin access
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_rejection_codes_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.indonesian_rejection_codes
  FOR EACH ROW EXECUTE FUNCTION audit_rejection_codes_access();

-- 9. Add security documentation comments
COMMENT ON TABLE public.indonesian_rejection_codes IS 
'SECURITY CRITICAL: Contains application rejection logic and resolution steps. Direct access blocked to prevent security bypass. Use get_safe_rejection_context() for user context or get_full_rejection_data() for admin access.';

COMMENT ON TABLE public.indonesian_validation_rules IS 
'SECURITY CRITICAL: Contains validation logic patterns. Access restricted to prevent circumvention of security checks.';

-- 10. Create function to validate rejection code access patterns
CREATE OR REPLACE FUNCTION public.log_rejection_code_usage(
  rejection_code text,
  usage_context text,
  application_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log usage patterns for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'rejection_code_usage_pattern',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'rejection_code', rejection_code,
      'usage_context', usage_context,
      'application_id', application_id,
      'timestamp', now()
    ),
    15 -- Medium risk for usage pattern monitoring
  );
END;
$$;