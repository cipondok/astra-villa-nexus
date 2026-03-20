-- ══════════════════════════════════════════════════════════════
-- Capital Deployment Timing Engine (CDTE)
-- ══════════════════════════════════════════════════════════════

-- 1) Market Cycle Phase Detection
CREATE TABLE public.cdte_cycle_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  district text,
  cycle_phase text DEFAULT 'early_growth' CHECK (cycle_phase IN ('early_growth','expansion','peak','correction','consolidation','recovery')),
  phase_confidence numeric DEFAULT 0,
  growth_rate_pct numeric DEFAULT 0,
  valuation_multiple numeric DEFAULT 0,
  price_momentum numeric DEFAULT 0,
  volume_trend text DEFAULT 'stable' CHECK (volume_trend IN ('accelerating','stable','decelerating','contracting')),
  months_in_phase integer DEFAULT 0,
  estimated_phase_remaining integer,
  leading_indicators jsonb DEFAULT '{}'::jsonb,
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cdte_cycle_phase ON public.cdte_cycle_phases(cycle_phase, phase_confidence DESC);
ALTER TABLE public.cdte_cycle_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cdte_cycle_phases" ON public.cdte_cycle_phases FOR SELECT TO authenticated USING (true);

-- 2) Liquidity Momentum Signals
CREATE TABLE public.cdte_liquidity_momentum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  transaction_velocity numeric DEFAULT 0,
  velocity_trend text DEFAULT 'stable' CHECK (velocity_trend IN ('surging','accelerating','stable','decelerating','collapsing')),
  investor_sentiment_score numeric DEFAULT 0,
  capital_inflow_usd numeric DEFAULT 0,
  inflow_concentration_pct numeric DEFAULT 0,
  absorption_rate_pct numeric DEFAULT 0,
  days_on_market_avg numeric,
  bid_ask_spread_pct numeric DEFAULT 0,
  momentum_composite numeric DEFAULT 0,
  signal_strength text DEFAULT 'neutral' CHECK (signal_strength IN ('strong_buy','buy','neutral','caution','strong_sell')),
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cdte_momentum ON public.cdte_liquidity_momentum(momentum_composite DESC);
ALTER TABLE public.cdte_liquidity_momentum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cdte_liquidity_momentum" ON public.cdte_liquidity_momentum FOR SELECT TO authenticated USING (true);

-- 3) Strategic Investment Allocation
CREATE TABLE public.cdte_allocation_strategy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  allocation_phase text DEFAULT 'balanced' CHECK (allocation_phase IN ('aggressive_expansion','growth','balanced','defensive','opportunistic_acquisition')),
  growth_allocation_pct numeric DEFAULT 0,
  infrastructure_allocation_pct numeric DEFAULT 0,
  partnership_allocation_pct numeric DEFAULT 0,
  reserve_allocation_pct numeric DEFAULT 0,
  total_deployable_usd numeric DEFAULT 0,
  deployed_usd numeric DEFAULT 0,
  deployment_efficiency numeric DEFAULT 0,
  roi_projection_pct numeric DEFAULT 0,
  risk_tolerance text DEFAULT 'moderate' CHECK (risk_tolerance IN ('aggressive','moderate','conservative','ultra_conservative')),
  strategy_rationale text,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cdte_alloc_phase ON public.cdte_allocation_strategy(allocation_phase, deployment_efficiency DESC);
ALTER TABLE public.cdte_allocation_strategy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cdte_allocation_strategy" ON public.cdte_allocation_strategy FOR SELECT TO authenticated USING (true);

-- 4) Risk-Adjusted Growth Timing
CREATE TABLE public.cdte_growth_timing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  expansion_readiness numeric DEFAULT 0,
  downside_protection_score numeric DEFAULT 0,
  regional_sequence_rank integer DEFAULT 0,
  capital_efficiency_ratio numeric DEFAULT 0,
  risk_reward_ratio numeric DEFAULT 0,
  timing_window text DEFAULT 'hold' CHECK (timing_window IN ('deploy_now','deploy_soon','hold','reduce','exit')),
  window_confidence numeric DEFAULT 0,
  max_deployment_pct numeric DEFAULT 0,
  volatility_adjusted_return numeric DEFAULT 0,
  drawdown_risk_pct numeric DEFAULT 0,
  optimal_horizon_months integer,
  timing_factors jsonb DEFAULT '{}'::jsonb,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cdte_timing_window ON public.cdte_growth_timing(timing_window, window_confidence DESC);
ALTER TABLE public.cdte_growth_timing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cdte_growth_timing" ON public.cdte_growth_timing FOR SELECT TO authenticated USING (true);

-- 5) Feedback Learning Loop
CREATE TABLE public.cdte_feedback_loop (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id text,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  predicted_roi_pct numeric DEFAULT 0,
  actual_roi_pct numeric,
  prediction_error_pct numeric,
  timing_accuracy_score numeric DEFAULT 0,
  market_condition_at_deploy text,
  market_condition_at_outcome text,
  lessons_learned text,
  model_adjustment jsonb DEFAULT '{}'::jsonb,
  feedback_iteration integer DEFAULT 1,
  learning_velocity numeric DEFAULT 0,
  scenario_simulation jsonb DEFAULT '{}'::jsonb,
  evaluated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cdte_feedback_iter ON public.cdte_feedback_loop(feedback_iteration DESC, timing_accuracy_score DESC);
ALTER TABLE public.cdte_feedback_loop ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cdte_feedback_loop" ON public.cdte_feedback_loop FOR SELECT TO authenticated USING (true);

-- Trigger: emit signal when deploy_now window detected with high confidence
CREATE OR REPLACE FUNCTION public.fn_cdte_deploy_window()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.timing_window = 'deploy_now' AND NEW.window_confidence >= 80 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('cdte_deploy_window', 'cdte_growth_timing', NEW.id, 'high',
      jsonb_build_object('city', NEW.city, 'country', NEW.country, 'confidence', NEW.window_confidence, 'risk_reward', NEW.risk_reward_ratio));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cdte_deploy_window
AFTER INSERT OR UPDATE ON public.cdte_growth_timing
FOR EACH ROW EXECUTE FUNCTION public.fn_cdte_deploy_window();