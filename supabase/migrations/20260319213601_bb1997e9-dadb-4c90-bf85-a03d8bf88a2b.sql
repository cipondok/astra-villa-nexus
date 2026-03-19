
-- ============================================================
-- GLOBAL DEAL DOMINANCE ENGINE SCHEMA
-- Deal gravity scoring, visibility ranking, suppression,
-- boost signals, and dominance feedback loop.
-- ============================================================

-- 1. Deal Gravity Index (per property)
CREATE TABLE public.deal_gravity_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  district text,
  -- Component scores (0-100)
  offer_frequency_acceleration numeric DEFAULT 0,
  viewing_velocity_momentum numeric DEFAULT 0,
  escrow_initiation_probability numeric DEFAULT 0,
  deal_close_reliability numeric DEFAULT 0,
  investor_competition_density numeric DEFAULT 0,
  price_competitiveness numeric DEFAULT 0,
  -- Composite
  deal_gravity_score numeric DEFAULT 0,
  gravity_tier text DEFAULT 'standard' CHECK (gravity_tier IN ('dominant','high','standard','low','suppressed')),
  scoring_inputs jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_dgi_property ON public.deal_gravity_index(property_id);
CREATE INDEX idx_dgi_gravity ON public.deal_gravity_index(deal_gravity_score DESC);
CREATE INDEX idx_dgi_district ON public.deal_gravity_index(district);
CREATE INDEX idx_dgi_tier ON public.deal_gravity_index(gravity_tier);

ALTER TABLE public.deal_gravity_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read deal_gravity_index" ON public.deal_gravity_index FOR SELECT USING (true);

-- 2. Deal Visibility Ranking
CREATE TABLE public.deal_visibility_ranking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  district text,
  -- Visibility components
  deal_gravity_weight numeric DEFAULT 0,
  liquidity_urgency_weight numeric DEFAULT 0,
  capital_inflow_weight numeric DEFAULT 0,
  portfolio_demand_weight numeric DEFAULT 0,
  -- Suppression / boost modifiers
  suppression_coefficient numeric DEFAULT 1.0,
  boost_multiplier numeric DEFAULT 1.0,
  -- Final score
  visibility_score numeric DEFAULT 0,
  homepage_rank int,
  search_rank int,
  investor_feed_rank int,
  agent_feed_rank int,
  -- Decay
  ranking_decay_rate numeric DEFAULT 0.02,
  last_decay_at timestamptz DEFAULT now(),
  -- Meta
  ranking_context text DEFAULT 'organic' CHECK (ranking_context IN ('organic','boosted','institutional','scarcity','suppressed')),
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_dvr_property ON public.deal_visibility_ranking(property_id);
CREATE INDEX idx_dvr_visibility ON public.deal_visibility_ranking(visibility_score DESC);
CREATE INDEX idx_dvr_homepage ON public.deal_visibility_ranking(homepage_rank) WHERE homepage_rank IS NOT NULL;
CREATE INDEX idx_dvr_search ON public.deal_visibility_ranking(search_rank) WHERE search_rank IS NOT NULL;

ALTER TABLE public.deal_visibility_ranking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read deal_visibility_ranking" ON public.deal_visibility_ranking FOR SELECT USING (true);

-- 3. Deal Boost Signals
CREATE TABLE public.deal_boost_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  district text,
  boost_type text NOT NULL CHECK (boost_type IN ('high_conversion','institutional_grade','scarcity_zone','momentum_surge','strategic_placement')),
  boost_strength numeric DEFAULT 1.0,
  boost_reason text,
  trigger_metrics jsonb DEFAULT '{}',
  -- Lifecycle
  status text DEFAULT 'active' CHECK (status IN ('active','expired','consumed','cancelled')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dbs_property ON public.deal_boost_signals(property_id);
CREATE INDEX idx_dbs_active ON public.deal_boost_signals(status, boost_type) WHERE status = 'active';

ALTER TABLE public.deal_boost_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read deal_boost_signals" ON public.deal_boost_signals FOR SELECT USING (true);

-- 4. District Deal Dominance (aggregate per district)
CREATE TABLE public.district_deal_dominance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  segment_type text,
  -- Aggregate metrics
  avg_deal_gravity numeric DEFAULT 0,
  total_active_deals int DEFAULT 0,
  dominant_listings int DEFAULT 0,
  suppressed_listings int DEFAULT 0,
  avg_visibility_score numeric DEFAULT 0,
  deal_velocity_7d numeric DEFAULT 0,
  conversion_lift_pct numeric DEFAULT 0,
  -- Dominance feedback
  boost_to_inquiry_rate numeric DEFAULT 0,
  inquiry_to_offer_rate numeric DEFAULT 0,
  offer_to_close_rate numeric DEFAULT 0,
  dominance_efficiency_score numeric DEFAULT 0,
  -- Meta
  insights jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_ddd_district_segment ON public.district_deal_dominance(district, COALESCE(segment_type, '__all__'));
CREATE INDEX idx_ddd_dominance ON public.district_deal_dominance(dominance_efficiency_score DESC);

ALTER TABLE public.district_deal_dominance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read district_deal_dominance" ON public.district_deal_dominance FOR SELECT USING (true);

-- 5. Dominance Feedback Loop (learning signal)
CREATE TABLE public.deal_dominance_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid,
  district text,
  boost_id uuid REFERENCES public.deal_boost_signals(id) ON DELETE SET NULL,
  -- Funnel tracking
  pre_boost_visibility numeric DEFAULT 0,
  post_boost_visibility numeric DEFAULT 0,
  inquiry_count_delta int DEFAULT 0,
  offer_count_delta int DEFAULT 0,
  close_count_delta int DEFAULT 0,
  conversion_lift_pct numeric DEFAULT 0,
  -- Learning output
  weight_adjustment jsonb DEFAULT '{}',
  fed_to_learning_engine boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ddf_property ON public.deal_dominance_feedback(property_id);
CREATE INDEX idx_ddf_unfed ON public.deal_dominance_feedback(fed_to_learning_engine) WHERE fed_to_learning_engine = false;

ALTER TABLE public.deal_dominance_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read deal_dominance_feedback" ON public.deal_dominance_feedback FOR SELECT USING (true);

-- 6. Trigger: emit signal when a listing becomes dominant
CREATE OR REPLACE FUNCTION public.emit_deal_dominance_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.gravity_tier = 'dominant' AND (OLD IS NULL OR OLD.gravity_tier != 'dominant') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'deal_dominance_achieved',
      'property',
      NEW.property_id::text,
      'critical',
      jsonb_build_object(
        'property_id', NEW.property_id,
        'district', NEW.district,
        'deal_gravity_score', NEW.deal_gravity_score,
        'tier', NEW.gravity_tier
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deal_dominance_signal
AFTER INSERT OR UPDATE ON public.deal_gravity_index
FOR EACH ROW EXECUTE FUNCTION public.emit_deal_dominance_signal();
