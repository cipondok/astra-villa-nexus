
CREATE OR REPLACE FUNCTION public.detect_pricing_adjustments(p_limit integer DEFAULT 20)
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
  composite numeric;
  deal_trend numeric;
  demand_momentum numeric;
  stability_index numeric;
  reduce_count int := 0;
  increase_count int := 0;
  maintain_count int := 0;
BEGIN
  FOR r IN
    SELECT
      p.id AS property_id,
      left(p.title, 50) AS title,
      p.city,
      p.price,
      COALESCE(p.days_on_market, 0) AS dom,
      COALESCE(pda.deal_score, 0) AS deal_score,
      COALESCE(pda.demand_signal_score, 0) AS demand_signal,
      COALESCE(pis.liquidity_score, 0) AS liquidity,
      COALESCE(pis.growth_prediction, 0) AS growth,
      COALESCE(pis.location_demand_score, 0) AS loc_demand,
      COALESCE(p.investment_score, 0) AS inv_score,
      -- Previous cycle signals from deal analysis history
      COALESCE(pda.previous_deal_score, 0) AS prev_deal_score,
      COALESCE(pda.previous_demand_score, 0) AS prev_demand_score
    FROM properties p
    LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
    LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
    WHERE p.status = 'available'
      AND p.price IS NOT NULL
      AND p.price > 0
    ORDER BY p.days_on_market DESC NULLS LAST
    LIMIT p_limit
  LOOP
    -- Deal trend: negative = declining, positive = improving
    deal_trend := r.deal_score - r.prev_deal_score;

    -- Demand momentum: positive = rising demand
    demand_momentum := r.demand_signal - r.prev_demand_score;

    -- Stability index: how balanced liquidity + deal signals are (0-100)
    stability_index := CASE
      WHEN r.liquidity > 0 AND r.deal_score > 0
        THEN 100 - ABS(r.liquidity - r.deal_score)
      ELSE 50
    END;

    -- === Signal Classification ===

    -- REDUCE: deal declining + high DOM + weak demand
    IF (deal_trend < -10 OR (r.deal_score < 35 AND r.dom > 60))
       AND demand_momentum <= 5 THEN
      signal := 'REDUCE_PRICE';
      reduce_count := reduce_count + 1;

      -- Confidence for reduction
      IF deal_trend < -20 AND r.dom > 90 THEN
        confidence := 'HIGH';
        reasoning := format(
          'Deal probability dropped %s pts with %s days on market. Demand stagnant. Price reduction of 5-10%% recommended to stimulate buyer interest.',
          ABS(deal_trend)::int, r.dom
        );
      ELSIF deal_trend < -10 THEN
        confidence := 'MODERATE';
        reasoning := format(
          'Deal score declining (%s→%s) over recent cycles. Consider strategic 3-5%% reduction to improve positioning.',
          r.prev_deal_score::int, r.deal_score::int
        );
      ELSE
        confidence := 'LOW';
        reasoning := format(
          'Weak deal probability (%s) with extended market time (%s days). Monitor for further decline before adjusting.',
          r.deal_score::int, r.dom
        );
      END IF;

    -- INCREASE: strong demand momentum + high liquidity + growth
    ELSIF demand_momentum > 10 AND r.demand_signal >= 60 AND r.liquidity >= 55 THEN
      signal := 'INCREASE_PRICE';
      increase_count := increase_count + 1;

      IF demand_momentum > 20 AND r.growth >= 60 THEN
        confidence := 'HIGH';
        reasoning := format(
          'Demand surged +%s pts with growth score %s and liquidity %s. Market supports 5-8%% price increase.',
          demand_momentum::int, r.growth::int, r.liquidity::int
        );
      ELSIF demand_momentum > 10 THEN
        confidence := 'MODERATE';
        reasoning := format(
          'Rising demand (+%s pts) and healthy liquidity (%s). Test 3-5%% price increase while monitoring absorption rate.',
          demand_momentum::int, r.liquidity::int
        );
      ELSE
        confidence := 'LOW';
        reasoning := format(
          'Positive demand trend detected. Evaluate market comparables before adjusting upward.',
          demand_momentum::int
        );
      END IF;

    -- MAINTAIN: balanced signals
    ELSE
      signal := 'MAINTAIN_PRICE';
      maintain_count := maintain_count + 1;

      IF stability_index >= 70 AND ABS(deal_trend) <= 5 THEN
        confidence := 'HIGH';
        reasoning := format(
          'Price well-positioned — stability index %s with balanced deal (%s) and liquidity (%s) signals. No adjustment needed.',
          stability_index::int, r.deal_score::int, r.liquidity::int
        );
      ELSIF stability_index >= 40 THEN
        confidence := 'MODERATE';
        reasoning := format(
          'Market signals moderately balanced. Deal score %s, demand %s. Hold current price and reassess next cycle.',
          r.deal_score::int, r.demand_signal::int
        );
      ELSE
        confidence := 'LOW';
        reasoning := 'Mixed signals — neither strong reduction nor increase triggers detected. Maintain and monitor closely.';
      END IF;
    END IF;

    result := result || jsonb_build_object(
      'listing_id', r.property_id,
      'title', r.title,
      'city', r.city,
      'price', r.price,
      'days_on_market', r.dom,
      'pricing_adjustment_signal', signal,
      'confidence_level', confidence,
      'market_reasoning', reasoning,
      'metrics', jsonb_build_object(
        'deal_score', r.deal_score,
        'prev_deal_score', r.prev_deal_score,
        'deal_trend', deal_trend,
        'demand_signal', r.demand_signal,
        'demand_momentum', demand_momentum,
        'liquidity', r.liquidity,
        'growth', r.growth,
        'stability_index', stability_index
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'adjustments', result,
    'total', jsonb_array_length(result),
    'reduce_count', reduce_count,
    'increase_count', increase_count,
    'maintain_count', maintain_count,
    'analyzed_at', now()
  );
END;
$$;
