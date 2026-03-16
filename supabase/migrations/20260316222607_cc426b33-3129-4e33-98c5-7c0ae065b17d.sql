
-- ═══════════════════════════════════════════════════════════
-- 1. Market Heat Zone Intelligence RPC
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_market_heat_zones(p_min_properties int DEFAULT 3)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(z)::jsonb ORDER BY z.heat_score DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      p.city,
      p.state,
      COUNT(*)::int AS property_count,
      ROUND(AVG(p.price))::bigint AS avg_price,
      ROUND(AVG(COALESCE(p.opportunity_score, 0)))::int AS avg_opportunity_score,
      ROUND(AVG(COALESCE(p.deal_score, 0)))::int AS avg_deal_score,
      ROUND(AVG(COALESCE(p.demand_score, 0)))::int AS avg_demand_score,
      SUM(COALESCE(p.views_count, 0))::int AS total_views,
      SUM(COALESCE(p.saves_count, 0))::int AS total_saves,
      -- Heat score: weighted composite
      ROUND(
        AVG(COALESCE(p.opportunity_score, 0)) * 0.35 +
        AVG(COALESCE(p.deal_score, 0)) * 0.25 +
        AVG(COALESCE(p.demand_score, 0)) * 0.20 +
        LEAST(SUM(COALESCE(p.views_count, 0))::numeric * 0.02, 20)
      )::int AS heat_score,
      -- Demand trend distribution
      COUNT(*) FILTER (WHERE p.demand_trend = 'hot')::int AS hot_count,
      COUNT(*) FILTER (WHERE p.demand_trend = 'stable')::int AS stable_count,
      COUNT(*) FILTER (WHERE p.demand_trend = 'cooling')::int AS cooling_count,
      -- Zone classification
      CASE
        WHEN AVG(COALESCE(p.opportunity_score, 0)) >= 70 AND SUM(COALESCE(p.views_count, 0)) > 100 THEN 'surging'
        WHEN AVG(COALESCE(p.opportunity_score, 0)) >= 50 THEN 'emerging'
        WHEN AVG(COALESCE(p.opportunity_score, 0)) >= 30 THEN 'stable'
        ELSE 'cooling'
      END AS zone_status,
      -- Price range
      MIN(p.price)::bigint AS min_price,
      MAX(p.price)::bigint AS max_price,
      -- Avg price per sqm
      ROUND(AVG(
        CASE WHEN COALESCE(p.area_sqm, 0) > 0 THEN p.price / p.area_sqm ELSE NULL END
      ))::bigint AS avg_price_per_sqm
    FROM properties p
    WHERE p.status = 'active' AND p.city IS NOT NULL
    GROUP BY p.city, p.state
    HAVING COUNT(*) >= p_min_properties
    ORDER BY heat_score DESC
    LIMIT 50
  ) z;

  RETURN v_result;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 2. Batch Opportunity Score Refresh
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.batch_refresh_opportunity_scores(p_limit int DEFAULT 200)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int := 0;
  v_prop record;
  v_score numeric;
BEGIN
  FOR v_prop IN
    SELECT id FROM properties
    WHERE status = 'active'
    ORDER BY
      CASE WHEN opportunity_score IS NULL OR opportunity_score = 0 THEN 0 ELSE 1 END,
      updated_at ASC NULLS FIRST
    LIMIT p_limit
  LOOP
    v_score := compute_opportunity_score(v_prop.id);
    v_updated := v_updated + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'updated', v_updated,
    'timestamp', now()
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 3. Investment AI Reasoning Generator
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_investment_reasoning(p_property_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prop record;
  v_deal record;
  v_inv record;
  v_reasons jsonb := '[]'::jsonb;
  v_forecast numeric := 0;
  v_risk text := 'medium';
  v_city_avg numeric;
BEGIN
  SELECT * INTO v_prop FROM properties WHERE id = p_property_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Property not found'); END IF;

  SELECT * INTO v_deal FROM property_deal_analysis WHERE property_id = p_property_id;
  SELECT * INTO v_inv FROM property_investment_scores WHERE property_id = p_property_id;

  -- Build reasoning factors
  IF v_deal IS NOT NULL THEN
    IF v_deal.undervaluation_percent > 10 THEN
      v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
        'factor', 'Price Undervaluation',
        'signal', 'bullish',
        'detail', format('%.1f%% below estimated market value', v_deal.undervaluation_percent)
      ));
    END IF;
    IF v_deal.deal_score >= 70 THEN
      v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
        'factor', 'Strong Deal Score',
        'signal', 'bullish',
        'detail', format('Deal score %s/100 indicates excellent value', v_deal.deal_score)
      ));
    END IF;
    v_forecast := v_forecast + COALESCE(v_deal.roi_forecast_gap, 0) * 0.4;
  END IF;

  IF v_inv IS NOT NULL THEN
    IF v_inv.rental_yield > 5 THEN
      v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
        'factor', 'High Rental Yield',
        'signal', 'bullish',
        'detail', format('%.1f%% gross yield exceeds market average', v_inv.rental_yield)
      ));
    END IF;
    IF v_inv.growth_prediction > 5 THEN
      v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
        'factor', 'Growth Momentum',
        'signal', 'bullish',
        'detail', format('%.1f%% projected growth in this area', v_inv.growth_prediction)
      ));
    ELSIF v_inv.growth_prediction < -2 THEN
      v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
        'factor', 'Declining Growth',
        'signal', 'bearish',
        'detail', format('%.1f%% negative growth trend detected', v_inv.growth_prediction)
      ));
    END IF;
    IF v_inv.liquidity_score > 70 THEN
      v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
        'factor', 'High Liquidity',
        'signal', 'bullish',
        'detail', 'Strong buyer pool and fast transaction velocity'
      ));
    END IF;
    v_forecast := v_forecast + COALESCE(v_inv.growth_prediction, 0) * 0.6;
    v_risk := v_inv.risk_level;
  END IF;

  -- Demand signal
  IF COALESCE(v_prop.demand_score, 0) > 70 THEN
    v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
      'factor', 'Strong Market Demand',
      'signal', 'bullish',
      'detail', format('Demand score %s/100 — high buyer interest', v_prop.demand_score)
    ));
  END IF;

  -- City avg comparison
  SELECT AVG(price / NULLIF(area_sqm, 0)) INTO v_city_avg
  FROM properties WHERE city = v_prop.city AND status = 'active' AND area_sqm > 0;

  IF v_city_avg IS NOT NULL AND v_prop.area_sqm > 0 THEN
    DECLARE v_ppsm numeric := v_prop.price / v_prop.area_sqm;
    BEGIN
      IF v_ppsm < v_city_avg * 0.85 THEN
        v_reasons := v_reasons || jsonb_build_array(jsonb_build_object(
          'factor', 'Below City Average PSM',
          'signal', 'bullish',
          'detail', format('Price/sqm Rp %s vs city avg Rp %s', ROUND(v_ppsm)::text, ROUND(v_city_avg)::text)
        ));
      END IF;
    END;
  END IF;

  RETURN jsonb_build_object(
    'property_id', p_property_id,
    'opportunity_score', COALESCE(v_prop.opportunity_score, 0),
    'demand_trend', COALESCE(v_prop.demand_trend, 'stable'),
    'risk_level', v_risk,
    'appreciation_forecast_pct', ROUND(GREATEST(-20, LEAST(50, v_forecast)), 1),
    'reasoning', v_reasons,
    'generated_at', now()
  );
END;
$$;
