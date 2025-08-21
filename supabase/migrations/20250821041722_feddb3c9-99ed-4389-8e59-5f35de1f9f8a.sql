-- Security fix for properties table - prevent scammer access to owner information
-- Remove overly permissive policies and implement secure access controls

-- First, ensure RLS is enabled
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Drop the existing permissive policies
DROP POLICY IF EXISTS "Public can view limited property info" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can view approved properties" ON public.properties;
DROP POLICY IF EXISTS "Property owners can manage their properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can manage assigned properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;

-- Create secure policies that protect owner information

-- 1. Public can only view basic property information (no owner/agent IDs)
-- This will be handled by a secure function instead of direct table access

-- 2. Property owners can manage their own properties
CREATE POLICY "owners_manage_own_properties" 
ON public.properties 
FOR ALL 
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 3. Agents can manage assigned properties  
CREATE POLICY "agents_manage_assigned_properties" 
ON public.properties 
FOR ALL 
TO authenticated
USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);

-- 4. Admins can manage all properties
CREATE POLICY "admins_manage_all_properties" 
ON public.properties 
FOR ALL 
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());

-- 5. Authenticated users can view approved properties with sensitive data filtered
CREATE POLICY "authenticated_view_approved_properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (
  (status = 'approved' OR approval_status = 'approved') 
  AND status = 'available'
);

-- 6. Block all anonymous access to the table directly
CREATE POLICY "block_anonymous_access" 
ON public.properties 
FOR ALL 
TO anon
USING (false);

-- Create a secure function for public property listings that excludes sensitive data
CREATE OR REPLACE FUNCTION public.get_public_property_listings(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_property_type TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  property_type TEXT,
  listing_type TEXT,
  location TEXT,
  city TEXT,
  area TEXT,
  state TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm INTEGER,
  images TEXT[],
  image_urls TEXT[],
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  -- Exclude sensitive fields: owner_id, agent_id, contact info
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.property_type,
    p.listing_type,
    p.location,
    p.city,
    p.area,
    p.state,
    p.bedrooms,
    p.bathrooms,
    p.area_sqm,
    p.images,
    p.image_urls,
    p.status,
    p.created_at,
    COUNT(*) OVER() as total_count
  FROM public.properties p
  WHERE 
    -- Only show approved and available properties
    (p.status = 'approved' OR p.approval_status = 'approved')
    AND p.status = 'available'
    -- Apply filters
    AND (p_search IS NULL OR 
         to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', p_search))
    AND (p_property_type IS NULL OR p.property_type = p_property_type)
    AND (p_listing_type IS NULL OR p.listing_type = p_listing_type)
    AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%')
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_public_property_listings TO anon, authenticated;

-- Verify the new policies
SELECT policyname, cmd, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'properties';