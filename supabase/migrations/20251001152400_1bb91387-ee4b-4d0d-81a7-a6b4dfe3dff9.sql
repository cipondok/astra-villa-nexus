
-- Allow public (anonymous) users to view approved and active properties
-- This is essential for a real estate website where listings should be publicly visible

-- First, drop the overly restrictive anonymous deny policy
DROP POLICY IF EXISTS "deny_all_anonymous_access_to_properties" ON properties;

-- Create a new policy that allows anonymous users to SELECT approved properties
CREATE POLICY "public_view_approved_properties"
ON properties
FOR SELECT
TO anon
USING (
  (status = 'active' OR status = 'available') 
  AND approval_status = 'approved'
);

-- Also ensure authenticated users can view approved properties (this already exists but let's be explicit)
DROP POLICY IF EXISTS "authenticated_view_available_properties" ON properties;

CREATE POLICY "authenticated_view_available_properties"
ON properties
FOR SELECT
TO authenticated
USING (
  (status = 'active' OR status = 'available') 
  AND approval_status = 'approved'
);
