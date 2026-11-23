DROP FUNCTION IF EXISTS public.get_property_rankings(text, int);
CREATE OR REPLACE FUNCTION public.get_property_rankings(p_kind text DEFAULT 'popular', p_limit int DEFAULT 12, p_with_photo boolean DEFAULT false)
RETURNS TABLE (property_id uuid, score numeric, unique_views bigint, saves bigint, shares bigint, inquiries bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH params AS (
    SELECT CASE WHEN p_kind = 'trending' THEN 7 ELSE 30 END AS days,
           least(greatest(coalesce(p_limit, 12), 1), 48) AS lim
  ),
  pool AS (
    SELECT p.id, coalesce(p.listed_at, p.created_at) AS listed, (p.approval_status = 'approved') AS verified
    FROM public.properties p
    WHERE p.status IN ('active', 'published')
      AND (NOT coalesce(p_with_photo, false)
           OR nullif(p.cover_image, '') IS NOT NULL
           OR nullif(p.thumbnail_url, '') IS NOT NULL
           OR coalesce(array_length(p.images, 1), 0) > 0
           OR coalesce(array_length(p.image_urls, 1), 0) > 0)
  ),
  v AS (
    SELECT e.property_id AS pid, count(*) AS n FROM public.property_view_events e, params
    WHERE e.viewed_on >= current_date - params.days GROUP BY 1
  ),
  s AS (
    SELECT f.property_id AS pid, count(DISTINCT f.user_id) AS n FROM public.favorites f, params
    WHERE f.created_at >= now() - make_interval(days => params.days) GROUP BY 1
  ),
  sh AS (
    SELECT x.property_id AS pid,
           count(DISTINCT coalesce(x.user_id::text, x.session_id, x.id::text) || ':' || x.created_at::date::text) AS n
    FROM public.social_share_events x, params
    WHERE x.event_type = 'share_click' AND x.property_id IS NOT NULL
      AND x.created_at >= now() - make_interval(days => params.days) GROUP BY 1
  ),
  i AS (
    SELECT q.property_id AS pid,
           count(DISTINCT coalesce(q.user_id::text, lower(q.contact_email), q.contact_phone, q.id::text)) AS n
    FROM public.inquiries q, params
    WHERE q.property_id IS NOT NULL AND q.created_at >= now() - make_interval(days => params.days) GROUP BY 1
  ),
  scored AS (
    SELECT pool.id, pool.listed,
           coalesce(v.n, 0) AS uv, coalesce(s.n, 0) AS sv, coalesce(sh.n, 0) AS shv, coalesce(i.n, 0) AS iv,
           ((coalesce(v.n, 0) + 4 * coalesce(s.n, 0) + 3 * coalesce(sh.n, 0) + 6 * coalesce(i.n, 0))::numeric
             * (1 + 0.5 * exp(-greatest(extract(epoch FROM now() - pool.listed) / 86400, 0) / 30))
             * CASE WHEN pool.verified THEN 1.1 ELSE 1 END) AS sc
    FROM pool
    LEFT JOIN v ON v.pid = pool.id
    LEFT JOIN s ON s.pid = pool.id
    LEFT JOIN sh ON sh.pid = pool.id
    LEFT JOIN i ON i.pid = pool.id
  )
  SELECT id, round(sc, 3), uv, sv, shv, iv
  FROM scored
  WHERE CASE p_kind
          WHEN 'newest' THEN true
          WHEN 'most_viewed' THEN uv > 0
          WHEN 'most_saved' THEN sv > 0
          WHEN 'most_shared' THEN shv > 0
          ELSE sc > 0
        END
  ORDER BY CASE p_kind
             WHEN 'newest' THEN extract(epoch FROM listed)::numeric
             WHEN 'most_viewed' THEN uv::numeric
             WHEN 'most_saved' THEN sv::numeric
             WHEN 'most_shared' THEN shv::numeric
             ELSE sc
           END DESC NULLS LAST, listed DESC
  LIMIT (SELECT lim FROM params)
$$;
REVOKE ALL ON FUNCTION public.get_property_rankings(text, int, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.get_property_rankings(text, int, boolean) TO anon, authenticated, service_role;