
-- ============================================================
-- AUTONOMOUS PRICING CONTROL SYSTEM SCHEMA
-- Price inefficiency, dynamic guidance, market stabilization,
-- negotiation intelligence, and autonomous influence signals.
-- ============================================================

-- 1. Price Inefficiency Detector (per property)
CREATE TABLE public.price_inefficiency_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  district text,
  -- Current state
  current_price numeric DEFAULT 0,
  estimated_fmv numeric DEFAULT 0,
  fmv_ratio numeric DEFAULT 1.0,
  -- Inefficiency components (0-100)
  undervaluation_score numeric DEFAULT 0,
  overpricing_score numeric DEFAULT 0,
  speculative_appreciation_score numeric DEFAULT 0,
  stagnation_risk_score numeric DEFAULT 0,
  -- Composite
  pricing_inefficiency_score numeric DEFAULT 0,
  inefficiency_type text DEFAULT 'fair' CHECK (inefficiency_type IN ('severely_undervalued','undervalued','fair','overpriced','severely_overpriced','speculative')),
  -- Context
  days_on_market int DEFAULT 0,
  total_views int DEFAULT 0,
  total_inquiries int DEFAULT 0,
  offer_count int DEFAULT 0,
  scoring_inputs jsonb DEFAULT '{}',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_pii_property ON public.price_inefficiency_index(property_id);
CREATE INDEX idx_pii_score ON public.price_inefficiency_index(pricing_inefficiency_score DESC);
CREATE INDEX idx_pii_type ON public.price_inefficiency_index(inefficiency_type);
CREATE INDEX idx_pii_district ON public.price_inefficiency_index(district);

ALTER TABLE public.price_inefficiency_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read price_inefficiency_index" ON public.price_inefficiency_index FOR SELECT USING (true);

-- 2. Dynamic Pricing Guidance (per property)
CREATE TABLE public.dynamic_pricing_guidance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  district text,
  -- Price bands
  recommended_price_low numeric DEFAULT 0,
  recommended_price_mid numeric DEFAULT 0,
  recommended_price_high numeric DEFAULT 0,
  liquidity_optimal_price numeric DEFAULT 0,
  urgency_discount_pct numeric DEFAULT 0,
  -- Conversion signals
  view_to_offer_rate numeric DEFAULT 0,
  offer_rejection_ratio numeric DEFAULT 0,
  predicted_days_to_close int,
  -- Guidance
  pricing_grade text DEFAULT 'C' CHECK (pricing_grade IN ('A','B','C','D','F')),
  pricing_zone text DEFAULT 'fair' CHECK (pricing_zone IN ('quick_sale','sweet_spot','fair','premium','overreach')),
  adjustment_direction text DEFAULT 'hold' CHECK (adjustment_direction IN ('reduce_urgent','reduce','hold','increase','increase_aggressive')),
  suggested_adjustment_pct numeric DEFAULT 0,
  guidance_narrative text,
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_dpg_property ON public.dynamic_pricing_guidance(property_id);
CREATE INDEX idx_dpg_grade ON public.dynamic_pricing_guidance(pricing_grade);
CREATE INDEX idx_dpg_district ON public.dynamic_pricing_guidance(district);

ALTER TABLE public.dynamic_pricing_guidance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dynamic_pricing_guidance" ON public.dynamic_pricing_guidance FOR SELECT USING (true);

-- 3. District Market Stabilization
CREATE TABLE public.district_price_stabilization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  segment_type text,
  -- Price metrics
  median_price numeric DEFAULT 0,
  avg_price numeric DEFAULT 0,
  price_volatility_30d numeric DEFAULT 0,
  price_volatility_90d numeric DEFAULT 0,
  price_trend_direction text DEFAULT 'stable' CHECK (price_trend_direction IN ('surging','rising','stable','declining','crashing')),
  -- Stabilization controls
  price_smoothing_coefficient numeric DEFAULT 1.0,
  volatility_guardrail_upper numeric DEFAULT 1.15,
  volatility_guardrail_lower numeric DEFAULT 0.85,
  bubble_cascade_risk numeric DEFAULT 0,
  panic_discount_risk numeric DEFAULT 0,
  -- Stabilization actions
  stabilization_mode text DEFAULT 'normal' CHECK (stabilization_mode IN ('normal','dampening','intervention','emergency')),
  active_interventions jsonb DEFAULT '[]',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_dps_district_segment ON public.district_price_stabilization(district, COALESCE(segment_type, '__all__'));
