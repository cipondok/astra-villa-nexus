
-- =============================================
-- AUTONOMOUS GLOBAL ASSET ALLOCATION BRAIN
-- =============================================

-- 1) Dynamic Capital Rotation Engine
CREATE TABLE public.aab_capital_rotation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  cycle_phase TEXT NOT NULL CHECK (cycle_phase IN (
    'early_recovery', 'expansion', 'peak', 'contraction', 'trough'
  )),
  phase_confidence NUMERIC(4,2) DEFAULT 0.5 CHECK (phase_confidence BETWEEN 0 AND 1),
  rotation_signal TEXT NOT NULL CHECK (rotation_signal IN (
    'strong_buy', 'accumulate', 'hold', 'reduce', 'exit'
  )),
  liquidity_acceleration NUMERIC(5,2) DEFAULT 0,
  momentum_score NUMERIC(5,2) DEFAULT 0,
  mean_reversion_risk NUMERIC(5,2) DEFAULT 0,
  time_in_phase_months INTEGER DEFAULT 0,
  estimated_phase_remaining_months INTEGER DEFAULT 0,
  signal_drivers JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, district)
);

CREATE INDEX idx_aab_rotation_signal ON public.aab_capital_rotation (rotation_signal);
CREATE INDEX idx_aab_rotation_phase ON public.aab_capital_rotation (cycle_phase);

-- 2) Risk-Adjusted Yield Optimizer
CREATE TABLE public.aab_yield_optimizer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  -- Yield components
  capital_appreciation_yield NUMERIC(6,2) DEFAULT 0,
  cashflow_yield NUMERIC(6,2) DEFAULT 0,
  blended_yield NUMERIC(6,2) DEFAULT 0,
  -- Risk adjustments
  volatility_discount NUMERIC(5,2) DEFAULT 0,
  liquidity_premium NUMERIC(5,2) DEFAULT 0,
  currency_exposure_factor NUMERIC(4,2) DEFAULT 1.0,
  -- Optimization outputs
  risk_adjusted_yield NUMERIC(6,2) DEFAULT 0,
  optimal_hold_period_months INTEGER DEFAULT 36,
  recommended_allocation_pct NUMERIC(5,2) DEFAULT 0,
  yield_tier TEXT CHECK (yield_tier IN (
    'alpha_generator', 'core_plus', 'core', 'value_add', 'opportunistic'
  )),
  optimization_strategy TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, district)
);

CREATE INDEX idx_aab_yield_tier ON public.aab_yield_optimizer (yield_tier);
CREATE INDEX idx_aab_yield_score ON public.aab_yield_optimizer (risk_adjusted_yield DESC);

-- 3) Portfolio Gravity Modeling
CREATE TABLE public.aab_portfolio_gravity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  -- Gravity metrics
  capital_mass NUMERIC(18,2) DEFAULT 0,
  investor_density INTEGER DEFAULT 0,
  network_liquidity_score NUMERIC(5,2) DEFAULT 0,
  clustering_coefficient NUMERIC(4,3) DEFAULT 0,
  saturation_index NUMERIC(5,2) DEFAULT 0,
  gravity_pull_score NUMERIC(5,2) DEFAULT 0 CHECK (gravity_pull_score BETWEEN 0 AND 100),
  -- Thresholds
  saturation_threshold NUMERIC(5,2) DEFAULT 80,
  is_saturated BOOLEAN DEFAULT false,
  network_reinforcement_active BOOLEAN DEFAULT false,
  gravity_tier TEXT CHECK (gravity_tier IN (
    'black_hole', 'supermassive', 'stellar', 'planetary', 'asteroid'
  )),
  simulation_data JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city, district)
);

CREATE INDEX idx_aab_gravity_score ON public.aab_portfolio_gravity (gravity_pull_score DESC);

-- 4) Institutional Syndication Strategy
CREATE TABLE public.aab_syndication_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_name TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  syndication_type TEXT NOT NULL CHECK (syndication_type IN (
    'co_investment', 'joint_venture', 'club_deal', 'mega_deal', 'platform_deal'
  )),
  target_capital_usd NUMERIC(16,2) DEFAULT 0,
  minimum_ticket_usd NUMERIC(14,2) DEFAULT 0,
  expected_irr_pct NUMERIC(5,2) DEFAULT 0,
  expected_multiple NUMERIC(4,2) DEFAULT 1.0,
  hold_period_years INTEGER DEFAULT 5,
  risk_rating TEXT CHECK (risk_rating IN ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'speculative')),
  co_investors_target INTEGER DEFAULT 0,
  co_investors_committed INTEGER DEFAULT 0,
  deal_thesis TEXT,
  market_timing_score NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'screening', 'due_diligence', 'structuring', 'fundraising', 'deployed', 'exited'
  )),
  identified_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aab_syndication_status ON public.aab_syndication_opportunities (status);
CREATE INDEX idx_aab_syndication_type ON public.aab_syndication_opportunities (syndication_type);

-- 5) Autonomous Rebalancing Protocol
CREATE TABLE public.aab_rebalance_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'district_shift', 'asset_class_reweight', 'exit_timing', 'entry_timing',
    'concentration_breach', 'risk_limit_trigger', 'opportunity_rotation'
  )),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  urgency TEXT NOT NULL CHECK (urgency IN ('immediate', 'this_week', 'this_month', 'next_quarter')),
  current_allocation_pct NUMERIC(5,2) DEFAULT 0,
  recommended_allocation_pct NUMERIC(5,2) DEFAULT 0,
  allocation_delta_pct NUMERIC(6,2) DEFAULT 0,
  trigger_reason TEXT NOT NULL,
  action_recommendation TEXT,
  risk_if_ignored TEXT,
  confidence NUMERIC(4,2) DEFAULT 0.5,
  is_executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aab_rebalance_urgency ON public.aab_rebalance_signals (urgency);
CREATE INDEX idx_aab_rebalance_type ON public.aab_rebalance_signals (signal_type);

-- 6) RLS
ALTER TABLE public.aab_capital_rotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aab_yield_optimizer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aab_portfolio_gravity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aab_syndication_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aab_rebalance_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read capital rotation" ON public.aab_capital_rotation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read yield optimizer" ON public.aab_yield_optimizer FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read portfolio gravity" ON public.aab_portfolio_gravity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read syndication" ON public.aab_syndication_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read rebalance signals" ON public.aab_rebalance_signals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service manage capital rotation" ON public.aab_capital_rotation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage yield optimizer" ON public.aab_yield_optimizer FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage portfolio gravity" ON public.aab_portfolio_gravity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage syndication" ON public.aab_syndication_opportunities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage rebalance signals" ON public.aab_rebalance_signals FOR ALL USING (true) WITH CHECK (true);

-- 7) Trigger: emit critical rebalance signal
CREATE OR REPLACE FUNCTION public.trg_aab_critical_rebalance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.urgency = 'immediate' AND ABS(NEW.allocation_delta_pct) >= 5 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'aab_critical_rebalance',
      'allocation_brain',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'signal_type', NEW.signal_type,
        'city', NEW.city,
        'district', NEW.district,
        'urgency', NEW.urgency,
        'allocation_delta_pct', NEW.allocation_delta_pct,
        'trigger_reason', NEW.trigger_reason
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_aab_rebalance_critical
  AFTER INSERT ON public.aab_rebalance_signals
  FOR EACH ROW EXECUTE FUNCTION public.trg_aab_critical_rebalance();
