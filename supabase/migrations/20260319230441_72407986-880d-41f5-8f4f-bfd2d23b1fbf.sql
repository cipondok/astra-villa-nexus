
-- ══════════════════════════════════════════════════════════════
-- PSRE: Post-Scarcity Real Estate Economy Model
-- ══════════════════════════════════════════════════════════════

-- 1) Intelligent Supply Synchronization
CREATE TABLE public.psre_supply_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  district text,
  -- Construction capacity
  construction_capacity_units_yr int NOT NULL DEFAULT 0,
  active_construction_units int NOT NULL DEFAULT 0,
  avg_build_cycle_months numeric NOT NULL DEFAULT 0,
  labor_availability_index numeric NOT NULL DEFAULT 50,
  -- Land utilization
  total_developable_land_ha numeric NOT NULL DEFAULT 0,
  utilized_land_pct numeric NOT NULL DEFAULT 0,
  zoned_residential_pct numeric NOT NULL DEFAULT 0,
  land_banking_pct numeric NOT NULL DEFAULT 0, -- hoarded/idle land
  -- Population forecast
  population_forecast_5y int NOT NULL DEFAULT 0,
  migration_net_annual int NOT NULL DEFAULT 0,
  household_formation_rate numeric NOT NULL DEFAULT 0,
  housing_units_needed_5y int NOT NULL DEFAULT 0,
  -- Infrastructure timing
  infra_readiness_score numeric NOT NULL DEFAULT 0, -- 0-100
  transit_expansion_planned boolean NOT NULL DEFAULT false,
  utility_capacity_headroom_pct numeric NOT NULL DEFAULT 0,
  -- Synchronization
  supply_sync_score numeric NOT NULL DEFAULT 0, -- 0-100 (100=perfectly synced)
  artificial_scarcity_index numeric NOT NULL DEFAULT 0, -- 0-100 (high = market failure)
  sync_status text NOT NULL DEFAULT 'monitoring', -- 'monitoring','misaligned','correcting','synchronized'
  recommended_intervention text,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_psre_sync_city ON public.psre_supply_sync(city);
CREATE INDEX idx_psre_sync_score ON public.psre_supply_sync(supply_sync_score DESC);

-- 2) Adaptive Ownership Structures
CREATE TABLE public.psre_ownership_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  model_type text NOT NULL, -- 'fractional_token','rental_to_equity','co_investment_pool','community_land_trust','shared_equity'
  -- Model metrics
  active_participants int NOT NULL DEFAULT 0,
  total_units_covered int NOT NULL DEFAULT 0,
  total_capital_locked_usd numeric NOT NULL DEFAULT 0,
  avg_entry_cost_usd numeric NOT NULL DEFAULT 0,
  avg_equity_accumulation_rate_pct numeric NOT NULL DEFAULT 0,
  -- Access expansion
  accessibility_score numeric NOT NULL DEFAULT 0, -- 0-100
  income_bracket_coverage text NOT NULL DEFAULT 'middle', -- 'all','upper_middle','middle','lower_middle','broad'
  first_time_buyer_pct numeric NOT NULL DEFAULT 0,
  -- Market stability
  market_destabilization_risk numeric NOT NULL DEFAULT 0, -- 0-100
  liquidity_provision_score numeric NOT NULL DEFAULT 0, -- 0-100
  regulatory_compliance_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Performance
  avg_participant_roi_pct numeric NOT NULL DEFAULT 0,
  default_rate_pct numeric NOT NULL DEFAULT 0,
  satisfaction_score numeric NOT NULL DEFAULT 0, -- 0-100
  model_maturity text NOT NULL DEFAULT 'experimental', -- 'experimental','pilot','scaling','mature','standard'
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_psre_own_city ON public.psre_ownership_models(city);
CREATE INDEX idx_psre_own_type ON public.psre_ownership_models(model_type);

-- 3) Price Stability & Volatility Dampening
CREATE TABLE public.psre_price_stability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  district text,
  -- Speculation detection
  speculative_heat_index numeric NOT NULL DEFAULT 0, -- 0-100
  flip_transaction_pct numeric NOT NULL DEFAULT 0, -- % of transactions < 2yr hold
  foreign_speculative_volume_pct numeric NOT NULL DEFAULT 0,
  price_income_divergence numeric NOT NULL DEFAULT 0,
  -- Supply rebalancing
  supply_incentive_active boolean NOT NULL DEFAULT false,
  incentive_type text, -- 'tax_relief','fast_permits','density_bonus','infra_subsidy'
  incentive_effectiveness_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Affordability
  median_price_to_income numeric NOT NULL DEFAULT 0,
  affordable_stock_pct numeric NOT NULL DEFAULT 0, -- % units affordable to median income
  rental_burden_pct numeric NOT NULL DEFAULT 0, -- avg % income on rent
  affordability_trajectory text NOT NULL DEFAULT 'stable', -- 'improving','stable','worsening','crisis'
  -- Dampening
  volatility_30d numeric NOT NULL DEFAULT 0,
  volatility_90d numeric NOT NULL DEFAULT 0,
  dampening_score numeric NOT NULL DEFAULT 50, -- 0-100 (100=perfectly stable)
  dampening_mechanism text, -- 'supply_release','speculation_tax','lending_tightening','demand_cooling'
  intervention_urgency text NOT NULL DEFAULT 'none', -- 'none','watch','moderate','urgent','critical'
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_psre_stab_city ON public.psre_price_stability(city);
CREATE INDEX idx_psre_stab_heat ON public.psre_price_stability(speculative_heat_index DESC);

