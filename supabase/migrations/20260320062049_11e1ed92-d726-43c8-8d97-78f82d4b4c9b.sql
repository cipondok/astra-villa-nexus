
-- ═══════════════════════════════════════════════════════════════
-- INFINITE HORIZON WEALTH INTELLIGENCE (IHWI)
-- ═══════════════════════════════════════════════════════════════

-- 1. Structural Wealth Driver Analytics
CREATE TABLE public.ihwi_structural_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  demographic_momentum NUMERIC NOT NULL DEFAULT 0,
  tech_productivity_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  urbanization_value_cycle NUMERIC NOT NULL DEFAULT 0,
  infra_investment_maturity NUMERIC NOT NULL DEFAULT 0,
  human_capital_depth NUMERIC NOT NULL DEFAULT 0,
  innovation_density NUMERIC NOT NULL DEFAULT 0,
  structural_driver_composite NUMERIC NOT NULL DEFAULT 0,
  driver_era TEXT NOT NULL DEFAULT 'emerging',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ihwi_structural_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ihwi_structural_drivers" ON public.ihwi_structural_drivers FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ihwi_drivers_region ON public.ihwi_structural_drivers(region);
CREATE INDEX idx_ihwi_drivers_computed ON public.ihwi_structural_drivers(computed_at DESC);

-- 2. Multi-Decade Capital Growth Simulator
CREATE TABLE public.ihwi_capital_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  scenario_name TEXT NOT NULL,
  compounding_rate_pct NUMERIC NOT NULL DEFAULT 0,
  opportunity_convergence NUMERIC NOT NULL DEFAULT 0,
  cyclical_risk_score NUMERIC NOT NULL DEFAULT 0,
  recovery_velocity NUMERIC NOT NULL DEFAULT 0,
  allocation_strategy TEXT NOT NULL DEFAULT 'balanced',
  projected_wealth_multiple NUMERIC NOT NULL DEFAULT 1.0,
  time_horizon_years INTEGER NOT NULL DEFAULT 30,
  confidence_band_pct NUMERIC NOT NULL DEFAULT 15,
  simulation_status TEXT NOT NULL DEFAULT 'draft',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ihwi_capital_growth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ihwi_capital_growth" ON public.ihwi_capital_growth FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ihwi_growth_region ON public.ihwi_capital_growth(region);

-- 3. Intergenerational Wealth Continuity
CREATE TABLE public.ihwi_generational_continuity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  education_investment_roi NUMERIC NOT NULL DEFAULT 0,
  human_capital_score NUMERIC NOT NULL DEFAULT 0,
  inheritance_efficiency NUMERIC NOT NULL DEFAULT 0,
  asset_transition_readiness NUMERIC NOT NULL DEFAULT 0,
  financial_inclusion_expansion NUMERIC NOT NULL DEFAULT 0,
  wealth_mobility_index NUMERIC NOT NULL DEFAULT 0,
  continuity_composite NUMERIC NOT NULL DEFAULT 0,
  generational_tier TEXT NOT NULL DEFAULT 'building',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ihwi_generational_continuity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ihwi_generational_continuity" ON public.ihwi_generational_continuity FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ihwi_gen_region ON public.ihwi_generational_continuity(region);

-- 4. Resilience & Sustainability Alignment
CREATE TABLE public.ihwi_resilience_alignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  climate_adaptation_score NUMERIC NOT NULL DEFAULT 0,
  resource_efficiency_index NUMERIC NOT NULL DEFAULT 0,
  systemic_risk_buffer NUMERIC NOT NULL DEFAULT 0,
  esg_integration_depth NUMERIC NOT NULL DEFAULT 0,
  sustainability_roi NUMERIC NOT NULL DEFAULT 0,
  resilience_composite NUMERIC NOT NULL DEFAULT 0,
  alignment_tier TEXT NOT NULL DEFAULT 'transitioning',
  risk_outlook TEXT NOT NULL DEFAULT 'moderate',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ihwi_resilience_alignment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ihwi_resilience_alignment" ON public.ihwi_resilience_alignment FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ihwi_resilience_region ON public.ihwi_resilience_alignment(region);

-- 5. Infinite Horizon Decision Intelligence
CREATE TABLE public.ihwi_decision_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Global',
  wealth_trajectory_score NUMERIC NOT NULL DEFAULT 0,
  growth_balance_index NUMERIC NOT NULL DEFAULT 0,
  institutional_readiness NUMERIC NOT NULL DEFAULT 0,
  horizon_confidence NUMERIC NOT NULL DEFAULT 0,
  decision_composite NUMERIC NOT NULL DEFAULT 0,
  prosperity_era TEXT NOT NULL DEFAULT 'foundational',
  strategic_recommendations TEXT[],
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ihwi_decision_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read ihwi_decision_intelligence" ON public.ihwi_decision_intelligence FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_ihwi_decision_region ON public.ihwi_decision_intelligence(region);

-- Trigger: emit signal on high structural driver composite
CREATE OR REPLACE FUNCTION public.emit_ihwi_prosperity_signal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.structural_driver_composite >= 80 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('ihwi_prosperity_breakout', 'ihwi_drivers', NEW.id::text, 'high',
      json_build_object('region', NEW.region, 'composite', NEW.structural_driver_composite, 'era', NEW.driver_era)::jsonb);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_ihwi_prosperity_signal
  AFTER INSERT OR UPDATE ON public.ihwi_structural_drivers
  FOR EACH ROW EXECUTE FUNCTION public.emit_ihwi_prosperity_signal();
