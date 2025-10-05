-- Fix ALL remaining read-only transaction errors by removing INSERT/logging from SELECT policies

-- Drop and recreate all security-related table policies without mutation side-effects
DO $$
DECLARE pol RECORD;
BEGIN
  -- Drop ALL existing policies on security tables
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('user_security_logs', 'login_attempts', 'account_lockouts', 
                      'error_logs', 'system_error_logs', 'financial_data_audit_log',
                      'user_login_alerts', 'vendor_astra_balances')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                   pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- user_security_logs: Pure SELECT access for admins/CS
CREATE POLICY "admins_cs_view_security_logs"
ON public.user_security_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

CREATE POLICY "users_view_own_security_logs"
ON public.user_security_logs FOR SELECT
USING (user_id = auth.uid());

-- login_attempts: Pure SELECT access
CREATE POLICY "admins_cs_view_login_attempts"
ON public.login_attempts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

CREATE POLICY "users_view_own_login_attempts"
ON public.login_attempts FOR SELECT
USING (user_id = auth.uid());

-- account_lockouts: Pure SELECT access
CREATE POLICY "admins_cs_view_lockouts"
ON public.account_lockouts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

CREATE POLICY "users_view_own_lockouts"
ON public.account_lockouts FOR SELECT
USING (user_id = auth.uid());

-- error_logs: Already fixed, ensuring it's correct
CREATE POLICY "admins_cs_view_error_logs"
ON public.error_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

-- system_error_logs: Already fixed
CREATE POLICY "admins_cs_view_system_errors"
ON public.system_error_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

-- financial_data_audit_log: NO logging side-effects
CREATE POLICY "admins_view_financial_audit"
ON public.financial_data_audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- user_login_alerts: Pure SELECT
CREATE POLICY "users_view_own_login_alerts"
ON public.user_login_alerts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "admins_cs_view_login_alerts"
ON public.user_login_alerts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

-- vendor_astra_balances: Remove logging from SELECT
CREATE POLICY "vendors_view_own_balance_clean"
ON public.vendor_astra_balances FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "admins_view_all_balances_clean"
ON public.vendor_astra_balances FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Ensure RLS is enabled on all these tables
ALTER TABLE public.user_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_data_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_astra_balances ENABLE ROW LEVEL SECURITY;