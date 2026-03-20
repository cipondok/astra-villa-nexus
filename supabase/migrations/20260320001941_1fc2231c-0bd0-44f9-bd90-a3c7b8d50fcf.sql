
-- =====================================================
-- AUTONOMOUS MULTI-ASSET ECONOMIC NERVOUS SYSTEM (AMENS)
-- =====================================================

-- 1. Cross-Asset Correlation Intelligence
CREATE TABLE public.amens_cross_asset_correlation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Global',
  city TEXT,
  re_equity_correlation NUMERIC(5,4) DEFAULT 0,
  re_bond_correlation NUMERIC(5,4) DEFAULT 0,
  re_commodity_correlation NUMERIC(5,4) DEFAULT 0,
  re_infrastructure_correlation NUMERIC(5,4) DEFAULT 0,
  interest_rate_sensitivity NUMERIC(5,2) DEFAULT 0,
  commodity_growth_impact NUMERIC(5,2) DEFAULT 0,
  equity_cycle_phase TEXT DEFAULT 'mid_cycle',
  bond_yield_spread NUMERIC(6,3) DEFAULT 0,
  correlation_regime TEXT DEFAULT 'normal',
  regime_stability_pct NUMERIC(5,2) DEFAULT 50,
  decorrelation_opportunity NUMERIC(5,2) DEFAULT 0,
  analysis_window_months INT DEFAULT 36,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Portfolio Resilience Optimization Engine
CREATE TABLE public.amens_portfolio_resilience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  re_allocation_pct NUMERIC(5,2) DEFAULT 0,
  equity_allocation_pct NUMERIC(5,2) DEFAULT 0,
  bond_allocation_pct NUMERIC(5,2) DEFAULT 0,
  commodity_allocation_pct NUMERIC(5,2) DEFAULT 0,
  infra_allocation_pct NUMERIC(5,2) DEFAULT 0,
  cash_allocation_pct NUMERIC(5,2) DEFAULT 0,
  diversification_benefit_pct NUMERIC(6,2) DEFAULT 0,
  volatility_spillover_risk NUMERIC(5,2) DEFAULT 0,
  portfolio_sharpe_ratio NUMERIC(5,3) DEFAULT 0,
  max_drawdown_pct NUMERIC(5,2) DEFAULT 0,
  stress_resilience_score NUMERIC(5,2) DEFAULT 0,
  optimal_re_weight_pct NUMERIC(5,2) DEFAULT 0,
  rebalance_urgency TEXT DEFAULT 'low',
  simulation_assumptions JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Capital Rotation Signal Detection
CREATE TABLE public.amens_capital_rotation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Global',
  rotation_direction TEXT DEFAULT 'neutral',
  financial_to_hard_asset_flow NUMERIC(5,2) DEFAULT 0,
  safe_haven_migration_score NUMERIC(5,2) DEFAULT 0,
  yield_seeking_intensity NUMERIC(5,2) DEFAULT 0,
  macro_phase TEXT DEFAULT 'expansion',
  re_inflow_momentum NUMERIC(5,2) DEFAULT 0,
  equity_outflow_signal NUMERIC(5,2) DEFAULT 0,
  bond_rotation_signal NUMERIC(5,2) DEFAULT 0,
  commodity_cycle_signal NUMERIC(5,2) DEFAULT 0,
  rotation_confidence NUMERIC(5,2) DEFAULT 0,
  rotation_velocity NUMERIC(6,3) DEFAULT 0,
  trigger_factors JSONB DEFAULT '[]',
  actionable_insight TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Integrated Economic Cycle Dashboard
