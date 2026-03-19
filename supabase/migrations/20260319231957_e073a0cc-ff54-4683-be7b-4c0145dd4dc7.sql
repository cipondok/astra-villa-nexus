
-- ══════════════════════════════════════════════════════
-- AI FOUNDER IMMORTALITY BUSINESS ARCHITECTURE (AFIBA)
-- ══════════════════════════════════════════════════════

-- 1️⃣ Founder Intelligence Capture Layer
CREATE TABLE public.afiba_intelligence_capture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_type TEXT NOT NULL DEFAULT 'decision_pattern',
  domain TEXT NOT NULL DEFAULT 'strategy',
  decision_pattern JSONB DEFAULT '{}',
  risk_appetite_calibration NUMERIC DEFAULT 50,
  market_interpretation JSONB DEFAULT '{}',
  innovation_heuristic TEXT,
  confidence_level NUMERIC DEFAULT 0,
  source_context TEXT,
  encoding_version TEXT DEFAULT 'v1.0',
  is_active BOOLEAN DEFAULT true,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2️⃣ Strategic Memory Engine
CREATE TABLE public.afiba_strategic_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_type TEXT NOT NULL DEFAULT 'deal_outcome',
  knowledge_domain TEXT NOT NULL DEFAULT 'investment',
  memory_content JSONB DEFAULT '{}',
  compounding_factor NUMERIC DEFAULT 1.0,
  institutional_relevance_score NUMERIC DEFAULT 50,
  deal_outcomes_linked INTEGER DEFAULT 0,
  decade_span TEXT,
  strategic_advantage_index NUMERIC DEFAULT 0,
  retrieval_frequency INTEGER DEFAULT 0,
  last_retrieved_at TIMESTAMPTZ,
  memory_epoch INTEGER DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3️⃣ Autonomous Leadership Simulation
CREATE TABLE public.afiba_leadership_simulation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_type TEXT NOT NULL DEFAULT 'scenario_planning',
  scenario_description TEXT,
  crisis_severity NUMERIC DEFAULT 0,
  capital_allocation_judgment JSONB DEFAULT '{}',
  founder_ethos_alignment NUMERIC DEFAULT 0,
  decision_output JSONB DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  alternative_paths INTEGER DEFAULT 0,
  selected_path_rationale TEXT,
  simulation_outcome TEXT DEFAULT 'pending',
  validated_by_governance BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4️⃣ Vision Evolution Protocol
CREATE TABLE public.afiba_vision_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evolution_trigger TEXT NOT NULL DEFAULT 'market_shift',
  market_reality JSONB DEFAULT '{}',
  tech_breakthrough JSONB DEFAULT '{}',
  societal_shift JSONB DEFAULT '{}',
  intelligence_refinement JSONB DEFAULT '{}',
  vision_drift_score NUMERIC DEFAULT 0,
  alignment_with_original NUMERIC DEFAULT 100,
  evolution_epoch INTEGER DEFAULT 1,
  approved_by_governance BOOLEAN DEFAULT false,
  evolution_magnitude TEXT DEFAULT 'minor',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5️⃣ Legacy Continuity Governance
CREATE TABLE public.afiba_legacy_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governance_type TEXT NOT NULL DEFAULT 'ethical_review',
  ethical_alignment_score NUMERIC DEFAULT 100,
  strategic_consistency_score NUMERIC DEFAULT 100,
  evolution_control_status TEXT DEFAULT 'within_bounds',
  override_required BOOLEAN DEFAULT false,
  override_reason TEXT,
  guardian_council_approval BOOLEAN DEFAULT false,
  risk_of_drift TEXT DEFAULT 'low',
  corrective_action JSONB DEFAULT '{}',
  audit_trail JSONB DEFAULT '[]',
  review_period TEXT DEFAULT 'quarterly',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_afiba_capture_type ON public.afiba_intelligence_capture(capture_type);
CREATE INDEX idx_afiba_capture_active ON public.afiba_intelligence_capture(is_active);
CREATE INDEX idx_afiba_memory_domain ON public.afiba_strategic_memory(knowledge_domain);
CREATE INDEX idx_afiba_memory_relevance ON public.afiba_strategic_memory(institutional_relevance_score DESC);
CREATE INDEX idx_afiba_sim_type ON public.afiba_leadership_simulation(simulation_type);
CREATE INDEX idx_afiba_vision_epoch ON public.afiba_vision_evolution(evolution_epoch);
CREATE INDEX idx_afiba_gov_type ON public.afiba_legacy_governance(governance_type);

-- Trigger: emit signal on critical governance override
CREATE OR REPLACE FUNCTION public.fn_afiba_governance_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.override_required = true AND NEW.ethical_alignment_score < 60 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'afiba_governance_override',
      'afiba_legacy_governance',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'governance_type', NEW.governance_type,
        'ethical_score', NEW.ethical_alignment_score,
        'drift_risk', NEW.risk_of_drift
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_afiba_governance_alert
AFTER INSERT OR UPDATE ON public.afiba_legacy_governance
FOR EACH ROW EXECUTE FUNCTION public.fn_afiba_governance_alert();

-- RLS
ALTER TABLE public.afiba_intelligence_capture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afiba_strategic_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afiba_leadership_simulation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afiba_vision_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afiba_legacy_governance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read afiba_intelligence_capture" ON public.afiba_intelligence_capture FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read afiba_strategic_memory" ON public.afiba_strategic_memory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read afiba_leadership_simulation" ON public.afiba_leadership_simulation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read afiba_vision_evolution" ON public.afiba_vision_evolution FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read afiba_legacy_governance" ON public.afiba_legacy_governance FOR SELECT TO authenticated USING (true);
