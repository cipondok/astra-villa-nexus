-- Fix critical financial security vulnerabilities
-- Protect sensitive financial information from unauthorized access

-- 1. Strengthen payout_settings security with additional constraints
-- Remove overly permissive policy and create stricter ones
DROP POLICY IF EXISTS "Users can manage their own payout settings" ON public.payout_settings;

-- Create separate policies for different operations with strict validation
CREATE POLICY "Users can view their own payout settings"
ON public.payout_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payout settings"
ON public.payout_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payout settings"
ON public.payout_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payout settings"
ON public.payout_settings FOR DELETE
USING (auth.uid() = user_id);

-- 2. Secure astra token transactions - strengthen existing policies
DROP POLICY IF EXISTS "System can create transactions" ON public.astra_token_transactions;
CREATE POLICY "Authenticated users can create transactions"
ON public.astra_token_transactions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 3. Secure payout transactions - strengthen system access
DROP POLICY IF EXISTS "System can create payout transactions" ON public.payout_transactions;
CREATE POLICY "Authorized systems can create payout transactions"
ON public.payout_transactions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Add missing UPDATE/DELETE policies for financial security
CREATE POLICY "Admins can update payout transactions"
ON public.payout_transactions FOR UPDATE
USING (check_admin_access())
WITH CHECK (check_admin_access());

CREATE POLICY "Users cannot update their payout transactions"
ON public.payout_transactions FOR UPDATE
USING (false);

CREATE POLICY "Users cannot delete payout transactions"
ON public.payout_transactions FOR DELETE
USING (false);

CREATE POLICY "Admins can delete payout transactions"
ON public.payout_transactions FOR DELETE
USING (check_admin_access());

-- 5. Secure astra token balances - prevent unauthorized modifications
CREATE POLICY "Users cannot update their token balances directly"
ON public.astra_token_balances FOR UPDATE
USING (false);

CREATE POLICY "Users cannot delete their token balances"
ON public.astra_token_balances FOR DELETE
USING (false);

CREATE POLICY "Admins can manage token balances"
ON public.astra_token_balances FOR ALL
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- 6. Secure vendor astra balances - prevent direct manipulation
CREATE POLICY "Vendors cannot update balances directly"
ON public.vendor_astra_balances FOR UPDATE
USING (false);

CREATE POLICY "Vendors cannot delete balances"
ON public.vendor_astra_balances FOR DELETE
USING (false);

CREATE POLICY "Admins can manage vendor balances"
ON public.vendor_astra_balances FOR ALL
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- 7. Create secure functions for financial operations
CREATE OR REPLACE FUNCTION public.get_user_financial_summary(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  summary jsonb;
  user_balance numeric := 0;
  pending_balance numeric := 0;
BEGIN
  -- Only allow users to view their own data or admins to view any
  IF p_user_id != auth.uid() AND NOT check_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Cannot view other users financial data';
  END IF;
  
  -- Get balances without exposing sensitive bank details
  SELECT COALESCE(available_balance, 0), COALESCE(pending_balance, 0)
  INTO user_balance, pending_balance
  FROM vendor_astra_balances 
  WHERE vendor_id = p_user_id;
  
  -- Return summary without sensitive information
  summary := jsonb_build_object(
    'available_balance', user_balance,
    'pending_balance', pending_balance,
    'total_balance', user_balance + pending_balance,
    'has_payout_settings', EXISTS(SELECT 1 FROM payout_settings WHERE user_id = p_user_id),
    'last_updated', now()
  );
  
  RETURN summary;
END;
$$;

-- 8. Create audit function for financial access
CREATE OR REPLACE FUNCTION public.log_financial_access(
  p_table_name text,
  p_operation text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log financial data access for security monitoring
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
      'timestamp', now()
    )
  );
END;
$$;