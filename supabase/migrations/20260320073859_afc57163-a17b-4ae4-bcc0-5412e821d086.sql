
-- ============================================================
-- AI-DRIVEN CAPITAL EMPIRE CONTROL MODEL (ACECM) SCHEMA
-- ============================================================

-- 1) Capital Signal Aggregation
CREATE TABLE public.acecm_capital_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  district TEXT,
  signal_type TEXT NOT NULL DEFAULT 'composite',
  transaction_velocity NUMERIC,
  pricing_momentum NUMERIC,
  liquidity_concentration NUMERIC,
  investor_behavioral_score NUMERIC,
  composite_signal_strength NUMERIC,
  signal_trend TEXT DEFAULT 'stable',
  data_points_consumed INTEGER DEFAULT 0,
  signal_confidence NUMERIC,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Opportunity Gravity Engine
CREATE TABLE public.acecm_opportunity_gravity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  district TEXT,
  gravity_score NUMERIC,
  investor_attention_index NUMERIC,
  ai_recommendation_influence NUMERIC,
  deal_flow_visibility NUMERIC,
  capital_attraction_rate NUMERIC,
  disproportionate_share_pct NUMERIC,
  competing_markets INTEGER DEFAULT 0,
  gravity_tier TEXT DEFAULT 'emerging',
  gravity_trend TEXT DEFAULT 'ascending',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Institutional Decision Influence Layer
CREATE TABLE public.acecm_institutional_influence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_segment TEXT NOT NULL,
  institution_name TEXT,
  integration_depth TEXT DEFAULT 'awareness',
  underwriting_adoption_pct NUMERIC,
  pipeline_reliance_score NUMERIC,
  risk_diversification_impact NUMERIC,
  data_dependency_score NUMERIC,
  decision_influence_index NUMERIC,
  deals_influenced INTEGER DEFAULT 0,
  capital_influenced_usd NUMERIC,
  adoption_stage TEXT DEFAULT 'evaluation',
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Capital Concentration Feedback Loop
CREATE TABLE public.acecm_capital_feedback_loop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  loop_stage TEXT NOT NULL DEFAULT 'seed_capital',
  capital_inflow_usd NUMERIC,
  transaction_activity_index NUMERIC,
  data_signal_strength NUMERIC,
  new_capital_attracted_usd NUMERIC,
  loop_velocity NUMERIC,
  amplification_factor NUMERIC DEFAULT 1.0,
  loop_iterations INTEGER DEFAULT 0,
  is_self_sustaining BOOLEAN DEFAULT false,
  feedback_health TEXT DEFAULT 'building',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Governance & Risk Awareness
CREATE TABLE public.acecm_governance_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governance_domain TEXT NOT NULL,
  market_stability_score NUMERIC,
  transparency_index NUMERIC,
  regulatory_engagement_level TEXT DEFAULT 'monitoring',
  responsible_deployment_score NUMERIC,
  concentration_risk_flag BOOLEAN DEFAULT false,
  systemic_impact_assessment TEXT,
  ethical_compliance_pct NUMERIC,
  risk_mitigation_actions JSONB,
  regulatory_jurisdictions TEXT[] DEFAULT '{}',
  last_audit_at TIMESTAMPTZ,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_acecm_signals_city ON public.acecm_capital_signals(city, computed_at DESC);
CREATE INDEX idx_acecm_gravity_city ON public.acecm_opportunity_gravity(city, gravity_score DESC);
CREATE INDEX idx_acecm_influence_segment ON public.acecm_institutional_influence(institution_segment, adoption_stage);
CREATE INDEX idx_acecm_feedback_city ON public.acecm_capital_feedback_loop(city, loop_stage);
CREATE INDEX idx_acecm_governance_domain ON public.acecm_governance_risk(governance_domain, assessed_at DESC);

-- RLS
ALTER TABLE public.acecm_capital_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acecm_opportunity_gravity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acecm_institutional_influence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acecm_capital_feedback_loop ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acecm_governance_risk ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read acecm_capital_signals" ON public.acecm_capital_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read acecm_opportunity_gravity" ON public.acecm_opportunity_gravity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read acecm_institutional_influence" ON public.acecm_institutional_influence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read acecm_capital_feedback_loop" ON public.acecm_capital_feedback_loop FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read acecm_governance_risk" ON public.acecm_governance_risk FOR SELECT TO authenticated USING (true);

-- Service role insert policies
CREATE POLICY "Service insert acecm_capital_signals" ON public.acecm_capital_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert acecm_opportunity_gravity" ON public.acecm_opportunity_gravity FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert acecm_institutional_influence" ON public.acecm_institutional_influence FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert acecm_capital_feedback_loop" ON public.acecm_capital_feedback_loop FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert acecm_governance_risk" ON public.acecm_governance_risk FOR INSERT TO service_role WITH CHECK (true);

-- Trigger: emit signal when feedback loop becomes self-sustaining
CREATE OR REPLACE FUNCTION public.trg_acecm_self_sustaining() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_self_sustaining = true AND (OLD IS NULL OR OLD.is_self_sustaining = false) THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('acecm_self_sustaining_loop', 'capital_feedback', NEW.id, 'critical',
      jsonb_build_object('city', NEW.city, 'loop_velocity', NEW.loop_velocity, 'amplification', NEW.amplification_factor));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_acecm_self_sustaining
  AFTER INSERT OR UPDATE ON public.acecm_capital_feedback_loop
  FOR EACH ROW EXECUTE FUNCTION public.trg_acecm_self_sustaining();
