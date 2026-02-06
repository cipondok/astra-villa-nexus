-- Drop the overly restrictive policy that blocks all access
DROP POLICY IF EXISTS "block_all_public_profile_access" ON public.profiles;

-- Keep the anonymous block but ensure authenticated users can access
-- The existing policies for authenticated users should work now