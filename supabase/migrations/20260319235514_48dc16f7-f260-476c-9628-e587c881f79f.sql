
-- AI SOVEREIGN CAPITAL INFRASTRUCTURE (ASCI)

CREATE TABLE public.asci_capital_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL,
  institution_type text NOT NULL CHECK (institution_type IN ('sovereign_fund','pension_fund','insurance_capital','endowment','family_office','development_bank','reit')),
  jurisdiction text NOT NULL,
  regulatory_constraints jsonb DEFAULT '[]'::jsonb,
  capital_horizon text NOT NULL DEFAULT 'long' CHECK (capital_horizon IN ('short','medium','long','perpetual')),
  risk_appetite text NOT NULL DEFAULT 'moderate' CHECK (risk_appetite IN ('conservative','moderate','growth','aggressive')),
  liquidity_tolerance_pct numeric DEFAULT 20 CHECK (liquidity_tolerance_pct BETWEEN 0 AND 100),
  deployment_capacity_usd numeric DEFAULT 0,
  min_ticket_usd numeric DEFAULT 0,
  max_single_exposure_pct numeric DEFAULT 10 CHECK (max_single_exposure_pct BETWEEN 0 AND 100),
  approved_asset_classes text[] DEFAULT '{}',
  approved_geographies text[] DEFAULT '{}',
  esg_requirements jsonb DEFAULT '{}'::jsonb,
  onboarding_status text DEFAULT 'intake' CHECK (onboarding_status IN ('intake','due_diligence','approved','active','suspended')),
  onboarded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.asci_macro_allocation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  city text,
  asset_class text NOT NULL,
  growth_momentum_score numeric DEFAULT 0 CHECK (growth_momentum_score BETWEEN 0 AND 100),
  demographic_expansion_rate numeric DEFAULT 0,
  infrastructure_pipeline_usd numeric DEFAULT 0,
  yield_differential_bps numeric DEFAULT 0,
  allocation_weight_pct numeric DEFAULT 0 CHECK (allocation_weight_pct BETWEEN 0 AND 100),
  risk_adjusted_return numeric DEFAULT 0,
  macro_confidence numeric DEFAULT 0 CHECK (macro_confidence BETWEEN 0 AND 100),
  recommended_deployment_usd numeric DEFAULT 0,
  allocation_rationale text,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.asci_risk_stabilization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  risk_type text NOT NULL CHECK (risk_type IN ('cyclical_downturn','oversupply_bubble','macro_shock','currency_crisis','political_instability','liquidity_freeze')),
  severity numeric DEFAULT 0 CHECK (severity BETWEEN 0 AND 100),
  probability numeric DEFAULT 0 CHECK (probability BETWEEN 0 AND 1),
  potential_drawdown_pct numeric DEFAULT 0,
  time_horizon_months int DEFAULT 12,
  early_warning_triggered boolean DEFAULT false,
  simulation_scenarios jsonb DEFAULT '[]'::jsonb,
  mitigation_strategies jsonb DEFAULT '[]'::jsonb,
  hedging_cost_pct numeric DEFAULT 0,
  stress_test_result text DEFAULT 'pass' CHECK (stress_test_result IN ('pass','marginal','fail')),
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.asci_crossborder_deployment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_jurisdiction text NOT NULL,
  target_jurisdiction text NOT NULL,
  deployment_tranche_usd numeric DEFAULT 0,
  currency_pair text,
  fx_hedging_strategy text,
  fx_cost_annual_pct numeric DEFAULT 0,
  deployment_phase int DEFAULT 1 CHECK (deployment_phase BETWEEN 1 AND 5),
  phase_description text,
  co_investment_partners int DEFAULT 0,
  syndication_structure text,
  regulatory_clearance boolean DEFAULT false,
  tax_treaty_benefit boolean DEFAULT false,
  withholding_tax_pct numeric DEFAULT 0,
  deployment_status text DEFAULT 'planning' CHECK (deployment_status IN ('planning','cleared','deploying','deployed','exiting')),
  deployed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.asci_trust_transparency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.asci_capital_intake(id) ON DELETE CASCADE,
  reporting_period text NOT NULL,
  total_deployed_usd numeric DEFAULT 0,
  total_return_pct numeric DEFAULT 0,
  benchmark_return_pct numeric DEFAULT 0,
  alpha_generated_pct numeric DEFAULT 0,
  attribution_by_region jsonb DEFAULT '{}'::jsonb,
  attribution_by_asset_class jsonb DEFAULT '{}'::jsonb,
  scenario_projections jsonb DEFAULT '[]'::jsonb,
  governance_score numeric DEFAULT 0 CHECK (governance_score BETWEEN 0 AND 100),
  transparency_index numeric DEFAULT 0 CHECK (transparency_index BETWEEN 0 AND 100),
  decision_confidence_score numeric DEFAULT 0 CHECK (decision_confidence_score BETWEEN 0 AND 100),
  compliance_status text DEFAULT 'compliant' CHECK (compliance_status IN ('compliant','review','remediation','non_compliant')),
  report_generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.asci_capital_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asci_macro_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asci_risk_stabilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asci_crossborder_deployment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asci_trust_transparency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to asci_capital_intake" ON public.asci_capital_intake FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asci_macro_allocation" ON public.asci_macro_allocation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asci_risk_stabilization" ON public.asci_risk_stabilization FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asci_crossborder_deployment" ON public.asci_crossborder_deployment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asci_trust_transparency" ON public.asci_trust_transparency FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.fn_asci_sovereign_deployment_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.deployment_status = 'deployed' AND (OLD.deployment_status IS DISTINCT FROM 'deployed') AND NEW.deployment_tranche_usd >= 10000000 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'asci_sovereign_deployment',
      'asci_crossborder_deployment',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'source', NEW.source_jurisdiction,
        'target', NEW.target_jurisdiction,
        'tranche_usd', NEW.deployment_tranche_usd,
        'co_investors', NEW.co_investment_partners,
        'phase', NEW.deployment_phase
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_asci_sovereign_deployment
  AFTER INSERT OR UPDATE ON public.asci_crossborder_deployment
  FOR EACH ROW EXECUTE FUNCTION public.fn_asci_sovereign_deployment_alert();
