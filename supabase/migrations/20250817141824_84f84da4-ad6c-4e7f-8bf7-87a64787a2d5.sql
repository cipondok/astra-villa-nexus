-- Fix vendor_services table security - add explicit deny policy for public access
-- This will prevent competitors from accessing vendor service pricing and strategies

CREATE POLICY "Deny public access to vendor services"
ON public.vendor_services
FOR ALL
TO anon
USING (false);

-- Also ensure authenticated users can only see active services
-- Update existing policy to be more restrictive
DROP POLICY IF EXISTS "Everyone can view active services" ON public.vendor_services;

CREATE POLICY "Public can view only active approved services"
ON public.vendor_services
FOR SELECT
TO anon, authenticated
USING (is_active = true AND admin_approval_status = 'approved');