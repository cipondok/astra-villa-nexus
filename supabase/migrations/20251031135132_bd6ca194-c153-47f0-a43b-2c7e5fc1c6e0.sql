-- Fix payment_logs RLS vulnerability
-- Drop the overly permissive policy that allows any authenticated user to manage all payment logs
DROP POLICY IF EXISTS "System can manage payment logs" ON public.payment_logs;

-- The correct policy "Users can view their own payment logs" already exists
-- But we need to ensure proper INSERT/UPDATE/DELETE policies

-- Only service role (edge functions) can insert payment logs
CREATE POLICY "service_insert_payment_logs" ON public.payment_logs
FOR INSERT TO authenticated
WITH CHECK (false); -- Client-side inserts blocked; only service role can insert

-- Only admins can update payment logs (for corrections/auditing)
CREATE POLICY "admins_update_payment_logs" ON public.payment_logs
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Only admins can delete payment logs (for data cleanup)
CREATE POLICY "admins_delete_payment_logs" ON public.payment_logs
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);