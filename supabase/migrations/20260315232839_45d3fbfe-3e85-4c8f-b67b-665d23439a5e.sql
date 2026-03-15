
CREATE OR REPLACE FUNCTION public.detect_listing_optimizations(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  r record;
  opt_type text;
  priority text;
  action text;
  impact text;
  counts jsonb;
  immediate_count int := 0;
  strategic_count int := 0;
  monitor_count int := 0;
BEGIN
  FOR r IN
    SELECT
      p.id AS property_id,
      p.title,
      p.city,
      COALESCE(pda.deal_score, 0)             AS deal_score,
      COALESCE(pda.demand_signal_score, 0)     AS demand_signal,
      COALESCE(pda.liquidity_probability, 0)   AS liquidity_prob,
      COALESCE(psa.seo_score, 0)               AS seo_score,
      COALESCE(pis.liquidity_score, 0)         AS liquidity_score,
      COALESCE(pis.location_demand_score, 0)   AS demand_score,
      COALESCE(pes.inquiries_total, 0)         AS inquiries,
      COALESCE(pes.views_total, 0)             AS views
    FROM properties p
    LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
    LEFT JOIN property_seo_analysis psa ON psa.property_id = p.id
    LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
    LEFT JOIN property_engagement_scores pes ON pes.property_id = p.id
    WHERE p.status = 'available'
    ORDER BY COALESCE(pda.deal_score, 0) ASC
    LIMIT 200
  LOOP
    -- 1. PRICE OPTIMIZATION: low deal score + high demand
    IF r.deal_score < 35 AND r.demand_signal > 60 THEN
      priority := CASE WHEN r.deal_score < 20 THEN 'Immediate Action' ELSE 'Strategic Improvement' END;
      result := result || jsonb_build_object(
        'listing_id', r.property_id,
        'title', left(r.title, 50),
        'city', r.city,
        'optimization_type', 'PRICE_OPTIMIZATION',
        'priority_level', priority,
        'metrics', jsonb_build_object('deal_score', r.deal_score, 'demand_signal', r.demand_signal),
        'recommended_action', format('Adjust pricing — deal score %s but demand at %s. Consider 5-10%% price reduction to align with market demand.', r.deal_score, r.demand_signal),
        'expected_impact', 'Increase deal probability by 15-25% and reduce time-to-sell by 2-3 weeks'
      );
      IF priority = 'Immediate Action' THEN immediate_count := immediate_count + 1; ELSE strategic_count := strategic_count + 1; END IF;
    END IF;

    -- 2. SEO VISIBILITY: seo_score below threshold
    IF r.seo_score < 45 AND r.seo_score > 0 THEN
      priority := CASE WHEN r.seo_score < 25 THEN 'Immediate Action' WHEN r.seo_score < 45 THEN 'Strategic Improvement' ELSE 'Monitor Performance' END;
      result := result || jsonb_build_object(
        'listing_id', r.property_id,
        'title', left(r.title, 50),
        'city', r.city,
        'optimization_type', 'SEO_VISIBILITY',
        'priority_level', priority,
        'metrics', jsonb_build_object('seo_score', r.seo_score),
        'recommended_action', format('SEO score at %s/100 — optimize title keywords, description length, and image alt-text for organic discovery.', r.seo_score),
        'expected_impact', 'Improve organic search visibility by 20-40% and drive additional inquiries'
      );
      IF priority = 'Immediate Action' THEN immediate_count := immediate_count + 1; ELSE strategic_count := strategic_count + 1; END IF;
    END IF;

    -- 3. MARKETING BOOST: good liquidity but low inquiries
    IF r.liquidity_score > 60 AND r.inquiries < 3 AND r.views > 20 THEN
      priority := CASE WHEN r.inquiries = 0 THEN 'Immediate Action' ELSE 'Strategic Improvement' END;
      result := result || jsonb_build_object(
        'listing_id', r.property_id,
        'title', left(r.title, 50),
        'city', r.city,
        'optimization_type', 'MARKETING_BOOST',
        'priority_level', priority,
        'metrics', jsonb_build_object('liquidity_score', r.liquidity_score, 'inquiries', r.inquiries, 'views', r.views),
        'recommended_action', format('Strong liquidity (%s) with %s views but only %s inquiries — boost with featured placement or social promotion.', r.liquidity_score, r.views, r.inquiries),
        'expected_impact', 'Convert existing traffic into 3-5x more inquiries within 2 weeks'
      );
      IF priority = 'Immediate Action' THEN immediate_count := immediate_count + 1; ELSE strategic_count := strategic_count + 1; END IF;
    END IF;

    -- 4. LISTING PAUSE: both demand and liquidity weak
    IF r.demand_score < 25 AND r.liquidity_score < 25 AND (r.demand_score + r.liquidity_score) > 0 THEN
      priority := CASE WHEN r.demand_score < 10 AND r.liquidity_score < 10 THEN 'Immediate Action' ELSE 'Strategic Improvement' END;
      result := result || jsonb_build_object(
        'listing_id', r.property_id,
        'title', left(r.title, 50),
        'city', r.city,
        'optimization_type', 'LISTING_PAUSE',
        'priority_level', priority,
        'metrics', jsonb_build_object('demand_score', r.demand_score, 'liquidity_score', r.liquidity_score),
        'recommended_action', format('Demand (%s) and liquidity (%s) both weak — consider pausing listing to avoid stale inventory perception.', r.demand_score, r.liquidity_score),
        'expected_impact', 'Reduce portfolio drag; re-list when market conditions improve for fresh exposure'
      );
      IF priority = 'Immediate Action' THEN immediate_count := immediate_count + 1; ELSE strategic_count := strategic_count + 1; END IF;
    END IF;

    EXIT WHEN jsonb_array_length(result) >= p_limit;
  END LOOP;

  RETURN jsonb_build_object(
    'recommendations', result,
    'total_recommendations', jsonb_array_length(result),
    'immediate_count', immediate_count,
    'strategic_count', strategic_count,
    'monitor_count', monitor_count,
    'scanned_at', now()
  );
END;
$$;
