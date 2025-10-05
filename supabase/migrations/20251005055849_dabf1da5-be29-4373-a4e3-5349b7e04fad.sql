-- Fix read-only transaction issue in security monitoring
-- Remove INSERT operations from SELECT policies

-- Drop existing SELECT policies that try to log
DROP POLICY IF EXISTS "Security personnel can view login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Security personnel can view account lockouts" ON public.account_lockouts;
DROP POLICY IF EXISTS "Security personnel can view security logs" ON public.user_security_logs;

-- Create new SELECT policies without logging
CREATE POLICY "Security personnel can view login attempts" 
ON public.login_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "Security personnel can view account lockouts" 
ON public.account_lockouts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "Security personnel can view security logs" 
ON public.user_security_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'customer_service')
  )
);