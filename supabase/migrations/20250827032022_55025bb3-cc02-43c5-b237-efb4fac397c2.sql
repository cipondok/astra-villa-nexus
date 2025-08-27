-- Secure Vendor Financial Information (Fixed)
-- Remove existing overlapping and potentially insecure policies on vendor_astra_balances
DROP POLICY IF EXISTS "Admins can manage vendor balances" ON vendor_astra_balances;
DROP POLICY IF EXISTS "Admins can view all balances" ON vendor_astra_balances;
DROP POLICY IF EXISTS "Vendors can only view their own astra balances" ON vendor_astra_balances;
DROP POLICY IF EXISTS "Vendors can view their own balance" ON vendor_astra_balances;
DROP POLICY IF EXISTS "Vendors cannot delete balances" ON vendor_astra_balances;
DROP POLICY IF EXISTS "Vendors cannot update balances directly" ON vendor_astra_balances;

-- Drop and recreate the log_financial_access function with return value
DROP FUNCTION IF EXISTS public.log_financial_access(text, text, uuid);

CREATE OR REPLACE FUNCTION public.log_financial_access(p_table_name text, p_operation text, p_user_id uuid DEFAULT auth.uid())
RETURNS text
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
  
  -- Return a confirmation value for RLS policy usage
  RETURN 'logged';
END;
$$;

-- Create a function to check if user has financial admin access
CREATE OR REPLACE FUNCTION public.check_financial_admin_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  -- Get current user info directly without triggering RLS
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user is super admin by email (financial access)
  IF user_email = 'mycode103@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Check if user has admin role with financial permissions
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Only specific admin roles should access financial data
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create comprehensive and secure RLS policies for vendor_astra_balances

-- 1. Vendors can only view their own balance (with logging)
CREATE POLICY "Vendors view own balance only with logging"
ON vendor_astra_balances
FOR SELECT
USING (
  vendor_id = auth.uid() AND 
  log_financial_access('vendor_astra_balances', 'SELECT', auth.uid()) IS NOT NULL
);

-- 2. Only financial admins can view all balances
CREATE POLICY "Financial admins view all balances"
ON vendor_astra_balances
FOR SELECT
USING (
  check_financial_admin_access() AND
  log_financial_access('vendor_astra_balances', 'SELECT_ALL', auth.uid()) IS NOT NULL
);

-- 3. Only financial admins can update balances (system operations)
CREATE POLICY "Financial admins manage balances"
ON vendor_astra_balances
FOR UPDATE
USING (check_financial_admin_access())
WITH CHECK (check_financial_admin_access());

-- 4. Only financial admins can insert new balance records
CREATE POLICY "Financial admins create balance records"
ON vendor_astra_balances
FOR INSERT
WITH CHECK (check_financial_admin_access());

-- 5. Prevent deletion of financial records entirely
CREATE POLICY "No deletion of financial records"
ON vendor_astra_balances
FOR DELETE
USING (false);

-- Create a secure function for vendors to get their financial summary
CREATE OR REPLACE FUNCTION public.get_vendor_financial_summary_secure()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  summary jsonb;
  vendor_balance_record RECORD;
BEGIN
  -- Only allow vendors to access their own data or admins to access any
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log the financial access
  PERFORM log_financial_access('vendor_astra_balances', 'SUMMARY_VIEW', auth.uid());
  
  -- Get vendor's balance information
  SELECT 
    available_balance,
    pending_balance,
    total_earned,
    total_withdrawn,
    last_transaction_at
  INTO vendor_balance_record
  FROM vendor_astra_balances 
  WHERE vendor_id = auth.uid();
  
  -- If no balance record exists, return default values
  IF vendor_balance_record IS NULL THEN
    summary := jsonb_build_object(
      'available_balance', 0,
      'pending_balance', 0,
      'total_balance', 0,
      'total_earned', 0,
      'total_withdrawn', 0,
      'last_transaction_at', null,
      'has_balance_record', false,
      'last_checked', now()
    );
  ELSE
    -- Return sanitized financial summary (no sensitive internal data)
    summary := jsonb_build_object(
      'available_balance', vendor_balance_record.available_balance,
      'pending_balance', vendor_balance_record.pending_balance,
      'total_balance', vendor_balance_record.available_balance + vendor_balance_record.pending_balance,
      'total_earned', vendor_balance_record.total_earned,
      'total_withdrawn', vendor_balance_record.total_withdrawn,
      'last_transaction_at', vendor_balance_record.last_transaction_at,
      'has_balance_record', true,
      'last_checked', now()
    );
  END IF;
  
  RETURN summary;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error attempt
    PERFORM log_security_event(
      auth.uid(),
      'financial_access_error',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'error', SQLERRM,
        'function', 'get_vendor_financial_summary_secure'
      ),
      70
    );
    RAISE EXCEPTION 'Unable to retrieve financial information';
END;
$$;

-- Create a secure function for financial admins to get vendor balance details
CREATE OR REPLACE FUNCTION public.get_vendor_balance_admin(p_vendor_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  balance_data jsonb;
BEGIN
  -- Only allow financial admins to access this function
  IF NOT check_financial_admin_access() THEN
    RAISE EXCEPTION 'Access denied: Financial admin privileges required';
  END IF;
  
  -- Log the admin financial access
  PERFORM log_financial_access('vendor_astra_balances', 'ADMIN_VIEW', auth.uid());
  
  -- Get complete balance information for admin view
  SELECT jsonb_build_object(
    'vendor_id', vendor_id,
    'available_balance', available_balance,
    'pending_balance', pending_balance,
    'total_earned', total_earned,
    'total_withdrawn', total_withdrawn,
    'last_transaction_at', last_transaction_at,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO balance_data
  FROM vendor_astra_balances
  WHERE vendor_id = p_vendor_id;
  
  -- Return data or null if vendor not found
  RETURN COALESCE(balance_data, jsonb_build_object('error', 'Vendor balance not found'));
END;
$$;