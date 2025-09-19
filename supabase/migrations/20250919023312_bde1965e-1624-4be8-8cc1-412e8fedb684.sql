-- Step 1: Remove the vulnerable anonymous access policy
DROP POLICY IF EXISTS "Allow anonymous users to view approved active properties" ON public.properties;

-- Step 2: Remove conflicting policies and create new secure ones
DROP POLICY IF EXISTS "authenticated_view_approved_properties" ON public.properties;
DROP POLICY IF EXISTS "block_anonymous_access" ON public.properties;

-- Step 3: Create strict RLS policies that require authentication for all access
CREATE POLICY "deny_all_anonymous_access_to_properties" 
ON public.properties 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Step 4: Create secure authenticated access policy
CREATE POLICY "authenticated_view_available_properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (
  (status = 'available' OR status = 'active') AND 
  (approval_status = 'approved') AND
  -- Log property access for security monitoring
  (log_security_event(
    auth.uid(),
    'property_view',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'property_id', id,
      'property_title', title,
      'listing_type', listing_type
    ),
    10 -- Low risk score for property viewing
  ) IS NOT NULL)
);

-- Step 5: Enhance the existing public property listings function to be more secure
CREATE OR REPLACE FUNCTION public.get_public_property_listings_secure(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL,
  p_property_type text DEFAULT NULL,
  p_listing_type text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_require_auth boolean DEFAULT true
)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  price numeric,
  property_type text,
  listing_type text,
  location text,
  city text,
  area text,
  state text,
  bedrooms integer,
  bathrooms integer,
  area_sqm integer,
  images text[],
  image_urls text[],
  status text,
  created_at timestamptz,
  development_status text,
  thumbnail_url text,
  virtual_tour_url text,
  total_count bigint,
  -- Security fields
  can_view_contact_info boolean,
  can_view_owner_info boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
  is_authenticated boolean;
