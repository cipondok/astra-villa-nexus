
-- ============================================================
-- PLATFORM NETWORK EFFECT SINGULARITY ENGINE SCHEMA
-- Network density, liquidity lock-in, viral multipliers,
-- platform dependency, and flywheel synchronization.
-- ============================================================

-- 1. Network Density Score (per city)
CREATE TABLE public.city_network_density (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  -- Component scores (0-100)
  investor_concentration_score numeric DEFAULT 0,
  vendor_service_depth_score numeric DEFAULT 0,
  deal_activity_frequency_score numeric DEFAULT 0,
  referral_propagation_velocity numeric DEFAULT 0,
  -- Absolute counts
  active_investors int DEFAULT 0,
  active_vendors int DEFAULT 0,
  active_agents int DEFAULT 0,
  active_listings int DEFAULT 0,
  deals_30d int DEFAULT 0,
  referrals_30d int DEFAULT 0,
  -- Composite
  network_density_score numeric DEFAULT 0,
  density_tier text DEFAULT 'emerging' CHECK (density_tier IN ('singularity','critical_mass','growing','emerging','nascent')),
  metcalfe_value_proxy numeric DEFAULT 0,
  scoring_inputs jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_cnd_city ON public.city_network_density(city);
CREATE INDEX idx_cnd_density ON public.city_network_density(network_density_score DESC);
CREATE INDEX idx_cnd_tier ON public.city_network_density(density_tier);

ALTER TABLE public.city_network_density ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read city_network_density" ON public.city_network_density FOR SELECT USING (true);

-- 2. Liquidity Lock-In Metrics (per city)
CREATE TABLE public.liquidity_lock_in_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  -- Flywheel metrics
  activity_to_roi_correlation numeric DEFAULT 0,
  roi_to_capital_correlation numeric DEFAULT 0,
  capital_to_closure_correlation numeric DEFAULT 0,
  flywheel_momentum_score numeric DEFAULT 0,
  -- Lock-in signals
  avg_investor_roi_pct numeric DEFAULT 0,
  capital_inflow_trend text DEFAULT 'stable' CHECK (capital_inflow_trend IN ('accelerating','growing','stable','declining','stalled')),
  avg_days_to_close numeric DEFAULT 0,
  repeat_investor_pct numeric DEFAULT 0,
  portfolio_depth_avg numeric DEFAULT 0,
  -- Composite
  lock_in_strength numeric DEFAULT 0,
  lock_in_tier text DEFAULT 'weak' CHECK (lock_in_tier IN ('impregnable','strong','moderate','weak','none')),
  insights jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_llm_city ON public.liquidity_lock_in_metrics(city);
CREATE INDEX idx_llm_strength ON public.liquidity_lock_in_metrics(lock_in_strength DESC);

ALTER TABLE public.liquidity_lock_in_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read liquidity_lock_in_metrics" ON public.liquidity_lock_in_metrics FOR SELECT USING (true);

-- 3. Viral Growth Multipliers
CREATE TABLE public.viral_growth_multipliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  period_month text NOT NULL,
  -- Viral metrics
  k_factor numeric DEFAULT 0,
  referral_conversion_rate numeric DEFAULT 0,
  organic_to_referred_ratio numeric DEFAULT 0,
  viral_cycle_time_days numeric DEFAULT 0,
  -- Tiered rewards impact
  tier_1_referrals int DEFAULT 0,
  tier_2_referrals int DEFAULT 0,
  tier_3_referrals int DEFAULT 0,
  reward_roi numeric DEFAULT 0,
  -- Growth multiplier
  compounding_growth_rate numeric DEFAULT 0,
  projected_users_30d int DEFAULT 0,
  projected_users_90d int DEFAULT 0,
  multiplier_tier text DEFAULT 'linear' CHECK (multiplier_tier IN ('exponential','superlinear','linear','sublinear','stalled')),
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_vgm_city_period ON public.viral_growth_multipliers(city, period_month);
CREATE INDEX idx_vgm_kfactor ON public.viral_growth_multipliers(k_factor DESC);

ALTER TABLE public.viral_growth_multipliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read viral_growth_multipliers" ON public.viral_growth_multipliers FOR SELECT USING (true);

-- 4. Platform Dependency Index (per user)
CREATE TABLE public.platform_dependency_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_role text,
  -- Dependency components (0-100)
  switching_cost_score numeric DEFAULT 0,
  engagement_stickiness_score numeric DEFAULT 0,
  portfolio_integration_depth numeric DEFAULT 0,
  data_moat_depth numeric DEFAULT 0,
  -- Activity signals
  total_sessions_30d int DEFAULT 0,
  total_actions_30d int DEFAULT 0,
  properties_managed int DEFAULT 0,
  deals_completed int DEFAULT 0,
  watchlist_size int DEFAULT 0,
  active_offers int DEFAULT 0,
  -- Composite
  dependency_score numeric DEFAULT 0,
  dependency_tier text DEFAULT 'casual' CHECK (dependency_tier IN ('locked_in','deeply_engaged','regular','casual','at_risk')),
  churn_risk_pct numeric DEFAULT 0,
  retention_actions jsonb DEFAULT '[]',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_pdi_user ON public.platform_dependency_index(user_id);
CREATE INDEX idx_pdi_dependency ON public.platform_dependency_index(dependency_score DESC);
CREATE INDEX idx_pdi_churn ON public.platform_dependency_index(churn_risk_pct DESC);

ALTER TABLE public.platform_dependency_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read platform_dependency_index" ON public.platform_dependency_index FOR SELECT USING (true);

-- 5. Flywheel Synchronization State
CREATE TABLE public.flywheel_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  -- Engine health scores (0-100)
  vendor_engine_health numeric DEFAULT 0,
  capital_engine_health numeric DEFAULT 0,
  deal_dominance_health numeric DEFAULT 0,
  pricing_engine_health numeric DEFAULT 0,
  network_density_health numeric DEFAULT 0,
  -- Synchronization
  sync_score numeric DEFAULT 0,
  weakest_link text,
  bottleneck_action text,
  -- Flywheel velocity
  flywheel_rpm numeric DEFAULT 0,
  acceleration_trend text DEFAULT 'stable' CHECK (acceleration_trend IN ('accelerating','stable','decelerating','stalled')),
  estimated_singularity_months int,
  -- Meta
  engine_states jsonb DEFAULT '{}',
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_fss_city ON public.flywheel_sync_state(city);
CREATE INDEX idx_fss_sync ON public.flywheel_sync_state(sync_score DESC);

ALTER TABLE public.flywheel_sync_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read flywheel_sync_state" ON public.flywheel_sync_state FOR SELECT USING (true);

-- 6. Trigger: emit signal when city reaches critical mass
CREATE OR REPLACE FUNCTION public.emit_network_singularity_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.density_tier IN ('singularity', 'critical_mass')
     AND (OLD IS NULL OR OLD.density_tier NOT IN ('singularity', 'critical_mass')) THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'network_critical_mass_reached',
      'city',
      NEW.city,
      'critical',
      jsonb_build_object(
        'city', NEW.city,
        'density_score', NEW.network_density_score,
        'tier', NEW.density_tier,
        'metcalfe_value', NEW.metcalfe_value_proxy
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_network_singularity_signal
AFTER INSERT OR UPDATE ON public.city_network_density
FOR EACH ROW EXECUTE FUNCTION public.emit_network_singularity_signal();
