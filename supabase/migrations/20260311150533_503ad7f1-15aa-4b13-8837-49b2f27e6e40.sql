
-- Portfolio Optimizer tables

CREATE TABLE public.portfolio_optimizer_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  total_return numeric DEFAULT 0,
  risk_score numeric DEFAULT 0,
  alpha numeric DEFAULT 0,
  beta numeric DEFAULT 0,
  max_drawdown numeric DEFAULT 0,
  yield_stability numeric DEFAULT 0,
  efficiency_score numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_optimizer_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read portfolio_optimizer_performance" ON public.portfolio_optimizer_performance FOR SELECT USING (true);

CREATE TABLE public.portfolio_optimizer_diversification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  correlation_score numeric DEFAULT 0,
  diversification_benefit numeric DEFAULT 0,
  concentration_risk numeric DEFAULT 0,
  recommended_weight numeric DEFAULT 0,
  sector_exposure text DEFAULT 'moderate',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_optimizer_diversification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read portfolio_optimizer_diversification" ON public.portfolio_optimizer_diversification FOR SELECT USING (true);

CREATE TABLE public.portfolio_optimizer_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  current_allocation_pct numeric DEFAULT 0,
  optimal_allocation_pct numeric DEFAULT 0,
  adjustment_direction text DEFAULT 'hold',
  risk_adjusted_return numeric DEFAULT 0,
  sharpe_ratio numeric DEFAULT 0,
  rebalance_priority integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_optimizer_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read portfolio_optimizer_allocations" ON public.portfolio_optimizer_allocations FOR SELECT USING (true);

CREATE TABLE public.portfolio_optimizer_rebalancing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text NOT NULL,
  action text DEFAULT 'hold',
  reason text,
  expected_return_improvement numeric DEFAULT 0,
  risk_reduction_pct numeric DEFAULT 0,
  urgency text DEFAULT 'low',
  capital_required numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_optimizer_rebalancing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read portfolio_optimizer_rebalancing" ON public.portfolio_optimizer_rebalancing FOR SELECT USING (true);

CREATE TABLE public.portfolio_optimizer_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name text NOT NULL,
  city text NOT NULL,
  property_type text NOT NULL,
  weight_pct numeric DEFAULT 0,
  projected_return numeric DEFAULT 0,
  projected_risk numeric DEFAULT 0,
  sharpe_ratio numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_optimizer_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read portfolio_optimizer_scenarios" ON public.portfolio_optimizer_scenarios FOR SELECT USING (true);
