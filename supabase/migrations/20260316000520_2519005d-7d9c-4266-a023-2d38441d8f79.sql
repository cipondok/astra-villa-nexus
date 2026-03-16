
CREATE OR REPLACE FUNCTION public.analyze_portfolio_strategy(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_assets int := 0;
  city_counts jsonb := '{}';
  type_counts jsonb := '{}';
  avg_growth numeric := 0;
  avg_liquidity numeric := 0;
  avg_yield numeric := 0;
  avg_deal numeric := 0;
  national_growth numeric := 0;
  max_city_pct numeric := 0;
  max_city text := '';
  max_type_pct numeric := 0;
  max_type text := '';
  concentration_risk boolean := false;
  growth_imbalance boolean := false;
  strategy_signal text;
  rebalance_action text;
  diversification text;
  outlook text;
  holdings jsonb := '[]'::jsonb;
  r record;
BEGIN
  -- Gather user holdings with scores
  FOR r IN
    SELECT
      p.id,
      left(p.title, 45) AS title,
      p.city,
      p.property_type,
      p.price,
      COALESCE(pis.growth_prediction, 0) AS growth,
      COALESCE(pis.liquidity_score, 0) AS liquidity,
      COALESCE(pis.rental_yield_estimate, 0) AS yield,
      COALESCE(pda.deal_score, 0) AS deal_score
    FROM properties p
    LEFT JOIN property_investment_scores pis ON pis.property_id = p.id
    LEFT JOIN property_deal_analysis pda ON pda.property_id = p.id
    WHERE p.owner_id = p_user_id
      AND p.status IN ('available', 'active', 'sold')
    ORDER BY COALESCE(pis.growth_prediction, 0) DESC
  LOOP
    total_assets := total_assets + 1;
    avg_growth := avg_growth + r.growth;
    avg_liquidity := avg_liquidity + r.liquidity;
    avg_yield := avg_yield + r.yield;
    avg_deal := avg_deal + r.deal_score;

    -- City concentration
    IF r.city IS NOT NULL THEN
      city_counts := city_counts || jsonb_build_object(
        r.city,
        COALESCE((city_counts->>r.city)::int, 0) + 1
      );
    END IF;

    -- Type concentration
    IF r.property_type IS NOT NULL THEN
      type_counts := type_counts || jsonb_build_object(
        r.property_type,
        COALESCE((type_counts->>r.property_type)::int, 0) + 1
      );
    END IF;

    holdings := holdings || jsonb_build_object(
      'id', r.id,
      'title', r.title,
      'city', r.city,
      'property_type', r.property_type,
      'price', r.price,
      'growth', r.growth,
      'liquidity', r.liquidity,
      'yield', ROUND(r.yield::numeric, 1),
      'deal_score', r.deal_score
    );
  END LOOP;

  IF total_assets = 0 THEN
    RETURN jsonb_build_object(
      'portfolio_id', p_user_id,
      'strategy_signal', 'NO_PORTFOLIO',
      'recommended_rebalance_action', 'START_ACQUIRING',
      'diversification_insight', 'No holdings detected. Begin building your portfolio with growth-zone assets.',
      'portfolio_outlook', 'NOT_APPLICABLE',
      'holdings', '[]'::jsonb,
      'metrics', jsonb_build_object('total_assets', 0)
    );
  END IF;

  avg_growth := ROUND(avg_growth / total_assets);
  avg_liquidity := ROUND(avg_liquidity / total_assets);
  avg_yield := ROUND(avg_yield / total_assets, 1);
  avg_deal := ROUND(avg_deal / total_assets);

  -- National benchmark
  SELECT COALESCE(AVG(ih.growth_score), 50) INTO national_growth
  FROM investment_hotspots ih
  WHERE ih.updated_at >= now() - interval '45 days';

  -- Detect city concentration
  IF total_assets >= 2 THEN
    SELECT key, (value::text)::numeric / total_assets * 100
    INTO max_city, max_city_pct
    FROM jsonb_each_text(city_counts)
    ORDER BY (value::text)::int DESC
    LIMIT 1;

    IF max_city_pct >= 60 THEN
      concentration_risk := true;
    END IF;
  END IF;

  -- Detect type concentration
  IF total_assets >= 2 THEN
    SELECT key, (value::text)::numeric / total_assets * 100
    INTO max_type, max_type_pct
    FROM jsonb_each_text(type_counts)
    ORDER BY (value::text)::int DESC
    LIMIT 1;

    IF max_type_pct >= 70 THEN
      concentration_risk := true;
    END IF;
  END IF;

  -- Detect growth imbalance vs national benchmark
  IF avg_growth < national_growth - 10 THEN
    growth_imbalance := true;
  END IF;

  -- === Strategy Signal ===
  IF concentration_risk AND growth_imbalance THEN
    strategy_signal := 'CRITICAL_REBALANCE';
    rebalance_action := 'ACQUIRE_GROWTH_ZONE';
    diversification := format(
      'Portfolio critically concentrated — %s%% in %s with growth (%s) trailing national benchmark (%s) by %s pts. '
      || 'Urgently diversify into high-growth regions to reduce downside exposure and capture upside.',
      ROUND(max_city_pct), max_city, avg_growth, ROUND(national_growth), ROUND(national_growth - avg_growth)
    );
    outlook := 'RISK_EXPOSURE_RISING';

  ELSIF concentration_risk THEN
    strategy_signal := 'DIVERSIFY';
    rebalance_action := 'ACQUIRE_GROWTH_ZONE';
    diversification := format(
      'Over-concentration detected — %s%% of assets in %s. Growth adequate (%s) but geographic risk is elevated. '
      || 'Add 1-2 assets in different growth corridors to build resilience.',
      ROUND(max_city_pct), max_city, avg_growth
    );
    outlook := 'BALANCED_STRATEGY';

  ELSIF growth_imbalance THEN
    strategy_signal := 'GROWTH_GAP';
    IF avg_liquidity >= 50 THEN
      rebalance_action := 'EXIT_WEAKENING_ASSET';
      diversification := format(
        'Portfolio growth (%s) underperforming national benchmark (%s). Liquidity healthy (%s) — exit lowest-growth asset and rotate into emerging regions.',
        avg_growth, ROUND(national_growth), avg_liquidity
      );
    ELSE
      rebalance_action := 'HOLD_STABLE_INCOME';
      diversification := format(
        'Growth below benchmark (%s vs %s) with tight liquidity (%s). Hold income-generating assets and wait for exit liquidity to improve before repositioning.',
        avg_growth, ROUND(national_growth), avg_liquidity
      );
    END IF;
    outlook := 'BALANCED_STRATEGY';

  ELSIF avg_growth >= national_growth + 5 AND avg_liquidity >= 50 AND avg_yield >= 4 THEN
    strategy_signal := 'OPTIMAL';
    rebalance_action := 'HOLD_STABLE_INCOME';
    diversification := format(
      'Portfolio well-optimized — growth %s outperforms national (%s), yield %s%%, liquidity %s. '
      || 'Maintain current allocation and compound rental income. Minor tactical adds only in high-conviction opportunities.',
      avg_growth, ROUND(national_growth), avg_yield, avg_liquidity
    );
    outlook := 'STRONG_WEALTH_GROWTH';

  ELSE
    strategy_signal := 'STABLE';
    rebalance_action := 'HOLD_STABLE_INCOME';
    diversification := format(
      'Portfolio performing at market rate — growth %s, national benchmark %s. Balanced but no alpha generation. '
      || 'Look for selective growth-zone additions to improve returns without increasing risk.',
      avg_growth, ROUND(national_growth)
    );
    outlook := 'BALANCED_STRATEGY';
  END IF;

  RETURN jsonb_build_object(
    'portfolio_id', p_user_id,
    'strategy_signal', strategy_signal,
    'recommended_rebalance_action', rebalance_action,
    'diversification_insight', diversification,
    'portfolio_outlook', outlook,
    'metrics', jsonb_build_object(
      'total_assets', total_assets,
      'avg_growth', avg_growth,
      'avg_liquidity', avg_liquidity,
      'avg_yield', avg_yield,
      'avg_deal_score', avg_deal,
      'national_growth_benchmark', ROUND(national_growth),
      'max_city', max_city,
      'max_city_pct', ROUND(max_city_pct),
      'max_type', max_type,
      'max_type_pct', ROUND(max_type_pct),
      'concentration_risk', concentration_risk,
      'growth_imbalance', growth_imbalance
    ),
    'holdings', holdings,
    'analyzed_at', now()
  );
END;
$$;
