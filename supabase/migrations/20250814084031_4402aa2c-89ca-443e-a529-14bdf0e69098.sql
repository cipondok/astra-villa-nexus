-- Secure astra_token_balances: restrict reads to owner and admins only
-- 1) Ensure RLS is enabled
ALTER TABLE public.astra_token_balances ENABLE ROW LEVEL SECURITY;

-- 2) Drop any overly-permissive SELECT/ALL policies except the approved ones
DO $$
DECLARE r record;
BEGIN
  FOR r IN 
    SELECT policyname, cmd 
    FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='astra_token_balances'
      AND cmd IN ('SELECT','ALL')
      AND policyname NOT IN ('Users can view their own balances', 'Admins can view all balances')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.astra_token_balances', r.policyname);
  END LOOP;
END $$;

-- 3) Ensure least-privilege read policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='astra_token_balances' AND policyname='Users can view their own balances') THEN
    CREATE POLICY "Users can view their own balances"
    ON public.astra_token_balances
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='astra_token_balances' AND policyname='Admins can view all balances') THEN
    CREATE POLICY "Admins can view all balances"
    ON public.astra_token_balances
    FOR SELECT
    USING (check_admin_access());
  END IF;
END $$;

-- Note: We are not modifying write policies here to avoid breaking existing system writes.