CREATE INDEX idx_dps_mode ON public.district_price_stabilization(stabilization_mode);

ALTER TABLE public.district_price_stabilization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read district_price_stabilization" ON public.district_price_stabilization FOR SELECT USING (true);

-- 4. Negotiation Intelligence (per property)
CREATE TABLE public.negotiation_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  district text,
  -- Patterns
  avg_counter_offer_discount_pct numeric DEFAULT 0,
  avg_rounds_to_close numeric DEFAULT 0,
  buyer_urgency_index numeric DEFAULT 0,
  seller_flexibility_index numeric DEFAULT 0,
  -- Probability model
  deal_close_price_low numeric DEFAULT 0,
  deal_close_price_mid numeric DEFAULT 0,
  deal_close_price_high numeric DEFAULT 0,
  close_probability_at_asking numeric DEFAULT 0,
  close_probability_at_5pct_discount numeric DEFAULT 0,
  close_probability_at_10pct_discount numeric DEFAULT 0,
  -- Intelligence
  optimal_opening_offer_pct numeric DEFAULT 0.92,
  predicted_final_discount_pct numeric DEFAULT 0,
  negotiation_power text DEFAULT 'balanced' CHECK (negotiation_power IN ('buyer_strong','buyer_slight','balanced','seller_slight','seller_strong')),
  insight_narrative text,
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_ni_property ON public.negotiation_intelligence(property_id);
CREATE INDEX idx_ni_district ON public.negotiation_intelligence(district);

ALTER TABLE public.negotiation_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read negotiation_intelligence" ON public.negotiation_intelligence FOR SELECT USING (true);

-- 5. Autonomous Pricing Influence Signals
CREATE TABLE public.pricing_influence_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid,
  district text,
  target_role text NOT NULL CHECK (target_role IN ('seller','agent','investor','system')),
  signal_type text NOT NULL CHECK (signal_type IN ('price_nudge','urgency_alert','value_signal','market_warning','opportunity_flag')),
  -- Content
  headline text NOT NULL,
  message text,
  suggested_action text,
  urgency_score numeric DEFAULT 0,
  -- Trigger context
  trigger_source text,
  trigger_metrics jsonb DEFAULT '{}',
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending','delivered','acknowledged','acted_upon','expired')),
  delivered_at timestamptz,
  acted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pis_property ON public.pricing_influence_signals(property_id);
CREATE INDEX idx_pis_status ON public.pricing_influence_signals(status) WHERE status IN ('pending','delivered');
CREATE INDEX idx_pis_role ON public.pricing_influence_signals(target_role, signal_type);

ALTER TABLE public.pricing_influence_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pricing_influence_signals" ON public.pricing_influence_signals FOR SELECT USING (true);

-- 6. Trigger: emit AI signal on severe inefficiency detection
CREATE OR REPLACE FUNCTION public.emit_pricing_inefficiency_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.inefficiency_type IN ('severely_undervalued', 'severely_overpriced', 'speculative')
     AND (OLD IS NULL OR OLD.inefficiency_type != NEW.inefficiency_type) THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'pricing_inefficiency_detected',
      'property',
      NEW.property_id::text,
      CASE WHEN NEW.inefficiency_type = 'speculative' THEN 'critical' ELSE 'high' END,
      jsonb_build_object(
        'property_id', NEW.property_id,
        'district', NEW.district,
        'inefficiency_type', NEW.inefficiency_type,
        'inefficiency_score', NEW.pricing_inefficiency_score,
        'fmv_ratio', NEW.fmv_ratio
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pricing_inefficiency_signal
AFTER INSERT OR UPDATE ON public.price_inefficiency_index
FOR EACH ROW EXECUTE FUNCTION public.emit_pricing_inefficiency_signal();
