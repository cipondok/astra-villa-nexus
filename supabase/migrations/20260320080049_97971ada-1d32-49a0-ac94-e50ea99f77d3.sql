
-- ============================================================
-- GLOBAL PROPTECH LEGACY ARCHITECTURE (GPLA) SCHEMA
-- ============================================================

-- 1) Infrastructure Permanence Layer
CREATE TABLE public.gpla_infrastructure_permanence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  infrastructure_domain TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Global',
  workflow_standardization_pct NUMERIC,
  dataset_universality_score NUMERIC,
  financial_ecosystem_depth NUMERIC,
  regulatory_compatibility_index NUMERIC,
  permanence_score NUMERIC,
  embedded_institutions INTEGER DEFAULT 0,
  api_integrations_active INTEGER DEFAULT 0,
  replacement_difficulty_years NUMERIC,
  permanence_tier TEXT DEFAULT 'establishing',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Ecosystem Generational Continuity
CREATE TABLE public.gpla_generational_continuity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  continuity_domain TEXT NOT NULL,
  developer_ecosystem_size INTEGER DEFAULT 0,
  third_party_services_count INTEGER DEFAULT 0,
  open_api_consumers INTEGER DEFAULT 0,
  industry_dependence_score NUMERIC,
  brand_trust_generation INTEGER DEFAULT 1,
  innovation_velocity NUMERIC,
  ecosystem_revenue_pct NUMERIC,
  generational_transfer_readiness NUMERIC,
  continuity_tier TEXT DEFAULT 'building',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Institutional Trust Compounding
CREATE TABLE public.gpla_trust_compounding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_type TEXT NOT NULL,
  institution_name TEXT,
  trust_depth_score NUMERIC,
  reliance_duration_years NUMERIC,
  aum_allocated_via_platform NUMERIC,
  crossborder_credibility NUMERIC,
  trust_compounding_rate NUMERIC,
  trust_vintage_years NUMERIC DEFAULT 0,
  cumulative_trust_index NUMERIC,
  dependency_irreversibility NUMERIC,
  trust_tier TEXT DEFAULT 'emerging',
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Market Reference Standard
CREATE TABLE public.gpla_reference_standard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_domain TEXT NOT NULL,
  adoption_regions INTEGER DEFAULT 0,
  citation_frequency INTEGER DEFAULT 0,
  benchmark_authority_score NUMERIC,
  urban_planning_adoption_pct NUMERIC,
  capital_deployment_reliance NUMERIC,
  competitor_reference_gap NUMERIC,
  regulatory_endorsement_count INTEGER DEFAULT 0,
  media_authority_index NUMERIC,
  standard_maturity TEXT DEFAULT 'emerging',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Legacy Governance & Stewardship
CREATE TABLE public.gpla_legacy_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governance_mechanism TEXT NOT NULL,
  mission_anchor_strength NUMERIC,
  innovation_mandate_horizon_years INTEGER DEFAULT 25,
  strategic_independence_score NUMERIC,
  founder_transition_readiness NUMERIC,
  stewardship_council_size INTEGER DEFAULT 0,
  charter_amendment_difficulty NUMERIC,
  long_horizon_capital_pct NUMERIC,
  governance_resilience_score NUMERIC,
  governance_maturity TEXT DEFAULT 'founding',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gpla_infra_domain ON public.gpla_infrastructure_permanence(infrastructure_domain, region);
CREATE INDEX idx_gpla_continuity_domain ON public.gpla_generational_continuity(continuity_domain, computed_at DESC);
CREATE INDEX idx_gpla_trust_type ON public.gpla_trust_compounding(institution_type, trust_tier);
CREATE INDEX idx_gpla_standard_domain ON public.gpla_reference_standard(standard_domain, assessed_at DESC);
CREATE INDEX idx_gpla_governance_mech ON public.gpla_legacy_governance(governance_mechanism, assessed_at DESC);

-- RLS
ALTER TABLE public.gpla_infrastructure_permanence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpla_generational_continuity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpla_trust_compounding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpla_reference_standard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpla_legacy_governance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read gpla_infrastructure_permanence" ON public.gpla_infrastructure_permanence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpla_generational_continuity" ON public.gpla_generational_continuity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpla_trust_compounding" ON public.gpla_trust_compounding FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpla_reference_standard" ON public.gpla_reference_standard FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpla_legacy_governance" ON public.gpla_legacy_governance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert gpla_infrastructure_permanence" ON public.gpla_infrastructure_permanence FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpla_generational_continuity" ON public.gpla_generational_continuity FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpla_trust_compounding" ON public.gpla_trust_compounding FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpla_reference_standard" ON public.gpla_reference_standard FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpla_legacy_governance" ON public.gpla_legacy_governance FOR INSERT TO service_role WITH CHECK (true);

-- Trigger: emit signal when permanence tier reaches "irreplaceable"
CREATE OR REPLACE FUNCTION public.trg_gpla_irreplaceable() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.permanence_tier = 'irreplaceable' AND (OLD IS NULL OR OLD.permanence_tier <> 'irreplaceable') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gpla_infrastructure_irreplaceable', 'legacy_architecture', NEW.id, 'critical',
      jsonb_build_object('domain', NEW.infrastructure_domain, 'region', NEW.region, 'permanence_score', NEW.permanence_score));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gpla_irreplaceable
  AFTER INSERT OR UPDATE ON public.gpla_infrastructure_permanence
  FOR EACH ROW EXECUTE FUNCTION public.trg_gpla_irreplaceable();
