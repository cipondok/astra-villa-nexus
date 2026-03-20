
-- ═══════════════════════════════════════════════════════════
-- INSTITUTIONAL CAPITAL TRUST ARCHITECTURE (ICTA)
-- ═══════════════════════════════════════════════════════════

-- 1. Institutional Transparency Intelligence
CREATE TABLE public.icta_transparency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_class TEXT NOT NULL DEFAULT 'residential',
  district TEXT,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  standardized_return_pct NUMERIC DEFAULT 0,
  risk_visibility_score NUMERIC DEFAULT 0,
  liquidity_forecast_accuracy NUMERIC DEFAULT 0,
  pipeline_reliability_index NUMERIC DEFAULT 0,
  data_completeness_pct NUMERIC DEFAULT 0,
  reporting_latency_hours NUMERIC DEFAULT 0,
  transparency_grade TEXT DEFAULT 'B' CHECK (transparency_grade IN ('AAA','AA','A','BBB','BB','B','CCC')),
  analytics_payload JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.icta_transparency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read icta_transparency" ON public.icta_transparency FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_icta_tr_grade ON public.icta_transparency(transparency_grade);

-- 2. Governance Confidence Framework
CREATE TABLE public.icta_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governance_dimension TEXT NOT NULL CHECK (governance_dimension IN ('OPERATIONAL_DISCIPLINE','COMPLIANCE_READINESS','AUDIT_STRUCTURE','DATA_INTEGRITY','PROCESS_MATURITY')),
  maturity_score NUMERIC DEFAULT 0,
  compliance_gap_count INTEGER DEFAULT 0,
  audit_trail_depth_days INTEGER DEFAULT 0,
  incident_count_30d INTEGER DEFAULT 0,
  remediation_velocity_hours NUMERIC DEFAULT 0,
  credibility_index NUMERIC DEFAULT 0,
  maturity_level TEXT DEFAULT 'DEVELOPING' CHECK (maturity_level IN ('INITIAL','DEVELOPING','DEFINED','MANAGED','OPTIMIZED')),
  evidence JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.icta_governance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read icta_governance" ON public.icta_governance FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_icta_gov_cred ON public.icta_governance(credibility_index DESC);

-- 3. Capital Deployment Optimization
CREATE TABLE public.icta_capital_deployment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_type TEXT NOT NULL CHECK (mandate_type IN ('CORE','CORE_PLUS','VALUE_ADD','OPPORTUNISTIC','DEVELOPMENT')),
  city TEXT NOT NULL DEFAULT 'Jakarta',
  district TEXT,
  matched_opportunities INTEGER DEFAULT 0,
  allocation_performance_pct NUMERIC DEFAULT 0,
  geographic_diversification NUMERIC DEFAULT 0,
  scenario_count INTEGER DEFAULT 0,
  optimal_allocation_pct NUMERIC DEFAULT 0,
  risk_adjusted_return NUMERIC DEFAULT 0,
  mandate_fit_score NUMERIC DEFAULT 0,
  deployment_status TEXT DEFAULT 'SCOUTING' CHECK (deployment_status IN ('SCOUTING','EVALUATING','DEPLOYING','MONITORING','EXITING')),
  scenario_results JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.icta_capital_deployment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read icta_capital_deployment" ON public.icta_capital_deployment FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_icta_cd_fit ON public.icta_capital_deployment(mandate_fit_score DESC);

-- 4. Strategic Partnership Enablement
CREATE TABLE public.icta_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type TEXT NOT NULL CHECK (partner_type IN ('SOVEREIGN_FUND','PENSION_FUND','ASSET_MANAGER','FAMILY_OFFICE','DEVELOPMENT_BANK','REIT')),
  partner_name TEXT NOT NULL,
  relationship_depth_score NUMERIC DEFAULT 0,
  co_investment_count INTEGER DEFAULT 0,
  total_capital_deployed NUMERIC DEFAULT 0,
  collaboration_frequency TEXT DEFAULT 'OCCASIONAL' CHECK (collaboration_frequency IN ('CONTINUOUS','REGULAR','OCCASIONAL','DORMANT')),
  trust_score NUMERIC DEFAULT 0,
  strategic_alignment NUMERIC DEFAULT 0,
  partnership_stage TEXT DEFAULT 'PROSPECT' CHECK (partnership_stage IN ('PROSPECT','ENGAGED','ACTIVE','STRATEGIC','ANCHOR')),
  interaction_log JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.icta_partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read icta_partnerships" ON public.icta_partnerships FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_icta_part_trust ON public.icta_partnerships(trust_score DESC);

-- 5. Trust Compounding Flywheel
CREATE TABLE public.icta_trust_flywheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL DEFAULT 'Jakarta',
  data_accuracy_score NUMERIC DEFAULT 0,
  allocation_success_rate NUMERIC DEFAULT 0,
  institutional_confidence NUMERIC DEFAULT 0,
  capital_inflow_velocity NUMERIC DEFAULT 0,
  flywheel_momentum NUMERIC DEFAULT 0,
  compounding_rate NUMERIC DEFAULT 1,
  loop_iteration INTEGER DEFAULT 0,
  flywheel_phase TEXT DEFAULT 'SEEDING' CHECK (flywheel_phase IN ('SEEDING','PROVING','SCALING','COMPOUNDING','SELF_SUSTAINING')),
  phase_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.icta_trust_flywheel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read icta_trust_flywheel" ON public.icta_trust_flywheel FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_icta_tf_momentum ON public.icta_trust_flywheel(flywheel_momentum DESC);

-- Signal trigger for institutional trust milestones
CREATE OR REPLACE FUNCTION public.fn_icta_trust_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.flywheel_phase = 'SELF_SUSTAINING' AND NEW.flywheel_momentum >= 85 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('icta_trust_self_sustaining', 'institutional', NEW.id::text, 'critical',
      jsonb_build_object('city', NEW.city, 'momentum', NEW.flywheel_momentum, 'confidence', NEW.institutional_confidence));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_icta_trust_signal
AFTER INSERT OR UPDATE ON public.icta_trust_flywheel
FOR EACH ROW EXECUTE FUNCTION public.fn_icta_trust_signal();
