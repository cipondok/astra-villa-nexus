-- Advanced property search function with all filters server-side
-- This eliminates client-side filtering and enables true pagination for heavy traffic

CREATE OR REPLACE FUNCTION public.search_properties_advanced(
  -- Text search
  p_search_text TEXT DEFAULT NULL,
  
  -- Basic filters
  p_property_type TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_development_status TEXT DEFAULT NULL,
  
  -- Location filters
  p_state TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  
  -- Range filters
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_bedrooms INTEGER DEFAULT NULL,
  p_max_bedrooms INTEGER DEFAULT NULL,
  p_min_bathrooms INTEGER DEFAULT NULL,
  p_max_bathrooms INTEGER DEFAULT NULL,
  p_min_area INTEGER DEFAULT NULL,
  p_max_area INTEGER DEFAULT NULL,
  
  -- JSONB property_features filters (moved from client-side)
  p_furnishing TEXT DEFAULT NULL,
  p_parking TEXT DEFAULT NULL,
  p_floor_level TEXT DEFAULT NULL,
  p_building_age TEXT DEFAULT NULL,
  p_amenities TEXT[] DEFAULT NULL,
  p_certifications TEXT[] DEFAULT NULL,
  p_features TEXT[] DEFAULT NULL,
  
  -- Special features
  p_has_3d BOOLEAN DEFAULT NULL,
  p_has_virtual_tour BOOLEAN DEFAULT NULL,
  
  -- Sorting
  p_sort_by TEXT DEFAULT 'newest',
  
  -- Pagination
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
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
  district TEXT,
  subdistrict TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm INTEGER,
  images TEXT[],
  image_urls TEXT[],
  thumbnail_url TEXT,
  status TEXT,
  development_status TEXT,
  property_features JSONB,
  three_d_model_url TEXT,
  virtual_tour_url TEXT,
  owner_type TEXT,
  property_condition TEXT,
  certificate_type TEXT,
  orientation TEXT,
  rental_period TEXT,
  minimum_rental_days INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_properties AS (
    SELECT 
      p.*,
      COUNT(*) OVER() as total_count
    FROM properties p
    WHERE 
      p.status = 'active'
      
      -- Text search using full-text index
      AND (
        p_search_text IS NULL 
        OR to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce(p.location,'')) 
           @@ plainto_tsquery('english', p_search_text)
      )
      
      -- Basic filters
      AND (p_property_type IS NULL OR p.property_type = p_property_type)
      AND (p_listing_type IS NULL OR p.listing_type = p_listing_type)
      AND (p_development_status IS NULL OR p.development_status = p_development_status)
      
      -- Location filters
      AND (p_state IS NULL OR p.state = p_state)
      AND (p_city IS NULL OR p.city = p_city)
      AND (p_location IS NULL OR p.location ILIKE '%' || p_location || '%')
      
      -- Price range
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      
      -- Bedrooms range
      AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
      AND (p_max_bedrooms IS NULL OR p.bedrooms <= p_max_bedrooms)
      
      -- Bathrooms range
      AND (p_min_bathrooms IS NULL OR p.bathrooms >= p_min_bathrooms)
      AND (p_max_bathrooms IS NULL OR p.bathrooms <= p_max_bathrooms)
      
      -- Area range
      AND (p_min_area IS NULL OR p.area_sqm >= p_min_area)
      AND (p_max_area IS NULL OR p.area_sqm <= p_max_area)
      
      -- JSONB property_features filters (SERVER-SIDE - was client-side before)
      AND (p_furnishing IS NULL OR p.property_features->>'furnishing' = p_furnishing)
      AND (p_parking IS NULL OR 
        CASE 
          WHEN p_parking = 'none' THEN p.property_features->>'parking' IS NULL
          WHEN p_parking = 'one' THEN p.property_features->>'parking' = 'one'
          WHEN p_parking = 'multiple' THEN p.property_features->>'parking' IN ('two', 'multiple')
          ELSE true
        END
      )
      AND (p_floor_level IS NULL OR p.property_features->>'floorLevel' = p_floor_level)
      AND (p_building_age IS NULL OR p.property_features->>'buildingAge' = p_building_age)
      
      -- Array filters for amenities (check if all required amenities exist)
      AND (
        p_amenities IS NULL 
        OR (
          SELECT bool_and(p.property_features->'amenities' ? amenity)
          FROM unnest(p_amenities) AS amenity
        )
      )
      
      -- Array filters for certifications (check if all required certifications exist)
      AND (
        p_certifications IS NULL 
        OR (
          SELECT bool_and(p.property_features->'certifications' ? cert)
          FROM unnest(p_certifications) AS cert
        )
      )
      
      -- Boolean features filter (check if all required features are true)
      AND (
        p_features IS NULL 
        OR (
          SELECT bool_and(COALESCE((p.property_features->feature)::text::boolean, false))
          FROM unnest(p_features) AS feature
        )
      )
      
      -- Special features
      AND (p_has_3d IS NULL OR (p_has_3d = true AND p.three_d_model_url IS NOT NULL) OR (p_has_3d = false))
      AND (p_has_virtual_tour IS NULL OR (p_has_virtual_tour = true AND p.virtual_tour_url IS NOT NULL) OR (p_has_virtual_tour = false))
      
    ORDER BY
      CASE 
        WHEN p_sort_by = 'newest' THEN p.created_at
      END DESC,
      CASE 
        WHEN p_sort_by = 'oldest' THEN p.created_at
      END ASC,
      CASE 
        WHEN p_sort_by = 'price_low_high' THEN p.price
      END ASC,
      CASE 
        WHEN p_sort_by = 'price_high_low' THEN p.price
      END DESC,
      CASE 
        WHEN p_sort_by = 'area_large_small' THEN p.area_sqm
      END DESC,
      CASE 
        WHEN p_sort_by = 'area_small_large' THEN p.area_sqm
      END ASC,
      p.created_at DESC -- Default fallback
      
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    fp.id,
    fp.title,
    fp.description,
    fp.price,
    fp.property_type,
    fp.listing_type,
    fp.location,
    fp.city,
    fp.area,
    fp.state,
    fp.district,
    fp.subdistrict,
    fp.bedrooms,
    fp.bathrooms,
    fp.area_sqm,
    fp.images,
    fp.image_urls,
    fp.thumbnail_url,
    fp.status,
    fp.development_status,
    fp.property_features,
    fp.three_d_model_url,
    fp.virtual_tour_url,
    fp.owner_type,
    fp.property_condition,
    fp.certificate_type,
    fp.orientation,
    fp.rental_period,
    fp.minimum_rental_days,
    fp.created_at,
    fp.updated_at,
    fp.total_count
  FROM filtered_properties fp;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_properties_advanced TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_properties_advanced TO anon;