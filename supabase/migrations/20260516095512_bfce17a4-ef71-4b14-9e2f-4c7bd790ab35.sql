-- Security fix: tighten overly permissive RLS policies (USING true / WITH CHECK true) on write operations.
-- Edge functions use service_role which bypasses RLS, so removing these client-facing write paths is safe.
-- ALL policies with qual=true and with_check=true are downgraded to SELECT-only to preserve client reads.

DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop INSERT/UPDATE/DELETE policies with WITH CHECK true (client-side write bypass)
  FOR r IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd IN ('INSERT','UPDATE','DELETE')
      AND (with_check = 'true' OR qual = 'true')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;

  -- Convert ALL policies with qual=true and with_check=true into SELECT-only USING(true)
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'ALL'
      AND qual = 'true'
      AND with_check = 'true'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING (true)',
      r.policyname || '_read',
      r.tablename
    );
  END LOOP;
END $$;