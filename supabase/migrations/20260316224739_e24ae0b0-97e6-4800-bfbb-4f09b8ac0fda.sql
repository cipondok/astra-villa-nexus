
-- ═══════════════════════════════════════════════════════════════
-- ASTRA VILLA — Autonomous Price Prediction Engine
-- ═══════════════════════════════════════════════════════════════

-- 1. Add prediction columns to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS ai_estimated_price bigint,
  ADD COLUMN IF NOT EXISTS valuation_gap_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valuation_label text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS price_forecast_3m bigint,
  ADD COLUMN IF NOT EXISTS price_forecast_6m bigint,
  ADD COLUMN IF NOT EXISTS price_forecast_12m bigint,
  ADD COLUMN IF NOT EXISTS price_trend_signal text DEFAULT 'Stable',
  ADD COLUMN IF NOT EXISTS ai_price_confidence smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_action_hint text,
  ADD COLUMN IF NOT EXISTS price_predicted_at timestamptz;

-- 2. Indexes for prediction queries
CREATE INDEX IF NOT EXISTS idx_properties_valuation_label ON properties(valuation_label) WHERE valuation_label IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_price_trend ON properties(price_trend_signal) WHERE price_trend_signal IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_ai_confidence ON properties(ai_price_confidence DESC) WHERE ai_price_confidence > 0;

-- 3. Core Price Prediction RPC
CREATE OR REPLACE FUNCTION public.compute_price_predictions(p_limit int DEFAULT 100)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prop record;
  v_updated int := 0;
  v_start timestamptz := clock_timestamp();
  v_city_avg bigint;
  v_city_avg_psm bigint;
  v_city_prop_count int;
  v_estimated bigint;
  v_gap_pct numeric;
  v_label text;
  v_forecast_3m bigint;
  v_forecast_6m bigint;
  v_forecast_12m bigint;
  v_trend text;
  v_confidence smallint;
  v_hint text;
  v_growth_rate numeric;
  v_demand_factor numeric;
  v_absorption_factor numeric;
  v_momentum numeric;