CREATE TABLE public.amens_economic_cycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Global',
  gdp_growth_trend NUMERIC(5,2) DEFAULT 0,
  inflation_rate NUMERIC(5,2) DEFAULT 0,
  central_bank_rate NUMERIC(5,2) DEFAULT 0,
  unemployment_trend NUMERIC(5,2) DEFAULT 0,
  consumer_confidence NUMERIC(5,2) DEFAULT 50,
  pmi_manufacturing NUMERIC(5,2) DEFAULT 50,
  credit_conditions_index NUMERIC(5,2) DEFAULT 50,
  cycle_phase TEXT DEFAULT 'mid_cycle',
  phase_maturity_pct NUMERIC(5,2) DEFAULT 50,
  sync_score NUMERIC(5,2) DEFAULT 0,
  expansion_contraction_signal TEXT DEFAULT 'neutral',
  strategic_allocation_bias TEXT DEFAULT 'balanced',
  macro_indicators JSONB DEFAULT '{}',
  forecast_horizon_months INT DEFAULT 12,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Adaptive Strategy Feedback Loop
CREATE TABLE public.amens_strategy_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_name TEXT NOT NULL,
  prediction_accuracy_pct NUMERIC(5,2) DEFAULT 0,
  allocation_outcome_vs_benchmark NUMERIC(6,2) DEFAULT 0,
  behavioral_pattern_detected TEXT,
  learning_iteration INT DEFAULT 0,
  model_confidence_delta NUMERIC(5,2) DEFAULT 0,
  weight_adjustments JSONB DEFAULT '{}',
  performance_attribution JSONB DEFAULT '{}',
  investor_behavior_cluster TEXT,
  recommendation_hit_rate NUMERIC(5,2) DEFAULT 0,
  feedback_strength NUMERIC(5,2) DEFAULT 0,
  next_recalibration_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.amens_cross_asset_correlation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amens_portfolio_resilience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amens_capital_rotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amens_economic_cycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amens_strategy_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read amens_cross_asset_correlation" ON public.amens_cross_asset_correlation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read amens_portfolio_resilience" ON public.amens_portfolio_resilience FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read amens_capital_rotation" ON public.amens_capital_rotation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read amens_economic_cycle" ON public.amens_economic_cycle FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read amens_strategy_feedback" ON public.amens_strategy_feedback FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service write amens_cross_asset_correlation" ON public.amens_cross_asset_correlation FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd amens_cross_asset_correlation" ON public.amens_cross_asset_correlation FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write amens_portfolio_resilience" ON public.amens_portfolio_resilience FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd amens_portfolio_resilience" ON public.amens_portfolio_resilience FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write amens_capital_rotation" ON public.amens_capital_rotation FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd amens_capital_rotation" ON public.amens_capital_rotation FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write amens_economic_cycle" ON public.amens_economic_cycle FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd amens_economic_cycle" ON public.amens_economic_cycle FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write amens_strategy_feedback" ON public.amens_strategy_feedback FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd amens_strategy_feedback" ON public.amens_strategy_feedback FOR UPDATE TO service_role USING (true);

-- Indexes
CREATE INDEX idx_amens_corr_regime ON public.amens_cross_asset_correlation(correlation_regime, decorrelation_opportunity DESC);
CREATE INDEX idx_amens_resilience_sharpe ON public.amens_portfolio_resilience(portfolio_sharpe_ratio DESC);
CREATE INDEX idx_amens_rotation_confidence ON public.amens_capital_rotation(rotation_confidence DESC);
CREATE INDEX idx_amens_cycle_phase ON public.amens_economic_cycle(cycle_phase, phase_maturity_pct DESC);
CREATE INDEX idx_amens_feedback_accuracy ON public.amens_strategy_feedback(prediction_accuracy_pct DESC);

-- Trigger: emit signal on significant capital rotation detection
CREATE OR REPLACE FUNCTION public.amens_rotation_detected()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rotation_confidence >= 75 AND NEW.rotation_direction IN ('financial_to_hard', 'safe_haven') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'amens_capital_rotation_alert',
      'amens_rotation',
      NEW.id::text,
      'high',
      jsonb_build_object(
        'region', NEW.region,
        'direction', NEW.rotation_direction,
        'confidence', NEW.rotation_confidence,
        'macro_phase', NEW.macro_phase,
        're_inflow', NEW.re_inflow_momentum,
        'insight', NEW.actionable_insight
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_amens_rotation_detected
AFTER INSERT OR UPDATE ON public.amens_capital_rotation
FOR EACH ROW EXECUTE FUNCTION public.amens_rotation_detected();
