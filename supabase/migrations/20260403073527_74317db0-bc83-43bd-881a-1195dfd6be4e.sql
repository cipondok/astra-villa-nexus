CREATE POLICY "Admin can view all security logs"
ON public.user_security_logs
FOR SELECT
TO authenticated
USING (check_admin_access());