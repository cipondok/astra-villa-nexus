
CREATE OR REPLACE FUNCTION public.predict_market_cycle_phase(p_lookback_days integer DEFAULT 90)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Current aggregated signals
  curr_demand numeric;
  curr_liquidity numeric;
  curr_growth numeric;
  curr_deal_prob numeric;
  -- Previous cycle signals (from lookback window midpoint)
  prev_demand numeric;
  prev_liquidity numeric;
  prev_growth numeric;
  prev_deal_prob numeric;
  -- Derived
  demand_momentum numeric;
  liquidity_trend numeric;
  growth_trend numeric;
  deal_trend numeric;
  phase text;
  confidence text;
  summary text;
  investment_signal text;
  composite numeric;
  -- Regional breakdown
  regional jsonb := '[]'::jsonb;
  reg record;
BEGIN
  -- Current cycle: aggregate from investment_hotspots + property_deal_analysis
  SELECT
    COALESCE(AVG(ih.demand_score), 0),
    COALESCE(AVG(ih.liquidity_score), 0),
    COALESCE(AVG(ih.growth_score), 0)
  INTO curr_demand, curr_liquidity, curr_growth
  FROM investment_hotspots ih
  WHERE ih.updated_at >= (now() - (p_lookback_days / 2 || ' days')::interval);

  SELECT COALESCE(AVG(pda.deal_score), 0)
  INTO curr_deal_prob
  FROM property_deal_analysis pda
  WHERE pda.updated_at >= (now() - (p_lookback_days / 2 || ' days')::interval);

  -- Previous cycle: older half of lookback window
  SELECT
    COALESCE(AVG(ih.demand_score), 0),
    COALESCE(AVG(ih.liquidity_score), 0),
    COALESCE(AVG(ih.growth_score), 0)
  INTO prev_demand, prev_liquidity, prev_growth
  FROM investment_hotspots ih
  WHERE ih.updated_at < (now() - (p_lookback_days / 2 || ' days')::interval)
    AND ih.updated_at >= (now() - (p_lookback_days || ' days')::interval);

  SELECT COALESCE(AVG(pda.deal_score), 0)
  INTO prev_deal_prob
  FROM property_deal_analysis pda
  WHERE pda.updated_at < (now() - (p_lookback_days / 2 || ' days')::interval)
    AND pda.updated_at >= (now() - (p_lookback_days || ' days')::interval);

  -- Trends (positive = improving)
  demand_momentum := curr_demand - prev_demand;
  liquidity_trend := curr_liquidity - prev_liquidity;
  growth_trend := curr_growth - prev_growth;
  deal_trend := curr_deal_prob - prev_deal_prob;

  -- Composite macro score
  composite := ROUND(curr_demand * 0.30 + curr_growth * 0.30 + curr_liquidity * 0.20 + curr_deal_prob * 0.20);

  -- === Phase Detection ===

  -- EXPANSION: growth rising + strong demand momentum
  IF growth_trend > 5 AND demand_momentum > 5 AND curr_growth >= 50 THEN
    phase := 'EXPANSION';

    IF growth_trend > 15 AND demand_momentum > 15 AND curr_demand >= 60 THEN
      confidence := 'HIGH';
      summary := format(
        'Strong expansion phase — growth accelerating (+%s pts) with robust demand momentum (+%s pts). Market fundamentals support sustained price appreciation across key regions.',
        ROUND(growth_trend), ROUND(demand_momentum)
      );
      investment_signal := 'AGGRESSIVE_ACCUMULATION';
    ELSIF growth_trend > 8 THEN
      confidence := 'MODERATE';
      summary := format(
        'Expansion underway — growth score %s (up %s pts) with healthy demand. Selective acquisition in high-growth corridors recommended.',
        ROUND(curr_growth), ROUND(growth_trend)
      );
      investment_signal := 'SELECTIVE_BUY';
    ELSE
      confidence := 'EARLY_SIGNAL';
      summary := format(
        'Early expansion signals detected — growth beginning to pick up (+%s pts). Monitor for confirmation before increasing exposure.',
        ROUND(growth_trend)
      );
      investment_signal := 'MONITOR_AND_PREPARE';
    END IF;

  -- PEAK RISK: high growth/demand BUT liquidity declining
  ELSIF curr_growth >= 60 AND curr_demand >= 55 AND liquidity_trend < -5 THEN
    phase := 'PEAK_RISK';

    IF liquidity_trend < -15 AND curr_liquidity < 45 THEN
      confidence := 'HIGH';
      summary := format(
        'Peak risk phase — growth (%s) and demand (%s) elevated but liquidity eroding rapidly (%s pts decline). Market overheating signals present. Prepare exit strategies.',
        ROUND(curr_growth), ROUND(curr_demand), ABS(ROUND(liquidity_trend))
      );
      investment_signal := 'TAKE_PROFIT';
    ELSIF liquidity_trend < -8 THEN
      confidence := 'MODERATE';
      summary := format(
        'Peak zone approaching — strong fundamentals but liquidity declining (%s pts). Reduce speculative positions and lock in gains on mature holdings.',
        ABS(ROUND(liquidity_trend))
      );
      investment_signal := 'REDUCE_EXPOSURE';
    ELSE
      confidence := 'EARLY_SIGNAL';
      summary := format(
        'Early peak warning — liquidity showing initial weakness (-%s pts) while growth remains strong. Begin defensive positioning.',
        ABS(ROUND(liquidity_trend))
      );
      investment_signal := 'HEDGE_POSITIONS';
    END IF;

  -- CORRECTION: demand dropping + deal probability weakening
  ELSIF demand_momentum < -5 AND deal_trend < -5 AND curr_demand < 50 THEN
    phase := 'CORRECTION';

    IF demand_momentum < -15 AND deal_trend < -15 AND curr_deal_prob < 35 THEN
      confidence := 'HIGH';
      summary := format(
        'Correction phase confirmed — demand collapsed (%s pts) with deal probability at %s. Market entering buyer''s territory. Preserve capital and wait for stabilization.',
        ROUND(demand_momentum), ROUND(curr_deal_prob)
      );
      investment_signal := 'CAPITAL_PRESERVATION';
    ELSIF demand_momentum < -8 THEN
      confidence := 'MODERATE';
      summary := format(
        'Correction underway — demand declining (-%s pts) and deal conversion weakening. Selective value hunting in resilient segments only.',
        ABS(ROUND(demand_momentum))
      );
      investment_signal := 'SELECTIVE_VALUE_BUY';
    ELSE
      confidence := 'EARLY_SIGNAL';
      summary := format(
        'Early correction signals — demand softening (-%s pts) with deal trend weakening. Shift to defensive allocation.',
        ABS(ROUND(demand_momentum))
      );
      investment_signal := 'DEFENSIVE_ALLOCATION';
    END IF;

  -- RECOVERY: liquidity stabilizing after decline
  ELSIF liquidity_trend >= 0 AND prev_liquidity < curr_liquidity AND curr_demand < 50 AND curr_growth < 50 THEN
    phase := 'RECOVERY';

    IF liquidity_trend > 10 AND demand_momentum > 0 THEN
      confidence := 'HIGH';
      summary := format(
        'Recovery phase confirmed — liquidity rebounding (+%s pts) with early demand stabilization. Optimal window for strategic value acquisition before next expansion cycle.',
        ROUND(liquidity_trend)
      );
      investment_signal := 'STRATEGIC_ACCUMULATION';
    ELSIF liquidity_trend > 3 THEN
      confidence := 'MODERATE';
      summary := format(
        'Recovery emerging — liquidity stabilizing (+%s pts) after correction. Begin building positions in fundamentally strong locations.',
        ROUND(liquidity_trend)
      );
      investment_signal := 'GRADUAL_ENTRY';
    ELSE
      confidence := 'EARLY_SIGNAL';
      summary := 'Early recovery signals — liquidity no longer declining. Market may be finding a floor. Monitor for sustained improvement before committing capital.';
      investment_signal := 'WATCH_AND_WAIT';
    END IF;

  -- Fallback: classify by composite
  ELSE
    IF composite >= 65 THEN
      phase := 'EXPANSION';
      confidence := 'MODERATE';
      summary := format('Market in steady expansion territory (composite: %s). Balanced growth with no extreme signals detected.', composite);
      investment_signal := 'SELECTIVE_BUY';
    ELSIF composite >= 45 THEN
      phase := 'RECOVERY';
      confidence := 'EARLY_SIGNAL';
      summary := format('Market in transitional zone (composite: %s). Mixed signals — maintain balanced portfolio and monitor trend direction.', composite);
      investment_signal := 'BALANCED_HOLD';
    ELSE
      phase := 'CORRECTION';
      confidence := 'EARLY_SIGNAL';
      summary := format('Market showing weakness (composite: %s). Defensive posture recommended until clearer signals emerge.', composite);
      investment_signal := 'DEFENSIVE_ALLOCATION';
    END IF;
  END IF;

  -- Regional breakdown: top 8 regions by growth
  FOR reg IN
    SELECT
      ih.city,
      ih.demand_score,
      ih.growth_score,
      ih.liquidity_score,
      ih.hotspot_score
    FROM investment_hotspots ih
    WHERE ih.updated_at >= (now() - (p_lookback_days / 2 || ' days')::interval)
    ORDER BY ih.growth_score DESC
    LIMIT 8
  LOOP
    regional := regional || jsonb_build_object(
      'city', reg.city,
      'demand', reg.demand_score,
      'growth', reg.growth_score,
      'liquidity', reg.liquidity_score,
      'hotspot', reg.hotspot_score
    );
  END LOOP;

  RETURN jsonb_build_object(
    'market_cycle_phase', phase,
    'confidence_level', confidence,
    'macro_trend_summary', summary,
    'strategic_investment_signal', investment_signal,
    'composite_score', composite,
    'current_signals', jsonb_build_object(
      'demand', ROUND(curr_demand),
      'liquidity', ROUND(curr_liquidity),
      'growth', ROUND(curr_growth),
      'deal_probability', ROUND(curr_deal_prob)
    ),
    'trends', jsonb_build_object(
      'demand_momentum', ROUND(demand_momentum),
      'liquidity_trend', ROUND(liquidity_trend),
      'growth_trend', ROUND(growth_trend),
      'deal_trend', ROUND(deal_trend)
    ),
    'regional_breakdown', regional,
    'lookback_days', p_lookback_days,
    'analyzed_at', now()
  );
END;
$$;
