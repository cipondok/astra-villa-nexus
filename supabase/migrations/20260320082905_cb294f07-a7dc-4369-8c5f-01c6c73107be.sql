
-- ═══════════════════════════════════════════════════════════════
-- PESA: Planetary Economic Stability Architecture
-- ═══════════════════════════════════════════════════════════════

-- 1️⃣ Macro Volatility Early-Signal Layer
CREATE TABLE public.pesa_volatility_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  signal_type TEXT NOT NULL DEFAULT 'overheating',
  overheating_index NUMERIC DEFAULT 0,
  supply_imbalance_score NUMERIC DEFAULT 0,
  capital_withdrawal_risk NUMERIC DEFAULT 0,
  price_acceleration_pct NUMERIC DEFAULT 0,
  credit_growth_ratio NUMERIC DEFAULT 0,
  speculative_activity_index NUMERIC DEFAULT 0,
  signal_severity TEXT DEFAULT 'normal',
  signal_confidence NUMERIC DEFAULT 0,
  early_warning_lead_months INT DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pesa_volatility_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pesa_volatility_signals" ON public.pesa_volatility_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert pesa_volatility_signals" ON public.pesa_volatility_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_pesa_vol_severity ON public.pesa_volatility_signals(signal_severity);
CREATE INDEX idx_pesa_vol_city ON public.pesa_volatility_signals(city);

-- 2️⃣ Coordinated Investment Flow Framework
CREATE TABLE public.pesa_investment_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_region TEXT NOT NULL,
  target_region TEXT NOT NULL,
  flow_type TEXT DEFAULT 'development_capital',
  capital_volume_usd NUMERIC DEFAULT 0,
  concentration_risk_index NUMERIC DEFAULT 0,
  infrastructure_alignment NUMERIC DEFAULT 0,
  underdevelopment_gap_score NUMERIC DEFAULT 0,
  coordination_effectiveness NUMERIC DEFAULT 0,
  flow_health TEXT DEFAULT 'balanced',
  redirection_potential NUMERIC DEFAULT 0,
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pesa_investment_flow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pesa_investment_flow" ON public.pesa_investment_flow FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert pesa_investment_flow" ON public.pesa_investment_flow FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_pesa_flow_health ON public.pesa_investment_flow(flow_health);

-- 3️⃣ Resilience & Crisis Mitigation
CREATE TABLE public.pesa_crisis_resilience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_type TEXT NOT NULL,
  region TEXT NOT NULL,
  financial_shock_readiness NUMERIC DEFAULT 0,
  climate_migration_preparedness NUMERIC DEFAULT 0,
  demographic_shift_adaptability NUMERIC DEFAULT 0,
  response_speed_index NUMERIC DEFAULT 0,
  recovery_trajectory_score NUMERIC DEFAULT 0,
  systemic_contagion_risk NUMERIC DEFAULT 0,
  mitigation_effectiveness NUMERIC DEFAULT 0,
  resilience_composite NUMERIC DEFAULT 0,
  resilience_tier TEXT DEFAULT 'vulnerable',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pesa_crisis_resilience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pesa_crisis_resilience" ON public.pesa_crisis_resilience FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert pesa_crisis_resilience" ON public.pesa_crisis_resilience FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_pesa_resilience_tier ON public.pesa_crisis_resilience(resilience_tier);

-- 4️⃣ Inclusive Growth Alignment
CREATE TABLE public.pesa_inclusive_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  housing_accessibility_index NUMERIC DEFAULT 0,
  balanced_expansion_score NUMERIC DEFAULT 0,
  regional_economy_sustainability NUMERIC DEFAULT 0,
  affordability_ratio NUMERIC DEFAULT 0,
  social_mobility_contribution NUMERIC DEFAULT 0,
  green_development_pct NUMERIC DEFAULT 0,
  inclusivity_composite NUMERIC DEFAULT 0,
  inclusivity_tier TEXT DEFAULT 'exclusionary',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pesa_inclusive_growth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pesa_inclusive_growth" ON public.pesa_inclusive_growth FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert pesa_inclusive_growth" ON public.pesa_inclusive_growth FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_pesa_inclusivity_tier ON public.pesa_inclusive_growth(inclusivity_tier);

-- 5️⃣ Long-Horizon Stability Governance
CREATE TABLE public.pesa_stability_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governance_domain TEXT NOT NULL,
  data_stewardship_score NUMERIC DEFAULT 0,
  multi_stakeholder_collaboration NUMERIC DEFAULT 0,
  adaptive_policy_alignment NUMERIC DEFAULT 0,
  transparency_index NUMERIC DEFAULT 0,
  accountability_mechanisms NUMERIC DEFAULT 0,
  institutional_trust_score NUMERIC DEFAULT 0,
  governance_composite NUMERIC DEFAULT 0,
  governance_tier TEXT DEFAULT 'nascent',
  decade_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pesa_stability_governance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read pesa_stability_governance" ON public.pesa_stability_governance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert pesa_stability_governance" ON public.pesa_stability_governance FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_pesa_governance_tier ON public.pesa_stability_governance(governance_tier);

-- Trigger: signal when volatility reaches critical severity
CREATE OR REPLACE FUNCTION notify_pesa_critical_volatility()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.signal_severity = 'critical' AND NEW.signal_confidence >= 80 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('pesa_critical_volatility', 'pesa_volatility_signals', NEW.id, 'critical',
      json_build_object('city', NEW.city, 'type', NEW.signal_type, 'confidence', NEW.signal_confidence, 'severity', NEW.signal_severity)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pesa_critical_volatility
AFTER INSERT OR UPDATE ON public.pesa_volatility_signals
FOR EACH ROW EXECUTE FUNCTION notify_pesa_critical_volatility();
