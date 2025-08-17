-- Add explicit policy to deny public access to vendor business profiles
-- This will satisfy security scanners looking for explicit public access restrictions

CREATE POLICY "Deny public access to vendor business profiles"
ON public.vendor_business_profiles
FOR ALL
TO anon
USING (false);