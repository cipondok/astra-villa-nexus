-- Add optimized database indexes for property search performance
-- These indexes will significantly improve search query performance

-- Index for location-based searches (city, area, province)
CREATE INDEX IF NOT EXISTS idx_properties_location_search 
ON public.properties (city, area, province) 
WHERE is_active = true;

-- Index for price range searches
CREATE INDEX IF NOT EXISTS idx_properties_price_range 
ON public.properties (price) 
WHERE is_active = true AND price IS NOT NULL;

-- Index for property type filtering
CREATE INDEX IF NOT EXISTS idx_properties_type_search 
ON public.properties (property_type, status) 
WHERE is_active = true;

-- Composite index for common search combinations
CREATE INDEX IF NOT EXISTS idx_properties_search_combo 
ON public.properties (property_type, city, price, status) 
WHERE is_active = true;

-- Index for sorting by created_at (newest first)
CREATE INDEX IF NOT EXISTS idx_properties_created_desc 
ON public.properties (created_at DESC) 
WHERE is_active = true;

-- Index for bedrooms/bathrooms filtering
CREATE INDEX IF NOT EXISTS idx_properties_rooms 
ON public.properties (bedrooms, bathrooms) 
WHERE is_active = true;

-- Full-text search index for property titles and descriptions
CREATE INDEX IF NOT EXISTS idx_properties_text_search 
ON public.properties USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Index for area/size searches
CREATE INDEX IF NOT EXISTS idx_properties_area_size 
ON public.properties (land_area, building_area) 
WHERE is_active = true;

-- Create search analytics table to track query performance
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  search_query TEXT NOT NULL,
  search_filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  cache_hit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for search analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON public.search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_response_time ON public.search_analytics(response_time_ms);

-- Enable RLS for search analytics
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policy for search analytics
CREATE POLICY "Admins can view search analytics" ON public.search_analytics
  FOR SELECT USING (check_admin_access());

CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics
  FOR INSERT WITH CHECK (true);

-- Optimized search function with caching support
CREATE OR REPLACE FUNCTION public.search_properties_optimized(
  p_search_text TEXT DEFAULT NULL,
  p_property_type TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_bedrooms INTEGER DEFAULT NULL,
  p_max_bedrooms INTEGER DEFAULT NULL,
  p_min_bathrooms INTEGER DEFAULT NULL,
  p_max_bathrooms INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  property_type TEXT,
  city TEXT,
  area TEXT,
  province TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  land_area NUMERIC,
  building_area NUMERIC,
  images JSONB,
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
      p.id, p.title, p.description, p.price, p.property_type,
      p.city, p.area, p.province, p.bedrooms, p.bathrooms,
      p.land_area, p.building_area, p.images, p.created_at,
      COUNT(*) OVER() as total_count
    FROM public.properties p
    WHERE p.is_active = true
      AND p.status = 'available'
      AND (p_search_text IS NULL OR 
           to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', p_search_text))
      AND (p_property_type IS NULL OR p.property_type = p_property_type)
      AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%')
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
      AND (p_max_bedrooms IS NULL OR p.bedrooms <= p_max_bedrooms)
      AND (p_min_bathrooms IS NULL OR p.bathrooms >= p_min_bathrooms)
      AND (p_max_bathrooms IS NULL OR p.bathrooms <= p_max_bathrooms)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_properties;
END;
$$;