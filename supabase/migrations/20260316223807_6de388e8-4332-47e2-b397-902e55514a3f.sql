
-- ═══════════════════════════════════════════════════════════════
-- ASTRA VILLA — AI Market Heat Cluster Engine
-- ═══════════════════════════════════════════════════════════════

-- 1. Market heat cluster cache table
CREATE TABLE IF NOT EXISTS public.market_heat_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_key text UNIQUE NOT NULL,
  city text NOT NULL,
  state text,
  -- Geo center (when lat/lng available)
  cluster_center_lat double precision,
  cluster_center_lng double precision,
  -- Counts
  property_count int DEFAULT 0,
  active_listings int DEFAULT 0,
  new_listings_30d int DEFAULT 0,
  -- Scores
  market_heat_score smallint DEFAULT 0,
  avg_opportunity_score smallint DEFAULT 0,
  avg_deal_score smallint DEFAULT 0,
  avg_demand_score smallint DEFAULT 0,
  opportunity_density numeric DEFAULT 0,
  -- Classification
  heat_label text DEFAULT 'Stable Market',
  zone_status text DEFAULT 'stable',
  -- Demand signals
  total_views int DEFAULT 0,
  total_saves int DEFAULT 0,
  total_inquiries int DEFAULT 0,
  avg_days_on_market numeric DEFAULT 0,
  -- Trend counts
  hot_count int DEFAULT 0,
  stable_count int DEFAULT 0,
  cooling_count int DEFAULT 0,
  -- Price data
  avg_price bigint DEFAULT 0,
  min_price bigint DEFAULT 0,
  max_price bigint DEFAULT 0,
  avg_price_per_sqm bigint DEFAULT 0,
  median_price bigint DEFAULT 0,
  -- Risk & forecast
  trend_direction text DEFAULT 'stable',
  heat_trend_3m text DEFAULT 'Stable',
  trend_confidence smallint DEFAULT 50,
  cooling_risk_signals jsonb DEFAULT '[]'::jsonb,
  emerging_signals jsonb DEFAULT '[]'::jsonb,
  -- Timestamps
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.market_heat_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market heat clusters are publicly readable"
  ON public.market_heat_clusters FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_market_heat_clusters_score ON market_heat_clusters(market_heat_score DESC);
CREATE INDEX IF NOT EXISTS idx_market_heat_clusters_zone ON market_heat_clusters(zone_status);
CREATE INDEX IF NOT EXISTS idx_market_heat_clusters_city ON market_heat_clusters(city);

-- 2. Core Market Heat Cluster Engine RPC
CREATE OR REPLACE FUNCTION public.compute_market_heat_clusters(p_min_properties int DEFAULT 3)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cluster record;
  v_upserted int := 0;
  v_heat smallint;
  v_label text;
  v_zone text;
  v_trend text;
  v_trend_3m text;
  v_confidence smallint;
  v_opp_density numeric;
  v_emerging jsonb;
  v_cooling jsonb;
  v_start timestamptz := clock_timestamp();
