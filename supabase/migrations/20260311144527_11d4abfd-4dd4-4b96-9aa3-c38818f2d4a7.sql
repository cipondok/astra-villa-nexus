
-- Hedging Engine: 5 tables

CREATE TABLE public.hedging_macro_risk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  interest_rate_risk numeric DEFAULT 0,
  inflation_momentum numeric DEFAULT 0,
  currency_volatility numeric DEFAULT 0,
  construction_cost_trend numeric DEFAULT 0,
  capital_flow_shift numeric DEFAULT 0,
  policy_tightening_risk numeric DEFAULT 0,
  macro_risk_pressure_index numeric DEFAULT 0,
  cycle_phase text DEFAULT 'expansion',
  capital_flight_probability numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.hedging_portfolio_exposure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text,
  price_tier text,
  allocation_pct numeric DEFAULT 0,
  overexposure_flag boolean DEFAULT false,
  geo_concentration_risk numeric DEFAULT 0,
  strategy_imbalance_score numeric DEFAULT 0,
  vulnerability_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.hedging_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  strategy_type text NOT NULL,
  action_description text,
  risk_reduction_pct numeric DEFAULT 0,
  capital_preservation_prob numeric DEFAULT 0,
  risk_adjusted_return_improvement numeric DEFAULT 0,
  priority_rank integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.hedging_downside_protection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text,
  max_drawdown_pct numeric DEFAULT 0,
  time_to_recovery_months numeric DEFAULT 0,
  income_decline_prob numeric DEFAULT 0,
  forced_liquidation_risk numeric DEFAULT 0,
  downside_resilience_index numeric DEFAULT 0,
  recovery_horizon_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.hedging_safe_havens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  defensive_score numeric DEFAULT 0,
  rental_stability numeric DEFAULT 0,
  policy_protection_score numeric DEFAULT 0,
  infra_backed_growth numeric DEFAULT 0,
  capital_protection_score numeric DEFAULT 0,
  safe_haven_rank integer DEFAULT 0,
  recommended_allocation_pct numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.hedging_macro_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hedging_portfolio_exposure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hedging_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hedging_downside_protection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hedging_safe_havens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hedging_macro_risk" ON public.hedging_macro_risk FOR SELECT USING (true);
CREATE POLICY "Public read hedging_portfolio_exposure" ON public.hedging_portfolio_exposure FOR SELECT USING (true);
CREATE POLICY "Public read hedging_strategies" ON public.hedging_strategies FOR SELECT USING (true);
CREATE POLICY "Public read hedging_downside_protection" ON public.hedging_downside_protection FOR SELECT USING (true);
CREATE POLICY "Public read hedging_safe_havens" ON public.hedging_safe_havens FOR SELECT USING (true);

-- Service role insert/update
CREATE POLICY "Service insert hedging_macro_risk" ON public.hedging_macro_risk FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert hedging_portfolio_exposure" ON public.hedging_portfolio_exposure FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert hedging_strategies" ON public.hedging_strategies FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert hedging_downside_protection" ON public.hedging_downside_protection FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert hedging_safe_havens" ON public.hedging_safe_havens FOR INSERT WITH CHECK (true);
