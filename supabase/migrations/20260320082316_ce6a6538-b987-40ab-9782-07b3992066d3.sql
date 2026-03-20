
-- ═══════════════════════════════════════════════════════════════
-- AHCSS: AI-Human Capital Symbiosis Strategy
-- ═══════════════════════════════════════════════════════════════

-- 1️⃣ Decision Augmentation Architecture
CREATE TABLE public.ahcss_decision_augmentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  augmentation_domain TEXT NOT NULL,
  opportunity_discovery_lift NUMERIC DEFAULT 0,
  risk_pattern_detection_accuracy NUMERIC DEFAULT 0,
  scenario_simulation_depth INT DEFAULT 0,
  ai_confidence_score NUMERIC DEFAULT 0,
  human_override_rate NUMERIC DEFAULT 0,
  override_quality_delta NUMERIC DEFAULT 0,
  decision_speed_multiplier NUMERIC DEFAULT 1,
  false_positive_rate NUMERIC DEFAULT 0,
  augmentation_composite NUMERIC DEFAULT 0,
  augmentation_tier TEXT DEFAULT 'basic',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ahcss_decision_augmentation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read ahcss_decision_augmentation" ON public.ahcss_decision_augmentation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ahcss_decision_augmentation" ON public.ahcss_decision_augmentation FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_ahcss_aug_tier ON public.ahcss_decision_augmentation(augmentation_tier);

-- 2️⃣ Human Strategic Oversight Layer
CREATE TABLE public.ahcss_human_oversight (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oversight_domain TEXT NOT NULL,
  ethical_governance_score NUMERIC DEFAULT 0,
  vision_setting_clarity NUMERIC DEFAULT 0,
  stakeholder_negotiation_skill NUMERIC DEFAULT 0,
  contextual_judgment_index NUMERIC DEFAULT 0,
  ai_delegation_readiness NUMERIC DEFAULT 0,
  intervention_effectiveness NUMERIC DEFAULT 0,
  oversight_composite NUMERIC DEFAULT 0,
  oversight_tier TEXT DEFAULT 'operational',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ahcss_human_oversight ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read ahcss_human_oversight" ON public.ahcss_human_oversight FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ahcss_human_oversight" ON public.ahcss_human_oversight FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_ahcss_oversight_tier ON public.ahcss_human_oversight(oversight_tier);

-- 3️⃣ Capital Allocation Co-Pilot Model
CREATE TABLE public.ahcss_capital_copilot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_domain TEXT NOT NULL,
  ai_proposal_accuracy NUMERIC DEFAULT 0,
  human_validation_rate NUMERIC DEFAULT 0,
  contextual_adjustment_pct NUMERIC DEFAULT 0,
  feedback_loop_iterations INT DEFAULT 0,
  refinement_velocity NUMERIC DEFAULT 0,
  allocation_efficiency_gain NUMERIC DEFAULT 0,
  risk_adjusted_return_delta NUMERIC DEFAULT 0,
  copilot_maturity_score NUMERIC DEFAULT 0,
  copilot_tier TEXT DEFAULT 'advisory',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ahcss_capital_copilot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read ahcss_capital_copilot" ON public.ahcss_capital_copilot FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ahcss_capital_copilot" ON public.ahcss_capital_copilot FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_ahcss_copilot_tier ON public.ahcss_capital_copilot(copilot_tier);

-- 4️⃣ Talent & Skill Evolution Pathways
CREATE TABLE public.ahcss_talent_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_domain TEXT NOT NULL,
  data_driven_thinking_score NUMERIC DEFAULT 0,
  ai_collaboration_fluency NUMERIC DEFAULT 0,
  cross_disciplinary_innovation NUMERIC DEFAULT 0,
  workforce_readiness_index NUMERIC DEFAULT 0,
  reskilling_velocity NUMERIC DEFAULT 0,
  talent_supply_gap NUMERIC DEFAULT 0,
  competitive_advantage_contribution NUMERIC DEFAULT 0,
  evolution_composite NUMERIC DEFAULT 0,
  evolution_tier TEXT DEFAULT 'traditional',
  generation_label TEXT DEFAULT 'current',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ahcss_talent_evolution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read ahcss_talent_evolution" ON public.ahcss_talent_evolution FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ahcss_talent_evolution" ON public.ahcss_talent_evolution FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_ahcss_talent_tier ON public.ahcss_talent_evolution(evolution_tier);

-- 5️⃣ Trust & Transparency Framework
CREATE TABLE public.ahcss_trust_transparency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_domain TEXT NOT NULL,
  explainability_score NUMERIC DEFAULT 0,
  accountability_clarity NUMERIC DEFAULT 0,
  institutional_confidence NUMERIC DEFAULT 0,
  audit_trail_completeness NUMERIC DEFAULT 0,
  bias_detection_coverage NUMERIC DEFAULT 0,
  regulatory_compliance_pct NUMERIC DEFAULT 0,
  stakeholder_satisfaction NUMERIC DEFAULT 0,
  trust_composite NUMERIC DEFAULT 0,
  trust_tier TEXT DEFAULT 'opaque',
  year_horizon INT DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ahcss_trust_transparency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read ahcss_trust_transparency" ON public.ahcss_trust_transparency FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ahcss_trust_transparency" ON public.ahcss_trust_transparency FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_ahcss_trust_tier ON public.ahcss_trust_transparency(trust_tier);

-- Trigger: signal when copilot reaches autonomous tier
CREATE OR REPLACE FUNCTION notify_ahcss_copilot_autonomous()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.copilot_tier = 'autonomous' AND NEW.copilot_maturity_score >= 85 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('ahcss_copilot_autonomous', 'ahcss_capital_copilot', NEW.id, 'high',
      json_build_object('domain', NEW.allocation_domain, 'maturity', NEW.copilot_maturity_score, 'efficiency_gain', NEW.allocation_efficiency_gain)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ahcss_copilot_autonomous
AFTER INSERT OR UPDATE ON public.ahcss_capital_copilot
FOR EACH ROW EXECUTE FUNCTION notify_ahcss_copilot_autonomous();
