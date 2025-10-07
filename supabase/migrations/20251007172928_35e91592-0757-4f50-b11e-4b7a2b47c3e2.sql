-- PHASE 1: CRITICAL SECURITY FIX - Remove Privilege Escalation Vector
-- Drop the 'role' column from profiles table to prevent users from self-elevating privileges

-- Step 1: Document current state for reference
COMMENT ON TABLE public.profiles IS 'User profiles table. Role column removed for security - roles now managed via user_roles table to prevent privilege escalation.';

-- Step 2: Remove the role column (this will cascade to dependent objects)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Step 3: Ensure RLS policies use has_role() function instead of profile.role
-- This comment serves as documentation for future policy updates
COMMENT ON FUNCTION public.has_role(uuid, user_role) IS 'Security definer function to check user roles. Always use this instead of querying profiles.role to prevent privilege escalation.';