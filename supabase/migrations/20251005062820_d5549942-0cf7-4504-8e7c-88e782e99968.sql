-- Fix read-only transaction errors when selecting from profiles
-- by removing any side-effecting RLS policies and recreating minimal, read-only policies

DO $$
DECLARE pol RECORD;
BEGIN
  -- Ensure table exists before operating (safety)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='profiles'
  ) THEN
    RAISE NOTICE 'Table public.profiles does not exist, skipping policy fixes';
    RETURN;
  END IF;

  -- Drop all existing policies on profiles
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname='public' AND tablename='profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;

  -- Enable RLS (idempotent)
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Minimal, side-effect-free policies
  -- 1) Users can view their own profile
  CREATE POLICY "users_select_own_profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

  -- 2) Admins can view all profiles
  CREATE POLICY "admins_select_all_profiles"
  ON public.profiles
  FOR SELECT
  USING (
    COALESCE(public.is_current_user_admin(), false)
    OR COALESCE(public.is_admin_user(), false)
  );

  -- 3) Users can update their own profile
  CREATE POLICY "users_update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

  -- 4) Admins can manage all profiles (update/delete)
  CREATE POLICY "admins_manage_profiles"
  ON public.profiles
  FOR ALL
  USING (COALESCE(public.is_current_user_admin(), false) OR COALESCE(public.is_admin_user(), false))
  WITH CHECK (COALESCE(public.is_current_user_admin(), false) OR COALESCE(public.is_admin_user(), false));

  -- 5) Allow inserts only for self or admin (profiles are generally created by trigger)
  CREATE POLICY "self_or_admin_insert_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    id = auth.uid() 
    OR COALESCE(public.is_current_user_admin(), false) 
    OR COALESCE(public.is_admin_user(), false)
  );
END $$;
