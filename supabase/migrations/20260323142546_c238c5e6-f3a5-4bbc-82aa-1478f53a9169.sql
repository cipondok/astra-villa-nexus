
-- Capital Allocation Signals
CREATE TABLE IF NOT EXISTS public.capital_allocation_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text DEFAULT 'Indonesia',
  city text NOT NULL,
  segment text DEFAULT 'mixed',
  liquidity_velocity_score numeric DEFAULT 0,
  demand_pressure_index numeric DEFAULT 0,
  price_momentum_score numeric DEFAULT 0,
  investor_intent_density numeric DEFAULT 0,
  historical_roi_estimate numeric DEFAULT 0,
  risk_volatility_score numeric DEFAULT 0,
  capital_efficiency_score numeric DEFAULT 0,
  allocation_priority_score numeric DEFAULT 0,
  recommended_capital_direction text DEFAULT 'hold',
  confidence_level text DEFAULT 'moderate',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cap_alloc_city_seg ON public.capital_allocation_signals(city, segment);
CREATE INDEX idx_cap_alloc_priority ON public.capital_allocation_signals(allocation_priority_score DESC);
CREATE INDEX idx_cap_alloc_created ON public.capital_allocation_signals(created_at);

-- Investor Portfolio Signals
CREATE TABLE IF NOT EXISTS public.investor_portfolio_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid,
  preferred_segments text[] DEFAULT '{}',
  avg_ticket_size numeric DEFAULT 0,
  risk_tolerance_level text DEFAULT 'moderate',
  diversification_score numeric DEFAULT 0,
  recommended_city_focus text,
  recommended_segment_focus text,
  optimal_capital_split_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_portfolio_signals_investor ON public.investor_portfolio_signals(investor_id);

-- Capital Flow Forecasts
CREATE TABLE IF NOT EXISTS public.capital_flow_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  segment text DEFAULT 'mixed',
  predicted_inflow_score numeric DEFAULT 0,
  hotspot_probability numeric DEFAULT 0,
  saturation_risk numeric DEFAULT 0,
  rotation_signal text,
  forecast_horizon_days integer DEFAULT 30,
  forecast_trend text DEFAULT 'stable',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cap_forecast_city ON public.capital_flow_forecasts(city);
CREATE INDEX idx_cap_forecast_created ON public.capital_flow_forecasts(created_at);

-- RLS
ALTER TABLE public.capital_allocation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_portfolio_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_flow_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read capital alloc" ON public.capital_allocation_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read portfolio signals" ON public.investor_portfolio_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read capital forecasts" ON public.capital_flow_forecasts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert capital alloc" ON public.capital_allocation_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert portfolio signals" ON public.investor_portfolio_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert capital forecasts" ON public.capital_flow_forecasts FOR INSERT TO service_role WITH CHECK (true);
