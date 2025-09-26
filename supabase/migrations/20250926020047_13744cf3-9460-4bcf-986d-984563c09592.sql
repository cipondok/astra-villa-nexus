-- Fix the critical security vulnerability in vendor_categories_hierarchy table
-- The table currently has NO RLS policies, making it publicly readable with sensitive pricing data

-- 1. Enable Row Level Security on the table
ALTER TABLE public.vendor_categories_hierarchy ENABLE ROW LEVEL SECURITY;

-- 2. Create a security definer function to check access permissions
CREATE OR REPLACE FUNCTION public.can_access_vendor_categories_strict()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
BEGIN
  current_user_id := auth.uid();
  
  -- Deny anonymous access completely
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = current_user_id;
  
  -- Only allow admin and authorized vendor management roles
  IF user_role IN ('admin', 'customer_service') OR check_admin_access() THEN
    RETURN true;
  END IF;
  
  -- For vendors, only allow viewing (not sensitive pricing data)
  -- This will be handled by separate policies
  RETURN false;
END;
$$;

-- 3. Create restrictive RLS policies
-- Policy 1: Admins can manage all data
CREATE POLICY "admins_manage_vendor_categories_hierarchy" 
ON public.vendor_categories_hierarchy 
FOR ALL
USING (can_access_vendor_categories_strict())
WITH CHECK (can_access_vendor_categories_strict());

-- Policy 2: Block all public access (this prevents the competitive pricing leak)
CREATE POLICY "block_public_access_to_pricing_data" 
ON public.vendor_categories_hierarchy 
FOR SELECT
USING (false);

-- 3. Create a secure public view function for basic category info (without pricing)
CREATE OR REPLACE FUNCTION public.get_safe_vendor_categories()
RETURNS TABLE(
  id uuid,
  category_code varchar,
  name_en varchar,
  name_id varchar,
  level integer,
  parent_id uuid,
  vendor_type varchar,
  icon varchar,
  is_active boolean,
  display_order integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Return only basic category information, excluding sensitive pricing data
  SELECT 
    vch.id,
    vch.category_code,
    vch.name_en,
    vch.name_id,
    vch.level,
    vch.parent_id,
    vch.vendor_type,
    vch.icon,
    vch.is_active,
    vch.display_order
  FROM public.vendor_categories_hierarchy vch
  WHERE vch.is_active = true
  ORDER BY vch.level, vch.display_order;
$$;

-- 4. Create audit trigger for sensitive data access logging
CREATE OR REPLACE FUNCTION public.audit_vendor_categories_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access to sensitive pricing data
  PERFORM log_security_event(
    auth.uid(),
    'vendor_categories_pricing_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'category_id', COALESCE(NEW.id, OLD.id),
      'operation', TG_OP,
      'category_code', COALESCE(NEW.category_code, OLD.category_code),
      'has_pricing_data', (
        COALESCE(NEW.commission_rate, OLD.commission_rate) IS NOT NULL OR
        COALESCE(NEW.base_price_range, OLD.base_price_range) IS NOT NULL OR
        COALESCE(NEW.pricing_model, OLD.pricing_model) IS NOT NULL
      ),
      'timestamp', now()
    ),
    CASE WHEN check_admin_access() THEN 20 ELSE 60 END -- High risk for non-admin access
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Apply the audit trigger (fix: INSERT, UPDATE, DELETE only - SELECT triggers aren't supported)
CREATE TRIGGER audit_vendor_categories_pricing_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_categories_hierarchy
  FOR EACH ROW EXECUTE FUNCTION audit_vendor_categories_access();

-- 6. Add table comment for documentation
COMMENT ON TABLE public.vendor_categories_hierarchy IS 
'SECURITY CRITICAL: Contains sensitive pricing data including commission rates and pricing models. Access is strictly controlled via RLS policies. Use get_safe_vendor_categories() for public category data.';

-- 7. Create a function for authorized pricing access (admins only)
CREATE OR REPLACE FUNCTION public.get_vendor_pricing_data(category_id uuid)
RETURNS TABLE(
  id uuid,
  commission_rate numeric,
  base_price_range jsonb,
  pricing_model text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access sensitive pricing information
  IF NOT check_admin_access() THEN
    RAISE EXCEPTION 'Insufficient permissions to access pricing data';
  END IF;

  -- Log the sensitive data access
  PERFORM log_security_event(
    auth.uid(),
    'pricing_data_admin_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('category_id', category_id),
    30
  );

  RETURN QUERY
  SELECT 
    vch.id,
    vch.commission_rate,
    vch.base_price_range,
    vch.pricing_model::text
  FROM public.vendor_categories_hierarchy vch
  WHERE vch.id = category_id;
END;
$$;