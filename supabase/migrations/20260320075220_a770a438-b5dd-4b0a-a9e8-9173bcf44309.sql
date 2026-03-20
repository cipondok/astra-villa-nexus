
-- ============================================================
-- SOVEREIGN WEALTH FUND PARTNERSHIP STRATEGY (SWFPS) SCHEMA
-- ============================================================

-- 1) Strategic Alignment Mapping
CREATE TABLE public.swfps_strategic_alignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sovereign_fund_name TEXT NOT NULL,
  country TEXT NOT NULL,
  alignment_domain TEXT NOT NULL,
  platform_capability TEXT,
  sovereign_priority_score NUMERIC,
  alignment_strength NUMERIC,
  urban_modernization_fit NUMERIC,
  crossborder_transparency_fit NUMERIC,
  economic_diversification_fit NUMERIC,
  smartcity_intelligence_fit NUMERIC,
  composite_alignment_score NUMERIC,
  engagement_readiness TEXT DEFAULT 'research',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Partnership Structure Design
CREATE TABLE public.swfps_partnership_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sovereign_fund_name TEXT NOT NULL,
  country TEXT NOT NULL,
  structure_type TEXT NOT NULL,
  equity_stake_pct NUMERIC,
  capital_commitment_usd NUMERIC,
  joint_venture_scope TEXT,
  coinvestment_pipeline_size INTEGER DEFAULT 0,
  tech_integration_depth TEXT DEFAULT 'api_access',
  governance_seats INTEGER DEFAULT 0,
  exclusivity_terms JSONB,
  term_years INTEGER DEFAULT 10,
  structure_attractiveness NUMERIC,
  negotiation_stage TEXT DEFAULT 'concept',
  designed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Long-Horizon Capital Stability
CREATE TABLE public.swfps_capital_stability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  sovereign_capital_committed_usd NUMERIC,
  funding_cycle_stability_index NUMERIC,
  institutional_credibility_lift NUMERIC,
  emerging_market_expansion_count INTEGER DEFAULT 0,
  runway_extension_months INTEGER,
  valuation_premium_pct NUMERIC,
  counter_cyclical_buffer_usd NUMERIC,
  dilution_impact_pct NUMERIC,
  stability_tier TEXT DEFAULT 'moderate',
  simulated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Mutual Value Creation
CREATE TABLE public.swfps_mutual_value (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sovereign_fund_name TEXT NOT NULL,
  country TEXT NOT NULL,
  value_domain TEXT NOT NULL,
  asset_allocation_insight_score NUMERIC,
  urban_planning_support_score NUMERIC,
  global_dealflow_visibility_score NUMERIC,
  platform_data_access_tier TEXT DEFAULT 'standard',
  sovereign_benefit_index NUMERIC,
  platform_benefit_index NUMERIC,
  mutual_value_score NUMERIC,
  value_delivery_status TEXT DEFAULT 'planned',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Governance & Trust Architecture
CREATE TABLE public.swfps_governance_trust (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sovereign_fund_name TEXT NOT NULL,
  country TEXT NOT NULL,
  governance_domain TEXT NOT NULL,
  transparency_score NUMERIC,
  reporting_frequency TEXT DEFAULT 'quarterly',
  risk_management_maturity NUMERIC,
  compliance_framework TEXT,
  audit_rights_granted BOOLEAN DEFAULT false,
  board_observer_rights BOOLEAN DEFAULT false,
  data_sovereignty_compliance BOOLEAN DEFAULT false,
  esg_alignment_score NUMERIC,
  trust_index NUMERIC,
  governance_status TEXT DEFAULT 'drafting',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_swfps_alignment_fund ON public.swfps_strategic_alignment(sovereign_fund_name, alignment_domain);
CREATE INDEX idx_swfps_structure_fund ON public.swfps_partnership_structures(sovereign_fund_name, structure_type);
CREATE INDEX idx_swfps_stability_scenario ON public.swfps_capital_stability(scenario_name, simulated_at DESC);
CREATE INDEX idx_swfps_value_fund ON public.swfps_mutual_value(sovereign_fund_name, value_domain);
CREATE INDEX idx_swfps_governance_fund ON public.swfps_governance_trust(sovereign_fund_name, governance_domain);

-- RLS
ALTER TABLE public.swfps_strategic_alignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swfps_partnership_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swfps_capital_stability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swfps_mutual_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swfps_governance_trust ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read swfps_strategic_alignment" ON public.swfps_strategic_alignment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read swfps_partnership_structures" ON public.swfps_partnership_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read swfps_capital_stability" ON public.swfps_capital_stability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read swfps_mutual_value" ON public.swfps_mutual_value FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read swfps_governance_trust" ON public.swfps_governance_trust FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert swfps_strategic_alignment" ON public.swfps_strategic_alignment FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert swfps_partnership_structures" ON public.swfps_partnership_structures FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert swfps_capital_stability" ON public.swfps_capital_stability FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert swfps_mutual_value" ON public.swfps_mutual_value FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert swfps_governance_trust" ON public.swfps_governance_trust FOR INSERT TO service_role WITH CHECK (true);

-- Trigger: emit signal when partnership moves to advanced negotiation
CREATE OR REPLACE FUNCTION public.trg_swfps_partnership_advance() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.negotiation_stage IN ('term_sheet', 'closing') AND (OLD IS NULL OR OLD.negotiation_stage NOT IN ('term_sheet', 'closing')) THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('swfps_partnership_advancing', 'sovereign_partnership', NEW.id, 'critical',
      jsonb_build_object('fund', NEW.sovereign_fund_name, 'country', NEW.country, 'stage', NEW.negotiation_stage, 'capital_usd', NEW.capital_commitment_usd));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_swfps_partnership_advance
  AFTER INSERT OR UPDATE ON public.swfps_partnership_structures
  FOR EACH ROW EXECUTE FUNCTION public.trg_swfps_partnership_advance();
