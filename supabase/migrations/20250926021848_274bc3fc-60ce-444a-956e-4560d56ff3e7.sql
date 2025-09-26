-- Analyze astra_reward_config table security vulnerability
-- Check if the table exists and examine its structure

SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%astra%reward%';

-- Check all astra-related tables that might contain financial data
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%astra%' OR table_name LIKE '%reward%');

-- If astra_reward_config exists, check its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'astra_reward_config'
ORDER BY ordinal_position;

-- Check current RLS status for all astra/reward related tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT array_agg(policyname) 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = t.tablename) as current_policies
FROM pg_tables t
WHERE schemaname = 'public' 
  AND (tablename LIKE '%astra%' OR tablename LIKE '%reward%');

-- Sample any exposed financial data (if table exists)
SELECT *
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'astra_reward_config'
LIMIT 1;