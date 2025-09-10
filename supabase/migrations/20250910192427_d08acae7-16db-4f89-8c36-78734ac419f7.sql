-- Fix vendor_business_profiles RLS policy to allow admin access
-- Current error: permission denied for table vendor_business_profiles

-- Check existing policies and fix them
DROP POLICY IF EXISTS "Admin can manage vendor profiles" ON vendor_business_profiles;
DROP POLICY IF EXISTS "Vendors can manage own profiles" ON vendor_business_profiles;
DROP POLICY IF EXISTS "Public can read approved profiles" ON vendor_business_profiles;

-- Create comprehensive policies for vendor_business_profiles
CREATE POLICY "Admin can manage all vendor profiles" 
ON vendor_business_profiles 
FOR ALL 
USING (check_admin_access());

CREATE POLICY "Vendors can manage their own profile" 
ON vendor_business_profiles 
FOR ALL 
USING (auth.uid() = vendor_id);

CREATE POLICY "Public can read active and verified profiles" 
ON vendor_business_profiles 
FOR SELECT 
USING (is_active = true AND is_verified = true);

-- Make sure RLS is enabled
ALTER TABLE vendor_business_profiles ENABLE ROW LEVEL SECURITY;