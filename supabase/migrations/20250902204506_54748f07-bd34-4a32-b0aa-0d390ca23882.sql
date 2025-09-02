-- Fix function signature conflict and security warnings

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.get_public_vendor_profiles();
DROP FUNCTION IF EXISTS public.get_vendor_public_info_secure();

-- Create the secure function with correct signature
CREATE OR REPLACE FUNCTION public.get_public_vendor_profiles()
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  is_active boolean,
  is_verified boolean,
  logo_url text,
  banner_url text,
  service_areas jsonb,
  business_hours jsonb,
  gallery_images jsonb,
  social_media jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Secure function to get public vendor profiles
  -- Only returns non-sensitive information for active, verified vendors
  -- Excludes: business_phone, business_email, business_address, tax_id, 
  --          license_number, tarif_harian_min/max, and other sensitive data
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.is_active,
    vbp.is_verified,
    vbp.logo_url,
    vbp.banner_url,
    vbp.service_areas,
    vbp.business_hours,
    vbp.gallery_images,
    vbp.social_media,
    vbp.created_at,
    vbp.updated_at
  FROM vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND auth.uid() IS NOT NULL  -- Require authentication
  ORDER BY vbp.rating DESC NULLS LAST, vbp.total_reviews DESC;
$$;

-- Fix any tables that might have RLS enabled but no policies
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    -- Find tables with RLS enabled but no policies
    FOR rec IN 
        SELECT c.relname as table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relkind = 'r' 
        AND c.relrowsecurity = true
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.schemaname = 'public' 
            AND p.tablename = c.relname
        )
    LOOP
        -- Add a restrictive policy for tables without policies
        EXECUTE format('CREATE POLICY "default_deny_all_%s" ON %I FOR ALL USING (false)', 
                      rec.table_name, rec.table_name);
        
        RAISE NOTICE 'Added deny-all policy to table: %', rec.table_name;
    END LOOP;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_vendor_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_public_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_own_vendor_profile_secure() TO authenticated;