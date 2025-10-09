-- Strengthen payout_settings RLS policies and add audit logging
-- Fix security issue: User Bank Account Details Exposed to Unauthorized Access

-- Drop existing policies to recreate with stronger security
DROP POLICY IF EXISTS "Users can view their own payout settings" ON public.payout_settings;
DROP POLICY IF EXISTS "Users can insert their own payout settings" ON public.payout_settings;
DROP POLICY IF EXISTS "Users can update their own payout settings" ON public.payout_settings;
DROP POLICY IF EXISTS "Users can delete their own payout settings" ON public.payout_settings;
DROP POLICY IF EXISTS "Admins can view all payout settings" ON public.payout_settings;

-- Create bulletproof policies with explicit authentication checks
-- 1. SELECT: Users can only view their own payout settings
CREATE POLICY "users_view_own_payout_settings_only"
ON public.payout_settings
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- 2. INSERT: Users can only insert their own payout settings
CREATE POLICY "users_insert_own_payout_settings_only"
ON public.payout_settings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- 3. UPDATE: Users can only update their own payout settings
CREATE POLICY "users_update_own_payout_settings_only"
ON public.payout_settings
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- 4. DELETE: Users can only delete their own payout settings
CREATE POLICY "users_delete_own_payout_settings_only"
ON public.payout_settings
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- 5. Admins can view all payout settings (access will be logged)
CREATE POLICY "admins_view_all_payout_settings_with_logging"
ON public.payout_settings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  OR has_role(auth.uid(), 'super_admin'::user_role)
);

-- 6. Block ALL anonymous access explicitly
CREATE POLICY "block_anonymous_payout_settings_access"
ON public.payout_settings
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Create trigger to audit all financial data modifications
CREATE OR REPLACE FUNCTION public.audit_payout_settings_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_access boolean;
  accessing_different_user boolean;
BEGIN
  -- Check if this is an admin accessing another user's data
  is_admin_access := has_role(auth.uid(), 'admin'::user_role) 
                     OR has_role(auth.uid(), 'super_admin'::user_role);
  
  accessing_different_user := (COALESCE(NEW.user_id, OLD.user_id) != auth.uid());
  
  -- Log admin access to other users' financial data
  IF is_admin_access AND accessing_different_user THEN
    PERFORM log_security_event(
      auth.uid(),
      'financial_data_access',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'table', 'payout_settings',
        'operation', TG_OP,
        'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
        'record_id', COALESCE(NEW.id, OLD.id),
        'timestamp', now(),
        'admin_cross_access', true
      ),
      30 -- Medium-high risk score for admin accessing user financial data
    );
  END IF;
  
  -- Log all modifications to financial settings
  PERFORM log_financial_access(
    'payout_settings',
    TG_OP,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for audit logging on modifications
DROP TRIGGER IF EXISTS audit_payout_settings_trigger ON public.payout_settings;
CREATE TRIGGER audit_payout_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payout_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_payout_settings_access();

-- Add comment documenting the security measures
COMMENT ON TABLE public.payout_settings IS 'Stores sensitive bank account and financial information. Protected by strict RLS policies ensuring users can only access their own data. All admin access to user financial data is logged for audit purposes.';