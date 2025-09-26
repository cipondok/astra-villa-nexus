-- First, let's check if the vendor_categories_hierarchy table exists and examine its structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vendor_categories_hierarchy'
) as table_exists;

-- If it exists, let's check its current RLS status and policies
SELECT schemaname, tablename, rowsecurity, policies
FROM pg_tables t
LEFT JOIN (
  SELECT schemaname, tablename, array_agg(policyname) as policies
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'vendor_categories_hierarchy'
  GROUP BY schemaname, tablename
) p USING (schemaname, tablename)
WHERE t.schemaname = 'public' AND t.tablename = 'vendor_categories_hierarchy';

-- Check the table structure if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vendor_categories_hierarchy'
ORDER BY ordinal_position;