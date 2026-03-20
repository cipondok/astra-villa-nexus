
-- =====================================================
-- PLANETARY URBANIZATION FORECAST GRID (PUFG)
-- =====================================================

-- 1. Urban Expansion Signal Engine
CREATE TABLE public.pufg_expansion_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Indonesia',
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  population_inflow_score NUMERIC(5,2) DEFAULT 0,
  transport_investment_score NUMERIC(5,2) DEFAULT 0,
  commercial_cluster_score NUMERIC(5,2) DEFAULT 0,
  land_use_velocity NUMERIC(5,2) DEFAULT 0,
  building_permit_momentum NUMERIC(5,2) DEFAULT 0,
  green_field_conversion_rate NUMERIC(6,3) DEFAULT 0,
  composite_expansion_signal NUMERIC(5,2) DEFAULT 0,
  expansion_tier TEXT DEFAULT 'dormant',
  expansion_vector TEXT DEFAULT 'stable',
  forecast_horizon_months INT DEFAULT 24,
  signal_drivers JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. District Lifecycle Prediction Model
CREATE TABLE public.pufg_district_lifecycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Indonesia',
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  lifecycle_phase TEXT DEFAULT 'early_growth',
  phase_maturity_pct NUMERIC(5,2) DEFAULT 0,
  phase_velocity NUMERIC(6,3) DEFAULT 0,
  estimated_phase_remaining_months INT,
  density_index NUMERIC(5,2) DEFAULT 0,
  commercial_saturation NUMERIC(5,2) DEFAULT 0,
  residential_saturation NUMERIC(5,2) DEFAULT 0,
  infrastructure_completeness NUMERIC(5,2) DEFAULT 0,
  regeneration_potential NUMERIC(5,2) DEFAULT 0,
  lifecycle_confidence NUMERIC(5,2) DEFAULT 0,
  transition_triggers JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Infrastructure Impact Projection Layer
CREATE TABLE public.pufg_infrastructure_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Indonesia',
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  project_name TEXT,
  project_type TEXT DEFAULT 'transit',
  investment_amount_usd NUMERIC(16,2) DEFAULT 0,
  value_uplift_pct NUMERIC(6,2) DEFAULT 0,
  impact_radius_km NUMERIC(5,2) DEFAULT 2,
  tod_effect_score NUMERIC(5,2) DEFAULT 0,
  logistics_expansion_score NUMERIC(5,2) DEFAULT 0,
  industrial_zone_effect NUMERIC(5,2) DEFAULT 0,
  completion_pct NUMERIC(5,2) DEFAULT 0,
  estimated_completion_date DATE,
  affected_properties_count INT DEFAULT 0,
  composite_impact_score NUMERIC(5,2) DEFAULT 0,
  impact_tier TEXT DEFAULT 'moderate',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Spatial Investment Sequencing Intelligence
CREATE TABLE public.pufg_spatial_sequencing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Indonesia',
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  development_wave INT DEFAULT 1,
  wave_priority_score NUMERIC(5,2) DEFAULT 0,
  residential_readiness NUMERIC(5,2) DEFAULT 0,
  commercial_readiness NUMERIC(5,2) DEFAULT 0,
  service_ecosystem_readiness NUMERIC(5,2) DEFAULT 0,
  capital_timing_alignment NUMERIC(5,2) DEFAULT 0,
  urban_readiness_index NUMERIC(5,2) DEFAULT 0,
  recommended_asset_mix JSONB DEFAULT '{}',
  deployment_sequence JSONB DEFAULT '[]',
  estimated_roi_premium_pct NUMERIC(6,2) DEFAULT 0,
  sequencing_confidence NUMERIC(5,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Sustainable Growth Optimization Loop
CREATE TABLE public.pufg_sustainable_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL DEFAULT 'Indonesia',
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  density_stress_index NUMERIC(5,2) DEFAULT 0,
  congestion_risk_score NUMERIC(5,2) DEFAULT 0,
  environmental_pressure NUMERIC(5,2) DEFAULT 0,
  green_space_ratio NUMERIC(5,3) DEFAULT 0,
  service_capacity_utilization NUMERIC(5,2) DEFAULT 0,
  balanced_growth_score NUMERIC(5,2) DEFAULT 0,
  sustainability_tier TEXT DEFAULT 'adequate',
  expansion_recommendation TEXT DEFAULT 'monitor',
  risk_warnings JSONB DEFAULT '[]',
  optimization_actions JSONB DEFAULT '[]',
  carrying_capacity_pct NUMERIC(5,2) DEFAULT 0,
  projected_stress_12m NUMERIC(5,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.pufg_expansion_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pufg_district_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pufg_infrastructure_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pufg_spatial_sequencing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pufg_sustainable_growth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read pufg_expansion_signals" ON public.pufg_expansion_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read pufg_district_lifecycle" ON public.pufg_district_lifecycle FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read pufg_infrastructure_impact" ON public.pufg_infrastructure_impact FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read pufg_spatial_sequencing" ON public.pufg_spatial_sequencing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read pufg_sustainable_growth" ON public.pufg_sustainable_growth FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service write pufg_expansion_signals" ON public.pufg_expansion_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd pufg_expansion_signals" ON public.pufg_expansion_signals FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write pufg_district_lifecycle" ON public.pufg_district_lifecycle FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd pufg_district_lifecycle" ON public.pufg_district_lifecycle FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write pufg_infrastructure_impact" ON public.pufg_infrastructure_impact FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd pufg_infrastructure_impact" ON public.pufg_infrastructure_impact FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write pufg_spatial_sequencing" ON public.pufg_spatial_sequencing FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd pufg_spatial_sequencing" ON public.pufg_spatial_sequencing FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service write pufg_sustainable_growth" ON public.pufg_sustainable_growth FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service upd pufg_sustainable_growth" ON public.pufg_sustainable_growth FOR UPDATE TO service_role USING (true);

-- Indexes
CREATE INDEX idx_pufg_expansion_composite ON public.pufg_expansion_signals(composite_expansion_signal DESC);
CREATE INDEX idx_pufg_expansion_city ON public.pufg_expansion_signals(city, district);
CREATE INDEX idx_pufg_lifecycle_phase ON public.pufg_district_lifecycle(lifecycle_phase, phase_maturity_pct DESC);
CREATE INDEX idx_pufg_infra_impact ON public.pufg_infrastructure_impact(composite_impact_score DESC);
CREATE INDEX idx_pufg_spatial_wave ON public.pufg_spatial_sequencing(development_wave, wave_priority_score DESC);
CREATE INDEX idx_pufg_sustain_growth ON public.pufg_sustainable_growth(balanced_growth_score DESC);

-- Trigger: emit signal on lifecycle phase transition to saturation
CREATE OR REPLACE FUNCTION public.pufg_lifecycle_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lifecycle_phase = 'saturation' AND (OLD IS NULL OR OLD.lifecycle_phase != 'saturation') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'pufg_saturation_reached',
      'pufg_lifecycle',
      NEW.id::text,
      'high',
      jsonb_build_object(
        'city', NEW.city, 'district', NEW.district,
        'phase', NEW.lifecycle_phase,
        'density', NEW.density_index,
        'regeneration_potential', NEW.regeneration_potential
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_pufg_lifecycle_transition
AFTER INSERT OR UPDATE ON public.pufg_district_lifecycle
FOR EACH ROW EXECUTE FUNCTION public.pufg_lifecycle_transition();
