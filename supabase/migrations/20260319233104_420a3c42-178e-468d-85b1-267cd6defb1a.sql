
-- ══════════════════════════════════════════════════════
-- AI MARKET REALITY DISTORTION ENGINE (MRDE)
-- ══════════════════════════════════════════════════════

-- 1️⃣ Narrative Momentum Engine
CREATE TABLE public.mrde_narrative_momentum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_theme TEXT NOT NULL,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'ID',
  confidence_signal_strength NUMERIC DEFAULT 0,
  success_case_visibility NUMERIC DEFAULT 0,
  growth_expectation_index NUMERIC DEFAULT 0,
  narrative_velocity NUMERIC DEFAULT 0,
  amplification_channel TEXT DEFAULT 'organic',
  reach_estimate INTEGER DEFAULT 0,
  engagement_multiplier NUMERIC DEFAULT 1.0,
  narrative_phase TEXT DEFAULT 'emerging',
  ethical_clearance BOOLEAN DEFAULT true,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2️⃣ Demand Gravity Amplifier
CREATE TABLE public.mrde_demand_gravity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'ID',
  liquidity_concentration NUMERIC DEFAULT 0,
  appreciation_velocity NUMERIC DEFAULT 0,
  investment_theme TEXT DEFAULT 'general',
  capital_clustering_index NUMERIC DEFAULT 0,
  attention_density NUMERIC DEFAULT 0,
  gravity_pull_score NUMERIC DEFAULT 0,
  promoted_asset_class TEXT,
  organic_vs_amplified_ratio NUMERIC DEFAULT 1.0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3️⃣ Perception Velocity Tracker
CREATE TABLE public.mrde_perception_velocity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT,
  market_segment TEXT DEFAULT 'residential',
  sentiment_acceleration NUMERIC DEFAULT 0,
  trust_index NUMERIC DEFAULT 50,
  trust_index_delta NUMERIC DEFAULT 0,
  fomo_participation_rate NUMERIC DEFAULT 0,
  tipping_point_proximity NUMERIC DEFAULT 0,
  viral_coefficient NUMERIC DEFAULT 0,
  sentiment_phase TEXT DEFAULT 'neutral',
  forecast_tipping_date TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4️⃣ Competitive Signal Dominance
CREATE TABLE public.mrde_competitive_dominance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_segment TEXT NOT NULL DEFAULT 'portal',
  visibility_lead_pct NUMERIC DEFAULT 0,
  thought_leadership_score NUMERIC DEFAULT 0,
  perceived_inevitability NUMERIC DEFAULT 0,
  share_of_voice NUMERIC DEFAULT 0,
  content_velocity_ratio NUMERIC DEFAULT 1.0,
  seo_dominance_keywords INTEGER DEFAULT 0,
  media_mention_multiplier NUMERIC DEFAULT 1.0,
  dominance_tier TEXT DEFAULT 'challenger',
  strategy_active TEXT DEFAULT 'content_blitz',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5️⃣ Market Phase Acceleration
CREATE TABLE public.mrde_phase_acceleration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_segment TEXT NOT NULL DEFAULT 'residential',
  city TEXT,
  adoption_cycle_weeks INTEGER DEFAULT 0,
  compressed_vs_natural_ratio NUMERIC DEFAULT 1.0,
  diffusion_velocity NUMERIC DEFAULT 0,
  ecosystem_scaling_wave INTEGER DEFAULT 1,
  participation_doubling_weeks NUMERIC DEFAULT 0,
  acceleration_lever TEXT DEFAULT 'content',
  network_effect_stage TEXT DEFAULT 'pre_critical',
  critical_mass_pct NUMERIC DEFAULT 0,
  ethical_guardrails JSONB DEFAULT '{"transparency": true, "no_false_claims": true, "data_backed": true}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_mrde_narrative_theme ON public.mrde_narrative_momentum(narrative_theme);
CREATE INDEX idx_mrde_narrative_velocity ON public.mrde_narrative_momentum(narrative_velocity DESC);
CREATE INDEX idx_mrde_gravity_city ON public.mrde_demand_gravity(city);
CREATE INDEX idx_mrde_gravity_score ON public.mrde_demand_gravity(gravity_pull_score DESC);
CREATE INDEX idx_mrde_perception_city ON public.mrde_perception_velocity(city);
CREATE INDEX idx_mrde_dominance_tier ON public.mrde_competitive_dominance(dominance_tier);
CREATE INDEX idx_mrde_phase_segment ON public.mrde_phase_acceleration(market_segment);

-- Trigger: emit signal on tipping point approach
CREATE OR REPLACE FUNCTION public.fn_mrde_tipping_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipping_point_proximity >= 85 AND NEW.sentiment_acceleration > 0 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'mrde_tipping_point_imminent',
      'mrde_perception_velocity',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'city', COALESCE(NEW.city, 'global'),
        'proximity', NEW.tipping_point_proximity,
        'sentiment', NEW.sentiment_phase,
        'fomo_rate', NEW.fomo_participation_rate
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mrde_tipping_point
AFTER INSERT OR UPDATE ON public.mrde_perception_velocity
FOR EACH ROW EXECUTE FUNCTION public.fn_mrde_tipping_point();

-- RLS
ALTER TABLE public.mrde_narrative_momentum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrde_demand_gravity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrde_perception_velocity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrde_competitive_dominance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrde_phase_acceleration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read mrde_narrative_momentum" ON public.mrde_narrative_momentum FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mrde_demand_gravity" ON public.mrde_demand_gravity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mrde_perception_velocity" ON public.mrde_perception_velocity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mrde_competitive_dominance" ON public.mrde_competitive_dominance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read mrde_phase_acceleration" ON public.mrde_phase_acceleration FOR SELECT TO authenticated USING (true);
