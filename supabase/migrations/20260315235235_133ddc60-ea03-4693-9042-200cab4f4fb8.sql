
CREATE OR REPLACE FUNCTION public.match_buyer_listings(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  lead record;
  prop record;
  score numeric;
  budget_fit numeric;
  location_fit numeric;
  type_fit numeric;
  deal_boost numeric;
  mismatch_flags text[];
  confidence text;
  action text;
  match_count int := 0;
BEGIN
  FOR lead IN
    SELECT
      pl.id AS lead_id,
      pl.lead_name,
      pl.lead_email,
      pl.lead_score,
      pl.status,
      pl.notes,
      pl.property_id AS interested_property_id,
      p_int.city AS interested_city,
      p_int.property_type AS interested_type,
      p_int.price AS interested_price
    FROM property_leads pl
    LEFT JOIN properties p_int ON p_int.id = pl.property_id
    WHERE pl.status IN ('new','contacted','qualified')
    ORDER BY pl.lead_score DESC
    LIMIT 30
  LOOP
    FOR prop IN
      SELECT
        p.id AS property_id,
        left(p.title, 50) AS title,
        p.city,
        p.price,
        p.property_type,
        COALESCE(pda.deal_score, 0) AS deal_score,
        COALESCE(pda.demand_signal_score, 0) AS demand_signal,
        COALESCE(pis.liquidity_score, 0) AS liquidity,
        COALESCE(p.investment_score, 0) AS inv_score
      FROM properties p
      LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
      LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
      WHERE p.status = 'available'
        AND p.price > 0
        AND p.id != COALESCE(lead.interested_property_id, '00000000-0000-0000-0000-000000000000')
      ORDER BY COALESCE(pda.deal_score, 0) DESC
      LIMIT 5
    LOOP
      mismatch_flags := ARRAY[]::text[];
      score := 0;

      -- Budget fit (30 pts): compare lead's interested price with listing
      IF lead.interested_price IS NOT NULL AND lead.interested_price > 0 THEN
        budget_fit := 1.0 - LEAST(1.0, ABS(prop.price - lead.interested_price)::numeric / lead.interested_price);
        score := score + ROUND(budget_fit * 30);
        IF budget_fit < 0.5 THEN
          mismatch_flags := array_append(mismatch_flags, 'BUDGET_MISMATCH');
        END IF;
      ELSE
        score := score + 15; -- neutral
      END IF;

      -- Location fit (25 pts)
      IF lead.interested_city IS NOT NULL AND prop.city IS NOT NULL THEN
        IF lower(lead.interested_city) = lower(prop.city) THEN
          location_fit := 25;
        ELSE
          location_fit := 5;
          mismatch_flags := array_append(mismatch_flags, 'LOCATION_CONFLICT');
        END IF;
      ELSE
        location_fit := 12;
      END IF;
      score := score + location_fit;

      -- Property type fit (20 pts)
      IF lead.interested_type IS NOT NULL AND prop.property_type IS NOT NULL THEN
        IF lower(lead.interested_type) = lower(prop.property_type) THEN
          type_fit := 20;
        ELSE
          type_fit := 5;
          mismatch_flags := array_append(mismatch_flags, 'TYPE_MISMATCH');
        END IF;
      ELSE
        type_fit := 10;
      END IF;
      score := score + type_fit;

      -- Deal probability boost (15 pts) — high-intent buyers get high-deal properties
      IF lead.lead_score >= 60 THEN
        deal_boost := LEAST(15, ROUND(prop.deal_score * 0.15));
      ELSE
        deal_boost := LEAST(8, ROUND(prop.deal_score * 0.08));
      END IF;
      score := score + deal_boost;

      -- Demand / liquidity baseline (10 pts)
      score := score + LEAST(10, ROUND((prop.demand_signal + prop.liquidity) * 0.05));

      score := LEAST(100, score);

      -- Confidence classification
      IF score >= 75 AND array_length(mismatch_flags, 1) IS NULL THEN
        confidence := 'STRONG_MATCH';
      ELSIF score >= 50 THEN
        confidence := 'MODERATE_MATCH';
      ELSE
        confidence := 'LOW_MATCH';
      END IF;

      -- Engagement action
      IF confidence = 'STRONG_MATCH' AND lead.lead_score >= 60 THEN
        action := 'IMMEDIATE_VIEWING';
      ELSIF confidence = 'MODERATE_MATCH' THEN
        action := 'FOLLOWUP_NURTURING';
      ELSE
        action := 'ALTERNATIVE_LISTING';
      END IF;

      IF score >= 40 THEN
        result := result || jsonb_build_object(
          'buyer_id', lead.lead_id,
          'buyer_name', lead.lead_name,
          'buyer_intent_score', lead.lead_score,
          'buyer_status', lead.status,
          'listing_id', prop.property_id,
          'listing_title', prop.title,
          'listing_city', prop.city,
          'listing_price', prop.price,
          'match_score', score,
          'match_confidence', confidence,
          'mismatch_risks', to_jsonb(mismatch_flags),
          'engagement_recommendation', action,
          'metrics', jsonb_build_object(
            'budget_fit', ROUND(COALESCE(budget_fit, 0.5) * 100),
            'location_fit', location_fit,
            'type_fit', type_fit,
            'deal_boost', deal_boost,
            'deal_score', prop.deal_score
          )
        );
        match_count := match_count + 1;
        EXIT WHEN match_count >= p_limit;
      END IF;
    END LOOP;
    EXIT WHEN match_count >= p_limit;
  END LOOP;

  RETURN jsonb_build_object(
    'matches', result,
    'total', jsonb_array_length(result),
    'strong_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'match_confidence' = 'STRONG_MATCH'),
    'moderate_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'match_confidence' = 'MODERATE_MATCH'),
    'low_count', (SELECT count(*) FROM jsonb_array_elements(result) e WHERE e->>'match_confidence' = 'LOW_MATCH'),
    'matched_at', now()
  );
END;
$$;
