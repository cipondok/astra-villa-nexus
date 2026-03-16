
CREATE OR REPLACE FUNCTION public.generate_deal_timing_signals(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  r record;
  signal text;
  confidence text;
  reasoning text;
  inv_rank numeric;
  cycle text;
  strong_buy_count int := 0;
  accumulate_count int := 0;
  hold_count int := 0;
  exit_count int := 0;
BEGIN
  -- Get current macro cycle phase
  SELECT COALESCE(
    (SELECT
      CASE
        WHEN ROUND(AVG(ih.demand_score)*0.30 + AVG(ih.growth_score)*0.30 + AVG(ih.liquidity_score)*0.20) >= 55
          AND AVG(ih.growth_score) >= 50 THEN 'EXPANSION'
        WHEN AVG(ih.growth_score) >= 60 AND AVG(ih.liquidity_score) < 45 THEN 'PEAK_RISK'
        WHEN AVG(ih.demand_score) < 40 AND AVG(ih.liquidity_score) < 40 THEN 'CORRECTION'
        ELSE 'RECOVERY'
      END
    FROM investment_hotspots ih
    WHERE ih.updated_at >= now() - interval '45 days'),
    'RECOVERY'
  ) INTO cycle;

  FOR r IN
    SELECT
      p.id AS property_id,
      left(p.title, 50) AS title,
      p.city,
      p.price,
      COALESCE(p.investment_score, 0) AS inv_score,
      COALESCE(pis.growth_prediction, 0) AS growth,
      COALESCE(pis.liquidity_score, 0) AS liquidity,
      COALESCE(pis.location_demand_score, 0) AS demand,
      COALESCE(pda.deal_score, 0) AS deal_score,
      COALESCE(pis.rental_yield_estimate, 0) AS rental_yield
    FROM properties p
    LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
    LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
    WHERE p.status = 'available'
      AND p.price > 0
    ORDER BY COALESCE(p.investment_score, 0) DESC
    LIMIT p_limit
  LOOP
    -- Composite investment rank (same formula as rank_investment_attractiveness)
    inv_rank := ROUND(
      r.growth * 0.30 +
      r.deal_score * 0.25 +
      LEAST(100, r.rental_yield * 12.5) * 0.25 +
      r.liquidity * 0.20
    );

    -- === Signal Classification ===

    -- STRONG BUY: high rank + recovery/expansion
    IF inv_rank >= 65 AND cycle IN ('RECOVERY', 'EXPANSION') THEN
      signal := 'STRONG_BUY';
      strong_buy_count := strong_buy_count + 1;

      IF inv_rank >= 80 AND r.growth >= 60 THEN
        confidence := 'HIGH_CONVICTION';
        reasoning := format(
          'Prime asset (rank %s) in %s phase. Growth score %s with strong liquidity %s — optimal entry window before price acceleration. Act decisively.',
          inv_rank, cycle, r.growth, r.liquidity
        );
      ELSIF inv_rank >= 70 THEN
        confidence := 'MODERATE_CONVICTION';
        reasoning := format(
          'High-potential asset (rank %s) aligned with %s cycle. Solid fundamentals support acquisition. Negotiate and secure within 2-4 weeks.',
          inv_rank, cycle
        );
      ELSE
        confidence := 'EARLY_SIGNAL';
        reasoning := format(
          'Investment rank %s in favorable %s cycle. Entry opportunity emerging — validate with local market comparables before committing.',
          inv_rank, cycle
        );
      END IF;

    -- ACCUMULATE: high growth but demand not yet peaked
    ELSIF r.growth >= 55 AND r.demand < 60 AND inv_rank >= 45 THEN
      signal := 'ACCUMULATE';
      accumulate_count := accumulate_count + 1;

      IF r.growth >= 70 AND r.demand < 45 THEN
        confidence := 'HIGH_CONVICTION';
        reasoning := format(
          'Asymmetric opportunity — growth potential %s but demand only %s. Market hasn''t priced in upside yet. Strategic accumulation before mainstream discovery.',
          r.growth, r.demand
        );
      ELSIF r.growth >= 60 THEN
        confidence := 'MODERATE_CONVICTION';
        reasoning := format(
          'Growth trajectory %s outpacing current demand %s. Build position gradually — this area is approaching an inflection point.',
          r.growth, r.demand
        );
      ELSE
        confidence := 'EARLY_SIGNAL';
        reasoning := format(
          'Early growth signals (%s) with room before demand peaks (%s). Begin research and due diligence for potential entry.',
          r.growth, r.demand
        );
      END IF;

    -- EXIT WARNING: peak risk + liquidity weakening
    ELSIF cycle = 'PEAK_RISK' AND r.liquidity < 45 THEN
      signal := 'EXIT_WARNING';
      exit_count := exit_count + 1;

      IF r.liquidity < 30 AND r.deal_score < 35 THEN
        confidence := 'HIGH_CONVICTION';
        reasoning := format(
          'Exit urgently — liquidity collapsed to %s with deal probability at %s in PEAK_RISK cycle. Market turning. Secure buyers immediately or accept discount.',
          r.liquidity, r.deal_score
        );
      ELSIF r.liquidity < 40 THEN
        confidence := 'MODERATE_CONVICTION';
        reasoning := format(
          'Exit window narrowing — liquidity %s declining in peak market. Begin listing optimization and buyer outreach. 30-60 day action window.',
          r.liquidity
        );
      ELSE
        confidence := 'EARLY_SIGNAL';
        reasoning := format(
          'Early exit signal — market at peak risk with liquidity at %s. Evaluate portfolio for assets to de-risk. No panic but prepare exit strategies.',
          r.liquidity
        );
      END IF;

    -- HOLD: stable performance, balanced signals
    ELSE
      signal := 'HOLD';
      hold_count := hold_count + 1;

      IF r.liquidity >= 55 AND inv_rank >= 50 AND r.rental_yield >= 4 THEN
        confidence := 'HIGH_CONVICTION';
        reasoning := format(
          'Solid hold — rank %s with healthy liquidity %s and yield %s%%. Asset performing well. Continue collecting rental income and monitor for upgrade opportunities.',
          inv_rank, r.liquidity, ROUND(r.rental_yield::numeric, 1)
        );
      ELSIF inv_rank >= 35 THEN
        confidence := 'MODERATE_CONVICTION';
        reasoning := format(
          'Stable hold position — investment rank %s with balanced signals. No compelling reason to exit or add. Reassess next cycle.',
          inv_rank
        );
      ELSE
        confidence := 'EARLY_SIGNAL';
        reasoning := format(
          'Hold by default — insufficient conviction for action. Investment rank %s in %s cycle. Watch for clearer directional signals.',
          inv_rank, cycle
        );
      END IF;
    END IF;

    result := result || jsonb_build_object(
      'listing_id', r.property_id,
      'title', r.title,
      'city', r.city,
      'price', r.price,
      'deal_signal', signal,
      'confidence_level', confidence,
      'strategic_reasoning', reasoning,
      'metrics', jsonb_build_object(
        'investment_rank', inv_rank,
        'growth_score', r.growth,
        'liquidity_score', r.liquidity,
        'demand_score', r.demand,
        'deal_score', r.deal_score,
        'rental_yield', ROUND(r.rental_yield::numeric, 1),
        'market_cycle', cycle
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'signals', result,
    'total', jsonb_array_length(result),
    'strong_buy_count', strong_buy_count,
    'accumulate_count', accumulate_count,
    'hold_count', hold_count,
    'exit_count', exit_count,
    'market_cycle', cycle,
    'generated_at', now()
  );
END;
$$;
