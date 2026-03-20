
-- ═══════════════════════════════════════════════════════════
-- LONG-HORIZON HUMAN PROSPERITY STRATEGY MODEL (LHPS)
-- ═══════════════════════════════════════════════════════════

-- 1️⃣ Prosperity Drivers Identification
CREATE TABLE public.lhps_prosperity_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  country text NOT NULL DEFAULT 'Global',
  education_index numeric NOT NULL DEFAULT 0,
  productivity_growth_pct numeric NOT NULL DEFAULT 0,
  infrastructure_quality_score numeric NOT NULL DEFAULT 0,
  housing_affordability_ratio numeric NOT NULL DEFAULT 5,
  innovation_ecosystem_score numeric NOT NULL DEFAULT 0,
  research_intensity_pct numeric NOT NULL DEFAULT 0,
  digital_readiness_score numeric NOT NULL DEFAULT 0,
  talent_retention_index numeric NOT NULL DEFAULT 0,
  composite_prosperity_driver numeric NOT NULL DEFAULT 0,
  driver_momentum text NOT NULL DEFAULT 'stable',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lhps_prosperity_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_lhps_drivers" ON public.lhps_prosperity_drivers FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_lhps_drivers_region ON public.lhps_prosperity_drivers (region);
CREATE INDEX idx_lhps_drivers_momentum ON public.lhps_prosperity_drivers (driver_momentum);

-- 2️⃣ Capital Productivity Optimization
CREATE TABLE public.lhps_capital_productivity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  infrastructure_roi_pct numeric NOT NULL DEFAULT 0,
  tech_efficiency_gain_pct numeric NOT NULL DEFAULT 0,
  labor_productivity_index numeric NOT NULL DEFAULT 100,
  capital_deepening_rate numeric NOT NULL DEFAULT 0,
  total_factor_productivity numeric NOT NULL DEFAULT 0,
  regional_competitiveness_rank integer NOT NULL DEFAULT 0,
  competitiveness_delta integer NOT NULL DEFAULT 0,
  investment_multiplier numeric NOT NULL DEFAULT 1,
  marginal_productivity_trend text NOT NULL DEFAULT 'stable',
  projected_productivity_5y numeric NOT NULL DEFAULT 0,
  optimization_score numeric NOT NULL DEFAULT 50,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lhps_capital_productivity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_lhps_productivity" ON public.lhps_capital_productivity FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_lhps_productivity_region ON public.lhps_capital_productivity (region);

-- 3️⃣ Social Stability & Opportunity Access
CREATE TABLE public.lhps_social_opportunity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  employment_resilience_score numeric NOT NULL DEFAULT 50,
  unemployment_rate_pct numeric NOT NULL DEFAULT 0,
  labor_force_participation_pct numeric NOT NULL DEFAULT 0,
  wealth_mobility_index numeric NOT NULL DEFAULT 50,
  income_quintile_ratio numeric NOT NULL DEFAULT 5,
  regional_dev_imbalance_score numeric NOT NULL DEFAULT 0,
  social_safety_net_coverage_pct numeric NOT NULL DEFAULT 0,
  opportunity_access_score numeric NOT NULL DEFAULT 50,
  youth_opportunity_index numeric NOT NULL DEFAULT 50,
  gender_parity_index numeric NOT NULL DEFAULT 0.5,
  stability_risk_level text NOT NULL DEFAULT 'moderate',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lhps_social_opportunity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_lhps_social" ON public.lhps_social_opportunity FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_lhps_social_region ON public.lhps_social_opportunity (region);
CREATE INDEX idx_lhps_social_risk ON public.lhps_social_opportunity (stability_risk_level);

-- 4️⃣ Long-Cycle Growth Scenario Simulator
CREATE TABLE public.lhps_growth_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name text NOT NULL,
  region text NOT NULL,
  time_horizon_years integer NOT NULL DEFAULT 30,
  policy_pathway text NOT NULL DEFAULT 'baseline',
  investment_pathway text NOT NULL DEFAULT 'moderate',
  sustainability_priority text NOT NULL DEFAULT 'balanced',
  projected_gdp_growth_pct numeric NOT NULL DEFAULT 0,
  projected_employment_pct numeric NOT NULL DEFAULT 0,
  projected_housing_affordability numeric NOT NULL DEFAULT 5,
  projected_innovation_score numeric NOT NULL DEFAULT 0,
  resilience_trade_off_score numeric NOT NULL DEFAULT 50,
  sustainability_trade_off_score numeric NOT NULL DEFAULT 50,
  prosperity_outcome_score numeric NOT NULL DEFAULT 50,
  scenario_classification text NOT NULL DEFAULT 'moderate',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lhps_growth_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_lhps_scenarios" ON public.lhps_growth_scenarios FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_lhps_scenarios_region ON public.lhps_growth_scenarios (region);
CREATE INDEX idx_lhps_scenarios_class ON public.lhps_growth_scenarios (scenario_classification);

-- 5️⃣ Integrated Prosperity Intelligence Dashboard
CREATE TABLE public.lhps_prosperity_insight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  prosperity_index numeric NOT NULL DEFAULT 50,
  capital_alignment_score numeric NOT NULL DEFAULT 50,
  societal_outcome_score numeric NOT NULL DEFAULT 50,
  key_growth_drivers text[] NOT NULL DEFAULT '{}',
  key_risk_factors text[] NOT NULL DEFAULT '{}',
  strategic_action_plan text NOT NULL DEFAULT '',
  confidence_score numeric NOT NULL DEFAULT 50,
  investment_societal_alignment text NOT NULL DEFAULT 'partial',
  outlook_classification text NOT NULL DEFAULT 'stable',
  forecast_horizon_years integer NOT NULL DEFAULT 20,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lhps_prosperity_insight ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_lhps_insight" ON public.lhps_prosperity_insight FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_lhps_insight_region ON public.lhps_prosperity_insight (region);
CREATE INDEX idx_lhps_insight_outlook ON public.lhps_prosperity_insight (outlook_classification);

-- ── Trigger: emit signal on high prosperity momentum ──
CREATE OR REPLACE FUNCTION public.fn_lhps_prosperity_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.prosperity_index >= 75 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'lhps_prosperity_surge',
      'lhps_prosperity_insight',
      NEW.id,
      'high',
      jsonb_build_object('region', NEW.region, 'prosperity_index', NEW.prosperity_index, 'outlook', NEW.outlook_classification)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_lhps_prosperity_signal
  AFTER INSERT OR UPDATE ON public.lhps_prosperity_insight
  FOR EACH ROW EXECUTE FUNCTION public.fn_lhps_prosperity_signal();
