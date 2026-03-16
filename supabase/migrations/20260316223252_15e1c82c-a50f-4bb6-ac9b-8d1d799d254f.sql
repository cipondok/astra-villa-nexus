
-- ═══════════════════════════════════════════════════════════════
-- ASTRA VILLA — AI Opportunity Scoring Engine
-- ═══════════════════════════════════════════════════════════════

-- 1. Add missing scoring columns to properties
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS opportunity_score smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS demand_score smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS demand_trend text DEFAULT 'stable',
  ADD COLUMN IF NOT EXISTS deal_score smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiry_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forecast_score_3m smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS luxury_index smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS score_updated_at timestamptz;

-- 2. Indexes for scoring engine
CREATE INDEX IF NOT EXISTS idx_properties_opportunity_score ON properties(opportunity_score DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_demand_trend ON properties(demand_trend) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_risk_level ON properties(risk_level) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_scoring_composite ON properties(opportunity_score DESC, deal_score DESC, demand_score DESC) WHERE status = 'active';

-- 3. Core Opportunity Scoring Engine RPC
CREATE OR REPLACE FUNCTION public.compute_opportunity_score(p_property_id uuid)
RETURNS smallint
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prop record;
  v_inv record;
  v_deal record;
  -- Sub-scores (0-100)
  v_roi_score numeric := 0;
  v_demand_heat numeric := 0;
  v_underval_score numeric := 0;
  v_inquiry_vel numeric := 0;
  v_rental_yield_score numeric := 0;
  v_luxury_score numeric := 0;
  -- Composite
  v_opportunity numeric := 0;
  -- Market context
  v_city_avg_psm numeric := 0;
  v_city_avg_views numeric := 0;
  v_city_avg_saves numeric := 0;
  v_prop_psm numeric := 0;
  -- Forecast & risk
  v_forecast smallint := 0;
  v_risk text := 'medium';
  v_demand_trend text := 'stable';
BEGIN
  -- Fetch property
  SELECT * INTO v_prop FROM properties WHERE id = p_property_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Fetch intelligence data
  SELECT * INTO v_inv FROM property_investment_scores WHERE property_id = p_property_id;
  SELECT * INTO v_deal FROM property_deal_analysis WHERE property_id = p_property_id;

  -- ── MARKET CONTEXT ──
  SELECT
    COALESCE(AVG(CASE WHEN area_sqm > 0 THEN price / area_sqm END), 0),
    COALESCE(AVG(views_count), 0),
    COALESCE(AVG(saves_count), 0)
  INTO v_city_avg_psm, v_city_avg_views, v_city_avg_saves
  FROM properties
  WHERE city = v_prop.city AND status = 'active' AND price > 0;

  IF COALESCE(v_prop.area_sqm, 0) > 0 THEN
    v_prop_psm := v_prop.price / v_prop.area_sqm;
  END IF;

  -- ═══ 1. ROI PROJECTION SCORE (30%) ═══
  -- Sources: roi_forecast_gap, growth_prediction, deal_score
  IF v_deal IS NOT NULL THEN
    v_roi_score := LEAST(100, GREATEST(0,
      COALESCE(v_deal.roi_forecast_gap, 0) * 3 +
      COALESCE(v_deal.location_growth_score, 0) * 0.4 +
      COALESCE(v_deal.flip_potential_score, 0) * 0.3
    ));
  END IF;
  IF v_inv IS NOT NULL AND v_roi_score < 20 THEN
    v_roi_score := GREATEST(v_roi_score, LEAST(100,
      COALESCE(v_inv.growth_prediction, 0) * 5 +
      COALESCE(v_inv.roi_forecast, 0) * 0.8
    ));
  END IF;

  -- ═══ 2. MARKET DEMAND HEAT (20%) ═══
  -- Sources: views, saves, inquiry count, demand signals
  DECLARE
    v_views_norm numeric := 0;
    v_saves_norm numeric := 0;
    v_inq_norm numeric := 0;
  BEGIN
    IF v_city_avg_views > 0 THEN
      v_views_norm := LEAST(100, (COALESCE(v_prop.views_count, 0) / v_city_avg_views) * 50);
    END IF;
    IF v_city_avg_saves > 0 THEN
      v_saves_norm := LEAST(100, (COALESCE(v_prop.saves_count, 0) / v_city_avg_saves) * 60);
    END IF;
    v_inq_norm := LEAST(100, COALESCE(v_prop.inquiry_count, 0) * 8);

    v_demand_heat := v_views_norm * 0.35 + v_saves_norm * 0.35 + v_inq_norm * 0.30;

    IF v_deal IS NOT NULL THEN
      v_demand_heat := v_demand_heat * 0.6 + COALESCE(v_deal.demand_signal_score, 0) * 0.4;
    END IF;
  END;

  -- ═══ 3. PRICE UNDERVALUATION SCORE (20%) ═══
  IF v_deal IS NOT NULL AND v_deal.undervaluation_percent > 0 THEN
    v_underval_score := LEAST(100, v_deal.undervaluation_percent * 4);
  ELSIF v_city_avg_psm > 0 AND v_prop_psm > 0 THEN
    -- Manual calc: how far below city avg
    DECLARE v_deviation numeric;
    BEGIN
      v_deviation := ((v_city_avg_psm - v_prop_psm) / v_city_avg_psm) * 100;
      v_underval_score := LEAST(100, GREATEST(0, v_deviation * 3));
    END;
  END IF;

  -- ═══ 4. BUYER INQUIRY VELOCITY (15%) ═══
  DECLARE
    v_dom numeric;
    v_inq_per_day numeric := 0;
  BEGIN
    v_dom := GREATEST(1, COALESCE(v_prop.days_on_market, 
      EXTRACT(EPOCH FROM (now() - COALESCE(v_prop.listed_at, v_prop.created_at))) / 86400
    ));
    v_inq_per_day := COALESCE(v_prop.inquiry_count, 0) / v_dom;
    -- Normalize: 0.5+ inquiries/day = 100
    v_inquiry_vel := LEAST(100, v_inq_per_day * 200);
    -- Bonus for saves velocity
    v_inquiry_vel := v_inquiry_vel + LEAST(20, (COALESCE(v_prop.saves_count, 0) / v_dom) * 40);
    v_inquiry_vel := LEAST(100, v_inquiry_vel);
  END;

  -- ═══ 5. RENTAL YIELD STRENGTH (10%) ═══
  IF v_inv IS NOT NULL AND v_inv.rental_yield > 0 THEN
    v_rental_yield_score := LEAST(100, v_inv.rental_yield * 12.5);
  ELSIF v_deal IS NOT NULL AND v_deal.rental_yield_estimate > 0 THEN
    v_rental_yield_score := LEAST(100, v_deal.rental_yield_estimate * 12.5);
  END IF;

  -- ═══ 6. LUXURY APPEAL INDEX (5%) ═══
  v_luxury_score := 0;
  -- Size premium
  IF COALESCE(v_prop.area_sqm, 0) > 200 THEN v_luxury_score := v_luxury_score + 25; END IF;
  IF COALESCE(v_prop.area_sqm, 0) > 500 THEN v_luxury_score := v_luxury_score + 15; END IF;
  -- Room premium
  IF COALESCE(v_prop.bedrooms, 0) >= 4 THEN v_luxury_score := v_luxury_score + 15; END IF;
  IF COALESCE(v_prop.bathrooms, 0) >= 3 THEN v_luxury_score := v_luxury_score + 10; END IF;
  -- Price tier premium (top 20% in city)
  IF v_city_avg_psm > 0 AND v_prop_psm > v_city_avg_psm * 1.5 THEN
    v_luxury_score := v_luxury_score + 20;
  END IF;
  -- Property type premium
  IF v_prop.property_type IN ('villa', 'penthouse', 'mansion', 'townhouse') THEN
    v_luxury_score := v_luxury_score + 15;
  END IF;
  v_luxury_score := LEAST(100, v_luxury_score);

  -- ═══ COMPOSITE SCORE ═══
  v_opportunity := ROUND(
    v_roi_score * 0.30 +
    v_demand_heat * 0.20 +
    v_underval_score * 0.20 +
    v_inquiry_vel * 0.15 +
    v_rental_yield_score * 0.10 +
    v_luxury_score * 0.05
  );

  -- ═══ DEMAND TREND CLASSIFICATION ═══
  IF v_demand_heat >= 65 THEN v_demand_trend := 'hot';
  ELSIF v_demand_heat >= 35 THEN v_demand_trend := 'stable';
  ELSE v_demand_trend := 'cooling';
  END IF;

  -- ═══ RISK CLASSIFICATION ═══
  DECLARE
    v_risk_signals int := 0;
  BEGIN
    -- Long DOM = risk
    IF COALESCE(v_prop.days_on_market, 0) > 120 THEN v_risk_signals := v_risk_signals + 1; END IF;
    -- Low demand = risk
    IF v_demand_heat < 25 THEN v_risk_signals := v_risk_signals + 1; END IF;
    -- Overpriced = risk
    IF v_underval_score < 10 AND v_prop_psm > v_city_avg_psm * 1.2 THEN v_risk_signals := v_risk_signals + 1; END IF;
    -- Low liquidity
    IF v_inv IS NOT NULL AND COALESCE(v_inv.liquidity_score, 0) < 25 THEN v_risk_signals := v_risk_signals + 1; END IF;

    IF v_risk_signals >= 3 THEN v_risk := 'high';
    ELSIF v_risk_signals >= 1 THEN v_risk := 'medium';
    ELSE v_risk := 'low';
    END IF;
  END;

  -- ═══ 3-MONTH FORECAST ═══
  v_forecast := LEAST(100, GREATEST(0, ROUND(
    v_opportunity * 0.5 +
    v_demand_heat * 0.2 +
    COALESCE(CASE WHEN v_inv IS NOT NULL THEN v_inv.growth_prediction * 2 ELSE 0 END, 0) +
    v_underval_score * 0.1
  )))::smallint;

  -- ═══ PERSIST SCORES ═══
  UPDATE properties SET
    opportunity_score = v_opportunity::smallint,
    demand_score = v_demand_heat::smallint,
    demand_trend = v_demand_trend,
    deal_score = COALESCE(v_deal.deal_score, 0)::smallint,
    inquiry_count = COALESCE(v_prop.inquiry_count, 0),
    forecast_score_3m = v_forecast,
    luxury_index = v_luxury_score::smallint,
    risk_level = v_risk,
    score_updated_at = now()
  WHERE id = p_property_id;

  RETURN v_opportunity::smallint;
END;
$$;

-- 4. Upgrade batch refresh to use compute_opportunity_score
CREATE OR REPLACE FUNCTION public.batch_refresh_opportunity_scores(p_limit int DEFAULT 200)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int := 0;
  v_prop record;
  v_score numeric;
  v_start timestamptz := clock_timestamp();
BEGIN
  FOR v_prop IN
    SELECT id FROM properties
    WHERE status = 'active'
    ORDER BY
      CASE WHEN opportunity_score IS NULL OR opportunity_score = 0 THEN 0 ELSE 1 END,
      score_updated_at ASC NULLS FIRST,
      updated_at ASC NULLS FIRST
    LIMIT p_limit
  LOOP
    v_score := compute_opportunity_score(v_prop.id);
    v_updated := v_updated + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'updated', v_updated,
    'duration_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000,
    'timestamp', now()
  );
