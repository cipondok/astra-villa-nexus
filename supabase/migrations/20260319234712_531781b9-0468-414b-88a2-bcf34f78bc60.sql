
-- GLOBAL CAPITAL FLYWHEEL SINGULARITY (GCFS)

CREATE TABLE public.gcfs_capital_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_source text NOT NULL,
  city text NOT NULL,
  district text,
  inquiry_velocity numeric DEFAULT 0,
  conversion_probability numeric DEFAULT 0 CHECK (conversion_probability BETWEEN 0 AND 1),
  capital_migration_volume_usd numeric DEFAULT 0,
  macro_yield_expectation numeric DEFAULT 0,
  signal_strength numeric DEFAULT 0 CHECK (signal_strength BETWEEN 0 AND 100),
  signal_confidence numeric DEFAULT 0 CHECK (signal_confidence BETWEEN 0 AND 100),
  flow_direction text DEFAULT 'inbound' CHECK (flow_direction IN ('inbound','outbound','internal','cross_border')),
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gcfs_opportunity_gravity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text,
  asset_class text NOT NULL,
  gravity_score numeric DEFAULT 0 CHECK (gravity_score BETWEEN 0 AND 100),
  capital_flow_priority int DEFAULT 0,
  liquidity_momentum numeric DEFAULT 0,
  yield_forecast_12m numeric DEFAULT 0,
  absorption_velocity numeric DEFAULT 0,
  visibility_rank int DEFAULT 0,
  competing_capital_density numeric DEFAULT 0,
  opportunity_window_months numeric,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gcfs_institutional_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_tier text NOT NULL CHECK (institution_tier IN ('sovereign_fund','pension_fund','family_office','reit','hedge_fund','private_equity')),
  transparency_score numeric DEFAULT 0 CHECK (transparency_score BETWEEN 0 AND 100),
  deal_performance_visibility numeric DEFAULT 0 CHECK (deal_performance_visibility BETWEEN 0 AND 100),
  downside_risk_accuracy numeric DEFAULT 0 CHECK (downside_risk_accuracy BETWEEN 0 AND 100),
  trust_threshold_met boolean DEFAULT false,
  participation_probability numeric DEFAULT 0 CHECK (participation_probability BETWEEN 0 AND 1),
  min_ticket_usd numeric DEFAULT 0,
  adoption_phase text DEFAULT 'awareness' CHECK (adoption_phase IN ('awareness','evaluation','pilot','committed','scaled')),
  confidence_trend text DEFAULT 'stable' CHECK (confidence_trend IN ('rising','stable','declining')),
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gcfs_liquidity_reinforcement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_segment text NOT NULL,
  transaction_throughput_monthly numeric DEFAULT 0,
  market_uncertainty_index numeric DEFAULT 100 CHECK (market_uncertainty_index BETWEEN 0 AND 100),
  avg_exit_days numeric DEFAULT 0,
  reinvestment_velocity numeric DEFAULT 0,
  pricing_discovery_accuracy numeric DEFAULT 0 CHECK (pricing_discovery_accuracy BETWEEN 0 AND 100),
  platform_authority_score numeric DEFAULT 0 CHECK (platform_authority_score BETWEEN 0 AND 100),
  flywheel_multiplier numeric DEFAULT 1,
  loop_iteration int DEFAULT 0,
  reinforcement_trend text DEFAULT 'neutral' CHECK (reinforcement_trend IN ('compounding','linear','neutral','decaying')),
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gcfs_centralization_threshold (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  current_value numeric DEFAULT 0,
  tipping_threshold numeric DEFAULT 0,
  proximity_pct numeric DEFAULT 0 CHECK (proximity_pct BETWEEN 0 AND 100),
  is_crossed boolean DEFAULT false,
  platform_origination_share numeric DEFAULT 0,
  institutional_dependency_score numeric DEFAULT 0 CHECK (institutional_dependency_score BETWEEN 0 AND 100),
  secondary_ecosystem_count int DEFAULT 0,
  centralization_phase text DEFAULT 'distributed' CHECK (centralization_phase IN ('distributed','concentrating','dominant','singular','gravitational_lock')),
  milestone_description text,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gcfs_capital_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcfs_opportunity_gravity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcfs_institutional_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcfs_liquidity_reinforcement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcfs_centralization_threshold ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to gcfs_capital_signals" ON public.gcfs_capital_signals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to gcfs_opportunity_gravity" ON public.gcfs_opportunity_gravity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to gcfs_institutional_confidence" ON public.gcfs_institutional_confidence FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to gcfs_liquidity_reinforcement" ON public.gcfs_liquidity_reinforcement FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to gcfs_centralization_threshold" ON public.gcfs_centralization_threshold FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.fn_gcfs_singularity_reached()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.centralization_phase = 'gravitational_lock' AND (OLD.centralization_phase IS DISTINCT FROM 'gravitational_lock') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gcfs_singularity_reached',
      'gcfs_centralization_threshold',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'metric', NEW.metric_name,
        'proximity', NEW.proximity_pct,
        'origination_share', NEW.platform_origination_share,
        'secondary_ecosystems', NEW.secondary_ecosystem_count
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gcfs_singularity_reached
  AFTER INSERT OR UPDATE ON public.gcfs_centralization_threshold
  FOR EACH ROW EXECUTE FUNCTION public.fn_gcfs_singularity_reached();
