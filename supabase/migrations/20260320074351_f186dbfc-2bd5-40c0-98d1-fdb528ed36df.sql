
-- ============================================================
-- ULTIMATE MARKET TIMING & CRISIS STRATEGY (UMTCS) SCHEMA
-- ============================================================

-- 1) Cycle Detection Intelligence
CREATE TABLE public.umtcs_cycle_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  district TEXT,
  liquidity_slowdown_index NUMERIC,
  inventory_accumulation_rate NUMERIC,
  financing_cost_trend NUMERIC,
  investor_sentiment_score NUMERIC,
  cycle_phase TEXT DEFAULT 'expansion',
  phase_confidence NUMERIC,
  transition_probability NUMERIC,
  months_to_inflection INTEGER,
  leading_indicators JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Defensive Stability Strategy
CREATE TABLE public.umtcs_defensive_stability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_domain TEXT NOT NULL,
  activation_trigger TEXT,
  distressed_opportunity_count INTEGER DEFAULT 0,
  risk_analytics_adoption_pct NUMERIC,
  vendor_diversification_index NUMERIC,
  platform_resilience_score NUMERIC,
  churn_mitigation_effectiveness NUMERIC,
  revenue_stability_pct NUMERIC,
  defensive_actions JSONB,
  is_activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Counter-Cyclical Growth Engine
CREATE TABLE public.umtcs_countercyclical_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  market_share_gain_pct NUMERIC,
  institutional_inflow_usd NUMERIC,
  discounted_asset_volume INTEGER DEFAULT 0,
  competitor_retrenchment_score NUMERIC,
  data_acquisition_acceleration NUMERIC,
  talent_acquisition_index NUMERIC,
  growth_during_contraction_pct NUMERIC,
  strategic_investments JSONB,
  cycle_phase TEXT DEFAULT 'contraction',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Recovery Acceleration Playbook
CREATE TABLE public.umtcs_recovery_acceleration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  liquidity_activation_speed NUMERIC,
  hotspot_detection_lead_days INTEGER,
  expansion_sequence_rank INTEGER,
  early_mover_advantage_score NUMERIC,
  recovery_signal_strength NUMERIC,
  capital_redeployment_readiness NUMERIC,
  recovery_phase TEXT DEFAULT 'pre_recovery',
  playbook_actions JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Long-Term Market Timing Advantage
CREATE TABLE public.umtcs_timing_advantage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advantage_domain TEXT NOT NULL,
  historical_data_depth_years NUMERIC,
  predictive_accuracy_pct NUMERIC,
  accuracy_improvement_rate NUMERIC,
  investor_trust_index NUMERIC,
  strategic_positioning_score NUMERIC,
  cycles_modeled INTEGER DEFAULT 0,
  competitive_timing_gap_months NUMERIC,
  data_moat_strength NUMERIC,
  compounding_intelligence_factor NUMERIC,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_umtcs_cycle_city ON public.umtcs_cycle_detection(city, cycle_phase, detected_at DESC);
CREATE INDEX idx_umtcs_defensive_domain ON public.umtcs_defensive_stability(strategy_domain, is_activated);
CREATE INDEX idx_umtcs_counter_city ON public.umtcs_countercyclical_growth(city, cycle_phase);
CREATE INDEX idx_umtcs_recovery_city ON public.umtcs_recovery_acceleration(city, recovery_phase);
CREATE INDEX idx_umtcs_timing_domain ON public.umtcs_timing_advantage(advantage_domain, computed_at DESC);

-- RLS
ALTER TABLE public.umtcs_cycle_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umtcs_defensive_stability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umtcs_countercyclical_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umtcs_recovery_acceleration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umtcs_timing_advantage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read umtcs_cycle_detection" ON public.umtcs_cycle_detection FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read umtcs_defensive_stability" ON public.umtcs_defensive_stability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read umtcs_countercyclical_growth" ON public.umtcs_countercyclical_growth FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read umtcs_recovery_acceleration" ON public.umtcs_recovery_acceleration FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read umtcs_timing_advantage" ON public.umtcs_timing_advantage FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert umtcs_cycle_detection" ON public.umtcs_cycle_detection FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert umtcs_defensive_stability" ON public.umtcs_defensive_stability FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert umtcs_countercyclical_growth" ON public.umtcs_countercyclical_growth FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert umtcs_recovery_acceleration" ON public.umtcs_recovery_acceleration FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert umtcs_timing_advantage" ON public.umtcs_timing_advantage FOR INSERT TO service_role WITH CHECK (true);

-- Trigger: emit signal on cycle phase transition
CREATE OR REPLACE FUNCTION public.trg_umtcs_cycle_transition() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transition_probability > 0.75 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('umtcs_cycle_inflection', 'market_cycle', NEW.id, 'critical',
      jsonb_build_object('city', NEW.city, 'phase', NEW.cycle_phase, 'transition_prob', NEW.transition_probability, 'months_to_inflection', NEW.months_to_inflection));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_umtcs_cycle_transition
  AFTER INSERT OR UPDATE ON public.umtcs_cycle_detection
  FOR EACH ROW EXECUTE FUNCTION public.trg_umtcs_cycle_transition();
