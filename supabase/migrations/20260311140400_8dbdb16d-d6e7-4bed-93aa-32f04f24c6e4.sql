
-- ============================================================
-- AUTONOMOUS INVESTMENT FUND INTELLIGENCE SCHEMA
-- ============================================================

-- 1. Capital Allocation Brain
CREATE TABLE IF NOT EXISTS public.fund_capital_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allocation_type TEXT NOT NULL DEFAULT 'recommended', -- recommended, active, simulated
  target_regions JSONB NOT NULL DEFAULT '[]',
  target_property_types JSONB NOT NULL DEFAULT '[]',
  target_risk_tiers JSONB NOT NULL DEFAULT '[]',
  allocation_matrix JSONB NOT NULL DEFAULT '{}',
  portfolio_volatility NUMERIC DEFAULT 0,
  expected_annual_return NUMERIC DEFAULT 0,
  wealth_growth_10y NUMERIC DEFAULT 0,
  macro_signals JSONB DEFAULT '{}',
  cycle_phase TEXT DEFAULT 'expansion',
  confidence_score NUMERIC DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

ALTER TABLE public.fund_capital_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own allocations" ON public.fund_capital_allocations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own allocations" ON public.fund_capital_allocations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 2. Portfolio Rebalancing Intelligence
CREATE TABLE IF NOT EXISTS public.fund_rebalancing_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL, -- concentration_risk, declining_market, underperformer, new_opportunity
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  affected_property_id UUID,
  affected_city TEXT,
  current_allocation_pct NUMERIC,
  recommended_allocation_pct NUMERIC,
  action TEXT NOT NULL, -- hold, reduce, exit, increase, enter
  reasoning TEXT,
  expected_impact_pct NUMERIC,
  is_acted_upon BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'
);

ALTER TABLE public.fund_rebalancing_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own signals" ON public.fund_rebalancing_signals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own signals" ON public.fund_rebalancing_signals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. Entry Timing Engine
CREATE TABLE IF NOT EXISTS public.fund_entry_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT,
  city TEXT NOT NULL,
  property_type TEXT,
  signal_type TEXT NOT NULL, -- acquisition_window, pre_launch_arb, distress_sale, correction_entry
  timing_confidence NUMERIC NOT NULL DEFAULT 0,
  upside_multiplier NUMERIC DEFAULT 1.0,
  liquidity_risk NUMERIC DEFAULT 0,
  price_momentum NUMERIC DEFAULT 0,
  volume_trend TEXT DEFAULT 'stable',
  macro_alignment_score NUMERIC DEFAULT 0,
  window_opens_at TIMESTAMPTZ,
  window_closes_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_entry_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read entry signals" ON public.fund_entry_signals FOR SELECT TO authenticated USING (true);

-- 4. Exit Strategy Optimization
CREATE TABLE IF NOT EXISTS public.fund_exit_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,
  strategy_type TEXT NOT NULL, -- sell_now, hold_long, refinance, flip
  optimal_exit_window TEXT,
  expected_profit NUMERIC DEFAULT 0,
  tax_efficiency_score NUMERIC DEFAULT 0,
  peak_probability NUMERIC DEFAULT 0,
  scenarios JSONB DEFAULT '[]',
  recommended BOOLEAN DEFAULT false,
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_exit_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own exit strategies" ON public.fund_exit_strategies FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own exit strategies" ON public.fund_exit_strategies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Wealth Simulation Engine
CREATE TABLE IF NOT EXISTS public.fund_wealth_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  persona TEXT NOT NULL DEFAULT 'balanced', -- conservative, balanced, aggressive
  initial_capital NUMERIC NOT NULL,
  monthly_contribution NUMERIC DEFAULT 0,
  projection_years INT DEFAULT 10,
  net_worth_trajectory JSONB DEFAULT '[]',
  cashflow_curve JSONB DEFAULT '[]',
  risk_heatmap JSONB DEFAULT '{}',
  compounding_efficiency NUMERIC DEFAULT 0,
  final_net_worth NUMERIC DEFAULT 0,
  total_return_pct NUMERIC DEFAULT 0,
  sharpe_ratio NUMERIC DEFAULT 0,
  max_drawdown_pct NUMERIC DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_wealth_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own simulations" ON public.fund_wealth_simulations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own simulations" ON public.fund_wealth_simulations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 6. Deal Execution Readiness
CREATE TABLE IF NOT EXISTS public.fund_deal_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,
  readiness_score NUMERIC DEFAULT 0,
  due_diligence_summary JSONB DEFAULT '{}',
  financing_structure JSONB DEFAULT '{}',
  legal_readiness_score NUMERIC DEFAULT 0,
  liquidity_assessment JSONB DEFAULT '{}',
  execution_packet JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- draft, ready, submitted
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_deal_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own readiness" ON public.fund_deal_readiness FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own readiness" ON public.fund_deal_readiness FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fund_capital_user ON public.fund_capital_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_rebalancing_user ON public.fund_rebalancing_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_entry_city ON public.fund_entry_signals(city);
CREATE INDEX IF NOT EXISTS idx_fund_exit_user ON public.fund_exit_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_wealth_user ON public.fund_wealth_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_readiness_user ON public.fund_deal_readiness(user_id);