BEGIN
  current_user_id := auth.uid();
  is_authenticated := current_user_id IS NOT NULL;
  
  -- Require authentication if p_require_auth is true
  IF p_require_auth AND NOT is_authenticated THEN
    RAISE EXCEPTION 'Authentication required to view property listings';
  END IF;
  
  -- Get user role for access control
  IF is_authenticated THEN
    SELECT role INTO user_role FROM public.profiles WHERE profiles.id = current_user_id;
  END IF;
  
  -- Log the property search request
  IF is_authenticated THEN
    PERFORM log_security_event(
      current_user_id,
      'property_search',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'search_terms', p_search,
        'filters', jsonb_build_object(
          'property_type', p_property_type,
          'listing_type', p_listing_type,
          'city', p_city,
          'price_range', CASE 
            WHEN p_min_price IS NOT NULL OR p_max_price IS NOT NULL 
            THEN jsonb_build_object('min', p_min_price, 'max', p_max_price)
            ELSE NULL
          END
        )
      ),
      15 -- Medium risk for property searches
    );
  END IF;
  
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
    p.development_status,
    p.thumbnail_url,
    p.virtual_tour_url,
    COUNT(*) OVER() as total_count,
    -- Security access levels
    CASE 
      WHEN is_authenticated AND (
        p.owner_id = current_user_id OR 
        p.agent_id = current_user_id OR 
        user_role IN ('admin', 'customer_service')
      ) THEN true
      ELSE false
    END as can_view_contact_info,
    CASE 
      WHEN is_authenticated AND (
        user_role IN ('admin', 'customer_service', 'agent')
      ) THEN true
      ELSE false
    END as can_view_owner_info
  FROM public.properties p
  WHERE 
    -- Only show approved and available properties
    p.status IN ('available', 'active') AND
    p.approval_status = 'approved' AND
    p.title IS NOT NULL AND p.title != '' AND
    -- Apply search filters
    (p_search IS NULL OR 
     to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', p_search)) AND
    (p_property_type IS NULL OR p.property_type = p_property_type) AND
    (p_listing_type IS NULL OR p.listing_type = p_listing_type) AND
    (p_city IS NULL OR p.city ILIKE '%' || p_city || '%') AND
    (p_min_price IS NULL OR p.price >= p_min_price) AND
    (p_max_price IS NULL OR p.price <= p_max_price)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Step 6: Create a function for property details with enhanced security
CREATE OR REPLACE FUNCTION public.get_property_details_secure(p_property_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  price numeric,
  property_type text,
  listing_type text,
  location text,
  city text,
  area text,
  state text,
  bedrooms integer,
  bathrooms integer,
  area_sqm integer,
  images text[],
  image_urls text[],
  status text,
  property_features jsonb,
  development_status text,
  virtual_tour_url text,
  three_d_model_url text,
  rental_periods text[],
  minimum_rental_days integer,
  created_at timestamptz,
  updated_at timestamptz,
  -- Conditional sensitive data (only for authorized users)
  owner_contact_info jsonb,
  agent_contact_info jsonb,
  can_view_contact_info boolean,
  access_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
  property_owner_id uuid;
  property_agent_id uuid;
  access_level_result text;
BEGIN
  current_user_id := auth.uid();
  
  -- Require authentication for property details
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to view property details';
  END IF;
  
  -- Get user role and property ownership info
  SELECT role INTO user_role FROM public.profiles WHERE profiles.id = current_user_id;
  SELECT owner_id, agent_id INTO property_owner_id, property_agent_id 
  FROM public.properties WHERE properties.id = p_property_id;
  
  -- Determine access level
  IF user_role IN ('admin', 'customer_service') THEN
    access_level_result := 'admin';
  ELSIF current_user_id = property_owner_id THEN
    access_level_result := 'owner';
  ELSIF current_user_id = property_agent_id THEN
    access_level_result := 'agent';
  ELSE
    access_level_result := 'public';
  END IF;
  
  -- Log property detail access
  PERFORM log_security_event(
    current_user_id,
    'property_detail_view',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'property_id', p_property_id,
      'access_level', access_level_result
    ),
    CASE access_level_result
      WHEN 'admin' THEN 25
      WHEN 'owner' THEN 10
      WHEN 'agent' THEN 15
      ELSE 20
    END
  );
  
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
    p.property_features,
    p.development_status,
    p.virtual_tour_url,
    p.three_d_model_url,
    p.rental_periods,
    p.minimum_rental_days,
    p.created_at,
    p.updated_at,
    -- Conditional sensitive data
    CASE 
      WHEN access_level_result IN ('admin', 'owner', 'agent') THEN
        jsonb_build_object(
          'owner_name', owner_profile.full_name,
          'owner_email', CASE 
            WHEN access_level_result = 'admin' THEN owner_profile.email
            ELSE NULL
          END,
          'owner_phone', CASE 
            WHEN access_level_result IN ('admin', 'agent') THEN owner_profile.phone
            ELSE NULL
          END
        )
      ELSE NULL
    END as owner_contact_info,
    CASE 
      WHEN access_level_result IN ('admin', 'owner', 'agent') AND p.agent_id IS NOT NULL THEN
        jsonb_build_object(
          'agent_name', agent_profile.full_name,
          'agent_email', CASE 
            WHEN access_level_result IN ('admin', 'owner') THEN agent_profile.email
            ELSE NULL
          END,
          'agent_phone', agent_profile.phone
        )
      ELSE NULL
    END as agent_contact_info,
    (access_level_result IN ('admin', 'owner', 'agent')) as can_view_contact_info,
    access_level_result as access_level
  FROM public.properties p
  LEFT JOIN public.profiles owner_profile ON owner_profile.id = p.owner_id
  LEFT JOIN public.profiles agent_profile ON agent_profile.id = p.agent_id
  WHERE p.id = p_property_id
    AND p.status IN ('available', 'active') 
    AND p.approval_status = 'approved';
END;
$$;

-- Step 7: Create a function for property statistics (admin only)
CREATE OR REPLACE FUNCTION public.get_property_statistics_secure()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats jsonb;
  current_user_id uuid;
  user_role text;
BEGIN
  current_user_id := auth.uid();
  
  -- Only admins can access property statistics
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT role INTO user_role FROM public.profiles WHERE profiles.id = current_user_id;
  
  IF user_role NOT IN ('admin', 'customer_service') THEN
    RAISE EXCEPTION 'Insufficient permissions to access property statistics';
  END IF;
  
  -- Generate aggregated statistics without exposing individual property data
  SELECT jsonb_build_object(
    'total_properties', COUNT(*),
    'available_properties', COUNT(*) FILTER (WHERE status = 'available'),
    'active_properties', COUNT(*) FILTER (WHERE status = 'active'),
    'approved_properties', COUNT(*) FILTER (WHERE approval_status = 'approved'),
    'pending_approval', COUNT(*) FILTER (WHERE approval_status = 'pending'),
    'by_type', jsonb_object_agg(
      COALESCE(property_type, 'unknown'), 
      type_counts.count
    ),
    'by_listing_type', jsonb_object_agg(
      COALESCE(listing_type, 'unknown'),
      listing_counts.count
    ),
    'last_updated', now()
  ) INTO stats
  FROM public.properties p
  LEFT JOIN (
    SELECT property_type, COUNT(*) as count 
    FROM public.properties 
    WHERE approval_status = 'approved' 
    GROUP BY property_type
  ) type_counts ON type_counts.property_type = p.property_type
  LEFT JOIN (
    SELECT listing_type, COUNT(*) as count 
    FROM public.properties 
    WHERE approval_status = 'approved' 
    GROUP BY listing_type
  ) listing_counts ON listing_counts.listing_type = p.listing_type
  WHERE p.approval_status = 'approved';
  
  -- Log statistics access
  PERFORM log_security_event(
    current_user_id,
    'property_statistics_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    30
  );
  
  RETURN COALESCE(stats, '{"total_properties": 0}'::jsonb);
END;
$$;