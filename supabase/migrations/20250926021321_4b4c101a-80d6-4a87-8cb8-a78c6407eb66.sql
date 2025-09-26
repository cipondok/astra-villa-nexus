-- Analyze the rejection codes table security vulnerability
-- First, check what rejection-related tables exist

SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%rejection%';

-- Check the structure of the indonesian_rejection_codes table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'indonesian_rejection_codes'
ORDER BY ordinal_position;

-- Check current RLS status and policies
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT array_agg(policyname) 
   FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'indonesian_rejection_codes') as current_policies
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'indonesian_rejection_codes';

-- Check if there are any other rejection-related tables
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%rejection%' OR table_name LIKE '%validation%' OR table_name LIKE '%error%');

-- Sample the sensitive data that could be exposed (first 3 rows)
SELECT code, category, reason_en, resolution_steps_en, estimated_fix_time_hours
FROM public.indonesian_rejection_codes 
LIMIT 3;