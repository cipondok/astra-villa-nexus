
CREATE OR REPLACE FUNCTION public.predict_deal_closing_timeline(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  r record;
  closing_window text;
  negotiation_intensity text;
  urgency_signal text;
  strategy_note text;
  closing_days_est int;
  composite numeric;
BEGIN
  FOR r IN
    SELECT
      p.id AS property_id,
      left(p.title, 55) AS title,
      p.city,
      p.price,
      COALESCE(p.predicted_days_to_sell, 60)   AS dom_prediction,
      COALESCE(pda.deal_score, 0)              AS deal_score,
      COALESCE(pda.deal_confidence, 0)         AS deal_confidence,
      COALESCE(pda.demand_signal_score, 0)     AS demand_signal,
      COALESCE(pda.liquidity_probability, 0)   AS liquidity_prob,
      COALESCE(pes.views_total, 0)             AS views,
      COALESCE(pes.saves_total, 0)             AS saves,
      COALESCE(pes.inquiries_total, 0)         AS inquiries,
      COALESCE(pis.location_demand_score, 0)   AS location_demand,
      EXTRACT(days FROM (now() - p.listed_at))::int AS days_active
    FROM properties p
    LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
    LEFT JOIN property_engagement_scores pes ON pes.property_id = p.id
    LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
    WHERE p.status = 'available'
      AND p.price IS NOT NULL
      AND p.price > 0
    ORDER BY COALESCE(pda.deal_score, 0) DESC
    LIMIT p_limit
  LOOP
    -- Composite speed score: deal_score*0.30 + demand*0.25 + liquidity*0.20 + engagement_norm*0.25
    composite := r.deal_score * 0.30
      + r.demand_signal * 0.25
      + r.liquidity_prob * 0.20
      + LEAST(100, (r.inquiries * 15 + r.saves * 5 + LEAST(r.views, 200) * 0.2)) * 0.25;

    -- Closing window
    IF composite >= 65 THEN
      closing_window := 'FAST_CLOSE';
      closing_days_est := LEAST(r.dom_prediction, 30);
    ELSIF composite >= 40 THEN
      closing_window := 'MODERATE_CLOSE';
      closing_days_est := GREATEST(30, LEAST(r.dom_prediction, 90));
    ELSE
      closing_window := 'SLOW_CLOSE';
      closing_days_est := GREATEST(90, r.dom_prediction);
    END IF;

    -- Negotiation intensity
    IF r.demand_signal >= 65 AND r.inquiries >= 3 THEN
      negotiation_intensity := 'COMPETITIVE_BUYER_MARKET';
    ELSIF r.demand_signal >= 35 AND r.deal_score >= 35 THEN
      negotiation_intensity := 'BALANCED_NEGOTIATION';
    ELSE
      negotiation_intensity := 'PRICE_RESISTANCE_RISK';
    END IF;

    -- Urgency signal
    IF closing_window = 'FAST_CLOSE' AND r.inquiries >= 2 THEN
      urgency_signal := 'IMMEDIATE_FOLLOWUP';
    ELSIF closing_window = 'MODERATE_CLOSE' OR r.days_active BETWEEN 14 AND 60 THEN
      urgency_signal := 'STRATEGIC_NURTURING';
    ELSE
      urgency_signal := 'LONG_TERM_LISTING';
    END IF;

    -- Strategy note
    IF closing_window = 'FAST_CLOSE' AND negotiation_intensity = 'COMPETITIVE_BUYER_MARKET' THEN
      strategy_note := format('High buyer competition detected with %s inquiries. Prioritize serious buyers with pre-qualification. Consider deadline-driven offer rounds to maximize seller leverage.', r.inquiries);
    ELSIF closing_window = 'FAST_CLOSE' THEN
      strategy_note := format('Strong closing signals with deal score %s and %s views. Accelerate follow-up within 24h to convert active interest. Prepare comparative market data for buyer confidence.', r.deal_score, r.views);
    ELSIF negotiation_intensity = 'PRICE_RESISTANCE_RISK' THEN
      strategy_note := format('Weak demand signals (score: %s) with %s days on market. Evaluate price positioning — consider strategic price adjustment or enhanced marketing to improve deal velocity.', r.demand_signal, r.days_active);
    ELSIF closing_window = 'MODERATE_CLOSE' THEN
      strategy_note := format('Moderate deal momentum with %s saves and %s views. Nurture leads with scheduled follow-ups every 5-7 days. Highlight unique value propositions to differentiate from competition.', r.saves, r.views);
    ELSE
      strategy_note := format('Extended timeline expected (%s+ days). Deploy long-term marketing: SEO optimization, virtual tours, and targeted ads. Re-evaluate pricing quarterly against market movement.', closing_days_est);
    END IF;

    result := result || jsonb_build_object(
      'listing_id', r.property_id,
      'title', r.title,
      'city', r.city,
      'price', r.price,
      'closing_window_prediction', closing_window,
      'estimated_days', closing_days_est,
      'negotiation_intensity', negotiation_intensity,
      'urgency_signal', urgency_signal,
      'strategy_note', strategy_note,
      'composite_score', round(composite),
      'metrics', jsonb_build_object(
        'deal_score', r.deal_score,
        'demand_signal', r.demand_signal,
        'liquidity_prob', r.liquidity_prob,
        'inquiries', r.inquiries,
        'views', r.views,
        'saves', r.saves,
        'days_active', r.days_active
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'predictions', result,
    'total', jsonb_array_length(result),
    'fast_close_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'closing_window_prediction' = 'FAST_CLOSE'),
    'moderate_close_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'closing_window_prediction' = 'MODERATE_CLOSE'),
    'slow_close_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'closing_window_prediction' = 'SLOW_CLOSE'),
    'scanned_at', now()
  );
END;
$$;
