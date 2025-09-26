-- Verify the security fix for astra_reward_config table is properly working
-- Check current RLS status and policies

SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT array_agg(policyname) 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'astra_reward_config') as current_policies
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'astra_reward_config';

-- Verify our security functions exist
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'can_access_financial_reward_config_strict',
    'check_user_reward_eligibility',
    'get_full_reward_configuration',
    'mask_financial_reward_data'
  );

-- Test anonymous access (should be completely blocked)
SET ROLE anon;
SELECT COUNT(*) as should_be_zero 
FROM public.astra_reward_config 
LIMIT 1;

-- Reset role
RESET ROLE;

-- Verify table security comment
SELECT obj_description('public.astra_reward_config'::regclass) as security_documentation;