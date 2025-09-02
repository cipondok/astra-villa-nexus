-- Fix RLS policy issues that are blocking access
-- Check for tables with RLS enabled but no policies and create basic access policies

-- First, let's identify any tables that might have RLS enabled but no policies
-- The linter detected this, so we need to add basic policies

-- For bpjs_verifications table (might be missing policies)
-- This table should allow vendors to view their own records and admins to view all
DO $$ 
DECLARE
    table_exists boolean;
    rls_enabled boolean;
    policy_count integer;
BEGIN
    -- Check if bpjs_verifications table exists and has RLS enabled
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'bpjs_verifications'
    ) INTO table_exists;
    
    IF table_exists THEN
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'bpjs_verifications';
        
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'bpjs_verifications';
        
        IF rls_enabled AND policy_count = 0 THEN
            -- Add basic policies for bpjs_verifications
            EXECUTE 'CREATE POLICY "vendors_view_own_bpjs_verifications" ON bpjs_verifications FOR SELECT USING (vendor_id = auth.uid())';
            EXECUTE 'CREATE POLICY "admins_manage_bpjs_verifications" ON bpjs_verifications FOR ALL USING (check_admin_access()) WITH CHECK (check_admin_access())';
            EXECUTE 'CREATE POLICY "system_manage_bpjs_verifications" ON bpjs_verifications FOR INSERT WITH CHECK (true)';
        END IF;
    END IF;
END $$;

-- Add similar checks for other tables that might be affected
DO $$ 
DECLARE
    table_name text;
    table_exists boolean;
    rls_enabled boolean;
    policy_count integer;
    tables_to_check text[] := ARRAY[
        'validation_rules',
        'payout_settings',
        'vendor_memberships'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Check if table exists and has RLS enabled
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            EXECUTE 'SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = ''public'' AND c.relname = ''' || table_name || '''' INTO rls_enabled;
            
            EXECUTE 'SELECT COUNT(*) FROM pg_policies WHERE schemaname = ''public'' AND tablename = ''' || table_name || '''' INTO policy_count;
            
            IF rls_enabled AND policy_count = 0 THEN
                -- Add basic admin-only policy for tables without policies
                EXECUTE 'CREATE POLICY "admin_only_access_' || table_name || '" ON ' || table_name || ' FOR ALL USING (check_admin_access()) WITH CHECK (check_admin_access())';
            END IF;
        END IF;
    END LOOP;
END $$;

-- Ensure all sensitive vendor data is properly protected
-- Add additional security logging
CREATE OR REPLACE FUNCTION public.audit_vendor_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log any changes to vendor business profiles for security auditing
  IF TG_OP = 'UPDATE' THEN
    -- Check if sensitive fields were changed
    IF OLD.business_phone != NEW.business_phone OR 
       OLD.business_email != NEW.business_email OR
       OLD.tax_id != NEW.tax_id OR
       OLD.license_number != NEW.license_number OR
       OLD.tarif_harian_min != NEW.tarif_harian_min OR
       OLD.tarif_harian_max != NEW.tarif_harian_max THEN
      
      PERFORM log_security_event(
        auth.uid(),
        'sensitive_vendor_data_modified',
        inet_client_addr(),
        NULL,
        NULL,
        jsonb_build_object(
          'vendor_id', NEW.vendor_id,
          'changed_fields', jsonb_build_array(
            CASE WHEN OLD.business_phone != NEW.business_phone THEN 'business_phone' END,
            CASE WHEN OLD.business_email != NEW.business_email THEN 'business_email' END,
            CASE WHEN OLD.tax_id != NEW.tax_id THEN 'tax_id' END,
            CASE WHEN OLD.license_number != NEW.license_number THEN 'license_number' END,
            CASE WHEN OLD.tarif_harian_min != NEW.tarif_harian_min THEN 'tarif_harian_min' END,
            CASE WHEN OLD.tarif_harian_max != NEW.tarif_harian_max THEN 'tarif_harian_max' END
          ),
          'timestamp', now()
        ),
        30  -- Medium risk score for data changes
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for auditing vendor profile changes
DROP TRIGGER IF EXISTS audit_vendor_profile_changes_trigger ON vendor_business_profiles;
CREATE TRIGGER audit_vendor_profile_changes_trigger
  AFTER UPDATE ON vendor_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_vendor_profile_changes();