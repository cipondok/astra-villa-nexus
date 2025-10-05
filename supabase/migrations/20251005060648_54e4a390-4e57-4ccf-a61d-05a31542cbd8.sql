-- Ensure error logs are readable without mutating side-effects in SELECT
DO $$
DECLARE pol RECORD;
BEGIN
  -- Drop existing policies on error_logs
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'error_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.error_logs', pol.policyname);
  END LOOP;
  
  -- Drop existing policies on system_error_logs
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_error_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.system_error_logs', pol.policyname);
  END LOOP;
END $$;

-- Create minimal SELECT policies (no logging in USING clause)
CREATE POLICY "Admins and CS can view error logs"
ON public.error_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

CREATE POLICY "Admins and CS can view system error logs"
ON public.system_error_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin','customer_service')
  )
);

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_logs ENABLE ROW LEVEL SECURITY;