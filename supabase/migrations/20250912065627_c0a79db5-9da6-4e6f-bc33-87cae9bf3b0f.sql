-- Fix the can_change_business_nature function to resolve ambiguous vendor_id reference
CREATE OR REPLACE FUNCTION public.can_change_business_nature(vendor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_record RECORD;
  days_since_finalized INTEGER;
BEGIN
  SELECT 
    business_finalized_at,
    last_nature_change_at,
    can_change_nature
  INTO profile_record
  FROM public.vendor_business_profiles 
  WHERE vendor_business_profiles.vendor_id = $1;
  
  -- If no profile exists, allow change
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- If admin disabled changes
  IF profile_record.can_change_nature = false THEN
    RETURN false;
  END IF;
  
  -- If never finalized, allow change
  IF profile_record.business_finalized_at IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if 30 days have passed since finalization or last change
  days_since_finalized := EXTRACT(days FROM (now() - COALESCE(profile_record.last_nature_change_at, profile_record.business_finalized_at)));
  
  RETURN days_since_finalized >= 30;
END;
$function$;

-- Clean up and fix RLS policies for vendor_business_profiles
DROP POLICY IF EXISTS "vendor_profiles_block_all_anonymous_access" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_profiles_admin_full_access" ON vendor_business_profiles;
DROP POLICY IF EXISTS "vendor_profiles_vendors_own_full_access" ON vendor_business_profiles;
DROP POLICY IF EXISTS "Public can read active and verified profiles" ON vendor_business_profiles;
DROP POLICY IF EXISTS "Admin can manage all vendor profiles" ON vendor_business_profiles;
DROP POLICY IF EXISTS "Vendors can manage their own profile" ON vendor_business_profiles;

-- Create comprehensive and clear RLS policies
CREATE POLICY "deny_anonymous_access" ON vendor_business_profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "vendors_full_access_own_profile" ON vendor_business_profiles
  FOR ALL 
  USING (auth.uid() = vendor_id)
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "admins_full_access_all_profiles" ON vendor_business_profiles
  FOR ALL 
  USING (check_admin_access())
  WITH CHECK (check_admin_access());

CREATE POLICY "public_read_verified_profiles" ON vendor_business_profiles
  FOR SELECT 
  USING (is_active = true AND is_verified = true AND auth.uid() IS NOT NULL);