-- 4) Global Habitat Quality Index
CREATE TABLE public.psre_habitat_quality (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  district text,
  -- Core dimensions
  livability_score numeric NOT NULL DEFAULT 0, -- 0-100
  connectivity_score numeric NOT NULL DEFAULT 0, -- 0-100
  economic_opportunity_score numeric NOT NULL DEFAULT 0, -- 0-100
  environmental_sustainability_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Sub-indicators
  healthcare_access numeric NOT NULL DEFAULT 0,
  education_quality numeric NOT NULL DEFAULT 0,
  safety_index numeric NOT NULL DEFAULT 0,
  cultural_richness numeric NOT NULL DEFAULT 0,
  digital_infrastructure numeric NOT NULL DEFAULT 0,
  public_transit_coverage numeric NOT NULL DEFAULT 0,
  employment_density numeric NOT NULL DEFAULT 0,
  startup_ecosystem numeric NOT NULL DEFAULT 0,
  air_quality_index numeric NOT NULL DEFAULT 0,
  green_coverage_pct numeric NOT NULL DEFAULT 0,
  renewable_energy_pct numeric NOT NULL DEFAULT 0,
  water_security numeric NOT NULL DEFAULT 0,
  -- Composite
  habitat_quality_index numeric NOT NULL DEFAULT 0, -- 0-100
  habitat_tier text NOT NULL DEFAULT 'developing', -- 'world_class','excellent','good','developing','underserved'
  capital_deployment_priority text NOT NULL DEFAULT 'standard', -- 'critical','high','standard','low','saturated'
  improvement_trajectory text NOT NULL DEFAULT 'stable',
  investment_impact_multiplier numeric NOT NULL DEFAULT 1.0, -- how much each $ improves score
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_psre_hab_city ON public.psre_habitat_quality(city);
CREATE INDEX idx_psre_hab_quality ON public.psre_habitat_quality(habitat_quality_index DESC);

-- 5) Abundance Flywheel
CREATE TABLE public.psre_abundance_flywheel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  -- Vacancy & utilization
  structural_vacancy_pct numeric NOT NULL DEFAULT 0,
  optimal_vacancy_pct numeric NOT NULL DEFAULT 5.0, -- healthy market friction
  vacancy_gap numeric NOT NULL DEFAULT 0, -- actual - optimal
  asset_utilization_score numeric NOT NULL DEFAULT 0, -- 0-100
  adaptive_reuse_units int NOT NULL DEFAULT 0,
  -- Development speed
  avg_permitting_days int NOT NULL DEFAULT 0,
  avg_construction_months numeric NOT NULL DEFAULT 0,
  dev_cycle_efficiency_score numeric NOT NULL DEFAULT 0, -- 0-100
  cycle_improvement_pct_yr numeric NOT NULL DEFAULT 0,
  -- Social mobility
  homeownership_accessibility_score numeric NOT NULL DEFAULT 0, -- 0-100
  wealth_building_velocity numeric NOT NULL DEFAULT 0, -- equity gain rate
  intergenerational_mobility_index numeric NOT NULL DEFAULT 0, -- 0-100
  housing_cost_burden_reduction_pct numeric NOT NULL DEFAULT 0,
  -- Flywheel
  abundance_composite_score numeric NOT NULL DEFAULT 0, -- 0-100
  flywheel_stage text NOT NULL DEFAULT 'nascent', -- 'nascent','activating','accelerating','self_sustaining','abundant'
  flywheel_momentum numeric NOT NULL DEFAULT 0, -- velocity of improvement
  next_stage_trigger text,
  estimated_months_to_next numeric,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_psre_fly_city ON public.psre_abundance_flywheel(city);
CREATE INDEX idx_psre_fly_score ON public.psre_abundance_flywheel(abundance_composite_score DESC);

-- Trigger: emit signal when artificial scarcity is high
CREATE OR REPLACE FUNCTION public.fn_psre_scarcity_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.artificial_scarcity_index >= 70 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'psre_artificial_scarcity',
      'psre_supply_sync',
      NEW.id::text,
      CASE WHEN NEW.artificial_scarcity_index >= 85 THEN 'critical' ELSE 'high' END,
      jsonb_build_object(
        'city', NEW.city,
        'scarcity_index', NEW.artificial_scarcity_index,
        'sync_score', NEW.supply_sync_score,
        'status', NEW.sync_status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_psre_scarcity_alert
AFTER INSERT OR UPDATE ON public.psre_supply_sync
FOR EACH ROW EXECUTE FUNCTION public.fn_psre_scarcity_alert();

-- RLS
ALTER TABLE public.psre_supply_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psre_ownership_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psre_price_stability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psre_habitat_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psre_abundance_flywheel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read psre_supply_sync" ON public.psre_supply_sync FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psre_ownership_models" ON public.psre_ownership_models FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psre_price_stability" ON public.psre_price_stability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psre_habitat_quality" ON public.psre_habitat_quality FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read psre_abundance_flywheel" ON public.psre_abundance_flywheel FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert psre_supply_sync" ON public.psre_supply_sync FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update psre_supply_sync" ON public.psre_supply_sync FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert psre_ownership_models" ON public.psre_ownership_models FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update psre_ownership_models" ON public.psre_ownership_models FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert psre_price_stability" ON public.psre_price_stability FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update psre_price_stability" ON public.psre_price_stability FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert psre_habitat_quality" ON public.psre_habitat_quality FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update psre_habitat_quality" ON public.psre_habitat_quality FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert psre_abundance_flywheel" ON public.psre_abundance_flywheel FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update psre_abundance_flywheel" ON public.psre_abundance_flywheel FOR UPDATE TO service_role USING (true);
