
CREATE OR REPLACE FUNCTION public.detect_capital_flow_trends(p_lookback_days int DEFAULT 90)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  half_window int := GREATEST(p_lookback_days / 2, 15);
  regions jsonb := '[]'::jsonb;
  r record;
  curr_velocity numeric;
  prev_velocity numeric;
  velocity_trend numeric;
  curr_deal numeric;
  prev_deal numeric;
  deal_trend numeric;
  curr_liquidity numeric;
  prev_liquidity numeric;
  liquidity_trend numeric;
  curr_growth numeric;
  prev_growth numeric;
  growth_accel numeric;
  curr_listings int;
  prev_listings int;
  listing_change numeric;
  flow_signal text;
  flow_strength text;
  note text;
  spec_risk boolean;
BEGIN
  FOR r IN
    SELECT DISTINCT city FROM properties WHERE city IS NOT NULL AND city <> ''
    ORDER BY city
  LOOP
    -- Current window deal scores
    SELECT COALESCE(AVG(pda.deal_score), 0), COUNT(*)
    INTO curr_deal, curr_listings
    FROM property_deal_analysis pda
    JOIN properties p ON p.id = pda.property_id
    WHERE p.city = r.city
      AND pda.analyzed_at >= now() - (p_lookback_days || ' days')::interval
      AND pda.analyzed_at >= now() - (half_window || ' days')::interval;

    -- Previous window deal scores
    SELECT COALESCE(AVG(pda.deal_score), 0), COUNT(*)
    INTO prev_deal, prev_listings
    FROM property_deal_analysis pda
    JOIN properties p ON p.id = pda.property_id
    WHERE p.city = r.city
      AND pda.analyzed_at >= now() - (p_lookback_days || ' days')::interval
      AND pda.analyzed_at < now() - (half_window || ' days')::interval;

    deal_trend := curr_deal - prev_deal;

    -- Transaction velocity (sold count ratio)
    SELECT COUNT(*) INTO curr_velocity
    FROM properties p
    WHERE p.city = r.city AND p.status = 'sold'
      AND p.sold_at >= now() - (half_window || ' days')::interval;

    SELECT COUNT(*) INTO prev_velocity
    FROM properties p
    WHERE p.city = r.city AND p.status = 'sold'
      AND p.sold_at >= now() - (p_lookback_days || ' days')::interval
      AND p.sold_at < now() - (half_window || ' days')::interval;

    velocity_trend := COALESCE(curr_velocity, 0) - COALESCE(prev_velocity, 0);

    -- Liquidity from hotspots
    SELECT COALESCE(ih.liquidity_score, 0), COALESCE(ih.growth_score, 0)
    INTO curr_liquidity, curr_growth
    FROM investment_hotspots ih
    WHERE ih.city = r.city
    ORDER BY ih.updated_at DESC LIMIT 1;

    -- Previous liquidity approximation
    SELECT COALESCE(AVG(ih.liquidity_score), curr_liquidity)
    INTO prev_liquidity
    FROM investment_hotspots ih
    WHERE ih.city = r.city
      AND ih.updated_at < now() - (half_window || ' days')::interval;

    liquidity_trend := curr_liquidity - prev_liquidity;

    -- Growth acceleration
    SELECT COALESCE(AVG(ih.growth_score), curr_growth)
    INTO prev_growth
    FROM investment_hotspots ih
    WHERE ih.city = r.city
      AND ih.updated_at < now() - (half_window || ' days')::interval;

    growth_accel := curr_growth - prev_growth;
    listing_change := curr_listings - prev_listings;

    -- Speculative heat: rapid growth > 15 with deal trend rising sharply
    spec_risk := (growth_accel > 15 AND deal_trend > 10 AND curr_growth > 65);

    -- === Classify ===
    IF spec_risk THEN
      flow_signal := 'SPECULATIVE_HEAT';
      flow_strength := 'CAPITAL_EXIT_RISK';
      note := format(
        '%s menunjukkan sinyal spekulatif — pertumbuhan akselerasi +%s dengan deal momentum +%s. '
        || 'Risiko koreksi harga tinggi. Pertimbangkan profit-taking atau hedging posisi.',
        r.city, ROUND(growth_accel), ROUND(deal_trend)
      );

    ELSIF velocity_trend > 0 AND deal_trend > 3 AND curr_deal >= 45 THEN
      flow_signal := 'CAPITAL_INFLOW';
      IF velocity_trend > 5 AND deal_trend > 8 THEN
        flow_strength := 'STRONG_INFLOW';
        note := format(
          'Arus modal kuat masuk ke %s — velocity transaksi +%s, deal probability naik +%s ke %s. '
          || 'Zona akumulasi strategis untuk investor growth-oriented.',
          r.city, velocity_trend, ROUND(deal_trend), ROUND(curr_deal)
        );
      ELSE
        flow_strength := 'MODERATE_ROTATION';
        note := format(
          'Rotasi modal moderat ke %s — velocity +%s, deal trend +%s. '
          || 'Monitor untuk konfirmasi tren sebelum menambah eksposur.',
          r.city, velocity_trend, ROUND(deal_trend)
        );
      END IF;

    ELSIF liquidity_trend < -5 AND listing_change > 0 THEN
      flow_signal := 'CAPITAL_OUTFLOW';
      IF liquidity_trend < -12 THEN
        flow_strength := 'CAPITAL_EXIT_RISK';
        note := format(
          'Peringatan capital exit di %s — likuiditas turun %s, inventory naik +%s listing. '
          || 'Kurangi eksposur dan hindari akuisisi baru di zona ini.',
          r.city, ROUND(liquidity_trend), listing_change
        );
      ELSE
        flow_strength := 'MODERATE_ROTATION';
        note := format(
          'Outflow moderat terdeteksi di %s — likuiditas melemah %s. '
          || 'Tahan posisi income-generating, tunda ekspansi.',
          r.city, ROUND(liquidity_trend)
        );
      END IF;

    ELSE
      flow_signal := 'STABLE';
      flow_strength := 'MODERATE_ROTATION';
      note := format(
        'Aliran modal stabil di %s — tidak ada pergerakan signifikan terdeteksi. '
        || 'Pasar dalam fase konsolidasi.',
        r.city
      );
    END IF;

    -- Only include regions with meaningful data
    IF curr_listings > 0 OR prev_listings > 0 OR curr_liquidity > 0 THEN
      regions := regions || jsonb_build_object(
        'region', r.city,
        'capital_flow_signal', flow_signal,
        'flow_strength', flow_strength,
        'strategic_market_note', note,
        'metrics', jsonb_build_object(
          'velocity_trend', velocity_trend,
          'deal_trend', ROUND(deal_trend),
          'liquidity_trend', ROUND(liquidity_trend),
          'growth_acceleration', ROUND(growth_accel),
          'current_deal_score', ROUND(curr_deal),
          'current_liquidity', ROUND(curr_liquidity),
          'current_growth', ROUND(curr_growth),
          'listing_change', listing_change,
          'speculative_risk', spec_risk
        )
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'regions', regions,
    'total_regions', jsonb_array_length(regions),
    'inflow_count', (SELECT COUNT(*) FROM jsonb_array_elements(regions) e WHERE e->>'capital_flow_signal' = 'CAPITAL_INFLOW'),
    'outflow_count', (SELECT COUNT(*) FROM jsonb_array_elements(regions) e WHERE e->>'capital_flow_signal' = 'CAPITAL_OUTFLOW'),
    'speculative_count', (SELECT COUNT(*) FROM jsonb_array_elements(regions) e WHERE e->>'capital_flow_signal' = 'SPECULATIVE_HEAT'),
    'analyzed_at', now()
  );
END;
$$;
