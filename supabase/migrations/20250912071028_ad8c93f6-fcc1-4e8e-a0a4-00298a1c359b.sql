-- Drop any problematic policies and recreate them properly
DROP POLICY IF EXISTS "deny_anonymous_access" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendors_full_access_own_profile" ON vendor_business_profiles;
DROP POLICY IF EXISTS "admins_full_access_all_profiles" ON vendor_business_profiles;
DROP POLICY IF EXISTS "public_read_verified_profiles" ON vendor_business_profiles;

-- Create clear and working RLS policies
CREATE POLICY "vendors_can_manage_own_profile" ON vendor_business_profiles
  FOR ALL 
  TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "admins_can_manage_all_profiles" ON vendor_business_profiles
  FOR ALL 
  TO authenticated
  USING (check_admin_access())
  WITH CHECK (check_admin_access());

CREATE POLICY "public_can_view_verified_profiles" ON vendor_business_profiles
  FOR SELECT 
  TO authenticated
  USING (is_active = true AND is_verified = true);

-- Ensure the table has RLS enabled
ALTER TABLE vendor_business_profiles ENABLE ROW LEVEL SECURITY;