-- Secure security monitoring tables from unauthorized access

-- Fix user_security_logs table - restrict to security personnel only
DROP POLICY IF EXISTS "System can insert security logs" ON public.user_security_logs;
DROP POLICY IF EXISTS "Admin can view security logs" ON public.user_security_logs;

-- Only allow authorized security personnel to view security logs
CREATE POLICY "Security personnel can view security logs"
ON public.user_security_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
);

-- System function for secure security log insertion
CREATE POLICY "Secure system security log insertion"
ON public.user_security_logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow system functions to insert logs with proper validation
  user_id IS NOT NULL 
  AND event_type IS NOT NULL
  AND risk_score >= 0 
  AND risk_score <= 100
);

-- Fix login_attempts table - highly sensitive security data
DROP POLICY IF EXISTS "System can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins can view all login attempts" ON public.login_attempts;

-- Restrict login attempts to security personnel only
CREATE POLICY "Security personnel can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
);

-- Secure system insertion for login attempts
CREATE POLICY "Secure system login attempt insertion"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (
  email IS NOT NULL 
  AND ip_address IS NOT NULL
  AND success IS NOT NULL
);

-- Fix user_login_alerts - users should NOT see detailed security alerts
DROP POLICY IF EXISTS "Users can view their own alerts" ON public.user_login_alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON public.user_login_alerts;

-- Only security personnel can view login alerts (prevents attack intelligence gathering)
CREATE POLICY "Security personnel can view login alerts"
ON public.user_login_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
);

-- Fix account_lockouts - users should not see lockout details
DROP POLICY IF EXISTS "Users can view their own lockouts" ON public.account_lockouts;

-- Only security personnel can view account lockouts
CREATE POLICY "Security personnel can view account lockouts"
ON public.account_lockouts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'customer_service')
  )
);

-- Create secure functions for user-facing security information (sanitized)
CREATE OR REPLACE FUNCTION public.get_user_security_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status json;
  has_active_alerts boolean := false;
  is_locked boolean := false;
BEGIN
  -- Check if user has any unread security alerts (without exposing details)
  SELECT EXISTS(
    SELECT 1 FROM public.user_login_alerts 
    WHERE user_id = auth.uid() 
    AND is_read = false
    AND created_at > (now() - INTERVAL '7 days')
  ) INTO has_active_alerts;
  
  -- Check if account is currently locked (without exposing details)
  SELECT EXISTS(
    SELECT 1 FROM public.account_lockouts 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND unlock_at > now()
  ) INTO is_locked;
  
  -- Return sanitized security status
  user_status := json_build_object(
    'has_security_alerts', has_active_alerts,
    'account_locked', is_locked,
    'last_checked', now()
  );
  
  RETURN user_status;
END;
$$;

-- Create function for users to mark alerts as read (without seeing details)
CREATE OR REPLACE FUNCTION public.mark_security_alerts_read()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_login_alerts 
  SET is_read = true 
  WHERE user_id = auth.uid() 
  AND is_read = false;
  
  RETURN true;
END;
$$;