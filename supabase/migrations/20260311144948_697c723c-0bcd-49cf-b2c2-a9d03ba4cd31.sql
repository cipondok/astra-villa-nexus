
-- Black Swan Stress Testing Engine: 5 tables

CREATE TABLE public.stress_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name text NOT NULL,
  scenario_type text NOT NULL,
  severity_score numeric DEFAULT 0,
  shock_duration_months numeric DEFAULT 0,
  geographic_impact_probability numeric DEFAULT 0,
  liquidity_freeze_risk numeric DEFAULT 0,
  description text,
  trigger_factors jsonb DEFAULT '[]',
  affected_cities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.stress_portfolio_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES public.stress_scenarios(id) ON DELETE CASCADE,
  city text NOT NULL,
  property_type text,
  value_decline_pct numeric DEFAULT 0,
  rental_contraction_pct numeric DEFAULT 0,
  transaction_volume_drop_pct numeric DEFAULT 0,
  time_to_market_months numeric DEFAULT 0,
  loss_containment_prob numeric DEFAULT 0,
  cash_flow_stress_months numeric DEFAULT 0,
  risk_exposure_rank integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.stress_survival_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES public.stress_scenarios(id) ON DELETE CASCADE,
  city text NOT NULL,
  property_type text,
  survival_index numeric DEFAULT 0,
  min_capital_buffer_pct numeric DEFAULT 0,
  forced_liquidation_prob numeric DEFAULT 0,
  debt_servicing_risk numeric DEFAULT 0,
  emergency_liquidity_months numeric DEFAULT 0,
  priority_actions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.stress_recovery_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES public.stress_scenarios(id) ON DELETE CASCADE,
  city text NOT NULL,
  recovery_horizon_months numeric DEFAULT 0,
  appreciation_recovery_pct numeric DEFAULT 0,
  rental_normalization_months numeric DEFAULT 0,
  post_crisis_opportunity_rank integer DEFAULT 0,
  reinvestment_signal text DEFAULT 'wait',
  hotspot_emergence_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.stress_crisis_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES public.stress_scenarios(id) ON DELETE CASCADE,
  city text NOT NULL,
  decision text NOT NULL,
  strategy_type text NOT NULL,
  action_description text,
  capital_preservation_score numeric DEFAULT 0,
  restructuring_priority integer DEFAULT 0,
  defensive_allocation_pct numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.stress_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_portfolio_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_survival_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_recovery_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_crisis_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stress_scenarios" ON public.stress_scenarios FOR SELECT USING (true);
CREATE POLICY "Public read stress_portfolio_projections" ON public.stress_portfolio_projections FOR SELECT USING (true);
CREATE POLICY "Public read stress_survival_scores" ON public.stress_survival_scores FOR SELECT USING (true);
CREATE POLICY "Public read stress_recovery_forecasts" ON public.stress_recovery_forecasts FOR SELECT USING (true);
CREATE POLICY "Public read stress_crisis_strategies" ON public.stress_crisis_strategies FOR SELECT USING (true);

CREATE POLICY "Service insert stress_scenarios" ON public.stress_scenarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert stress_portfolio_projections" ON public.stress_portfolio_projections FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert stress_survival_scores" ON public.stress_survival_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert stress_recovery_forecasts" ON public.stress_recovery_forecasts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert stress_crisis_strategies" ON public.stress_crisis_strategies FOR INSERT WITH CHECK (true);
