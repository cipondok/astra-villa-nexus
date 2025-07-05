-- Add optimized database indexes for property search performance
-- Based on actual properties table structure

-- Index for location-based searches (city, area, state)
CREATE INDEX IF NOT EXISTS idx_properties_location_search 
ON public.properties (city, area, state) 
WHERE status = 'available';

-- Index for price range searches
CREATE INDEX IF NOT EXISTS idx_properties_price_range 
ON public.properties (price) 
WHERE status = 'available' AND price IS NOT NULL;

-- Index for property type and listing type filtering
CREATE INDEX IF NOT EXISTS idx_properties_type_search 
ON public.properties (property_type, listing_type, status);

-- Composite index for common search combinations
CREATE INDEX IF NOT EXISTS idx_properties_search_combo 
ON public.properties (property_type, city, price, status);

-- Index for sorting by created_at (newest first)
CREATE INDEX IF NOT EXISTS idx_properties_created_desc 
ON public.properties (created_at DESC) 
WHERE status = 'available';

-- Index for bedrooms/bathrooms filtering
CREATE INDEX IF NOT EXISTS idx_properties_rooms 
ON public.properties (bedrooms, bathrooms) 
WHERE status = 'available';

-- Full-text search index for property titles and descriptions
CREATE INDEX IF NOT EXISTS idx_properties_text_search 
ON public.properties USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Index for area searches
CREATE INDEX IF NOT EXISTS idx_properties_area_size 
ON public.properties (area_sqm) 
WHERE status = 'available';

-- Index for location text search
CREATE INDEX IF NOT EXISTS idx_properties_location_text 
ON public.properties USING GIN (to_tsvector('english', location || ' ' || COALESCE(city, '') || ' ' || COALESCE(area, '')));

-- Add missing columns to existing search_analytics table
ALTER TABLE public.search_analytics 
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cache_hit BOOLEAN DEFAULT false;

-- Create additional indexes for search analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_response_time ON public.search_analytics(response_time_ms);

-- Optimized search function with proper column names
CREATE OR REPLACE FUNCTION public.search_properties_optimized(
  p_search_text TEXT DEFAULT NULL,
  p_property_type TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_bedrooms INTEGER DEFAULT NULL,
  p_max_bedrooms INTEGER DEFAULT NULL,
  p_min_bathrooms INTEGER DEFAULT NULL,
  p_max_bathrooms INTEGER DEFAULT NULL,
  p_min_area INTEGER DEFAULT NULL,
  p_max_area INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
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
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_properties AS (
    SELECT 
      p.id, p.title, p.description, p.price, p.property_type, p.listing_type,
      p.location, p.city, p.area, p.state, p.bedrooms, p.bathrooms,
      p.area_sqm, p.images, p.image_urls, p.status, p.created_at,
      COUNT(*) OVER() as total_count
    FROM public.properties p
    WHERE p.status = 'available'
      AND (p_search_text IS NULL OR 
           to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', p_search_text) OR
           to_tsvector('english', p.location || ' ' || COALESCE(p.city, '') || ' ' || COALESCE(p.area, '')) @@ plainto_tsquery('english', p_search_text))
      AND (p_property_type IS NULL OR p.property_type = p_property_type)
      AND (p_listing_type IS NULL OR p.listing_type = p_listing_type)
      AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%')
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
      AND (p_max_bedrooms IS NULL OR p.bedrooms <= p_max_bedrooms)
      AND (p_min_bathrooms IS NULL OR p.bathrooms >= p_min_bathrooms)
      AND (p_max_bathrooms IS NULL OR p.bathrooms <= p_max_bathrooms)
      AND (p_min_area IS NULL OR p.area_sqm >= p_min_area)
      AND (p_max_area IS NULL OR p.area_sqm <= p_max_area)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_properties;
END;
$$;