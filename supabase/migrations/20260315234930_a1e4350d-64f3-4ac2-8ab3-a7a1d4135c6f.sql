
CREATE OR REPLACE FUNCTION public.rank_investment_attractiveness(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  r record;
  opp_level text;
  action_signal text;
  key_strength text;
  composite numeric;
  prime_count int := 0;
  high_count int := 0;
  stable_count int := 0;
  spec_count int := 0;
BEGIN
  FOR r IN
    SELECT
      p.id            AS property_id,
      left(p.title, 55) AS title,
      p.city,
      p.price,
      COALESCE(pis.growth_prediction, 0)       AS growth_score,
      COALESCE(pda.deal_score, 0)              AS deal_score,
      COALESCE(pis.rental_yield_estimate, 0)   AS rental_yield,
      COALESCE(pis.liquidity_score, 0)         AS liquidity_score,
      COALESCE(pis.location_demand_score, 0)   AS demand_score,
      COALESCE(pda.demand_signal_score, 0)     AS demand_signal,
      COALESCE(p.investment_score, 0)          AS inv_score
    FROM properties p
    LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
    LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
    WHERE p.status = 'available'
      AND p.price IS NOT NULL
      AND p.price > 0
    ORDER BY (
      COALESCE(pis.growth_prediction, 0) * 0.30 +
      COALESCE(pda.deal_score, 0) * 0.25 +
      COALESCE(pis.rental_yield_estimate, 0) * 2.5 +
      COALESCE(pis.liquidity_score, 0) * 0.20
    ) DESC
    LIMIT p_limit
  LOOP
    -- Composite = growth*0.30 + deal*0.25 + yield_norm*0.25 + liquidity*0.20
    composite := ROUND(
      r.growth_score * 0.30 +
      r.deal_score * 0.25 +
      LEAST(100, r.rental_yield * 12.5) * 0.25 +
      r.liquidity_score * 0.20
    );

    -- Key strength detection
    IF r.growth_score >= r.deal_score AND r.growth_score >= LEAST(100, r.rental_yield * 12.5) AND r.growth_score >= r.liquidity_score THEN
      key_strength := format('Strong growth potential (score: %s) — location positioned for significant capital appreciation', r.growth_score);
    ELSIF r.deal_score >= LEAST(100, r.rental_yield * 12.5) AND r.deal_score >= r.liquidity_score THEN
      key_strength := format('High deal probability (score: %s) — market conditions favor fast closing and competitive pricing', r.deal_score);
    ELSIF LEAST(100, r.rental_yield * 12.5) >= r.liquidity_score THEN
      key_strength := format('Attractive rental yield (%s%%) — strong cashflow potential for income-focused investors', ROUND(r.rental_yield::numeric, 1));
    ELSE
      key_strength := format('High liquidity (score: %s) — asset can be repositioned or exited with minimal friction', r.liquidity_score);
    END IF;

    -- Opportunity level
    IF composite >= 75 THEN
      opp_level := 'PRIME_INVESTMENT';
      prime_count := prime_count + 1;
    ELSIF composite >= 55 THEN
      opp_level := 'HIGH_POTENTIAL';
      high_count := high_count + 1;
    ELSIF composite >= 35 THEN
      opp_level := 'STABLE_OPTION';
      stable_count := stable_count + 1;
    ELSE
      opp_level := 'SPECULATIVE_RISK';
      spec_count := spec_count + 1;
    END IF;

    -- Investor action signal
    IF composite >= 70 AND r.deal_score >= 60 THEN
      action_signal := 'ACQUIRE_NOW';
    ELSIF composite >= 45 THEN
      action_signal := 'MONITOR_ENTRY';
    ELSE
      action_signal := 'LONG_TERM_HOLD';
    END IF;

    result := result || jsonb_build_object(
      'listing_id', r.property_id,
      'title', r.title,
      'city', r.city,
      'price', r.price,
      'investment_rank_score', composite,
      'opportunity_level', opp_level,
      'key_strength', key_strength,
      'investor_action_signal', action_signal,
      'metrics', jsonb_build_object(
        'growth_score', r.growth_score,
        'deal_score', r.deal_score,
        'rental_yield', ROUND(r.rental_yield::numeric, 1),
        'liquidity_score', r.liquidity_score,
        'demand_score', r.demand_score
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'rankings', result,
    'total', jsonb_array_length(result),
    'prime_count', prime_count,
    'high_count', high_count,
    'stable_count', stable_count,
    'speculative_count', spec_count,
    'ranked_at', now()
  );
END;
$$;
