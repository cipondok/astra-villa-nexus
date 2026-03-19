
-- ══════════════════════════════════════════════════════
-- HUMAN-AI WEALTH CO-EVOLUTION (HAWCE)
-- ══════════════════════════════════════════════════════

-- 1️⃣ Augmented Investor Intelligence
CREATE TABLE public.hawce_augmented_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  decision_clarity_score NUMERIC DEFAULT 50,
  risk_perception_accuracy NUMERIC DEFAULT 50,
  opportunity_discovery_speed NUMERIC DEFAULT 50,
  augmentation_level TEXT DEFAULT 'assisted',
  human_agency_preserved BOOLEAN DEFAULT true,
  ai_suggestions_accepted INTEGER DEFAULT 0,
  ai_suggestions_rejected INTEGER DEFAULT 0,
  override_rate NUMERIC DEFAULT 0,
  augmentation_composite NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2️⃣ Adaptive Trust Architecture
CREATE TABLE public.hawce_trust_architecture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  trust_level TEXT DEFAULT 'cautious',
  transparency_score NUMERIC DEFAULT 50,
  confidence_calibration NUMERIC DEFAULT 50,
  automation_adoption_stage TEXT DEFAULT 'manual',
  ai_reasoning_visibility NUMERIC DEFAULT 50,
  explainability_requests INTEGER DEFAULT 0,
  trust_building_events INTEGER DEFAULT 0,
  trust_erosion_events INTEGER DEFAULT 0,
  progressive_delegation_pct NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3️⃣ Collective Wealth Intelligence Network
CREATE TABLE public.hawce_collective_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_size INTEGER DEFAULT 0,
  behaviors_ingested INTEGER DEFAULT 0,
  opportunity_matching_precision NUMERIC DEFAULT 50,
  network_effect_multiplier NUMERIC DEFAULT 1.0,
  investment_outcome_improvement NUMERIC DEFAULT 0,
  graph_density NUMERIC DEFAULT 0,
  signal_to_noise_ratio NUMERIC DEFAULT 0,
  compounding_epoch INTEGER DEFAULT 1,
  intelligence_tier TEXT DEFAULT 'emerging',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4️⃣ Skill Evolution Pathways
CREATE TABLE public.hawce_skill_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  literacy_score NUMERIC DEFAULT 30,
  investing_stage TEXT DEFAULT 'reactive',
  insights_consumed INTEGER DEFAULT 0,
  coaching_sessions INTEGER DEFAULT 0,
  skill_growth_rate NUMERIC DEFAULT 0,
  portfolio_complexity_level TEXT DEFAULT 'basic',
  strategic_maturity_index NUMERIC DEFAULT 0,
  milestone_achieved TEXT,
  evolution_path JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5️⃣ Co-Evolution Flywheel
CREATE TABLE public.hawce_coevolution_flywheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT NOT NULL,
  capital_productivity_gain NUMERIC DEFAULT 0,
  systemic_risk_reduction NUMERIC DEFAULT 0,
  wealth_inclusivity_index NUMERIC DEFAULT 50,
  human_ai_synergy_score NUMERIC DEFAULT 0,
  flywheel_velocity NUMERIC DEFAULT 0,
  collaboration_depth TEXT DEFAULT 'surface',
  cumulative_wealth_impact_usd NUMERIC DEFAULT 0,
  participation_growth_pct NUMERIC DEFAULT 0,
  decade_span TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_hawce_aug_investor ON public.hawce_augmented_intelligence(investor_id);
CREATE INDEX idx_hawce_trust_investor ON public.hawce_trust_architecture(investor_id);
CREATE INDEX idx_hawce_collective_epoch ON public.hawce_collective_intelligence(compounding_epoch);
CREATE INDEX idx_hawce_skill_investor ON public.hawce_skill_evolution(investor_id);
CREATE INDEX idx_hawce_flywheel_cycle ON public.hawce_coevolution_flywheel(cycle_id);

-- Trigger: emit signal on co-evolution milestone
CREATE OR REPLACE FUNCTION public.fn_hawce_synergy_milestone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.human_ai_synergy_score >= 80 AND NEW.flywheel_velocity >= 70 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'hawce_synergy_milestone',
      'hawce_coevolution_flywheel',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'cycle_id', NEW.cycle_id,
        'synergy', NEW.human_ai_synergy_score,
        'velocity', NEW.flywheel_velocity,
        'depth', NEW.collaboration_depth
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hawce_synergy_milestone
AFTER INSERT OR UPDATE ON public.hawce_coevolution_flywheel
FOR EACH ROW EXECUTE FUNCTION public.fn_hawce_synergy_milestone();

-- RLS
ALTER TABLE public.hawce_augmented_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hawce_trust_architecture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hawce_collective_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hawce_skill_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hawce_coevolution_flywheel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read hawce_augmented_intelligence" ON public.hawce_augmented_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read hawce_trust_architecture" ON public.hawce_trust_architecture FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read hawce_collective_intelligence" ON public.hawce_collective_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read hawce_skill_evolution" ON public.hawce_skill_evolution FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read hawce_coevolution_flywheel" ON public.hawce_coevolution_flywheel FOR SELECT TO authenticated USING (true);
