-- Restrict financial data access on vendor_astra_balances
-- 1) Remove overly-permissive policy
DROP POLICY IF EXISTS "System can manage balances" ON public.vendor_astra_balances;

-- 2) Ensure RLS is enabled (defensive)
ALTER TABLE public.vendor_astra_balances ENABLE ROW LEVEL SECURITY;

-- 3) Ensure vendors can only view their own balances (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'vendor_astra_balances' 
      AND policyname = 'Vendors can view their own balance'
  ) THEN
    CREATE POLICY "Vendors can view their own balance"
    ON public.vendor_astra_balances
    FOR SELECT
    USING (vendor_id = auth.uid());
  END IF;
END $$;

-- Admin SELECT policy already exists via check_admin_access(); leave as-is
-- No INSERT/UPDATE/DELETE policies are created for end users (denied by default)
