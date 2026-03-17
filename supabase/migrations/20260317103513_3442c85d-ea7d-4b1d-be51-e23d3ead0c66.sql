
CREATE OR REPLACE FUNCTION public.get_price_drop_deals(
  p_min_drop_pct numeric DEFAULT 3,
  p_city text DEFAULT NULL,
  p_min_score int DEFAULT 0,
  p_limit int DEFAULT 50
)
RETURNS TABLE(
  property_id uuid,
  property_title text,
  city text,
  old_price numeric,
  new_price numeric,
  drop_percentage numeric,
  changed_at timestamptz,
  opportunity_score int,
  demand_heat_score int,
  rental_yield numeric,
  investment_score int,
  property_image text,
  alert_tier text,
  ai_undervaluation text
)
LANGUAGE sql STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id AS property_id,
    p.title AS property_title,
    p.city,
    ph.old_price,
    ph.new_price,
    ABS(ph.change_percentage) AS drop_percentage,
    ph.changed_at,
    COALESCE(p.opportunity_score, 0)::int AS opportunity_score,
    COALESCE(p.demand_heat_score, 0)::int AS demand_heat_score,
    COALESCE(p.rental_yield, 0)::numeric AS rental_yield,
    COALESCE(p.investment_score, 0)::int AS investment_score,
    p.images[1] AS property_image,
    CASE
      WHEN ABS(ph.change_percentage) >= 10 THEN 'elite_deal'
      WHEN ABS(ph.change_percentage) >= 5 THEN 'opportunity'
      WHEN ABS(ph.change_percentage) >= 3 THEN 'minor'
      ELSE 'none'
    END AS alert_tier,
    CASE
      WHEN p.opportunity_score >= 85 THEN 'Highly Undervalued'
      WHEN p.opportunity_score >= 65 THEN 'Moderately Undervalued'
      WHEN p.opportunity_score >= 40 THEN 'Fair Value'
      ELSE 'Market Price'
    END AS ai_undervaluation
  FROM property_price_history ph
  JOIN properties p ON p.id = ph.property_id
  WHERE ph.change_percentage < 0
    AND ABS(ph.change_percentage) >= p_min_drop_pct
    AND p.status = 'active'
    AND (p_city IS NULL OR p.city ILIKE p_city)
    AND COALESCE(p.opportunity_score, 0) >= p_min_score
  ORDER BY ph.changed_at DESC
  LIMIT p_limit;
$$;
