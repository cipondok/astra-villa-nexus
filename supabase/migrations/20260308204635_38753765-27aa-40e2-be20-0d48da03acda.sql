
-- RPC: Get properties within map viewport bounds
CREATE OR REPLACE FUNCTION public.get_properties_in_bounds(
  p_north double precision,
  p_south double precision,
  p_east double precision,
  p_west double precision,
  p_limit integer DEFAULT 500,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_min_bedrooms integer DEFAULT NULL,
  p_property_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  price numeric,
  property_type text,
  listing_type text,
  location text,
  city text,
  state text,
  bedrooms integer,
  bathrooms integer,
  land_area_sqm numeric,
  building_area_sqm numeric,
  latitude double precision,
  longitude double precision,
  images text[],
  image_urls text[],
  thumbnail_url text,
  investment_score numeric,
  demand_heat_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.price, p.property_type, p.listing_type,
    p.location, p.city, p.state,
    p.bedrooms, p.bathrooms,
    p.land_area_sqm, p.building_area_sqm,
    p.latitude, p.longitude,
    p.images, p.image_urls, p.thumbnail_url,
    p.investment_score, p.demand_heat_score
  FROM properties p
  WHERE p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.latitude BETWEEN p_south AND p_north
    AND p.longitude BETWEEN p_west AND p_east
    AND p.status = 'active'
    AND p.approval_status = 'approved'
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
    AND (p_property_type IS NULL OR p.property_type = p_property_type)
  ORDER BY p.price DESC
  LIMIT p_limit;
END;
$$;

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng 
  ON public.properties (latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND status = 'active';
