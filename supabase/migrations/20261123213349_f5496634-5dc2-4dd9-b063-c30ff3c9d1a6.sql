-- 1) Marketplace setting: are sample (DEMO) listings visible to visitors? Off by default.
INSERT INTO public.system_settings (category, key, value, description, is_public)
VALUES ('marketplace', 'show_demo_listings', 'false'::jsonb,
        'When true, sample (DEMO) listings are visible to visitors. Keep false for production.', true)
ON CONFLICT (key) DO NOTHING;

-- 2) Moderation guard: non-admin owners/agents can never approve, publish, feature or un-demo their own listings.
CREATE OR REPLACE FUNCTION private.enforce_property_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_privileged boolean := current_user IN ('postgres', 'service_role', 'supabase_admin') OR public.is_admin();
  v_content_changed boolean;
BEGIN
  IF v_privileged THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.approval_status := 'pending';
    NEW.status := CASE WHEN NEW.status = 'draft' THEN 'draft' ELSE 'pending_approval' END;
    NEW.is_demo := false;
    NEW.featured := false;
    NEW.is_featured := false;
    NEW.meta := coalesce(NEW.meta, '{}'::jsonb) - 'review';
    RETURN NEW;
  END IF;

  -- UPDATE by owner/agent
  NEW.is_demo := OLD.is_demo;
  NEW.featured := OLD.featured;
  NEW.is_featured := OLD.is_featured;
  IF OLD.meta ? 'review' THEN
    NEW.meta := jsonb_set(coalesce(NEW.meta, '{}'::jsonb), '{review}', OLD.meta -> 'review');
  ELSE
    NEW.meta := coalesce(NEW.meta, '{}'::jsonb) - 'review';
  END IF;

  -- Owners may only (re)submit for review; every other approval change is admin-only.
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status AND NEW.approval_status <> 'pending' THEN
    NEW.approval_status := OLD.approval_status;
  END IF;

  v_content_changed :=
       NEW.title IS DISTINCT FROM OLD.title
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.price IS DISTINCT FROM OLD.price
    OR NEW.price_idr IS DISTINCT FROM OLD.price_idr
    OR NEW.images IS DISTINCT FROM OLD.images
    OR NEW.image_urls IS DISTINCT FROM OLD.image_urls
    OR NEW.cover_image IS DISTINCT FROM OLD.cover_image
    OR NEW.thumbnail_url IS DISTINCT FROM OLD.thumbnail_url
    OR NEW.city IS DISTINCT FROM OLD.city
    OR NEW.address IS DISTINCT FROM OLD.address
    OR NEW.location IS DISTINCT FROM OLD.location
    OR NEW.state IS DISTINCT FROM OLD.state
    OR NEW.area IS DISTINCT FROM OLD.area
    OR NEW.property_type IS DISTINCT FROM OLD.property_type
    OR NEW.listing_type IS DISTINCT FROM OLD.listing_type
    OR NEW.bedrooms IS DISTINCT FROM OLD.bedrooms
    OR NEW.bathrooms IS DISTINCT FROM OLD.bathrooms
    OR NEW.area_sqm IS DISTINCT FROM OLD.area_sqm
    OR NEW.land_area_sqm IS DISTINCT FROM OLD.land_area_sqm
    OR NEW.building_area_sqm IS DISTINCT FROM OLD.building_area_sqm;

  IF v_content_changed AND OLD.approval_status = 'approved' THEN
    NEW.approval_status := 'pending';
  END IF;

  -- Only approved listings may be live; owners can take an approved listing offline and back online.
  IF NEW.approval_status IS DISTINCT FROM 'approved' THEN
    IF NEW.status IN ('active', 'published') OR NEW.approval_status = 'pending' AND NEW.status <> 'draft' THEN
      NEW.status := 'pending_approval';
    END IF;
  ELSIF NEW.status NOT IN ('active', 'published', 'inactive', 'sold', 'rented', 'draft') THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_properties_enforce_moderation ON public.properties;
CREATE TRIGGER trg_properties_enforce_moderation
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION private.enforce_property_moderation();

-- 3) Visitors only see approved, live listings; samples only when the marketplace setting allows it.
DROP POLICY IF EXISTS "Public properties are visible" ON public.properties;
CREATE POLICY "Public properties are visible"
ON public.properties
FOR SELECT
TO public
USING (
  public.is_admin()
  OR (
    status IN ('published', 'active')
    AND approval_status = 'approved'
    AND (
      is_demo = false
      OR EXISTS (
        SELECT 1 FROM public.system_settings s
        WHERE s.key = 'show_demo_listings' AND s.is_public = true AND s.value = 'true'::jsonb
      )
    )
  )
);

-- 4) Rankings (security definer, bypasses RLS) must follow the same public rules.
CREATE OR REPLACE FUNCTION public.get_property_rankings(p_kind text DEFAULT 'popular'::text, p_limit integer DEFAULT 12, p_with_photo boolean DEFAULT false)
 RETURNS TABLE(property_id uuid, score numeric, unique_views bigint, saves bigint, shares bigint, inquiries bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH params AS (
    SELECT CASE WHEN p_kind = 'trending' THEN 7 ELSE 30 END AS days,
           least(greatest(coalesce(p_limit, 12), 1), 48) AS lim,
           EXISTS (SELECT 1 FROM public.system_settings s WHERE s.key = 'show_demo_listings' AND s.is_public = true AND s.value = 'true'::jsonb) AS demo_ok
  ),
  pool AS (
    SELECT p.id, coalesce(p.listed_at, p.created_at) AS listed, true AS verified
    FROM public.properties p, params
    WHERE p.status IN ('active', 'published')
      AND p.approval_status = 'approved'
      AND (p.is_demo = false OR params.demo_ok)
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
             * (1 + 0.5 * exp(-greatest(extract(epoch FROM now() - pool.listed) / 86400, 0) / 30))) AS sc
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
$function$;