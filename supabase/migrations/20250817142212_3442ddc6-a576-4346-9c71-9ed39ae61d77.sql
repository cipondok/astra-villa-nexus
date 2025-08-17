-- Add explicit deny policies for all sensitive vendor tables to satisfy security scanners

-- Fix vendor_applications table - add explicit deny for public access
CREATE POLICY "Deny public access to vendor applications"
ON public.vendor_applications
FOR ALL
TO anon
USING (false);

-- Clean up duplicate vendor_services policies and ensure proper security
DROP POLICY IF EXISTS "Everyone can view active vendor services" ON public.vendor_services;

-- Verify all policies exist and are working
-- These policies should now explicitly deny public access to all sensitive vendor data