BEGIN
  FOR v_prop IN
    SELECT
      p.id, p.price, p.area_sqm, p.city, p.state,
      p.opportunity_score, p.demand_score, p.deal_score,
      p.forecast_score_3m, p.risk_level, p.demand_trend,
      p.views_count, p.saves_count, p.inquiry_count,
      p.days_on_market,
      EXTRACT(EPOCH FROM (now() - COALESCE(p.listed_at, p.created_at))) / 86400 AS dom_calc
    FROM properties p
    WHERE p.status = 'active'
      AND p.price > 0
      AND p.city IS NOT NULL
    ORDER BY
      p.price_predicted_at ASC NULLS FIRST,
      p.score_updated_at DESC NULLS LAST
    LIMIT p_limit
  LOOP
    -- ═══ CITY COMPARABLES ═══
    SELECT
      ROUND(AVG(price))::bigint,
      ROUND(AVG(CASE WHEN COALESCE(area_sqm, 0) > 0 THEN price / area_sqm END))::bigint,
      COUNT(*)::int
    INTO v_city_avg, v_city_avg_psm, v_city_prop_count
    FROM properties
    WHERE city = v_prop.city
      AND status = 'active'
      AND price > 0
      AND id != v_prop.id;

    -- ═══ AI ESTIMATED PRICE ═══
    -- Blend: comparable PSM approach (60%) + city average (40%) + score adjustments
    IF v_city_avg_psm IS NOT NULL AND v_city_avg_psm > 0 AND COALESCE(v_prop.area_sqm, 0) > 0 THEN
      v_estimated := ROUND(
        (v_city_avg_psm * v_prop.area_sqm * 0.60 + COALESCE(v_city_avg, v_prop.price) * 0.40) *
        (1 + (COALESCE(v_prop.opportunity_score, 50) - 50) * 0.003) *
        (1 + (COALESCE(v_prop.demand_score, 50) - 50) * 0.002)
      )::bigint;
    ELSIF v_city_avg IS NOT NULL THEN
      v_estimated := ROUND(
        v_city_avg *
        (1 + (COALESCE(v_prop.opportunity_score, 50) - 50) * 0.004) *
        (1 + (COALESCE(v_prop.demand_score, 50) - 50) * 0.002)
      )::bigint;
    ELSE
      v_estimated := v_prop.price;
    END IF;

    -- ═══ VALUATION GAP ═══
    v_gap_pct := CASE
      WHEN v_estimated > 0 THEN ROUND(((v_prop.price::numeric - v_estimated) / v_estimated) * 100, 1)
      ELSE 0
    END;

    -- ═══ VALUATION LABEL ═══
    IF v_gap_pct <= -25 THEN v_label := 'Deeply Undervalued';
    ELSIF v_gap_pct <= -10 THEN v_label := 'Slightly Undervalued';
    ELSIF v_gap_pct <= 10 THEN v_label := 'Fairly Priced';
    ELSIF v_gap_pct <= 30 THEN v_label := 'Overpriced';
    ELSE v_label := 'High Bubble Risk';
    END IF;

    -- ═══ GROWTH RATE CALCULATION ═══
    -- Demand factor: hot=1.08, stable=1.03, cooling=0.98
    v_demand_factor := CASE v_prop.demand_trend
      WHEN 'hot' THEN 1.08
      WHEN 'stable' THEN 1.03
      WHEN 'cooling' THEN 0.98
      ELSE 1.02
    END;

    -- Absorption factor: fast absorption = higher growth
    v_absorption_factor := CASE
      WHEN COALESCE(v_prop.days_on_market, v_prop.dom_calc) <= 30 THEN 1.04
      WHEN COALESCE(v_prop.days_on_market, v_prop.dom_calc) <= 60 THEN 1.02
      WHEN COALESCE(v_prop.days_on_market, v_prop.dom_calc) <= 120 THEN 1.00
      ELSE 0.97
    END;

    -- Momentum from scores
    v_momentum := (
      COALESCE(v_prop.opportunity_score, 50) * 0.35 +
      COALESCE(v_prop.demand_score, 50) * 0.25 +
      COALESCE(v_prop.forecast_score_3m, 50) * 0.25 +
      LEAST(100, COALESCE(v_prop.views_count, 0) * 0.05 +
                  COALESCE(v_prop.saves_count, 0) * 0.2 +
                  COALESCE(v_prop.inquiry_count, 0) * 0.5) * 0.15
    );

    -- Annual growth rate from momentum
    v_growth_rate := CASE
      WHEN v_momentum >= 75 THEN 8 + (v_momentum - 75) * 0.2
      WHEN v_momentum >= 55 THEN 4 + (v_momentum - 55) * 0.2
      WHEN v_momentum >= 35 THEN 1 + (v_momentum - 35) * 0.15
      ELSE -2 + v_momentum * 0.08
    END;

    -- Apply demand and absorption multipliers
    v_growth_rate := v_growth_rate * (v_demand_factor - 1 + 1) * (v_absorption_factor - 1 + 1);

    -- ═══ PRICE FORECASTS ═══
    v_forecast_3m := ROUND(v_estimated * (1 + v_growth_rate / 100 * 0.25))::bigint;
    v_forecast_6m := ROUND(v_estimated * (1 + v_growth_rate / 100 * 0.50))::bigint;
    v_forecast_12m := ROUND(v_estimated * (1 + v_growth_rate / 100))::bigint;

    -- ═══ TREND SIGNAL ═══
    IF v_growth_rate >= 8 THEN v_trend := 'Strong Growth';
    ELSIF v_growth_rate >= 4 THEN v_trend := 'Moderate Growth';
    ELSIF v_growth_rate >= 0 THEN v_trend := 'Stable';
    ELSE v_trend := 'Decline Risk';
    END IF;

    -- ═══ CONFIDENCE SCORE ═══
    v_confidence := LEAST(99, GREATEST(15,
      -- Data availability (40%)
      (CASE WHEN v_city_prop_count >= 20 THEN 35 WHEN v_city_prop_count >= 5 THEN 25 ELSE 10 END) +
      (CASE WHEN COALESCE(v_prop.area_sqm, 0) > 0 THEN 5 ELSE 0 END) +
      -- Demand stability (30%)
      (CASE v_prop.demand_trend
        WHEN 'stable' THEN 25 WHEN 'hot' THEN 20 WHEN 'cooling' THEN 10 ELSE 15 END) +
      (CASE WHEN v_prop.views_count > 0 OR v_prop.inquiry_count > 0 THEN 5 ELSE 0 END) +
      -- Score quality (30%)
      (CASE WHEN COALESCE(v_prop.opportunity_score, 0) > 0 THEN 15 ELSE 5 END) +
      (CASE WHEN COALESCE(v_prop.forecast_score_3m, 0) > 0 THEN 15 ELSE 5 END)
    ))::smallint;

    -- ═══ ACTION HINT ═══
    IF v_gap_pct <= -20 AND v_growth_rate >= 5 THEN
      v_hint := 'Potential flip opportunity';
    ELSIF v_gap_pct <= -10 AND v_growth_rate >= 3 THEN
      v_hint := 'Strong acquisition candidate';
    ELSIF v_growth_rate >= 6 AND v_prop.demand_trend = 'hot' THEN
      v_hint := 'Long-term hold candidate';
    ELSIF v_growth_rate < 0 OR v_gap_pct > 25 THEN
      v_hint := 'Short-term risk zone';
    ELSIF v_gap_pct > 10 THEN
      v_hint := 'Wait for price correction';
    ELSE
      v_hint := 'Fair entry point';
    END IF;

    -- ═══ UPDATE ═══
    UPDATE properties SET
      ai_estimated_price = v_estimated,
      valuation_gap_pct = v_gap_pct,
      valuation_label = v_label,
      price_forecast_3m = v_forecast_3m,
      price_forecast_6m = v_forecast_6m,
      price_forecast_12m = v_forecast_12m,
      price_trend_signal = v_trend,
      ai_price_confidence = v_confidence,
      price_action_hint = v_hint,
      price_predicted_at = now()
    WHERE id = v_prop.id;

    v_updated := v_updated + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'properties_predicted', v_updated,
    'duration_ms', ROUND(EXTRACT(EPOCH FROM (clock_timestamp() - v_start)) * 1000),
    'timestamp', now()
  );
