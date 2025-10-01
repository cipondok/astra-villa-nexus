-- Fix security issue: Remove public access to office_locations
-- This prevents unauthorized access to sensitive business data like addresses and phone numbers

-- Drop the old public policy that allows anyone to read office locations
DROP POLICY IF EXISTS "Public can read active office locations" ON public.office_locations;

-- Drop the previous attempt to fix if it exists
DROP POLICY IF EXISTS "Restrict office_locations to authenticated users" ON public.office_locations;

-- Create new policy: Only authenticated users can view office locations
-- This protects against social engineering, physical security threats, and competitive intelligence gathering
CREATE POLICY "Authenticated users can view active office locations"
ON public.office_locations
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
);

-- Ensure admins can still manage office locations (this policy should already exist)
-- If not, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'office_locations' 
    AND policyname = 'Admins can manage office locations'
  ) THEN
    CREATE POLICY "Admins can manage office locations"
    ON public.office_locations
    FOR ALL
    USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user());
  END IF;
END $$;

-- Add comment explaining the security decision
COMMENT ON POLICY "Authenticated users can view active office locations" ON public.office_locations IS 
'Security policy: Restricts office location data (addresses, phones, emails) to authenticated users only to prevent social engineering attacks, physical security threats, and competitive intelligence gathering.';