BEGIN
  FOR v_cluster IN
    SELECT
      p.city,
      p.state,
      LOWER(TRIM(p.city)) || '::' || LOWER(TRIM(COALESCE(p.state, ''))) AS cluster_key,
      COUNT(*)::int AS property_count,
      COUNT(*) FILTER (WHERE p.status = 'active')::int AS active_listings,
      COUNT(*) FILTER (WHERE p.created_at >= now() - interval '30 days')::int AS new_listings_30d,
      -- Geo center
      AVG(p.latitude) FILTER (WHERE p.latitude IS NOT NULL) AS center_lat,
      AVG(p.longitude) FILTER (WHERE p.longitude IS NOT NULL) AS center_lng,
      -- Score averages
      ROUND(AVG(COALESCE(p.opportunity_score, 0)))::smallint AS avg_opp,
      ROUND(AVG(COALESCE(p.deal_score, 0)))::smallint AS avg_deal,
      ROUND(AVG(COALESCE(p.demand_score, 0)))::smallint AS avg_demand,
      -- Engagement
      SUM(COALESCE(p.views_count, 0))::int AS total_views,
      SUM(COALESCE(p.saves_count, 0))::int AS total_saves,
      SUM(COALESCE(p.inquiry_count, 0))::int AS total_inquiries,
      -- DOM
      ROUND(AVG(COALESCE(p.days_on_market, 
        EXTRACT(EPOCH FROM (now() - COALESCE(p.listed_at, p.created_at))) / 86400
      )))::numeric AS avg_dom,
      -- Trend counts
      COUNT(*) FILTER (WHERE p.demand_trend = 'hot')::int AS hot_cnt,
      COUNT(*) FILTER (WHERE p.demand_trend = 'stable')::int AS stable_cnt,
      COUNT(*) FILTER (WHERE p.demand_trend = 'cooling')::int AS cooling_cnt,
      -- Price
      ROUND(AVG(p.price))::bigint AS avg_price,
      MIN(p.price)::bigint AS min_price,
      MAX(p.price)::bigint AS max_price,
      ROUND(AVG(CASE WHEN COALESCE(p.area_sqm,0) > 0 THEN p.price/p.area_sqm END))::bigint AS avg_psm,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price)::bigint AS median_price,
      -- Score signals
      COUNT(*) FILTER (WHERE p.opportunity_score >= 65)::int AS high_opp_count,
      ROUND(AVG(COALESCE(p.forecast_score_3m, 0)))::smallint AS avg_forecast
    FROM properties p
    WHERE p.city IS NOT NULL AND p.city != ''
    GROUP BY p.city, p.state
    HAVING COUNT(*) >= p_min_properties
  LOOP
    -- ═══ HEAT SCORE CALCULATION ═══
    -- Weighted: opportunity(30%) + demand(25%) + absorption_speed(20%) + engagement(15%) + price_signal(10%)
    DECLARE
      v_absorption_score numeric;
      v_engagement_score numeric;
      v_price_signal numeric;
    BEGIN
      -- Absorption speed: lower DOM = higher score
      v_absorption_score := CASE
        WHEN v_cluster.avg_dom <= 14 THEN 95
        WHEN v_cluster.avg_dom <= 30 THEN 80
        WHEN v_cluster.avg_dom <= 60 THEN 60
        WHEN v_cluster.avg_dom <= 90 THEN 40
        WHEN v_cluster.avg_dom <= 180 THEN 25
        ELSE 10
      END;

      -- Engagement: normalized views+saves+inquiries
      v_engagement_score := LEAST(100,
        LEAST(50, v_cluster.total_views::numeric * 0.02) +
        LEAST(30, v_cluster.total_saves::numeric * 0.1) +
        LEAST(20, v_cluster.total_inquiries::numeric * 0.5)
      );

      -- Price appreciation signal: new_listings vs active (proxy)
      v_price_signal := CASE
        WHEN v_cluster.active_listings > 0 THEN
          LEAST(100, (v_cluster.new_listings_30d::numeric / v_cluster.active_listings) * 200)
        ELSE 20
      END;

      v_heat := ROUND(
        v_cluster.avg_opp * 0.30 +
        v_cluster.avg_demand * 0.25 +
        v_absorption_score * 0.20 +
        v_engagement_score * 0.15 +
        v_price_signal * 0.10
      )::smallint;
    END;

    -- ═══ HEAT CLASSIFICATION ═══
    IF v_heat >= 80 THEN
      v_label := 'Investment Hotspot';
      v_zone := 'hotspot';
    ELSIF v_heat >= 60 THEN
      v_label := 'Growing Market';
      v_zone := 'growing';
    ELSIF v_heat >= 40 THEN
      v_label := 'Stable Market';
      v_zone := 'stable';
    ELSE
      v_label := 'Cooling Market';
      v_zone := 'cooling';
    END IF;

    -- ═══ OPPORTUNITY DENSITY ═══
    v_opp_density := CASE
      WHEN v_cluster.active_listings > 0 THEN
        ROUND((v_cluster.high_opp_count::numeric / v_cluster.active_listings) * 100, 1)
      ELSE 0
    END;

    -- ═══ TREND DIRECTION ═══
    IF v_cluster.hot_cnt > v_cluster.cooling_cnt * 2 THEN
      v_trend := 'rising';
    ELSIF v_cluster.cooling_cnt > v_cluster.hot_cnt * 2 THEN
      v_trend := 'declining';
    ELSE
      v_trend := 'stable';
    END IF;

    -- ═══ 3-MONTH FORECAST ═══
    -- Based on current heat, trend momentum, forecast scores
    DECLARE
      v_momentum numeric;
    BEGIN
      v_momentum := v_cluster.avg_forecast * 0.4 + v_heat * 0.3 +
        CASE v_trend WHEN 'rising' THEN 20 WHEN 'declining' THEN -10 ELSE 5 END;

      IF v_momentum >= 60 THEN
        v_trend_3m := 'Rising';
        v_confidence := LEAST(95, GREATEST(50, v_momentum))::smallint;
      ELSIF v_momentum >= 35 THEN
        v_trend_3m := 'Stable';
        v_confidence := LEAST(85, GREATEST(40, v_momentum))::smallint;
      ELSE
        v_trend_3m := 'Declining';
        v_confidence := LEAST(80, GREATEST(30, ABS(v_momentum)))::smallint;
      END IF;
    END;

    -- ═══ EMERGING SIGNALS ═══
    v_emerging := '[]'::jsonb;
    IF v_cluster.avg_opp >= 55 AND v_trend = 'rising' THEN
      v_emerging := v_emerging || '["High opportunity scores with rising trend"]'::jsonb;
    END IF;
    IF v_cluster.new_listings_30d > 0 AND v_cluster.avg_dom < 45 THEN
      v_emerging := v_emerging || '["Fast absorption of new listings"]'::jsonb;
    END IF;
    IF v_cluster.hot_cnt > v_cluster.property_count * 0.4 THEN
      v_emerging := v_emerging || '["Over 40% of properties showing hot demand"]'::jsonb;
    END IF;

    -- ═══ COOLING RISK SIGNALS ═══
    v_cooling := '[]'::jsonb;
    IF v_cluster.avg_dom > 120 THEN
      v_cooling := v_cooling || '["High average days on market (>120)"]'::jsonb;
    END IF;
    IF v_cluster.cooling_cnt > v_cluster.property_count * 0.5 THEN
      v_cooling := v_cooling || '["Over 50% of properties in cooling demand"]'::jsonb;
    END IF;
    IF v_cluster.total_inquiries < v_cluster.active_listings THEN
      v_cooling := v_cooling || '["Low inquiry-to-listing ratio"]'::jsonb;
    END IF;

    -- Upgrade zone status if signals present
    IF jsonb_array_length(v_emerging) >= 2 AND v_heat >= 55 THEN
      v_zone := 'surging';
      v_label := 'Surging Investment Zone';
    END IF;
    IF jsonb_array_length(v_cooling) >= 2 AND v_heat < 50 THEN
      v_zone := 'cooling_risk';
      v_label := 'Cooling Risk Area';
    END IF;

    -- ═══ UPSERT ═══
    INSERT INTO market_heat_clusters (
      cluster_key, city, state, cluster_center_lat, cluster_center_lng,
      property_count, active_listings, new_listings_30d,
      market_heat_score, avg_opportunity_score, avg_deal_score, avg_demand_score, opportunity_density,
      heat_label, zone_status,
      total_views, total_saves, total_inquiries, avg_days_on_market,
      hot_count, stable_count, cooling_count,
      avg_price, min_price, max_price, avg_price_per_sqm, median_price,
      trend_direction, heat_trend_3m, trend_confidence,
      cooling_risk_signals, emerging_signals,
      computed_at, updated_at
    ) VALUES (
      v_cluster.cluster_key, v_cluster.city, v_cluster.state,
      v_cluster.center_lat, v_cluster.center_lng,
      v_cluster.property_count, v_cluster.active_listings, v_cluster.new_listings_30d,
      v_heat, v_cluster.avg_opp, v_cluster.avg_deal, v_cluster.avg_demand, v_opp_density,
      v_label, v_zone,
      v_cluster.total_views, v_cluster.total_saves, v_cluster.total_inquiries, v_cluster.avg_dom,
      v_cluster.hot_cnt, v_cluster.stable_cnt, v_cluster.cooling_cnt,
      v_cluster.avg_price, v_cluster.min_price, v_cluster.max_price,
      COALESCE(v_cluster.avg_psm, 0), COALESCE(v_cluster.median_price, 0),
      v_trend, v_trend_3m, v_confidence,
      v_cooling, v_emerging,
      now(), now()
    )
    ON CONFLICT (cluster_key) DO UPDATE SET
      cluster_center_lat = EXCLUDED.cluster_center_lat,
      cluster_center_lng = EXCLUDED.cluster_center_lng,
      property_count = EXCLUDED.property_count,
      active_listings = EXCLUDED.active_listings,
      new_listings_30d = EXCLUDED.new_listings_30d,
      market_heat_score = EXCLUDED.market_heat_score,
      avg_opportunity_score = EXCLUDED.avg_opportunity_score,
      avg_deal_score = EXCLUDED.avg_deal_score,
      avg_demand_score = EXCLUDED.avg_demand_score,
      opportunity_density = EXCLUDED.opportunity_density,
      heat_label = EXCLUDED.heat_label,
      zone_status = EXCLUDED.zone_status,
      total_views = EXCLUDED.total_views,
      total_saves = EXCLUDED.total_saves,
      total_inquiries = EXCLUDED.total_inquiries,
      avg_days_on_market = EXCLUDED.avg_days_on_market,
      hot_count = EXCLUDED.hot_count,
      stable_count = EXCLUDED.stable_count,
      cooling_count = EXCLUDED.cooling_count,
      avg_price = EXCLUDED.avg_price,
      min_price = EXCLUDED.min_price,
      max_price = EXCLUDED.max_price,
      avg_price_per_sqm = EXCLUDED.avg_price_per_sqm,
      median_price = EXCLUDED.median_price,
      trend_direction = EXCLUDED.trend_direction,
      heat_trend_3m = EXCLUDED.heat_trend_3m,
      trend_confidence = EXCLUDED.trend_confidence,
      cooling_risk_signals = EXCLUDED.cooling_risk_signals,
      emerging_signals = EXCLUDED.emerging_signals,
      computed_at = now(),
      updated_at = now();

    v_upserted := v_upserted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'clusters_computed', v_upserted,
    'duration_ms', ROUND(EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000),
    'timestamp', now()
  );