END;
$$;

-- 4. Stats aggregation RPC
CREATE OR REPLACE FUNCTION public.get_price_prediction_stats()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'total_predicted', COUNT(*) FILTER (WHERE price_predicted_at IS NOT NULL),
      'total_active', COUNT(*),
      'coverage_pct', ROUND(
        COUNT(*) FILTER (WHERE price_predicted_at IS NOT NULL)::numeric /
        NULLIF(COUNT(*), 0) * 100, 1
      ),
      'avg_confidence', ROUND(AVG(ai_price_confidence) FILTER (WHERE ai_price_confidence > 0)),
      'avg_gap_pct', ROUND(AVG(valuation_gap_pct) FILTER (WHERE valuation_gap_pct != 0), 1),
      'deeply_undervalued', COUNT(*) FILTER (WHERE valuation_label = 'Deeply Undervalued'),
      'slightly_undervalued', COUNT(*) FILTER (WHERE valuation_label = 'Slightly Undervalued'),
      'fairly_priced', COUNT(*) FILTER (WHERE valuation_label = 'Fairly Priced'),
      'overpriced', COUNT(*) FILTER (WHERE valuation_label = 'Overpriced'),
      'bubble_risk', COUNT(*) FILTER (WHERE valuation_label = 'High Bubble Risk'),
      'strong_growth', COUNT(*) FILTER (WHERE price_trend_signal = 'Strong Growth'),
      'moderate_growth', COUNT(*) FILTER (WHERE price_trend_signal = 'Moderate Growth'),
      'stable', COUNT(*) FILTER (WHERE price_trend_signal = 'Stable'),
      'decline_risk', COUNT(*) FILTER (WHERE price_trend_signal = 'Decline Risk'),
      'flip_opportunities', COUNT(*) FILTER (WHERE price_action_hint = 'Potential flip opportunity'),
      'hold_candidates', COUNT(*) FILTER (WHERE price_action_hint = 'Long-term hold candidate'),
      'risk_zones', COUNT(*) FILTER (WHERE price_action_hint = 'Short-term risk zone')
    )
    FROM properties
    WHERE status = 'active' AND price > 0
  );
END;
$$;
