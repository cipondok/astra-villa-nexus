
-- ============================================================
-- LIQUIDITY INTELLIGENCE ENGINE
-- ============================================================

-- Core liquidity metrics table (materialized intelligence)
CREATE TABLE IF NOT EXISTS public.market_liquidity_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid,
  district text NOT NULL,
  segment_type text NOT NULL DEFAULT 'villa',
  viewing_velocity_score numeric NOT NULL DEFAULT 0,
  offer_conversion_score numeric NOT NULL DEFAULT 0,
  avg_days_to_offer numeric DEFAULT 0,
  avg_days_to_close numeric DEFAULT 0,
  deal_close_probability numeric DEFAULT 0,
  inquiry_count_30d integer DEFAULT 0,
  viewing_count_30d integer DEFAULT 0,
  offer_count_30d integer DEFAULT 0,
  escrow_count_30d integer DEFAULT 0,
  closed_count_30d integer DEFAULT 0,
  active_listings integer DEFAULT 0,
  absorption_rate numeric DEFAULT 0,
  supply_demand_ratio numeric DEFAULT 0,
  liquidity_strength_index numeric NOT NULL DEFAULT 0,
  momentum_trend text DEFAULT 'stable',
  last_recalculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(district, segment_type)
);

ALTER TABLE public.market_liquidity_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read liquidity metrics" ON public.market_liquidity_metrics
  FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_liquidity_district ON public.market_liquidity_metrics(district);
CREATE INDEX IF NOT EXISTS idx_liquidity_segment ON public.market_liquidity_metrics(segment_type);
CREATE INDEX IF NOT EXISTS idx_liquidity_strength ON public.market_liquidity_metrics(liquidity_strength_index DESC);

-- Per-property liquidity cache
CREATE TABLE IF NOT EXISTS public.property_liquidity_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  viewing_velocity numeric DEFAULT 0,
  offer_momentum numeric DEFAULT 0,
  inquiry_intensity numeric DEFAULT 0,
  price_competitiveness numeric DEFAULT 0,
  days_on_market integer DEFAULT 0,
  liquidity_score numeric NOT NULL DEFAULT 0,
  liquidity_grade text DEFAULT 'C',
  last_signal_at timestamptz,
  last_recalculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

ALTER TABLE public.property_liquidity_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read property liquidity" ON public.property_liquidity_scores
  FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_prop_liquidity_score ON public.property_liquidity_scores(liquidity_score DESC);

-- Liquidity hotspot zones view
CREATE OR REPLACE VIEW public.liquidity_hotspot_zones
WITH (security_invoker = on) AS
SELECT
  m.district,
  m.segment_type,
  m.viewing_velocity_score AS investor_demand_velocity,
  m.deal_close_probability AS closing_momentum,
  m.liquidity_strength_index,
  m.momentum_trend,
  m.absorption_rate,
  CASE
    WHEN m.supply_demand_ratio < 0.5 THEN 'critical_shortage'
    WHEN m.supply_demand_ratio < 1.0 THEN 'undersupplied'
    WHEN m.supply_demand_ratio < 2.0 THEN 'balanced'
    ELSE 'oversupplied'
  END AS supply_indicator,
  m.active_listings,
  m.viewing_count_30d,
  m.offer_count_30d,
  m.closed_count_30d,
  m.avg_days_to_offer,
  m.avg_days_to_close,
  m.last_recalculated_at
FROM public.market_liquidity_metrics m
WHERE m.liquidity_strength_index > 0
ORDER BY m.liquidity_strength_index DESC;

-- RPC function for opportunity scoring to include liquidity factor
CREATE OR REPLACE FUNCTION public.get_property_liquidity_boost(p_property_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT liquidity_score * 0.10 FROM public.property_liquidity_scores WHERE property_id = p_property_id),
    0
  );
$$;
