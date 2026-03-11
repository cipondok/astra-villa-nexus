
-- Liquidity Absorption Velocity
CREATE TABLE public.liquidity_absorption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  avg_dom numeric DEFAULT 0,
  liquidity_speed_index numeric DEFAULT 0,
  absorption_rating text DEFAULT 'moderate',
  exit_difficulty numeric DEFAULT 0,
  view_to_inquiry_ratio numeric DEFAULT 0,
  seasonal_factor jsonb DEFAULT '{}',
  transaction_velocity numeric DEFAULT 0,
  demand_cycle_phase text DEFAULT 'neutral',
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, property_type)
);
ALTER TABLE public.liquidity_absorption ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read liquidity_absorption" ON public.liquidity_absorption FOR SELECT USING (true);

-- Liquidity Demand Elasticity
CREATE TABLE public.liquidity_demand_elasticity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  elasticity_coefficient numeric DEFAULT 0,
  price_reduction_risk numeric DEFAULT 0,
  supply_pressure numeric DEFAULT 0,
  competition_intensity numeric DEFAULT 0,
  mortgage_affordability_impact numeric DEFAULT 0,
  foreign_investor_participation numeric DEFAULT 0,
  optimal_pricing_strategy text DEFAULT 'market_rate',
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, property_type)
);
ALTER TABLE public.liquidity_demand_elasticity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read liquidity_demand_elasticity" ON public.liquidity_demand_elasticity FOR SELECT USING (true);

-- Liquidity Rental Stability
CREATE TABLE public.liquidity_rental_stability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  occupancy_stability numeric DEFAULT 0,
  cashflow_reliability_index numeric DEFAULT 0,
  vacancy_risk numeric DEFAULT 0,
  tenant_turnover_prob numeric DEFAULT 0,
  short_term_viability numeric DEFAULT 0,
  long_term_viability numeric DEFAULT 0,
  rental_income_continuity numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, property_type)
);
ALTER TABLE public.liquidity_rental_stability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read liquidity_rental_stability" ON public.liquidity_rental_stability FOR SELECT USING (true);

-- Liquidity Crisis Resilience
CREATE TABLE public.liquidity_crisis_resilience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  scenario text NOT NULL,
  stress_liquidity_score numeric DEFAULT 0,
  forced_sale_risk numeric DEFAULT 0,
  capital_protection_rank integer DEFAULT 0,
  recovery_time_months integer DEFAULT 0,
  price_drop_estimate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, property_type, scenario)
);
ALTER TABLE public.liquidity_crisis_resilience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read liquidity_crisis_resilience" ON public.liquidity_crisis_resilience FOR SELECT USING (true);

-- Liquidity Exit Timing
CREATE TABLE public.liquidity_exit_timing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  best_sell_window text DEFAULT 'Q2',
  peak_liquidity_month integer DEFAULT 6,
  optimal_hold_months integer DEFAULT 36,
  flip_profitability numeric DEFAULT 0,
  hold_profitability numeric DEFAULT 0,
  liquidity_adjusted_roi numeric DEFAULT 0,
  exit_scenarios jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(city, property_type)
);
ALTER TABLE public.liquidity_exit_timing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read liquidity_exit_timing" ON public.liquidity_exit_timing FOR SELECT USING (true);
