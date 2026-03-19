
-- ══════════════════════════════════════════════════════════════
-- GCCF: AI-Governed Global Capital Civilization Framework
-- ══════════════════════════════════════════════════════════════

-- 1) Capital Transparency Grid
CREATE TABLE public.gccf_transparency_grid (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_country text NOT NULL,
  target_country text NOT NULL,
  sector text NOT NULL, -- 'residential','commercial','infrastructure','industrial','mixed_use'
  -- Flow metrics
  flow_volume_usd numeric NOT NULL DEFAULT 0,
  flow_direction text NOT NULL DEFAULT 'inbound', -- 'inbound','outbound','bilateral'
  flow_velocity_change_pct numeric NOT NULL DEFAULT 0,
  -- Concentration risk
  sector_concentration_hhi numeric NOT NULL DEFAULT 0, -- 0-10000
  geographic_concentration_risk numeric NOT NULL DEFAULT 0, -- 0-100
  single_entity_dominance_pct numeric NOT NULL DEFAULT 0,
  -- Infrastructure gaps
  infra_funding_gap_usd numeric NOT NULL DEFAULT 0,
  infra_gap_severity text NOT NULL DEFAULT 'moderate', -- 'minimal','moderate','significant','critical'
  estimated_gap_closure_years numeric,
  -- Transparency
  transparency_score numeric NOT NULL DEFAULT 50, -- 0-100
  beneficial_ownership_visibility_pct numeric NOT NULL DEFAULT 0,
  aml_compliance_score numeric NOT NULL DEFAULT 50, -- 0-100
  reporting_frequency text NOT NULL DEFAULT 'quarterly',
  data_quality_grade text NOT NULL DEFAULT 'B', -- A,B,C,D,F
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gccf_trans_src ON public.gccf_transparency_grid(source_country);
CREATE INDEX idx_gccf_trans_tgt ON public.gccf_transparency_grid(target_country);
CREATE INDEX idx_gccf_trans_score ON public.gccf_transparency_grid(transparency_score DESC);

-- 2) Strategic Allocation Councils
CREATE TABLE public.gccf_allocation_councils (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  council_name text NOT NULL,
  council_type text NOT NULL, -- 'sovereign','institutional','regional','sectoral','emergency'
  region text NOT NULL,
  -- Members
  institutional_members int NOT NULL DEFAULT 0,
  public_sector_members int NOT NULL DEFAULT 0,
  ai_advisor_weight numeric NOT NULL DEFAULT 0.33, -- 0-1 (how much AI influences)
  -- Decision metrics
  total_capital_governed_usd numeric NOT NULL DEFAULT 0,
  decisions_made int NOT NULL DEFAULT 0,
  avg_decision_time_days numeric NOT NULL DEFAULT 0,
  ai_recommendation_acceptance_pct numeric NOT NULL DEFAULT 0,
  -- Performance
  portfolio_return_pct numeric NOT NULL DEFAULT 0,
  risk_adjusted_return numeric NOT NULL DEFAULT 0,
  alignment_with_prosperity_goals_pct numeric NOT NULL DEFAULT 0,
  -- Governance
  voting_mechanism text NOT NULL DEFAULT 'weighted_consensus', -- 'weighted_consensus','majority','supermajority','ai_guided'
  transparency_level text NOT NULL DEFAULT 'high', -- 'full','high','moderate','restricted'
  conflict_of_interest_checks boolean NOT NULL DEFAULT true,
  last_session_at timestamptz,
  next_session_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gccf_council_type ON public.gccf_allocation_councils(council_type);
CREATE INDEX idx_gccf_council_region ON public.gccf_allocation_councils(region);

-- 3) Crisis Stabilization Protocol
CREATE TABLE public.gccf_crisis_protocol (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_type text NOT NULL, -- 'macro_instability','currency_crisis','liquidity_freeze','housing_crash','geopolitical_shock','systemic_contagion'
  affected_region text NOT NULL,
  affected_countries text[] NOT NULL DEFAULT '{}',
  -- Detection
  severity_level text NOT NULL DEFAULT 'watch', -- 'watch','elevated','severe','critical','systemic'
  detection_confidence numeric NOT NULL DEFAULT 0, -- 0-100
  leading_indicators jsonb NOT NULL DEFAULT '[]',
  trigger_threshold_breached boolean NOT NULL DEFAULT false,
  -- Response
  recommended_redistribution jsonb NOT NULL DEFAULT '{}', -- {from_sector, to_sector, pct}
  capital_protection_actions text[] NOT NULL DEFAULT '{}',
  liquidity_injection_needed_usd numeric NOT NULL DEFAULT 0,
  estimated_recovery_months int,
  -- Resilience
  financial_resilience_score numeric NOT NULL DEFAULT 50, -- 0-100
  contagion_risk_pct numeric NOT NULL DEFAULT 0,
  systemic_importance_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Status
  protocol_status text NOT NULL DEFAULT 'monitoring', -- 'monitoring','activated','responding','stabilizing','resolved'
  activated_at timestamptz,
  resolved_at timestamptz,
  response_effectiveness_score numeric, -- 0-100 post-resolution
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gccf_crisis_type ON public.gccf_crisis_protocol(crisis_type);
CREATE INDEX idx_gccf_crisis_severity ON public.gccf_crisis_protocol(severity_level);

-- 4) Inclusive Wealth Participation Layer
CREATE TABLE public.gccf_inclusive_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  region text NOT NULL,
  -- Emerging market access
  emerging_market_readiness_score numeric NOT NULL DEFAULT 0, -- 0-100
  regulatory_barrier_index numeric NOT NULL DEFAULT 0, -- 0-100 (0=no barriers)
  digital_access_pct numeric NOT NULL DEFAULT 0,
  financial_literacy_index numeric NOT NULL DEFAULT 0, -- 0-100
  -- Micro-ownership
  micro_ownership_enabled boolean NOT NULL DEFAULT false,
  min_investment_threshold_usd numeric NOT NULL DEFAULT 0,
  active_micro_investors int NOT NULL DEFAULT 0,
  micro_portfolio_total_usd numeric NOT NULL DEFAULT 0,
  avg_micro_return_pct numeric NOT NULL DEFAULT 0,
  -- Global participation
  cross_border_participation_pct numeric NOT NULL DEFAULT 0,
  diaspora_investment_volume_usd numeric NOT NULL DEFAULT 0,
  mobile_first_investors_pct numeric NOT NULL DEFAULT 0,
  -- Inclusion KPIs
  wealth_gini_impact numeric NOT NULL DEFAULT 0, -- negative=reducing inequality
  new_investor_onboarding_monthly int NOT NULL DEFAULT 0,
  wealth_creation_per_capita_usd numeric NOT NULL DEFAULT 0,
  inclusion_composite_score numeric NOT NULL DEFAULT 0, -- 0-100
  inclusion_tier text NOT NULL DEFAULT 'developing', -- 'leading','advancing','developing','emerging','excluded'
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gccf_incl_country ON public.gccf_inclusive_participation(country);
CREATE INDEX idx_gccf_incl_score ON public.gccf_inclusive_participation(inclusion_composite_score DESC);

