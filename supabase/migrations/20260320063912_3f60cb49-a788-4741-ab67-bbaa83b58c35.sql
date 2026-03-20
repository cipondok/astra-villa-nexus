
-- ═══════════════════════════════════════════════════════════
-- NETWORK EFFECT WEAPONIZATION FRAMEWORK (NEWF)
-- ═══════════════════════════════════════════════════════════

-- 1️⃣ Liquidity Gravity Engine
CREATE TABLE public.newf_liquidity_gravity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  deal_activity_index NUMERIC DEFAULT 0,
  discovery_accuracy_score NUMERIC DEFAULT 0,
  retention_rate NUMERIC DEFAULT 0,
  listing_quality_index NUMERIC DEFAULT 0,
  gravity_pull NUMERIC DEFAULT 0,
  gravity_phase TEXT DEFAULT 'NASCENT' CHECK (gravity_phase IN ('NASCENT','FORMING','STRONG','INESCAPABLE')),
  feedback_loop_velocity NUMERIC DEFAULT 0,
  loop_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.newf_liquidity_gravity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read newf_liquidity_gravity" ON public.newf_liquidity_gravity FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_newf_lg_pull ON public.newf_liquidity_gravity(gravity_pull DESC);

-- 2️⃣ Data Advantage Compounding
CREATE TABLE public.newf_data_advantage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  behavioral_signals_ingested BIGINT DEFAULT 0,
  proprietary_insights_generated INTEGER DEFAULT 0,
  pricing_accuracy_pct NUMERIC DEFAULT 0,
  pricing_accuracy_delta NUMERIC DEFAULT 0,
  moat_width_score NUMERIC DEFAULT 0,
  unique_dataset_count INTEGER DEFAULT 0,
  competitor_data_gap_pct NUMERIC DEFAULT 0,
  compounding_rate NUMERIC DEFAULT 1,
  advantage_tier TEXT DEFAULT 'PARITY' CHECK (advantage_tier IN ('PARITY','EDGE','MOAT','FORTRESS')),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.newf_data_advantage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read newf_data_advantage" ON public.newf_data_advantage FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_newf_da_moat ON public.newf_data_advantage(moat_width_score DESC);

-- 3️⃣ Participant Lock-In
CREATE TABLE public.newf_participant_lockin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_type TEXT NOT NULL CHECK (participant_type IN ('AGENT','VENDOR','INVESTOR','DEVELOPER')),
  city TEXT NOT NULL DEFAULT 'Jakarta',
  performance_visibility_score NUMERIC DEFAULT 0,
  portfolio_dependency_depth NUMERIC DEFAULT 0,
  workflow_integration_count INTEGER DEFAULT 0,
  switching_friction_index NUMERIC DEFAULT 0,
  reward_tier TEXT DEFAULT 'BASIC' CHECK (reward_tier IN ('BASIC','SILVER','GOLD','PLATINUM','DIAMOND')),
  active_participants INTEGER DEFAULT 0,
  avg_tenure_months NUMERIC DEFAULT 0,
  churn_probability NUMERIC DEFAULT 0,
  lockin_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.newf_participant_lockin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read newf_participant_lockin" ON public.newf_participant_lockin FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_newf_pl_friction ON public.newf_participant_lockin(switching_friction_index DESC);

-- 4️⃣ Reputation Flywheel
CREATE TABLE public.newf_reputation_flywheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  top_performer_count INTEGER DEFAULT 0,
  trust_ecosystem_score NUMERIC DEFAULT 0,
  marketplace_reliability_index NUMERIC DEFAULT 0,
  amplification_multiplier NUMERIC DEFAULT 1,
  deal_success_rate NUMERIC DEFAULT 0,
  review_velocity NUMERIC DEFAULT 0,
  reputation_momentum NUMERIC DEFAULT 0,
  flywheel_phase TEXT DEFAULT 'SEEDING' CHECK (flywheel_phase IN ('SEEDING','GROWING','COMPOUNDING','DOMINANT')),
  phase_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.newf_reputation_flywheel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read newf_reputation_flywheel" ON public.newf_reputation_flywheel FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_newf_rf_momentum ON public.newf_reputation_flywheel(reputation_momentum DESC);

-- 5️⃣ Ecosystem Expansion Hooks
CREATE TABLE public.newf_ecosystem_hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_type TEXT NOT NULL CHECK (hook_type IN ('INTEGRATION','FINANCIAL_PARTNER','DEVELOPER_API','DATA_FEED')),
  partner_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jakarta',
  integration_depth_score NUMERIC DEFAULT 0,
  api_call_volume INTEGER DEFAULT 0,
  revenue_contribution NUMERIC DEFAULT 0,
  user_adoption_pct NUMERIC DEFAULT 0,
  partner_dependency_index NUMERIC DEFAULT 0,
  expansion_status TEXT DEFAULT 'PROSPECT' CHECK (expansion_status IN ('PROSPECT','PILOT','ACTIVE','STRATEGIC','CRITICAL')),
  hook_metrics JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.newf_ecosystem_hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read newf_ecosystem_hooks" ON public.newf_ecosystem_hooks FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_newf_eh_depth ON public.newf_ecosystem_hooks(integration_depth_score DESC);

-- Signal trigger for inescapable gravity
CREATE OR REPLACE FUNCTION public.fn_newf_gravity_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.gravity_phase = 'INESCAPABLE' AND NEW.gravity_pull >= 85 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('newf_inescapable_gravity', 'district', NEW.id::text, 'critical',
      jsonb_build_object('district', NEW.district, 'city', NEW.city, 'gravity_pull', NEW.gravity_pull));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_newf_gravity_signal
AFTER INSERT OR UPDATE ON public.newf_liquidity_gravity
FOR EACH ROW EXECUTE FUNCTION public.fn_newf_gravity_signal();
