-- CRITICAL SECURITY FIX: Secure astra_reward_config table immediately
-- Issue: Financial Reward Configuration Data Exposed to Public

-- 1. Enable Row Level Security on astra_reward_config table immediately
ALTER TABLE public.astra_reward_config ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function for strict financial data access
CREATE OR REPLACE FUNCTION public.can_access_financial_reward_config_strict(operation text DEFAULT 'SELECT')
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
  
  -- Deny anonymous access completely to financial data
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  -- Only super admin and specific financial roles can access reward configuration
  IF check_super_admin_email() OR user_role = 'admin' OR check_admin_access() THEN
    -- Log access to sensitive financial reward data
    PERFORM log_security_event(
      current_user_id,
      'financial_reward_config_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'operation', operation,
        'access_type', 'financial_reward_configuration',
        'security_critical', true,
        'timestamp', now()
      ),
      50 -- Very high risk for financial configuration access
    );
    RETURN true;
  END IF;
  
  -- Deny all other access to prevent financial intelligence theft
  RETURN false;
END;
$$;

-- 3. Create function for safe user reward eligibility check (no amounts exposed)
CREATE OR REPLACE FUNCTION public.check_user_reward_eligibility(user_id_param uuid, reward_type_param text)
RETURNS TABLE(
  is_eligible boolean,
  reward_type text,
  user_role text,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user is authenticated and can only check their own eligibility
  IF auth.uid() IS NULL OR (auth.uid() != user_id_param AND NOT check_admin_access()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only check own reward eligibility';
  END IF;
  
  -- Log eligibility check (no financial amounts exposed)
  PERFORM log_security_event(
    auth.uid(),
    'reward_eligibility_check',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'checked_user_id', user_id_param,
      'reward_type', reward_type_param,
      'is_self_check', (auth.uid() = user_id_param)
    ),
    5 -- Low risk for eligibility check
  );

  RETURN QUERY
  SELECT 
    arc.is_active as is_eligible,
    arc.reward_type,
    arc.user_role,
    arc.valid_from,
    arc.valid_until
  FROM public.astra_reward_config arc
  JOIN public.profiles p ON p.role::text = arc.user_role
  WHERE p.id = user_id_param
    AND arc.reward_type = reward_type_param
    AND arc.is_active = true
    AND (arc.valid_from IS NULL OR arc.valid_from <= now())
    AND (arc.valid_until IS NULL OR arc.valid_until >= now())
  LIMIT 1;
  -- Note: Financial amounts are NOT exposed to prevent competitive intelligence theft
END;
$$;

-- 4. Create admin-only function for full financial reward management
CREATE OR REPLACE FUNCTION public.get_full_reward_configuration(reward_type_param text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  reward_type text,
  user_role text,
  reward_amount numeric,
  percentage_rate numeric,
  conditions jsonb,
  is_active boolean,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admin can access full financial reward configuration
  IF NOT check_super_admin_email() THEN
    RAISE EXCEPTION 'Insufficient permissions: Super admin access required for financial reward configuration';
  END IF;

  -- Log admin access to complete financial data
  PERFORM log_security_event(
    auth.uid(),
    'full_reward_config_admin_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'reward_type_filter', reward_type_param,
      'access_type', 'complete_financial_configuration',
      'security_critical', true,
      'admin_access', true
    ),
    60 -- Very high risk for complete financial data access
  );

  RETURN QUERY
  SELECT 
    arc.id,
    arc.reward_type,
    arc.user_role,
    arc.reward_amount,
    arc.percentage_rate,
    arc.conditions,
    arc.is_active,
    arc.valid_from,
    arc.valid_until,
    arc.created_at,
    arc.updated_at
  FROM public.astra_reward_config arc
  WHERE (reward_type_param IS NULL OR arc.reward_type = reward_type_param)
  ORDER BY arc.created_at DESC;
END;
$$;

-- 5. Create restrictive RLS policies for astra_reward_config
-- Policy 1: Block ALL direct access to financial reward configuration
CREATE POLICY "block_all_direct_access_to_reward_config" 
ON public.astra_reward_config 
FOR ALL
USING (false);

-- Policy 2: Super admin only access with strict validation and logging
CREATE POLICY "super_admin_only_reward_config_access" 
ON public.astra_reward_config 
FOR ALL
USING (can_access_financial_reward_config_strict());

-- 6. Create audit trigger for financial reward configuration access
CREATE OR REPLACE FUNCTION public.audit_financial_reward_config_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access attempts to sensitive financial reward configuration
  PERFORM log_security_event(
    auth.uid(),
    'reward_config_' || lower(TG_OP),
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'reward_config_id', COALESCE(NEW.id, OLD.id),
      'operation', TG_OP,
      'reward_type', COALESCE(NEW.reward_type, OLD.reward_type),
      'user_role', COALESCE(NEW.user_role, OLD.user_role),
      'has_financial_data', (
        COALESCE(NEW.reward_amount, OLD.reward_amount) IS NOT NULL OR
        COALESCE(NEW.percentage_rate, OLD.percentage_rate) IS NOT NULL
      ),
      'financial_exposure_risk', 'critical',
      'timestamp', now()
    ),
    CASE WHEN check_super_admin_email() THEN 40 ELSE 95 END -- Extremely high risk for non-admin access
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_financial_reward_config_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.astra_reward_config
  FOR EACH ROW EXECUTE FUNCTION audit_financial_reward_config_access();

-- 7. Add critical security documentation
COMMENT ON TABLE public.astra_reward_config IS 
'SECURITY CRITICAL: Contains highly sensitive financial reward configuration including amounts, rates, and business strategy. Direct access completely blocked. Use check_user_reward_eligibility() for user context or get_full_reward_configuration() for super admin access only.';

-- 8. Create function to mask financial data in logs
CREATE OR REPLACE FUNCTION public.mask_financial_reward_data(amount numeric, data_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE data_type
    WHEN 'amount' THEN
      -- Mask reward amounts: show only magnitude
      IF amount IS NOT NULL THEN
        IF amount >= 1000 THEN
          RETURN '****(4+ digits)';
        ELSIF amount >= 100 THEN
          RETURN '***(3 digits)';
        ELSIF amount >= 10 THEN
          RETURN '**(2 digits)';
        ELSE
          RETURN '*(1 digit)';
        END IF;
      ELSE
        RETURN 'N/A';
      END IF;
    WHEN 'percentage' THEN
      -- Mask percentage rates
      IF amount IS NOT NULL THEN
        RETURN '*.' || right(amount::text, 1) || '%';
      ELSE
        RETURN 'N/A';
      END IF;
    ELSE
      RETURN '***';
  END CASE;
END;
$$;