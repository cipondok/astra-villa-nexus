
-- ══════════════════════════════════════════════════════════════
-- DECADE-LONG MONOPOLY EXPANSION MASTERPLAN (DMEM)
-- ══════════════════════════════════════════════════════════════

-- 1️⃣ Phase 1: Liquidity Intelligence Leadership (Year 0-2)
CREATE TABLE public.dmem_liquidity_leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_name text NOT NULL,
  target_year integer NOT NULL CHECK (target_year BETWEEN 0 AND 10),
  target_quarter integer CHECK (target_quarter BETWEEN 1 AND 4),
  category text NOT NULL CHECK (category IN ('DEAL_INTELLIGENCE','DISCOVERY_DOMINANCE','DATA_CREDIBILITY','MARKET_COVERAGE')),
  current_progress_pct numeric DEFAULT 0,
  target_metric_value numeric DEFAULT 0,
  actual_metric_value numeric DEFAULT 0,
  metric_unit text,
  competitive_advantage_score numeric DEFAULT 0,
  moat_contribution numeric DEFAULT 0,
  dependencies jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','IN_PROGRESS','ACHIEVED','DELAYED','BLOCKED')),
  achieved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.dmem_liquidity_leadership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read dmem_liquidity_leadership" ON public.dmem_liquidity_leadership FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_dmem_ll_year ON public.dmem_liquidity_leadership (target_year, target_quarter);
CREATE INDEX idx_dmem_ll_status ON public.dmem_liquidity_leadership (status);

-- 2️⃣ Phase 2: Marketplace Gravity Formation (Year 2-4)
CREATE TABLE public.dmem_marketplace_gravity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_type text NOT NULL CHECK (stakeholder_type IN ('VENDOR','AGENT','DEVELOPER','INVESTOR','INSTITUTIONAL','GOVERNMENT')),
  dependency_metric text NOT NULL,
  dependency_score numeric DEFAULT 0,
  switching_cost_months numeric DEFAULT 0,
  platform_share_of_workflow_pct numeric DEFAULT 0,
  alternative_count integer DEFAULT 0,
  gravity_pull_strength numeric DEFAULT 0,
  transaction_volume_contribution numeric DEFAULT 0,
  compounding_factor numeric DEFAULT 1.0,
  retention_rate_pct numeric DEFAULT 0,
  network_effect_multiplier numeric DEFAULT 1.0,
  phase_target_year integer DEFAULT 3,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dmem_marketplace_gravity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read dmem_marketplace_gravity" ON public.dmem_marketplace_gravity FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_dmem_mg_gravity ON public.dmem_marketplace_gravity (gravity_pull_strength DESC);

-- 3️⃣ Phase 3: Ecosystem Lock-In (Year 4-6)
CREATE TABLE public.dmem_ecosystem_lockin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_layer text NOT NULL CHECK (service_layer IN ('FINANCING','LEGAL','PROPERTY_MANAGEMENT','INSURANCE','VALUATION','TOKENIZATION','TAX_ADVISORY')),
  integration_depth text CHECK (integration_depth IN ('API_CONNECTED','EMBEDDED','NATIVE','WHITE_LABEL')),
  switching_cost_score numeric DEFAULT 0,
  user_dependency_pct numeric DEFAULT 0,
  revenue_per_user_usd numeric DEFAULT 0,
  multi_service_adoption_pct numeric DEFAULT 0,
  lock_in_strength numeric DEFAULT 0,
  competitor_replication_years numeric DEFAULT 0,
  data_moat_contribution numeric DEFAULT 0,
  ecosystem_completeness_pct numeric DEFAULT 0,
  launch_year integer DEFAULT 4,
  maturity_year integer DEFAULT 6,
  status text DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','BUILDING','LIVE','SCALING','DOMINANT')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.dmem_ecosystem_lockin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read dmem_ecosystem_lockin" ON public.dmem_ecosystem_lockin FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_dmem_el_lockin ON public.dmem_ecosystem_lockin (lock_in_strength DESC);

-- 4️⃣ Phase 4: Capital Flow Control (Year 6-8)
CREATE TABLE public.dmem_capital_flow_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_domain text NOT NULL CHECK (flow_domain IN ('INSTITUTIONAL_SOURCING','ASSET_MANAGEMENT','CROSS_BORDER_ROUTING','FUND_ORIGINATION','SYNDICATION','SECONDARY_MARKET')),
  capital_volume_usd numeric DEFAULT 0,
  market_share_pct numeric DEFAULT 0,
  proprietary_advantage text,
  platform_intermediation_pct numeric DEFAULT 0,
  intelligence_premium_pct numeric DEFAULT 0,
  institutional_relationships integer DEFAULT 0,
  countries_active integer DEFAULT 0,
  regulatory_licenses jsonb DEFAULT '[]'::jsonb,
  revenue_from_flow_usd numeric DEFAULT 0,
  dominance_score numeric DEFAULT 0,
  target_year integer DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.dmem_capital_flow_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read dmem_capital_flow_control" ON public.dmem_capital_flow_control FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_dmem_cfc_dominance ON public.dmem_capital_flow_control (dominance_score DESC);

-- 5️⃣ Phase 5: Global Infrastructure Status (Year 8-10)
CREATE TABLE public.dmem_global_infrastructure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  infrastructure_dimension text NOT NULL CHECK (infrastructure_dimension IN ('DEFAULT_OS','DATA_AUTHORITY','URBAN_ECONOMIC_LAYER','REGULATORY_STANDARD','CAPITAL_BACKBONE','INTELLIGENCE_MONOPOLY')),
  geographic_reach text CHECK (geographic_reach IN ('NATIONAL','REGIONAL','MULTI_CONTINENTAL','GLOBAL')),
  market_penetration_pct numeric DEFAULT 0,
  cities_embedded integer DEFAULT 0,
  api_integrations integer DEFAULT 0,
  government_partnerships integer DEFAULT 0,
  data_standard_adoption_pct numeric DEFAULT 0,
  irreversibility_score numeric DEFAULT 0,
  annual_platform_gdp_usd numeric DEFAULT 0,
  infrastructure_status text DEFAULT 'EMERGING' CHECK (infrastructure_status IN ('EMERGING','ESTABLISHING','EMBEDDED','IRREVERSIBLE')),
  target_year integer DEFAULT 9,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.dmem_global_infrastructure ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read dmem_global_infrastructure" ON public.dmem_global_infrastructure FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_dmem_gi_irreversibility ON public.dmem_global_infrastructure (irreversibility_score DESC);

-- Trigger: emit signal when infrastructure reaches IRREVERSIBLE
CREATE OR REPLACE FUNCTION public.fn_dmem_irreversible_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.infrastructure_status = 'IRREVERSIBLE' AND (OLD.infrastructure_status IS NULL OR OLD.infrastructure_status != 'IRREVERSIBLE') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('dmem_infrastructure_irreversible', 'dmem_infra', NEW.id, 'critical',
      jsonb_build_object('dimension', NEW.infrastructure_dimension, 'reach', NEW.geographic_reach, 'cities', NEW.cities_embedded, 'irreversibility', NEW.irreversibility_score));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_dmem_irreversible
  AFTER INSERT OR UPDATE ON public.dmem_global_infrastructure
  FOR EACH ROW EXECUTE FUNCTION public.fn_dmem_irreversible_signal();
