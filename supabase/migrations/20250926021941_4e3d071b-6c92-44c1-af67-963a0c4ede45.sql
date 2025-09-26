-- Get detailed structure and sample data from astra_reward_config table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'astra_reward_config'
ORDER BY ordinal_position;

-- Check current RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'astra_reward_config';

-- Sample the financial data that's currently exposed (first 2 rows to understand the vulnerability)
SELECT * FROM public.astra_reward_config LIMIT 2;