
DROP FUNCTION IF EXISTS public.admin_global_search(text, integer);

CREATE OR REPLACE FUNCTION public.admin_global_search(p_query text, p_limit int DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_properties jsonb;
  v_alerts jsonb;
  v_seo jsonb;
  v_leads jsonb;
  v_pattern text := '%' || p_query || '%';
  v_trgm_threshold float := 0.25;
BEGIN
  PERFORM set_limit(v_trgm_threshold);

  SELECT COALESCE(jsonb_agg(row_to_json(r)::jsonb ORDER BY r.relevance_boost DESC), '[]'::jsonb)
  INTO v_properties
  FROM (
    SELECT 
      p.id, p.title, p.state, p.city, p.area, p.property_type, p.listing_type,
      p.price, p.deal_score, p.demand_score, p.status, p.created_at,
      COALESCE(p.opportunity_score, 0) AS opportunity_score,
      COALESCE(p.demand_trend, 'stable') AS demand_trend,
      'property'::text AS result_type,
      (
        CASE WHEN p.title ILIKE v_pattern THEN 40 ELSE 0 END +
        CASE WHEN p.city ILIKE v_pattern THEN 25 ELSE 0 END +
        CASE WHEN p.state ILIKE v_pattern THEN 15 ELSE 0 END +
        COALESCE(p.opportunity_score, 0) * 0.3 +
        COALESCE(p.deal_score, 0) * 0.2 +
        CASE WHEN similarity(p.title, p_query) > v_trgm_threshold THEN 20 ELSE 0 END
      )::numeric AS relevance_boost
    FROM properties p
    WHERE 
      p.title ILIKE v_pattern 
      OR p.city ILIKE v_pattern 
      OR p.state ILIKE v_pattern
      OR p.area ILIKE v_pattern
      OR p.property_type ILIKE v_pattern
      OR similarity(p.title, p_query) > v_trgm_threshold
      OR similarity(COALESCE(p.city,''), p_query) > v_trgm_threshold
    ORDER BY relevance_boost DESC
    LIMIT p_limit
  ) r;

  SELECT COALESCE(jsonb_agg(row_to_json(r)::jsonb ORDER BY r.relevance_boost DESC), '[]'::jsonb)
  INTO v_alerts
  FROM (
    SELECT 
      a.id, a.title, a.message, a.type, a.priority, a.is_read, 
      a.action_required, a.created_at,
      'alert'::text AS result_type,
      (
        CASE WHEN a.title ILIKE v_pattern THEN 40 ELSE 0 END +
        CASE WHEN a.message ILIKE v_pattern THEN 20 ELSE 0 END +
        CASE WHEN a.priority = 'critical' AND NOT a.is_read THEN 50 ELSE 0 END +
        CASE WHEN a.priority = 'critical' THEN 30 ELSE 0 END +
        CASE WHEN a.priority = 'high' AND NOT a.is_read THEN 25 ELSE 0 END +
        CASE WHEN NOT a.is_read THEN 15 ELSE 0 END +
        CASE WHEN a.action_required THEN 10 ELSE 0 END
      )::numeric AS relevance_boost
    FROM admin_alerts a
    WHERE a.title ILIKE v_pattern OR a.message ILIKE v_pattern OR a.type ILIKE v_pattern
    ORDER BY relevance_boost DESC
    LIMIT p_limit
  ) r;

  SELECT COALESCE(jsonb_agg(row_to_json(r)::jsonb ORDER BY r.relevance_boost DESC), '[]'::jsonb)
  INTO v_seo
  FROM (
    SELECT 
      s.id, s.title, s.slug, s.primary_keyword, s.seo_score, 
      s.organic_traffic, s.status, s.target_location, s.content_type, s.created_at,
      'seo_page'::text AS result_type,
      (
        CASE WHEN s.title ILIKE v_pattern THEN 40 ELSE 0 END +
        CASE WHEN s.primary_keyword ILIKE v_pattern THEN 30 ELSE 0 END +
        CASE WHEN s.target_location ILIKE v_pattern THEN 20 ELSE 0 END +
        COALESCE(s.seo_score, 0) * 0.25 +
        LEAST(COALESCE(s.organic_traffic, 0) * 0.01, 15)
      )::numeric AS relevance_boost
    FROM acquisition_seo_content s
    WHERE 
      s.title ILIKE v_pattern 
      OR s.primary_keyword ILIKE v_pattern
      OR s.slug ILIKE v_pattern
      OR s.target_location ILIKE v_pattern
    ORDER BY relevance_boost DESC
    LIMIT p_limit
  ) r;

  SELECT COALESCE(jsonb_agg(row_to_json(r)::jsonb ORDER BY r.relevance_boost DESC), '[]'::jsonb)
  INTO v_leads
  FROM (
    SELECT 
      l.id, l.agent_name, l.email, l.city, l.stage, l.priority,
      l.source_channel, l.specialization, l.created_at,
      'lead'::text AS result_type,
      (
        CASE WHEN l.agent_name ILIKE v_pattern THEN 40 ELSE 0 END +
        CASE WHEN l.city ILIKE v_pattern THEN 25 ELSE 0 END +
        CASE WHEN l.specialization ILIKE v_pattern THEN 15 ELSE 0 END +
        CASE WHEN l.priority = 'critical' THEN 20 ELSE 0 END +
        CASE WHEN l.priority = 'high' THEN 10 ELSE 0 END
      )::numeric AS relevance_boost
    FROM agent_acquisition_pipeline l
    WHERE 
      l.agent_name ILIKE v_pattern 
      OR l.city ILIKE v_pattern
      OR l.email ILIKE v_pattern
      OR l.specialization ILIKE v_pattern
    ORDER BY relevance_boost DESC
    LIMIT p_limit
  ) r;

  v_result := jsonb_build_object(
    'properties', v_properties,
    'alerts', v_alerts,
    'seo_pages', v_seo,
    'leads', v_leads
  );

  RETURN v_result;
END;
$$;
