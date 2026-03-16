
-- Global intelligence search RPC: cross-module unified search
-- Returns results from properties, admin_alerts, acquisition_seo_content, and agent_acquisition_pipeline
CREATE OR REPLACE FUNCTION public.admin_global_search(
  p_query text,
  p_limit int DEFAULT 20
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  normalized_query text;
  ts_query tsquery;
BEGIN
  normalized_query := trim(lower(p_query));
  IF normalized_query = '' THEN
    RETURN '{"properties":[],"alerts":[],"seo_pages":[],"leads":[]}'::json;
  END IF;

  -- Build tsquery safely, fallback to plain
  BEGIN
    ts_query := plainto_tsquery('english', normalized_query);
  EXCEPTION WHEN OTHERS THEN
    ts_query := NULL;
  END;

  SELECT json_build_object(
    'properties', COALESCE((
      SELECT json_agg(row_to_json(p))
      FROM (
        SELECT
          id,
          title,
          state,
          city,
          area,
          property_type,
          listing_type,
          price,
          deal_score,
          demand_score,
          status,
          created_at,
          'property' as result_type,
          CASE
            WHEN deal_score >= 75 THEN 3
            WHEN deal_score >= 50 THEN 2
            ELSE 1
          END as relevance_boost
        FROM properties
        WHERE
          (title ILIKE '%' || normalized_query || '%')
          OR (city ILIKE '%' || normalized_query || '%')
          OR (state ILIKE '%' || normalized_query || '%')
          OR (area ILIKE '%' || normalized_query || '%')
          OR (property_type ILIKE '%' || normalized_query || '%')
        ORDER BY
          CASE WHEN deal_score >= 75 THEN 0 ELSE 1 END,
          deal_score DESC NULLS LAST,
          created_at DESC
        LIMIT p_limit
      ) p
    ), '[]'::json),

    'alerts', COALESCE((
      SELECT json_agg(row_to_json(a))
      FROM (
        SELECT
          id,
          title,
          message,
          type,
          priority,
          is_read,
          action_required,
          created_at,
          'alert' as result_type,
          CASE
            WHEN priority = 'critical' THEN 4
            WHEN priority = 'high' THEN 3
            WHEN action_required = true THEN 2
            ELSE 1
          END as relevance_boost
        FROM admin_alerts
        WHERE
          (title ILIKE '%' || normalized_query || '%')
          OR (message ILIKE '%' || normalized_query || '%')
          OR (type ILIKE '%' || normalized_query || '%')
        ORDER BY
          CASE WHEN is_read = false THEN 0 ELSE 1 END,
          CASE
            WHEN priority = 'critical' THEN 0
            WHEN priority = 'high' THEN 1
            WHEN priority = 'medium' THEN 2
            ELSE 3
          END,
          created_at DESC
        LIMIT p_limit
      ) a
    ), '[]'::json),

    'seo_pages', COALESCE((
      SELECT json_agg(row_to_json(s))
      FROM (
        SELECT
          id,
          title,
          slug,
          primary_keyword,
          seo_score,
          organic_traffic,
          status,
          target_location,
          content_type,
          created_at,
          'seo_page' as result_type,
          CASE
            WHEN seo_score >= 80 THEN 3
            WHEN seo_score >= 60 THEN 2
            ELSE 1
          END as relevance_boost
        FROM acquisition_seo_content
        WHERE
          (title ILIKE '%' || normalized_query || '%')
          OR (primary_keyword ILIKE '%' || normalized_query || '%')
          OR (target_location ILIKE '%' || normalized_query || '%')
          OR (slug ILIKE '%' || normalized_query || '%')
        ORDER BY
          seo_score DESC NULLS LAST,
          organic_traffic DESC NULLS LAST
        LIMIT p_limit
      ) s
    ), '[]'::json),

    'leads', COALESCE((
      SELECT json_agg(row_to_json(l))
      FROM (
        SELECT
          id,
          agent_name,
          email,
          city,
          stage,
          priority,
          source_channel,
          specialization,
          created_at,
          'lead' as result_type,
          CASE
            WHEN priority = 'critical' THEN 4
            WHEN priority = 'high' THEN 3
            WHEN stage = 'negotiation' THEN 2
            ELSE 1
          END as relevance_boost
        FROM agent_acquisition_pipeline
        WHERE
          (agent_name ILIKE '%' || normalized_query || '%')
          OR (email ILIKE '%' || normalized_query || '%')
          OR (city ILIKE '%' || normalized_query || '%')
          OR (specialization ILIKE '%' || normalized_query || '%')
        ORDER BY
          CASE
            WHEN priority = 'critical' THEN 0
            WHEN priority = 'high' THEN 1
            ELSE 2
          END,
          created_at DESC
        LIMIT p_limit
      ) l
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;
