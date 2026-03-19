
-- AI COMPETITIVE EXTINCTION STRATEGY (ACES)

CREATE TABLE public.aces_intelligence_superiority (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  prediction_accuracy_pct numeric DEFAULT 0 CHECK (prediction_accuracy_pct BETWEEN 0 AND 100),
  accuracy_improvement_rate numeric DEFAULT 0,
  transactions_processed bigint DEFAULT 0,
  proprietary_data_points bigint DEFAULT 0,
  replication_difficulty_score numeric DEFAULT 0 CHECK (replication_difficulty_score BETWEEN 0 AND 100),
  market_timing_advantage_hours numeric DEFAULT 0,
  competitor_accuracy_gap_pct numeric DEFAULT 0,
  compounding_velocity numeric DEFAULT 0,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.aces_network_acceleration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network_segment text NOT NULL,
  deal_velocity_per_user numeric DEFAULT 0,
  transaction_friction_score numeric DEFAULT 100 CHECK (transaction_friction_score BETWEEN 0 AND 100),
  institutional_attraction_rate numeric DEFAULT 0,
  flywheel_rpm numeric DEFAULT 0,
  user_to_deal_ratio numeric DEFAULT 0,
  network_density numeric DEFAULT 0,
  competitor_velocity_gap_pct numeric DEFAULT 0,
  time_to_critical_mass_months numeric,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.aces_execution_dominance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text NOT NULL,
  discovery_to_close_hours numeric DEFAULT 0,
  automation_coverage_pct numeric DEFAULT 0 CHECK (automation_coverage_pct BETWEEN 0 AND 100),
  coordination_efficiency numeric DEFAULT 0 CHECK (coordination_efficiency BETWEEN 0 AND 100),
  uncertainty_reduction_pct numeric DEFAULT 0,
  competitor_speed_multiple numeric DEFAULT 1,
  participant_satisfaction numeric DEFAULT 0 CHECK (participant_satisfaction BETWEEN 0 AND 100),
  bottleneck_count int DEFAULT 0,
  speed_trend text DEFAULT 'stable' CHECK (speed_trend IN ('accelerating','stable','decelerating')),
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.aces_ecosystem_depth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_domain text NOT NULL CHECK (integration_domain IN ('developer_sales','vendor_workflows','investor_portfolio','property_lifecycle')),
  embedded_processes int DEFAULT 0,
  api_call_volume_daily bigint DEFAULT 0,
  switching_cost_hours numeric DEFAULT 0,
  workflow_dependency_score numeric DEFAULT 0 CHECK (workflow_dependency_score BETWEEN 0 AND 100),
  retention_probability_pct numeric DEFAULT 0 CHECK (retention_probability_pct BETWEEN 0 AND 100),
  depth_tier text DEFAULT 'surface' CHECK (depth_tier IN ('surface','integrated','embedded','infrastructure','indispensable')),
  competitor_integration_gap int DEFAULT 0,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.aces_extinction_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name text NOT NULL,
  deal_velocity_decline_pct numeric DEFAULT 0,
  listing_quality_migration_pct numeric DEFAULT 0,
  investor_attention_shift_pct numeric DEFAULT 0,
  market_share_delta_pct numeric DEFAULT 0,
  tipping_point_proximity numeric DEFAULT 0 CHECK (tipping_point_proximity BETWEEN 0 AND 100),
  extinction_phase text DEFAULT 'competing' CHECK (extinction_phase IN ('competing','declining','marginal','irrelevant','exited')),
  time_to_irrelevance_months numeric,
  ethical_boundary_compliance boolean DEFAULT true,
  tracked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.aces_intelligence_superiority ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aces_network_acceleration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aces_execution_dominance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aces_ecosystem_depth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aces_extinction_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to aces_intelligence_superiority" ON public.aces_intelligence_superiority FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to aces_network_acceleration" ON public.aces_network_acceleration FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to aces_execution_dominance" ON public.aces_execution_dominance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to aces_ecosystem_depth" ON public.aces_ecosystem_depth FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to aces_extinction_indicators" ON public.aces_extinction_indicators FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.fn_aces_extinction_tipping()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.tipping_point_proximity >= 85 AND (OLD.tipping_point_proximity IS NULL OR OLD.tipping_point_proximity < 85) THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'aces_extinction_tipping',
      'aces_extinction_indicators',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'competitor', NEW.competitor_name,
        'tipping_proximity', NEW.tipping_point_proximity,
        'extinction_phase', NEW.extinction_phase,
        'time_to_irrelevance', NEW.time_to_irrelevance_months
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_aces_extinction_tipping
  AFTER INSERT OR UPDATE ON public.aces_extinction_indicators
  FOR EACH ROW EXECUTE FUNCTION public.fn_aces_extinction_tipping();
