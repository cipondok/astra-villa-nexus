-- Create RLS policy to allow anonymous users to view approved, active properties
-- This ensures public users can browse properties on the main page

CREATE POLICY "Allow anonymous users to view approved active properties" 
ON public.properties 
FOR SELECT 
TO anon
USING (
  status = 'active' 
  AND approval_status = 'approved'
  AND title IS NOT NULL 
  AND title != ''
);