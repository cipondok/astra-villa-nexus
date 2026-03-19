
-- AUTONOMOUS MARKET CREATION ENGINE (AMCE)

CREATE TABLE public.amce_opportunity_detection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text,
  detection_type text NOT NULL CHECK (detection_type IN ('liquidity_uptick','demographic_migration','infrastructure_inflection','yield_compression','supply_gap')),
  signal_strength numeric DEFAULT 0 CHECK (signal_strength BETWEEN 0 AND 100),
  confidence numeric DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  current_liquidity_index numeric DEFAULT 0,
  projected_growth_12m numeric DEFAULT 0,
  infrastructure_catalyst text,
  demographic_shift_vector jsonb DEFAULT '{}'::jsonb,
  yield_spread_vs_mainstream numeric DEFAULT 0,
  discovery_priority int DEFAULT 3 CHECK (discovery_priority BETWEEN 1 AND 5),
  is_actionable boolean DEFAULT false,
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.amce_category_formation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text NOT NULL,
  category_thesis text,
  asset_count int DEFAULT 0,
  thematic_tags text[] DEFAULT '{}',
  standardized_metrics jsonb DEFAULT '{}'::jsonb,
  narrative_frame text,
  investor_comprehension_score numeric DEFAULT 0 CHECK (investor_comprehension_score BETWEEN 0 AND 100),
  category_distinctiveness numeric DEFAULT 0 CHECK (category_distinctiveness BETWEEN 0 AND 100),
  formation_stage text DEFAULT 'conceptual' CHECK (formation_stage IN ('conceptual','defined','validated','adopted','mainstream')),
  comparable_categories text[] DEFAULT '{}',
  formed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.amce_demand_stimulation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.amce_category_formation(id) ON DELETE CASCADE,
  stimulation_type text NOT NULL CHECK (stimulation_type IN ('deal_showcase','education_content','supply_activation','early_adopter_incentive','targeted_outreach')),
  campaign_name text NOT NULL,
  target_investor_segment text,
  reach_count int DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  conversion_count int DEFAULT 0,
  awareness_lift_pct numeric DEFAULT 0,
  demand_acceleration_score numeric DEFAULT 0 CHECK (demand_acceleration_score BETWEEN 0 AND 100),
  budget_usd numeric DEFAULT 0,
  roi_multiple numeric DEFAULT 0,
  status text DEFAULT 'planned' CHECK (status IN ('planned','active','completed','paused')),
  launched_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.amce_liquidity_seeding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.amce_category_formation(id) ON DELETE CASCADE,
  city text NOT NULL,
  district text,
  anchor_investor_count int DEFAULT 0,
  deal_flow_concentration numeric DEFAULT 0,
  comparable_transactions int DEFAULT 0,
  benchmark_price_established boolean DEFAULT false,
  avg_transaction_value_usd numeric DEFAULT 0,
  liquidity_depth_score numeric DEFAULT 0 CHECK (liquidity_depth_score BETWEEN 0 AND 100),
  time_to_benchmark_months numeric,
  seeding_phase text DEFAULT 'pre_seed' CHECK (seeding_phase IN ('pre_seed','seeding','germinating','rooted','liquid')),
  seeded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.amce_market_maturity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.amce_category_formation(id) ON DELETE CASCADE,
  maturity_stage text NOT NULL DEFAULT 'emerging' CHECK (maturity_stage IN ('emerging','validated','scaling','institutionalized')),
  total_transaction_volume_usd numeric DEFAULT 0,
  unique_investors int DEFAULT 0,
  institutional_participation boolean DEFAULT false,
  price_discovery_accuracy numeric DEFAULT 0 CHECK (price_discovery_accuracy BETWEEN 0 AND 100),
  market_depth_index numeric DEFAULT 0 CHECK (market_depth_index BETWEEN 0 AND 100),
  months_in_stage int DEFAULT 0,
  graduation_readiness_pct numeric DEFAULT 0 CHECK (graduation_readiness_pct BETWEEN 0 AND 100),
  next_stage_requirements jsonb DEFAULT '[]'::jsonb,
  impact_thesis text,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.amce_opportunity_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amce_category_formation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amce_demand_stimulation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amce_liquidity_seeding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amce_market_maturity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to amce_opportunity_detection" ON public.amce_opportunity_detection FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to amce_category_formation" ON public.amce_category_formation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to amce_demand_stimulation" ON public.amce_demand_stimulation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to amce_liquidity_seeding" ON public.amce_liquidity_seeding FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to amce_market_maturity" ON public.amce_market_maturity FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.fn_amce_market_institutionalized()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.maturity_stage = 'institutionalized' AND (OLD.maturity_stage IS DISTINCT FROM 'institutionalized') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'amce_market_institutionalized',
      'amce_market_maturity',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'category_id', NEW.category_id,
        'transaction_volume', NEW.total_transaction_volume_usd,
        'unique_investors', NEW.unique_investors,
        'market_depth', NEW.market_depth_index
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_amce_market_institutionalized
  AFTER INSERT OR UPDATE ON public.amce_market_maturity
  FOR EACH ROW EXECUTE FUNCTION public.fn_amce_market_institutionalized();
