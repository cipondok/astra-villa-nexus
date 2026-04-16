
-- Market price trends table
CREATE TABLE public.market_price_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text,
  property_type text NOT NULL DEFAULT 'villa',
  period_start date NOT NULL,
  period_end date NOT NULL,
  median_price numeric,
  avg_price_per_sqm numeric,
  price_change_pct numeric,
  transaction_volume integer,
  rental_yield_pct numeric,
  occupancy_rate_pct numeric,
  demand_index numeric,
  supply_index numeric,
  interest_rate numeric,
  inflation_rate numeric,
  gdp_growth_pct numeric,
  data_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.market_price_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read market trends"
  ON public.market_price_trends FOR SELECT
  USING (true);

CREATE INDEX idx_market_trends_city ON public.market_price_trends(city, property_type);
CREATE INDEX idx_market_trends_period ON public.market_price_trends(period_start, period_end);

-- Investment forecasts table
CREATE TABLE public.investment_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  city text,
  district text,
  property_type text,
  forecast_horizon_months integer NOT NULL DEFAULT 12,
  predicted_price numeric,
  predicted_yield_pct numeric,
  predicted_appreciation_pct numeric,
  confidence_score numeric,
  growth_drivers text[],
  risk_factors text[],
  model_version text DEFAULT 'v1',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.investment_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read forecasts"
  ON public.investment_forecasts FOR SELECT
  USING (true);

CREATE INDEX idx_forecasts_property ON public.investment_forecasts(property_id);
CREATE INDEX idx_forecasts_city ON public.investment_forecasts(city, property_type);

-- Portfolio allocations table
CREATE TABLE public.portfolio_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  city text,
  property_type text,
  target_allocation_pct numeric,
  current_value numeric DEFAULT 0,
  invested_amount numeric DEFAULT 0,
  expected_roi_pct numeric,
  risk_score numeric,
  liquidity_score numeric,
  optimization_strategy text DEFAULT 'balanced',
  status text DEFAULT 'recommended',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own allocations"
  ON public.portfolio_allocations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own allocations"
  ON public.portfolio_allocations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own allocations"
  ON public.portfolio_allocations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own allocations"
  ON public.portfolio_allocations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_allocations_user ON public.portfolio_allocations(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_allocations_updated_at
  BEFORE UPDATE ON public.portfolio_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
