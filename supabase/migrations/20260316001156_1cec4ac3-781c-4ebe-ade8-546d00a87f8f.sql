
CREATE OR REPLACE FUNCTION public.run_marketplace_optimization_cycle(p_lookback_days int DEFAULT 60)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  half int := GREATEST(p_lookback_days / 2, 14);
  listings jsonb := '[]'::jsonb;
  summary_improving int := 0;
  summary_stable int := 0;
  summary_intervention int := 0;
  total_processed int := 0;
  r record;
  curr_deal numeric;
  prev_deal numeric;
  deal_trend numeric;
  curr_seo numeric;
  curr_demand numeric;
  prev_demand numeric;
  demand_trend numeric;
  curr_liquidity numeric;
  prev_liquidity numeric;
  liquidity_trend numeric;
  cycle_signal text;
  primary_action text;
  perf_trend text;
  next_focus text;
BEGIN
  FOR r IN
    SELECT
      p.id,
      left(p.title, 50) AS title,
      p.city,
      p.price,
      p.property_type
    FROM properties p
    WHERE p.status IN ('available', 'active')
    ORDER BY p.created_at DESC
    LIMIT 200
  LOOP
    total_processed := total_processed + 1;

    -- Current deal score
    SELECT COALESCE(pda.deal_score, 0)
    INTO curr_deal
    FROM property_deal_analysis pda
    WHERE pda.property_id = r.id
      AND pda.analyzed_at >= now() - (half || ' days')::interval
    ORDER BY pda.analyzed_at DESC LIMIT 1;

    curr_deal := COALESCE(curr_deal, 0);

    -- Previous deal score
    SELECT COALESCE(pda.deal_score, 0)
    INTO prev_deal
    FROM property_deal_analysis pda
    WHERE pda.property_id = r.id
      AND pda.analyzed_at < now() - (half || ' days')::interval
      AND pda.analyzed_at >= now() - (p_lookback_days || ' days')::interval
    ORDER BY pda.analyzed_at DESC LIMIT 1;

    prev_deal := COALESCE(prev_deal, curr_deal);
    deal_trend := curr_deal - prev_deal;

    -- SEO score
    SELECT COALESCE(pis.seo_quality_score, 0)
    INTO curr_seo
    FROM property_investment_scores pis
    WHERE pis.property_id = r.id
    ORDER BY pis.updated_at DESC LIMIT 1;

    curr_seo := COALESCE(curr_seo, 0);

    -- Demand from hotspots (city level)
    SELECT COALESCE(ih.demand_score, 0), COALESCE(ih.liquidity_score, 0)
    INTO curr_demand, curr_liquidity
    FROM investment_hotspots ih
    WHERE ih.city = r.city
    ORDER BY ih.updated_at DESC LIMIT 1;

    curr_demand := COALESCE(curr_demand, 0);
    curr_liquidity := COALESCE(curr_liquidity, 0);

    -- Previous demand / liquidity
    SELECT COALESCE(AVG(ih.demand_score), curr_demand), COALESCE(AVG(ih.liquidity_score), curr_liquidity)
    INTO prev_demand, prev_liquidity
    FROM investment_hotspots ih
    WHERE ih.city = r.city
      AND ih.updated_at < now() - (half || ' days')::interval;

    demand_trend := curr_demand - prev_demand;
    liquidity_trend := curr_liquidity - prev_liquidity;

    -- === Classification logic ===

    -- Primary action priority
    IF deal_trend < -8 AND curr_deal < 40 THEN
      primary_action := 'PRICING_ADJUSTMENT';
      IF liquidity_trend < -5 THEN
        primary_action := 'PRICING_ADJUSTMENT';
      END IF;
    ELSIF curr_seo < 35 THEN
      primary_action := 'SEO_OPTIMIZATION';
    ELSIF demand_trend > 5 AND curr_demand >= 50 THEN
      primary_action := 'BUYER_MATCH_ESCALATION';
    ELSIF deal_trend < -3 THEN
      primary_action := 'PRICING_ADJUSTMENT';
    ELSE
      primary_action := 'MONITOR';
    END IF;

    -- Performance trend
    IF deal_trend > 5 THEN
      perf_trend := 'IMPROVING';
    ELSIF deal_trend >= -3 THEN
      perf_trend := 'STABLE';
    ELSE
      perf_trend := 'DECLINING';
    END IF;

    -- Cycle signal
    IF perf_trend = 'IMPROVING' AND primary_action = 'MONITOR' THEN
      cycle_signal := 'OPTIMIZATION_IMPROVING';
      summary_improving := summary_improving + 1;
    ELSIF perf_trend = 'DECLINING' OR primary_action IN ('PRICING_ADJUSTMENT', 'SEO_OPTIMIZATION') THEN
      cycle_signal := 'INTERVENTION_REQUIRED';
      summary_intervention := summary_intervention + 1;
    ELSE
      cycle_signal := 'STABLE_CONDITION';
      summary_stable := summary_stable + 1;
    END IF;

    -- Next cycle focus
    IF primary_action = 'PRICING_ADJUSTMENT' AND curr_seo < 40 THEN
      next_focus := 'DUAL_PRICE_SEO';
    ELSIF primary_action = 'BUYER_MATCH_ESCALATION' THEN
      next_focus := 'CONVERSION_PUSH';
    ELSIF primary_action = 'SEO_OPTIMIZATION' THEN
      next_focus := 'VISIBILITY_BOOST';
    ELSIF perf_trend = 'IMPROVING' THEN
      next_focus := 'MOMENTUM_MAINTAIN';
    ELSE
      next_focus := 'STANDARD_MONITOR';
    END IF;

    listings := listings || jsonb_build_object(
      'listing_id', r.id,
      'title', r.title,
      'city', r.city,
      'price', r.price,
      'optimization_cycle_signal', cycle_signal,
      'primary_action_triggered', primary_action,
      'performance_trend', perf_trend,
      'next_cycle_focus', next_focus,
      'metrics', jsonb_build_object(
        'deal_score', ROUND(curr_deal),
        'deal_trend', ROUND(deal_trend),
        'seo_score', ROUND(curr_seo),
        'demand', ROUND(curr_demand),
        'demand_trend', ROUND(demand_trend),
        'liquidity', ROUND(curr_liquidity),
        'liquidity_trend', ROUND(liquidity_trend)
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'listings', listings,
    'total_processed', total_processed,
    'summary', jsonb_build_object(
      'improving', summary_improving,
      'stable', summary_stable,
      'intervention', summary_intervention,
      'health_ratio', CASE WHEN total_processed > 0
        THEN ROUND((summary_improving + summary_stable)::numeric / total_processed * 100)
        ELSE 0 END
    ),
    'analyzed_at', now()
  );
END;
$$;
