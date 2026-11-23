-- 1) Readable, permanent property web addresses ---------------------------
CREATE OR REPLACE FUNCTION public.property_slugify(p_text text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(p_text, '')), '[^a-z0-9]+', '-', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.property_base_slug(p_title text, p_city text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  WITH t AS (
    SELECT public.property_slugify(p_title) AS ts,
           public.property_slugify(regexp_replace(lower(coalesce(p_city, '')), '^\s*(kabupaten|kab\.|kota adm\.|kota)\s+', '')) AS cs
  )
  SELECT coalesce(nullif(trim(both '-' from left(
           CASE WHEN cs = '' OR position(cs in ts) > 0 THEN ts ELSE ts || '-' || cs END, 80)), ''), 'property')
  FROM t
$$;

CREATE OR REPLACE FUNCTION public.set_property_slug()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slug text;
BEGIN
  v_slug := nullif(public.property_slugify(NEW.slug), '');
  IF v_slug IS NULL THEN
    v_slug := public.property_base_slug(NEW.title, NEW.city);
  END IF;
  IF EXISTS (SELECT 1 FROM public.properties WHERE slug = v_slug AND id <> NEW.id) THEN
    v_slug := left(v_slug, 72) || '-' || left(replace(NEW.id::text, '-', ''), 6);
  END IF;
  NEW.slug := v_slug;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_properties_set_slug ON public.properties;
CREATE TRIGGER trg_properties_set_slug
  BEFORE INSERT OR UPDATE OF slug ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_property_slug();

-- Backfill without touching updated_at (a new address is not a content change)
ALTER TABLE public.properties DISABLE TRIGGER trg_properties_updated_at;
WITH b AS (
  SELECT id, public.property_base_slug(title, city) AS base,
         row_number() OVER (PARTITION BY public.property_base_slug(title, city) ORDER BY created_at, id) AS rn
  FROM public.properties
  WHERE slug IS NULL OR slug = ''
)
UPDATE public.properties p
SET slug = CASE
  WHEN b.rn = 1 AND NOT EXISTS (SELECT 1 FROM public.properties x WHERE x.slug = b.base)
    THEN b.base
  ELSE left(b.base, 72) || '-' || left(replace(p.id::text, '-', ''), 6)
END
FROM b WHERE p.id = b.id;
ALTER TABLE public.properties ENABLE TRIGGER trg_properties_updated_at;

-- 2) Real, de-duplicated property views ------------------------------------
CREATE TABLE public.property_view_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_key text NOT NULL,
  ip_hash text,
  user_id uuid,
  viewed_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, viewer_key, viewed_on)
);
GRANT SELECT ON public.property_view_events TO authenticated;
GRANT ALL ON public.property_view_events TO service_role;
ALTER TABLE public.property_view_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read property views" ON public.property_view_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::user_role) OR public.has_role(auth.uid(), 'super_admin'::user_role));

CREATE INDEX idx_pve_viewer_day ON public.property_view_events (viewer_key, viewed_on);
CREATE INDEX idx_pve_ip_day ON public.property_view_events (property_id, ip_hash, viewed_on);
CREATE INDEX idx_pve_day ON public.property_view_events (viewed_on, property_id);

CREATE OR REPLACE FUNCTION public.record_property_view(p_property_id uuid, p_viewer_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_headers json; v_ua text := ''; v_ip text := ''; v_ip_hash text;
  v_uid uuid := auth.uid(); v_key text; v_owner uuid; v_agent uuid; v_status text; v_rows int;
BEGIN
  BEGIN
    v_headers := nullif(current_setting('request.headers', true), '')::json;
    v_ua := coalesce(v_headers->>'user-agent', '');
    v_ip := coalesce(split_part(v_headers->>'x-forwarded-for', ',', 1), v_headers->>'cf-connecting-ip', '');
  EXCEPTION WHEN others THEN v_ua := ''; END;

  -- Bots, link-preview fetchers and scripts never count as views
  IF v_ua = '' OR v_ua ~* '(bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|go-http|postman)' THEN
    RETURN false;
  END IF;

  IF v_uid IS NOT NULL THEN
    v_key := 'u:' || v_uid::text;
  ELSIF p_viewer_key ~ '^[A-Za-z0-9_-]{8,80}$' THEN
    v_key := 'a:' || p_viewer_key;
  ELSE
    RETURN false;
  END IF;

  SELECT owner_id, agent_id, status INTO v_owner, v_agent, v_status FROM public.properties WHERE id = p_property_id;
  IF NOT FOUND OR v_status NOT IN ('active', 'published') THEN RETURN false; END IF;
  -- Owners and listing agents can't inflate their own listing
  IF v_uid IS NOT NULL AND (v_uid = v_owner OR v_uid = v_agent) THEN RETURN false; END IF;

  -- One viewer can't flood the system
  IF (SELECT count(*) FROM public.property_view_events WHERE viewer_key = v_key AND viewed_on = current_date) >= 200 THEN
    RETURN false;
  END IF;

  -- Rotating anonymous ids from one network count at most 3 times per listing per day
  IF v_ip <> '' THEN
    v_ip_hash := encode(sha256(convert_to(trim(v_ip) || ':astra-pv', 'UTF8')), 'hex');
    IF (SELECT count(*) FROM public.property_view_events
        WHERE property_id = p_property_id AND ip_hash = v_ip_hash AND viewed_on = current_date) >= 3 THEN
      RETURN false;
    END IF;
  END IF;

  INSERT INTO public.property_view_events (property_id, viewer_key, ip_hash, user_id)
  VALUES (p_property_id, v_key, v_ip_hash, v_uid)
  ON CONFLICT (property_id, viewer_key, viewed_on) DO NOTHING;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END $$;
REVOKE ALL ON FUNCTION public.record_property_view(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_property_view(uuid, text) TO anon, authenticated;

-- 3) Transparent ranking from real engagement ------------------------------
CREATE OR REPLACE FUNCTION public.get_property_rankings(p_kind text DEFAULT 'popular', p_limit int DEFAULT 12)
RETURNS TABLE (property_id uuid, score numeric, unique_views bigint, saves bigint, shares bigint, inquiries bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH params AS (
    SELECT CASE WHEN p_kind = 'trending' THEN 7 ELSE 30 END AS days,
           least(greatest(coalesce(p_limit, 12), 1), 48) AS lim
  ),
  pool AS (
    SELECT p.id, coalesce(p.listed_at, p.created_at) AS listed, (p.approval_status = 'approved') AS verified
    FROM public.properties p WHERE p.status IN ('active', 'published')
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
REVOKE ALL ON FUNCTION public.get_property_rankings(text, int) FROM public;
GRANT EXECUTE ON FUNCTION public.get_property_rankings(text, int) TO anon, authenticated;