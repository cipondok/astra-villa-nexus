
CREATE OR REPLACE FUNCTION public.detect_pricing_intelligence(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  r record;
  signal text;
  adj_lo numeric;
  adj_hi numeric;
  confidence text;
  impact text;
  reduce_count int := 0;
  increase_count int := 0;
  hold_count int := 0;
BEGIN
  FOR r IN
    SELECT
      p.id            AS property_id,
      left(p.title, 55) AS title,
      p.city,
      p.price,
      COALESCE(pda.deal_score, 0)             AS deal_score,
      COALESCE(pda.demand_signal_score, 0)    AS demand_signal,
      COALESCE(pda.liquidity_probability, 0)  AS liquidity_prob,
      COALESCE(pda.undervaluation_percent, 0) AS underval_pct,
      COALESCE(pis.liquidity_score, 0)        AS liquidity_score,
      COALESCE(pis.location_demand_score, 0)  AS demand_score,
      COALESCE(pis.growth_prediction, 0)      AS growth_pred,
      COALESCE(ih.growth_score, 0)            AS market_growth
    FROM properties p
    LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
    LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
    LEFT JOIN investment_hotspots ih ON ih.city = p.city
    WHERE p.status = 'available'
      AND p.price IS NOT NULL
      AND p.price > 0
    ORDER BY COALESCE(pda.deal_score, 0) ASC
    LIMIT 300
  LOOP
    signal := NULL;

    -- 1. OVERPRICED: low deal score + weak demand
    IF r.deal_score < 35 AND r.demand_signal < 40 THEN
      signal := 'REDUCE_PRICE';
      -- Severity-based adjustment range
      IF r.deal_score < 15 THEN
        adj_lo := 10; adj_hi := 18; confidence := 'HIGH';
      ELSIF r.deal_score < 25 THEN
        adj_lo := 7; adj_hi := 12; confidence := 'HIGH';
      ELSE
        adj_lo := 3; adj_hi := 8; confidence := 'MEDIUM';
      END IF;
      impact := format('Projected +%s-%s%% deal probability uplift; faster time-to-close', 
                        round(adj_lo * 1.8), round(adj_hi * 1.5));

    -- 2. UNDERPRICED: high deal score + strong demand + significant undervaluation
    ELSIF r.deal_score > 65 AND r.demand_signal > 60 AND r.underval_pct > 10 THEN
      signal := 'INCREASE_PRICE';
      IF r.underval_pct > 25 THEN
        adj_lo := 8; adj_hi := 15; confidence := 'HIGH';
      ELSIF r.underval_pct > 15 THEN
        adj_lo := 5; adj_hi := 10; confidence := 'MEDIUM';
      ELSE
        adj_lo := 2; adj_hi := 6; confidence := 'MEDIUM';
      END IF;
      impact := format('Capture %s-%s%% additional seller revenue while maintaining strong demand',
                        round(adj_lo * 0.9), round(adj_hi * 0.85));

    -- 3. STABILITY ZONE: balanced demand + decent liquidity + moderate deal score
    ELSIF r.deal_score BETWEEN 35 AND 65
      AND r.demand_score BETWEEN 30 AND 70
      AND r.liquidity_score BETWEEN 30 AND 70 THEN
      signal := 'HOLD_PRICE';
      adj_lo := 0; adj_hi := 0;
      confidence := CASE
        WHEN r.deal_score BETWEEN 45 AND 55 AND r.demand_score BETWEEN 40 AND 60 THEN 'HIGH'
        ELSE 'MEDIUM'
      END;
      impact := 'Market equilibrium detected; current pricing aligned with demand-liquidity balance';

    END IF;

    IF signal IS NOT NULL THEN
      IF signal = 'REDUCE_PRICE' THEN reduce_count := reduce_count + 1;
      ELSIF signal = 'INCREASE_PRICE' THEN increase_count := increase_count + 1;
      ELSE hold_count := hold_count + 1;
      END IF;

      result := result || jsonb_build_object(
        'listing_id', r.property_id,
        'title', r.title,
        'city', r.city,
        'price', r.price,
        'pricing_signal', signal,
        'adjustment_range', CASE
          WHEN adj_lo = 0 THEN '0%'
          ELSE format('%s-%s%%', adj_lo, adj_hi)
        END,
        'confidence_level', confidence,
        'expected_market_impact', impact,
        'metrics', jsonb_build_object(
          'deal_score', r.deal_score,
          'demand_signal', r.demand_signal,
          'liquidity_score', r.liquidity_score,
          'underval_pct', round(r.underval_pct, 1),
          'market_growth', r.market_growth
        )
      );

      EXIT WHEN jsonb_array_length(result) >= p_limit;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'signals', result,
    'total_signals', jsonb_array_length(result),
    'reduce_count', reduce_count,
    'increase_count', increase_count,
    'hold_count', hold_count,
    'scanned_at', now()
  );
END;
$$;
