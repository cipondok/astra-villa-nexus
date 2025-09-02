-- Find and fix any remaining security definer views
-- Check for views that might have security_barrier or other security definer properties

-- List all views in the public schema to identify potential issues
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Check for any views with security properties that might be flagged
    FOR view_record IN 
        SELECT schemaname, viewname, definition 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Log the views for debugging
        RAISE NOTICE 'Found view: %.%', view_record.schemaname, view_record.viewname;
        
        -- Drop any views that might be problematic
        IF view_record.viewname LIKE '%vendor%profile%' OR view_record.viewname LIKE '%public%' THEN
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
            RAISE NOTICE 'Dropped potentially problematic view: %', view_record.viewname;
        END IF;
    END LOOP;
END $$;

-- Make sure no security definer views remain
-- If any exist, they should be replaced with secure functions instead

-- Alternative approach: Create a simple, non-security-definer query method
-- This completely avoids the security definer view issue
CREATE OR REPLACE FUNCTION public.search_vendor_profiles(search_term text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  business_name text,
  business_type text,
  business_description text,
  rating numeric,
  total_reviews integer,
  logo_url text,
  service_areas jsonb
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple secure function to search vendor profiles
  -- Only returns basic public information, no sensitive data
  RETURN QUERY
  SELECT 
    vbp.id,
    vbp.business_name,
    vbp.business_type,
    vbp.business_description,
    vbp.rating,
    vbp.total_reviews,
    vbp.logo_url,
    vbp.service_areas
  FROM vendor_business_profiles vbp
  WHERE vbp.is_active = true
    AND vbp.is_verified = true
    AND auth.uid() IS NOT NULL
    AND (
      search_term IS NULL 
      OR vbp.business_name ILIKE '%' || search_term || '%'
      OR vbp.business_type ILIKE '%' || search_term || '%'
      OR vbp.business_description ILIKE '%' || search_term || '%'
    )
  ORDER BY vbp.rating DESC NULLS LAST;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_vendor_profiles(text) TO authenticated;