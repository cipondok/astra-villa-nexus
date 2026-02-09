
-- Create a function to get property type counts per province
CREATE OR REPLACE FUNCTION public.get_property_counts_by_province()
RETURNS TABLE(
  province text,
  property_type text,
  count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    COALESCE(p.state, 'Unknown') as province,
    COALESCE(p.property_type, 'other') as property_type,
    COUNT(*)::bigint as count
  FROM properties p
  WHERE p.status = 'active'
  GROUP BY p.state, p.property_type
  ORDER BY province, property_type;
$$;

-- Create a function to get search keyword analytics
CREATE OR REPLACE FUNCTION public.get_search_keyword_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(
  search_query text,
  search_count bigint,
  avg_results numeric,
  last_searched timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    sa.search_query,
    COUNT(*)::bigint as search_count,
    ROUND(AVG(sa.results_count)::numeric, 1) as avg_results,
    MAX(sa.created_at) as last_searched
  FROM search_analytics sa
  WHERE sa.created_at >= NOW() - (days_back || ' days')::interval
    AND sa.search_query IS NOT NULL
    AND sa.search_query != ''
  GROUP BY sa.search_query
  ORDER BY search_count DESC
  LIMIT 100;
$$;

-- Create a function to get visitor location analytics
CREATE OR REPLACE FUNCTION public.get_visitor_location_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(
  country text,
  city text,
  visitor_count bigint,
  page_views bigint,
  avg_duration numeric
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    COALESCE(wa.country, 'Unknown') as country,
    COALESCE(wa.city, 'Unknown') as city,
    COUNT(DISTINCT wa.visitor_id)::bigint as visitor_count,
    COUNT(*)::bigint as page_views,
    ROUND(AVG(wa.visit_duration)::numeric, 1) as avg_duration
  FROM web_analytics wa
  WHERE wa.created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY wa.country, wa.city
  ORDER BY visitor_count DESC
  LIMIT 100;
$$;

-- Create a function to get property views by location
CREATE OR REPLACE FUNCTION public.get_property_views_by_location(days_back integer DEFAULT 30)
RETURNS TABLE(
  page_path text,
  country text,
  city text,
  view_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT 
    wa.page_path,
    COALESCE(wa.country, 'Unknown') as country,
    COALESCE(wa.city, 'Unknown') as city,
    COUNT(*)::bigint as view_count
  FROM web_analytics wa
  WHERE wa.created_at >= NOW() - (days_back || ' days')::interval
    AND wa.page_path LIKE '/property%'
  GROUP BY wa.page_path, wa.country, wa.city
  ORDER BY view_count DESC
  LIMIT 100;
$$;
