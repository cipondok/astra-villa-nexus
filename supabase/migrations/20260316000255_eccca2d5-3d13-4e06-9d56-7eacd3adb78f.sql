
CREATE OR REPLACE FUNCTION public.forecast_national_market(p_lookback_days integer DEFAULT 90)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Current window
  curr_growth numeric;
  curr_demand numeric;
  curr_liquidity numeric;
  curr_deal numeric;
  -- Previous window
  prev_growth numeric;
  prev_demand numeric;
  prev_liquidity numeric;
  prev_deal numeric;
  -- Trends
  growth_trend numeric;
  demand_trend numeric;
  liquidity_trend numeric;
  deal_trend numeric;
  -- Results
  price_forecast text;
  climate_phase text;
  outlook text;
  composite numeric;
  emerging jsonb := '[]'::jsonb;
  reg record;
BEGIN
  -- Current half
  SELECT
    COALESCE(AVG(demand_score), 0),
    COALESCE(AVG(growth_score), 0),
    COALESCE(AVG(liquidity_score), 0)
  INTO curr_demand, curr_growth, curr_liquidity
  FROM investment_hotspots
  WHERE updated_at >= now() - (p_lookback_days / 2 || ' days')::interval;

  SELECT COALESCE(AVG(deal_score), 0) INTO curr_deal
  FROM property_deal_analysis
  WHERE updated_at >= now() - (p_lookback_days / 2 || ' days')::interval;

  -- Previous half
  SELECT
    COALESCE(AVG(demand_score), 0),
    COALESCE(AVG(growth_score), 0),
    COALESCE(AVG(liquidity_score), 0)
  INTO prev_demand, prev_growth, prev_liquidity
  FROM investment_hotspots
  WHERE updated_at < now() - (p_lookback_days / 2 || ' days')::interval
    AND updated_at >= now() - (p_lookback_days || ' days')::interval;

  SELECT COALESCE(AVG(deal_score), 0) INTO prev_deal
  FROM property_deal_analysis
  WHERE updated_at < now() - (p_lookback_days / 2 || ' days')::interval
    AND updated_at >= now() - (p_lookback_days || ' days')::interval;

  growth_trend := curr_growth - prev_growth;
  demand_trend := curr_demand - prev_demand;
  liquidity_trend := curr_liquidity - prev_liquidity;
  deal_trend := curr_deal - prev_deal;

  composite := ROUND(curr_growth * 0.30 + curr_demand * 0.30 + curr_liquidity * 0.20 + curr_deal * 0.20);

  -- === 12-month price direction ===
  IF growth_trend > 10 AND demand_trend > 8 AND curr_growth >= 60 THEN
    price_forecast := 'STRONG_GROWTH';
  ELSIF growth_trend > 3 AND curr_growth >= 45 AND demand_trend >= 0 THEN
    price_forecast := 'MODERATE_GROWTH';
  ELSIF ABS(growth_trend) <= 5 AND ABS(demand_trend) <= 5 THEN
    price_forecast := 'STABLE';
  ELSE
    price_forecast := 'DOWNSIDE_RISK';
  END IF;

  -- === Investment climate phase ===
  IF composite >= 60 AND growth_trend > 5 AND demand_trend > 3 THEN
    climate_phase := 'EXPANSION_CYCLE';
  ELSIF composite >= 40 AND (growth_trend > 0 OR demand_trend > 0) THEN
    climate_phase := 'SELECTIVE_OPPORTUNITY';
  ELSE
    climate_phase := 'RISK_CONTROL';
  END IF;

  -- === Emerging growth regions ===
  FOR reg IN
    SELECT
      ih.city,
      ih.demand_score,
      ih.growth_score,
      ih.liquidity_score,
      ih.hotspot_score,
      (ih.demand_score - COALESCE(prev_ih.demand_score, ih.demand_score)) AS demand_accel,
      (ih.liquidity_score - COALESCE(prev_ih.liquidity_score, ih.liquidity_score)) AS liq_improve
    FROM investment_hotspots ih
    LEFT JOIN LATERAL (
      SELECT ih2.demand_score, ih2.liquidity_score
      FROM investment_hotspots ih2
      WHERE ih2.city = ih.city
        AND ih2.updated_at < now() - (p_lookback_days / 2 || ' days')::interval
        AND ih2.updated_at >= now() - (p_lookback_days || ' days')::interval
      ORDER BY ih2.updated_at DESC
      LIMIT 1
    ) prev_ih ON true
    WHERE ih.updated_at >= now() - (p_lookback_days / 2 || ' days')::interval
    ORDER BY
      (ih.demand_score - COALESCE(prev_ih.demand_score, ih.demand_score)) +
      (ih.liquidity_score - COALESCE(prev_ih.liquidity_score, ih.liquidity_score)) DESC
    LIMIT 6
  LOOP
    IF reg.demand_accel > 3 OR reg.liq_improve > 3 OR reg.growth_score >= 55 THEN
      emerging := emerging || jsonb_build_object(
        'city', reg.city,
        'growth_score', reg.growth_score,
        'demand_score', reg.demand_score,
        'liquidity_score', reg.liquidity_score,
        'demand_acceleration', ROUND(reg.demand_accel),
        'liquidity_improvement', ROUND(reg.liq_improve),
        'hotspot_score', reg.hotspot_score
      );
    END IF;
  END LOOP;

  -- === Outlook summary ===
  IF price_forecast = 'STRONG_GROWTH' THEN
    outlook := format(
      'National property market poised for strong 12-month growth. Growth accelerating (+%s pts) with robust demand momentum (+%s pts). '
      || 'Composite index at %s — fundamentals support sustained price appreciation. %s emerging growth clusters identified. '
      || 'Investors should front-load acquisitions in high-growth corridors before market pricing catches up.',
      ROUND(growth_trend), ROUND(demand_trend), composite, jsonb_array_length(emerging)
    );
  ELSIF price_forecast = 'MODERATE_GROWTH' THEN
    outlook := format(
      'Moderate national growth expected over 12 months. Growth trend positive (+%s pts) with demand holding steady. '
      || 'Composite at %s — selective opportunities in emerging regions. Focus on quality assets with strong yield profiles '
      || 'and proven demand. %s regions showing acceleration signals.',
      ROUND(growth_trend), composite, jsonb_array_length(emerging)
    );
  ELSIF price_forecast = 'STABLE' THEN
    outlook := format(
      'National market entering a stabilization phase. Growth and demand trends flat (±%s pts). '
      || 'Composite at %s — market consolidating after prior movement. Prioritize income-generating assets '
      || 'and defensive positions. Wait for clearer directional signals before increasing exposure.',
      GREATEST(ABS(ROUND(growth_trend)), ABS(ROUND(demand_trend))), composite
    );
  ELSE
    outlook := format(
      'Downside risk detected in national outlook. Growth declining (%s pts) with weakening demand (%s pts). '
      || 'Composite at %s — defensive allocation recommended. Preserve capital, reduce leveraged positions, '
      || 'and focus on liquidity. Opportunistic value buying only in resilient sub-markets.',
      ROUND(growth_trend), ROUND(demand_trend), composite
    );
  END IF;

  RETURN jsonb_build_object(
    'national_price_forecast', price_forecast,
    'emerging_growth_regions', emerging,
    'investment_climate_phase', climate_phase,
    'macro_outlook_summary', outlook,
    'composite_score', composite,
    'current_signals', jsonb_build_object(
      'growth', ROUND(curr_growth),
      'demand', ROUND(curr_demand),
      'liquidity', ROUND(curr_liquidity),
      'deal_probability', ROUND(curr_deal)
    ),
    'trends', jsonb_build_object(
      'growth_trend', ROUND(growth_trend),
      'demand_trend', ROUND(demand_trend),
      'liquidity_trend', ROUND(liquidity_trend),
      'deal_trend', ROUND(deal_trend)
    ),
    'lookback_days', p_lookback_days,
    'forecasted_at', now()
  );
END;
$$;