-- 5) Ethical Allocation Principles
CREATE TABLE public.gccf_ethical_allocation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text,
  -- Regional balance
  regional_development_balance_score numeric NOT NULL DEFAULT 50, -- 0-100
  capital_flow_fairness_index numeric NOT NULL DEFAULT 50, -- 0-100
  rural_urban_investment_ratio numeric NOT NULL DEFAULT 0,
  underserved_area_allocation_pct numeric NOT NULL DEFAULT 0,
  -- Environmental
  environmental_impact_score numeric NOT NULL DEFAULT 50, -- 0-100 (100=positive)
  carbon_intensity_per_investment numeric NOT NULL DEFAULT 0,
  green_building_adoption_pct numeric NOT NULL DEFAULT 0,
  biodiversity_risk_flag boolean NOT NULL DEFAULT false,
  climate_resilience_investment_pct numeric NOT NULL DEFAULT 0,
  -- Intergenerational
  intergenerational_fairness_score numeric NOT NULL DEFAULT 50, -- 0-100
  housing_affordability_preservation boolean NOT NULL DEFAULT true,
  sovereign_wealth_preservation_pct numeric NOT NULL DEFAULT 0,
  youth_wealth_access_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Composite
  ethical_composite_score numeric NOT NULL DEFAULT 50, -- 0-100
  ethical_tier text NOT NULL DEFAULT 'standard', -- 'exemplary','strong','standard','needs_improvement','failing'
  violations_detected int NOT NULL DEFAULT 0,
  violation_details jsonb NOT NULL DEFAULT '[]',
  remediation_actions jsonb NOT NULL DEFAULT '[]',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gccf_eth_country ON public.gccf_ethical_allocation(country);
CREATE INDEX idx_gccf_eth_score ON public.gccf_ethical_allocation(ethical_composite_score DESC);

-- Trigger: emit signal on crisis activation
CREATE OR REPLACE FUNCTION public.fn_gccf_crisis_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.severity_level IN ('critical', 'systemic') AND NEW.protocol_status = 'activated' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gccf_crisis_activated',
      'gccf_crisis_protocol',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'crisis_type', NEW.crisis_type,
        'region', NEW.affected_region,
        'severity', NEW.severity_level,
        'resilience_score', NEW.financial_resilience_score,
        'contagion_risk', NEW.contagion_risk_pct
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gccf_crisis_alert
AFTER INSERT OR UPDATE ON public.gccf_crisis_protocol
FOR EACH ROW EXECUTE FUNCTION public.fn_gccf_crisis_alert();

-- RLS
ALTER TABLE public.gccf_transparency_grid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gccf_allocation_councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gccf_crisis_protocol ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gccf_inclusive_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gccf_ethical_allocation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read gccf_transparency_grid" ON public.gccf_transparency_grid FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gccf_allocation_councils" ON public.gccf_allocation_councils FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gccf_crisis_protocol" ON public.gccf_crisis_protocol FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gccf_inclusive_participation" ON public.gccf_inclusive_participation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gccf_ethical_allocation" ON public.gccf_ethical_allocation FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert gccf_transparency_grid" ON public.gccf_transparency_grid FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gccf_transparency_grid" ON public.gccf_transparency_grid FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gccf_allocation_councils" ON public.gccf_allocation_councils FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gccf_allocation_councils" ON public.gccf_allocation_councils FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gccf_crisis_protocol" ON public.gccf_crisis_protocol FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gccf_crisis_protocol" ON public.gccf_crisis_protocol FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gccf_inclusive_participation" ON public.gccf_inclusive_participation FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gccf_inclusive_participation" ON public.gccf_inclusive_participation FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert gccf_ethical_allocation" ON public.gccf_ethical_allocation FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update gccf_ethical_allocation" ON public.gccf_ethical_allocation FOR UPDATE TO service_role USING (true);
