-- Harden access to vendor_business_profiles
-- 1) Drop public read policy
DROP POLICY IF EXISTS "Anyone can view active vendor profiles" ON public.vendor_business_profiles;

-- 2) Ensure RLS is enabled (defensive)
ALTER TABLE public.vendor_business_profiles ENABLE ROW LEVEL SECURITY;

-- 3) Allow only authenticated users to view active vendor profiles
CREATE POLICY "Authenticated users can view active vendor profiles"
ON public.vendor_business_profiles
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- 4) Ensure admins retain full management access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'vendor_business_profiles' 
      AND policyname = 'Admins can manage vendor business profiles'
  ) THEN
    CREATE POLICY "Admins can manage vendor business profiles"
    ON public.vendor_business_profiles
    FOR ALL
    USING (check_admin_access())
    WITH CHECK (check_admin_access());
  END IF;
END $$;

-- Note: The existing vendor self-management policy remains and continues to allow vendors to manage their own record.