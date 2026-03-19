
-- CATEGORY-KILLER PRODUCT EVOLUTION ROADMAP (CKPER)

CREATE TABLE public.ckper_evolution_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number int NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  phase_name text NOT NULL,
  phase_status text NOT NULL DEFAULT 'planned' CHECK (phase_status IN ('planned','building','live','dominant','transcended')),
  target_start_date date,
  target_end_date date,
  actual_start_date date,
  actual_end_date date,
  completion_pct numeric DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
  category_displacement_score numeric DEFAULT 0,
  user_behavior_shift_pct numeric DEFAULT 0,
  competitive_gap_months numeric DEFAULT 0,
  breakthrough_features jsonb DEFAULT '[]'::jsonb,
  displacement_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.ckper_feature_stack (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid REFERENCES public.ckper_evolution_phases(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  feature_category text NOT NULL CHECK (feature_category IN ('matching','transparency','execution','prediction','automation','infrastructure','intelligence')),
  impact_tier text NOT NULL DEFAULT 'high' CHECK (impact_tier IN ('critical','high','medium','foundational')),
  development_status text NOT NULL DEFAULT 'planned' CHECK (development_status IN ('planned','in_progress','beta','live','scaling')),
  competitive_uniqueness_score numeric DEFAULT 0 CHECK (competitive_uniqueness_score BETWEEN 0 AND 100),
  user_adoption_rate numeric DEFAULT 0,
  switching_cost_contribution numeric DEFAULT 0,
  estimated_dev_weeks int DEFAULT 4,
  dependencies jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.ckper_competitive_displacement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name text NOT NULL,
  competitor_category text NOT NULL,
  our_advantage_score numeric DEFAULT 0 CHECK (our_advantage_score BETWEEN -100 AND 100),
  feature_gap_count int DEFAULT 0,
  speed_advantage_pct numeric DEFAULT 0,
  data_moat_depth numeric DEFAULT 0,
  user_migration_rate numeric DEFAULT 0,
  perceived_inevitability numeric DEFAULT 0 CHECK (perceived_inevitability BETWEEN 0 AND 100),
  displacement_phase int DEFAULT 1,
  displacement_strategy text,
  tracked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.ckper_behavior_transformation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_name text NOT NULL,
  phase_number int NOT NULL,
  reactive_pct numeric DEFAULT 100,
  informed_pct numeric DEFAULT 0,
  predictive_pct numeric DEFAULT 0,
  autonomous_pct numeric DEFAULT 0,
  institutional_pct numeric DEFAULT 0,
  avg_decisions_per_month numeric DEFAULT 0,
  platform_dependency_score numeric DEFAULT 0 CHECK (platform_dependency_score BETWEEN 0 AND 100),
  behavior_velocity numeric DEFAULT 0,
  transformation_confidence numeric DEFAULT 0,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.ckper_category_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text NOT NULL,
  ownership_tier text NOT NULL DEFAULT 'challenger' CHECK (ownership_tier IN ('entrant','challenger','leader','category_definer','industry_os')),
  market_share_pct numeric DEFAULT 0,
  mind_share_pct numeric DEFAULT 0,
  standard_setting_influence numeric DEFAULT 0 CHECK (standard_setting_influence BETWEEN 0 AND 100),
  api_dependency_count int DEFAULT 0,
  ecosystem_partners int DEFAULT 0,
  category_redefinition_events int DEFAULT 0,
  time_to_next_tier_months numeric,
  ownership_momentum numeric DEFAULT 0,
  decade_projection jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ckper_evolution_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ckper_feature_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ckper_competitive_displacement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ckper_behavior_transformation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ckper_category_ownership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to ckper_evolution_phases" ON public.ckper_evolution_phases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ckper_feature_stack" ON public.ckper_feature_stack FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ckper_competitive_displacement" ON public.ckper_competitive_displacement FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ckper_behavior_transformation" ON public.ckper_behavior_transformation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ckper_category_ownership" ON public.ckper_category_ownership FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.fn_ckper_phase_dominant()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.phase_status = 'dominant' AND (OLD.phase_status IS DISTINCT FROM 'dominant') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'ckper_phase_dominant',
      'ckper_evolution_phases',
      NEW.id::text,
      'critical',
      jsonb_build_object('phase_number', NEW.phase_number, 'phase_name', NEW.phase_name, 'displacement_score', NEW.category_displacement_score, 'competitive_gap_months', NEW.competitive_gap_months)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ckper_phase_dominant
  AFTER UPDATE ON public.ckper_evolution_phases
  FOR EACH ROW EXECUTE FUNCTION public.fn_ckper_phase_dominant();
