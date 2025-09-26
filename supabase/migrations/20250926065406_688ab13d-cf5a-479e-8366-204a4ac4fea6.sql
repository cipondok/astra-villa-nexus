-- Secure astra_reward_config table with RLS and admin-only access
-- 1) Enable RLS (default deny)
ALTER TABLE public.astra_reward_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astra_reward_config FORCE ROW LEVEL SECURITY;

-- 2) Create admin-only policies for full management
DO $$
BEGIN
  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'astra_reward_config' 
      AND policyname = 'Admins can select astra_reward_config'
  ) THEN
    CREATE POLICY "Admins can select astra_reward_config"
      ON public.astra_reward_config
      FOR SELECT
      USING (check_admin_access());
  END IF;

  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'astra_reward_config' 
      AND policyname = 'Admins can insert astra_reward_config'
  ) THEN
    CREATE POLICY "Admins can insert astra_reward_config"
      ON public.astra_reward_config
      FOR INSERT
      WITH CHECK (check_admin_access());
  END IF;

  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'astra_reward_config' 
      AND policyname = 'Admins can update astra_reward_config'
  ) THEN
    CREATE POLICY "Admins can update astra_reward_config"
      ON public.astra_reward_config
      FOR UPDATE
      USING (check_admin_access())
      WITH CHECK (check_admin_access());
  END IF;

  -- DELETE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'astra_reward_config' 
      AND policyname = 'Admins can delete astra_reward_config'
  ) THEN
    CREATE POLICY "Admins can delete astra_reward_config"
      ON public.astra_reward_config
      FOR DELETE
      USING (check_admin_access());
  END IF;
END $$;

-- 3) Optional: Revoke any legacy grants to prevent bypass (harmless if none)
REVOKE ALL ON public.astra_reward_config FROM PUBLIC;
REVOKE ALL ON public.astra_reward_config FROM authenticated;