-- Verify the security fix for vendor_categories_hierarchy table is working
-- Check current RLS status and policies

SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT array_agg(policyname) 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'vendor_categories_hierarchy') as current_policies
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'vendor_categories_hierarchy';

-- Check if our security functions exist
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'can_access_vendor_categories_strict',
    'get_safe_vendor_categories',
    'get_vendor_pricing_data'
  );

-- Test anonymous access (should be blocked)
SET ROLE anon;
SELECT COUNT(*) as should_be_zero 
FROM public.vendor_categories_hierarchy 
LIMIT 1;

-- Reset role
RESET ROLE;

-- Verify table comment for security documentation
SELECT obj_description('public.vendor_categories_hierarchy'::regclass) as security_comment;