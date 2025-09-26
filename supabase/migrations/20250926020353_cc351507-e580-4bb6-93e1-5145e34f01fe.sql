-- Analyze current security state of profiles table
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check current RLS status and policies
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  (SELECT array_agg(policyname) 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'profiles') as policies
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check for any existing sensitive data exposure
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('email', 'phone', 'business_address', 'npwp_number', 'license_number', 'nik', 'passport_number');