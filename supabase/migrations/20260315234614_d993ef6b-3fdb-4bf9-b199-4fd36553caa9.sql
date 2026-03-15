
CREATE OR REPLACE FUNCTION public.get_national_property_market_index()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nat_demand numeric;
  nat_growth numeric;
  nat_liquidity numeric;
  nat_price_index numeric;
  nat_investment_score numeric;
  total_properties int;
  total_cities int;
  leaders jsonb;
  momentum_score numeric;
BEGIN
  -- Aggregate national metrics from investment_hotspots
  SELECT
    COALESCE(AVG(demand_score), 0),
    COALESCE(AVG(growth_score), 0),
    COALESCE(AVG(rental_yield_score), 0),
    COALESCE(AVG(roi_score), 0),
    COALESCE(AVG(avg_investment_score), 0),
    COUNT(DISTINCT city)
  INTO nat_demand, nat_growth, nat_liquidity, nat_price_index, nat_investment_score, total_cities
  FROM investment_hotspots;

  -- Total active properties
  SELECT count(*) INTO total_properties
  FROM properties WHERE status = 'available';

  -- Momentum = demand * 0.40 + liquidity * 0.30 + growth * 0.30
  momentum_score := ROUND(nat_demand * 0.40 + nat_liquidity * 0.30 + nat_growth * 0.30);

  -- Regional growth leaders (top 6 cities by composite hotspot score)
  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.composite DESC), '[]'::jsonb)
  INTO leaders
  FROM (
    SELECT
      city,
      COALESCE(demand_score, 0) AS demand,
      COALESCE(growth_score, 0) AS growth,
      COALESCE(rental_yield_score, 0) AS rental_yield,
      COALESCE(avg_investment_score, 0) AS investment_score,
      COALESCE(market_status, 'Stable') AS market_status,
      COALESCE(market_growth_rate, 0) AS growth_rate,
      ROUND(
        COALESCE(avg_investment_score, 0) * 0.30 +
        COALESCE(growth_score, 0) * 0.25 +
        COALESCE(rental_yield_score, 0) * 0.25 +
        COALESCE(roi_score, 0) * 0.20
      ) AS composite
    FROM investment_hotspots
    ORDER BY (
      COALESCE(avg_investment_score, 0) * 0.30 +
      COALESCE(growth_score, 0) * 0.25 +
      COALESCE(rental_yield_score, 0) * 0.25 +
      COALESCE(roi_score, 0) * 0.20
    ) DESC
    LIMIT 6
  ) sub;

  RETURN jsonb_build_object(
    'national_demand', ROUND(nat_demand),
    'national_growth', ROUND(nat_growth),
    'national_liquidity', ROUND(nat_liquidity),
    'national_price_index', ROUND(nat_price_index),
    'national_investment_score', ROUND(nat_investment_score),
    'momentum_score', momentum_score,
    'total_properties', total_properties,
    'total_cities', total_cities,
    'regional_leaders', leaders,
    'generated_at', now()
  );
END;
$$;
