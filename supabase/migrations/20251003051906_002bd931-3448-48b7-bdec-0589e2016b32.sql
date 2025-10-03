-- Fix infinite recursion in profiles RLS policies
-- The current policies are causing 500 errors by recursively checking profiles table

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create non-recursive admin policy using the is_admin_user function
CREATE POLICY "Admins have full access to profiles"
ON profiles
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Allow users to view their own profile
CREATE POLICY "Users view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_admin_user());

-- Allow users to update their own profile
CREATE POLICY "Users update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR is_admin_user())
WITH CHECK (id = auth.uid() OR is_admin_user());