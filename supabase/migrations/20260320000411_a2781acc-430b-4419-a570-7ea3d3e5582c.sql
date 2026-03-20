
-- =====================================================
-- AUTONOMOUS URBAN WEALTH CREATION PROTOCOL (AUWCP)
-- =====================================================

-- 1. Urban Opportunity Mapping Engine
CREATE TABLE public.auwcp_opportunity_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Indonesia',
  development_potential_score NUMERIC(5,2) DEFAULT 0,
  infrastructure_trigger_score NUMERIC(5,2) DEFAULT 0,
  commercial_cluster_density NUMERIC(5,2) DEFAULT 0,
  population_growth_rate NUMERIC(6,3) DEFAULT 0,
  land_availability_index NUMERIC(5,2) DEFAULT 0,
  transit_proximity_score NUMERIC(5,2) DEFAULT 0,
  zoning_flexibility_score NUMERIC(5,2) DEFAULT 0,
  composite_opportunity_score NUMERIC(5,2) DEFAULT 0,
  opportunity_tier TEXT DEFAULT 'emerging',
  appreciation_forecast_pct NUMERIC(6,2) DEFAULT 0,
  key_triggers JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Coordinated Investment Sequencing System
CREATE TABLE public.auwcp_investment_sequencing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Indonesia',
  current_phase INT DEFAULT 1,
  total_phases INT DEFAULT 5,
  phase_name TEXT DEFAULT 'foundation',
  residential_readiness NUMERIC(5,2) DEFAULT 0,
  commercial_readiness NUMERIC(5,2) DEFAULT 0,
  vendor_supply_readiness NUMERIC(5,2) DEFAULT 0,
  infrastructure_readiness NUMERIC(5,2) DEFAULT 0,
  mixed_use_balance_score NUMERIC(5,2) DEFAULT 0,
  sequencing_confidence NUMERIC(5,2) DEFAULT 0,
  estimated_phase_months INT DEFAULT 12,
  capital_deployed_usd NUMERIC(14,2) DEFAULT 0,
  capital_target_usd NUMERIC(14,2) DEFAULT 0,
  next_milestone TEXT,
  sequencing_actions JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Wealth Distribution Impact Intelligence
CREATE TABLE public.auwcp_wealth_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Indonesia',
  jobs_created_30d INT DEFAULT 0,
  jobs_created_cumulative INT DEFAULT 0,
  local_service_growth_pct NUMERIC(5,2) DEFAULT 0,
  property_appreciation_avg_pct NUMERIC(6,2) DEFAULT 0,
  property_appreciation_median_pct NUMERIC(6,2) DEFAULT 0,
  gini_dispersion_index NUMERIC(5,4) DEFAULT 0,
  small_business_formation_rate NUMERIC(6,2) DEFAULT 0,
  household_income_impact_pct NUMERIC(6,2) DEFAULT 0,
  community_investment_score NUMERIC(5,2) DEFAULT 0,
  prosperity_inclusion_index NUMERIC(5,2) DEFAULT 0,
  impact_tier TEXT DEFAULT 'baseline',
  measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Development Risk Mitigation Layer
CREATE TABLE public.auwcp_risk_mitigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Indonesia',
  speculative_heat_score NUMERIC(5,2) DEFAULT 0,
  infrastructure_bottleneck_risk NUMERIC(5,2) DEFAULT 0,
  capital_concentration_risk NUMERIC(5,2) DEFAULT 0,
  oversupply_probability NUMERIC(5,2) DEFAULT 0,
  demand_sustainability_score NUMERIC(5,2) DEFAULT 0,
  composite_risk_score NUMERIC(5,2) DEFAULT 0,
  risk_tier TEXT DEFAULT 'low',
  early_warning_signals JSONB DEFAULT '[]',
  mitigation_actions JSONB DEFAULT '[]',
  stress_test_result TEXT,
  forecast_horizon_months INT DEFAULT 12,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Long-Term Urban Prosperity Feedback Loop
