-- Ensure safe, read-only SELECT access for security monitoring logs
-- Drop ALL existing policies on user_security_logs to remove any logging side-effects in SELECT
DO $$
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_security_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_security_logs', pol.policyname);
  END LOOP;
END $$;

-- Recreate minimal, non-mutating SELECT policies
CREATE POLICY "Admins and CS can view user security logs"
ON public.user_security_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin','customer_service')
  )
);

CREATE POLICY "Users can view own user security logs"
ON public.user_security_logs
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Optional: ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.user_security_logs ENABLE ROW LEVEL SECURITY;