END;
$$;

-- 3. Heatmap dataset RPC (lightweight for map rendering)
CREATE OR REPLACE FUNCTION public.get_heatmap_dataset(p_min_score int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'cluster_key', cluster_key,
        'city', city,
        'state', state,
        'lat', cluster_center_lat,
        'lng', cluster_center_lng,
        'heat_score', market_heat_score,
        'heat_label', heat_label,
        'zone_status', zone_status,
        'opportunity_density', opportunity_density,
        'trend_direction', trend_direction,
        'heat_trend_3m', heat_trend_3m,
        'confidence', trend_confidence,
        'property_count', property_count,
        'avg_price', avg_price
      ) ORDER BY market_heat_score DESC
    ), '[]'::jsonb)
    FROM market_heat_clusters
    WHERE market_heat_score >= p_min_score
  );
END;
$$;

-- 4. Upgrade get_market_heat_zones to use cached clusters
CREATE OR REPLACE FUNCTION public.get_market_heat_zones(p_min_properties int DEFAULT 3)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(c)::jsonb ORDER BY c.market_heat_score DESC), '[]'::jsonb)
    FROM (
      SELECT
        city, state, property_count, active_listings, new_listings_30d,
        market_heat_score AS heat_score,
        avg_opportunity_score, avg_deal_score, avg_demand_score,
        opportunity_density,
        total_views, total_saves, total_inquiries,
        avg_days_on_market,
        heat_label, zone_status,
        hot_count, stable_count, cooling_count,
        avg_price, min_price, max_price, avg_price_per_sqm, median_price,
        trend_direction, heat_trend_3m, trend_confidence,
        cooling_risk_signals, emerging_signals,
        cluster_center_lat, cluster_center_lng,
        computed_at
      FROM market_heat_clusters
      WHERE property_count >= p_min_properties
      ORDER BY market_heat_score DESC
      LIMIT 100
    ) c
  );
END;
$$;