CREATE TABLE public.auwcp_prosperity_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Indonesia',
  policy_alignment_score NUMERIC(5,2) DEFAULT 0,
  sustainable_density_index NUMERIC(5,2) DEFAULT 0,
  liquidity_cycle_health NUMERIC(5,2) DEFAULT 0,
  reinvestment_velocity NUMERIC(6,3) DEFAULT 0,
  green_development_pct NUMERIC(5,2) DEFAULT 0,
  community_satisfaction_proxy NUMERIC(5,2) DEFAULT 0,
  long_term_viability_score NUMERIC(5,2) DEFAULT 0,
  prosperity_momentum TEXT DEFAULT 'stable',
  feedback_loop_strength NUMERIC(5,2) DEFAULT 0,
  projected_prosperity_12m NUMERIC(5,2) DEFAULT 0,
  policy_recommendations JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.auwcp_opportunity_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auwcp_investment_sequencing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auwcp_wealth_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auwcp_risk_mitigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auwcp_prosperity_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read auwcp_opportunity_mapping" ON public.auwcp_opportunity_mapping FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read auwcp_investment_sequencing" ON public.auwcp_investment_sequencing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read auwcp_wealth_impact" ON public.auwcp_wealth_impact FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read auwcp_risk_mitigation" ON public.auwcp_risk_mitigation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read auwcp_prosperity_feedback" ON public.auwcp_prosperity_feedback FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert auwcp_opportunity_mapping" ON public.auwcp_opportunity_mapping FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update auwcp_opportunity_mapping" ON public.auwcp_opportunity_mapping FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert auwcp_investment_sequencing" ON public.auwcp_investment_sequencing FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update auwcp_investment_sequencing" ON public.auwcp_investment_sequencing FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert auwcp_wealth_impact" ON public.auwcp_wealth_impact FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update auwcp_wealth_impact" ON public.auwcp_wealth_impact FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert auwcp_risk_mitigation" ON public.auwcp_risk_mitigation FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update auwcp_risk_mitigation" ON public.auwcp_risk_mitigation FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert auwcp_prosperity_feedback" ON public.auwcp_prosperity_feedback FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update auwcp_prosperity_feedback" ON public.auwcp_prosperity_feedback FOR UPDATE TO service_role USING (true);

-- Indexes
CREATE INDEX idx_auwcp_opp_composite ON public.auwcp_opportunity_mapping(composite_opportunity_score DESC);
CREATE INDEX idx_auwcp_opp_city ON public.auwcp_opportunity_mapping(city, district);
CREATE INDEX idx_auwcp_seq_phase ON public.auwcp_investment_sequencing(current_phase, sequencing_confidence DESC);
CREATE INDEX idx_auwcp_wealth_inclusion ON public.auwcp_wealth_impact(prosperity_inclusion_index DESC);
CREATE INDEX idx_auwcp_risk_composite ON public.auwcp_risk_mitigation(composite_risk_score DESC);
CREATE INDEX idx_auwcp_prosperity_viability ON public.auwcp_prosperity_feedback(long_term_viability_score DESC);

-- Trigger: emit signal when prosperity feedback loop reaches high momentum
CREATE OR REPLACE FUNCTION public.auwcp_prosperity_surge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.long_term_viability_score >= 80 AND NEW.prosperity_momentum = 'accelerating' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'auwcp_prosperity_surge',
      'auwcp_prosperity',
      NEW.id::text,
      'high',
      jsonb_build_object(
        'city', NEW.city,
        'district', NEW.district,
        'viability', NEW.long_term_viability_score,
        'momentum', NEW.prosperity_momentum,
        'feedback_strength', NEW.feedback_loop_strength
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_auwcp_prosperity_surge
AFTER INSERT OR UPDATE ON public.auwcp_prosperity_feedback
FOR EACH ROW EXECUTE FUNCTION public.auwcp_prosperity_surge();