END;
$$;

-- 5. Scoring stats aggregation RPC
CREATE OR REPLACE FUNCTION public.get_opportunity_score_stats()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_scored', COUNT(*) FILTER (WHERE opportunity_score > 0),
    'total_active', COUNT(*),
    'avg_score', ROUND(AVG(COALESCE(opportunity_score, 0))),
    'median_score', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY COALESCE(opportunity_score, 0)),
    'elite_count', COUNT(*) FILTER (WHERE opportunity_score >= 85),
    'strong_count', COUNT(*) FILTER (WHERE opportunity_score >= 65 AND opportunity_score < 85),
    'moderate_count', COUNT(*) FILTER (WHERE opportunity_score >= 40 AND opportunity_score < 65),
    'weak_count', COUNT(*) FILTER (WHERE opportunity_score < 40 AND opportunity_score > 0),
    'unscored_count', COUNT(*) FILTER (WHERE opportunity_score IS NULL OR opportunity_score = 0),
    'risk_distribution', jsonb_build_object(
      'low', COUNT(*) FILTER (WHERE risk_level = 'low'),
      'medium', COUNT(*) FILTER (WHERE risk_level = 'medium'),
      'high', COUNT(*) FILTER (WHERE risk_level = 'high')
    ),
    'trend_distribution', jsonb_build_object(
      'hot', COUNT(*) FILTER (WHERE demand_trend = 'hot'),
      'stable', COUNT(*) FILTER (WHERE demand_trend = 'stable'),
      'cooling', COUNT(*) FILTER (WHERE demand_trend = 'cooling')
    ),
    'avg_luxury_index', ROUND(AVG(COALESCE(luxury_index, 0))),
    'avg_forecast_3m', ROUND(AVG(COALESCE(forecast_score_3m, 0))),
    'last_batch_run', MAX(score_updated_at),
    'coverage_pct', ROUND(
      (COUNT(*) FILTER (WHERE opportunity_score > 0))::numeric / NULLIF(COUNT(*), 0) * 100
    )
  )
  INTO v_result
  FROM properties
  WHERE status = 'active';

  RETURN v_result;
END;
$$;
