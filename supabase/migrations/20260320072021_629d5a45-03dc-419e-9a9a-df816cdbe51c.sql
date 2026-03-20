
-- ══════════════════════════════════════════════════════════════
-- GLOBAL PROPTECH WAR STRATEGY (GPWS)
-- ══════════════════════════════════════════════════════════════

-- 1️⃣ Market Invasion Sequencing
CREATE TABLE public.gpws_market_invasion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  region text,
  invasion_phase text NOT NULL DEFAULT 'RECON',
  entry_strategy text CHECK (entry_strategy IN ('DENSITY_FIRST','GEOGRAPHY_FIRST','HYBRID')),
  liquidity_signal_score numeric DEFAULT 0,
  digital_infra_weakness numeric DEFAULT 0,
  competitor_density numeric DEFAULT 0,
  population_millions numeric DEFAULT 0,
  urbanization_rate numeric DEFAULT 0,
  sequence_rank integer DEFAULT 0,
  timing_window text CHECK (timing_window IN ('IMMEDIATE','NEXT_QUARTER','H2','MONITOR')),
  dominance_compounding_factor numeric DEFAULT 1.0,
  estimated_capture_months integer,
  market_size_usd_m numeric DEFAULT 0,
  entry_started_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpws_market_invasion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpws_market_invasion" ON public.gpws_market_invasion FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpws_invasion_rank ON public.gpws_market_invasion (sequence_rank);
CREATE INDEX idx_gpws_invasion_phase ON public.gpws_market_invasion (invasion_phase);

-- 2️⃣ Strategic Beachhead Formation
CREATE TABLE public.gpws_beachhead (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  beachhead_phase text NOT NULL DEFAULT 'SEEDING',
  premium_listings_seeded integer DEFAULT 0,
  anchor_agents_recruited integer DEFAULT 0,
  anchor_developers_recruited integer DEFAULT 0,
  investor_demand_perception numeric DEFAULT 0,
  network_effect_ignition_score numeric DEFAULT 0,
  local_brand_awareness_pct numeric DEFAULT 0,
  content_pieces_published integer DEFAULT 0,
  strategic_partnerships integer DEFAULT 0,
  time_to_critical_mass_weeks integer,
  beachhead_strength_score numeric DEFAULT 0,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpws_beachhead ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpws_beachhead" ON public.gpws_beachhead FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpws_beachhead_strength ON public.gpws_beachhead (beachhead_strength_score DESC);

-- 3️⃣ Competitive Battlefield Mapping
CREATE TABLE public.gpws_battlefield (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  competitor_name text NOT NULL,
  competitor_type text CHECK (competitor_type IN ('PORTAL','BROKER_NETWORK','FINTECH','DEVELOPER_PLATFORM','HYBRID','NONE')),
  competitor_strength_score numeric DEFAULT 0,
  market_share_pct numeric DEFAULT 0,
  digital_maturity_score numeric DEFAULT 0,
  listing_volume integer DEFAULT 0,
  investor_base_size integer DEFAULT 0,
  defensible_niche text,
  vulnerability_score numeric DEFAULT 0,
  our_advantage_score numeric DEFAULT 0,
  displacement_strategy text,
  displacement_timeline_months integer,
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpws_battlefield ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpws_battlefield" ON public.gpws_battlefield FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpws_battlefield_vuln ON public.gpws_battlefield (vulnerability_score DESC);

-- 4️⃣ Data Supremacy Strategy
CREATE TABLE public.gpws_data_supremacy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  data_asset_type text CHECK (data_asset_type IN ('PRICING_INTEL','BEHAVIORAL','PREDICTIVE','TRANSACTION','GEOSPATIAL','SENTIMENT')),
  proprietary_data_points bigint DEFAULT 0,
  competitor_data_gap_pct numeric DEFAULT 0,
  moat_depth_score numeric DEFAULT 0,
  prediction_accuracy_pct numeric DEFAULT 0,
  data_freshness_hours numeric DEFAULT 24,
  monetization_potential_usd numeric DEFAULT 0,
  compounding_rate numeric DEFAULT 1.0,
  replication_difficulty numeric DEFAULT 0,
  strategic_value_tier text CHECK (strategic_value_tier IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpws_data_supremacy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpws_data_supremacy" ON public.gpws_data_supremacy FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpws_data_moat ON public.gpws_data_supremacy (moat_depth_score DESC);

-- 5️⃣ Expansion Momentum Warfare
CREATE TABLE public.gpws_expansion_momentum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Indonesia',
  listings_count integer DEFAULT 0,
  investor_count integer DEFAULT 0,
  deal_velocity_monthly integer DEFAULT 0,
  data_points_generated bigint DEFAULT 0,
  intelligence_advantage_score numeric DEFAULT 0,
  flywheel_rpm numeric DEFAULT 0,
  momentum_phase text CHECK (momentum_phase IN ('IGNITION','ACCELERATING','COMPOUNDING','DOMINANT','UNSTOPPABLE')),
  network_density numeric DEFAULT 0,
  viral_coefficient numeric DEFAULT 0,
  competitor_gap_widening_rate numeric DEFAULT 0,
  time_to_dominance_months integer,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gpws_expansion_momentum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gpws_expansion_momentum" ON public.gpws_expansion_momentum FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_gpws_momentum_rpm ON public.gpws_expansion_momentum (flywheel_rpm DESC);

-- Trigger: emit signal on UNSTOPPABLE momentum
CREATE OR REPLACE FUNCTION public.fn_gpws_momentum_signal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.momentum_phase = 'UNSTOPPABLE' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gpws_unstoppable_momentum', 'gpws_momentum', NEW.id, 'critical',
      jsonb_build_object('city', NEW.city, 'flywheel_rpm', NEW.flywheel_rpm, 'intelligence_advantage', NEW.intelligence_advantage_score));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gpws_momentum_signal
  AFTER INSERT OR UPDATE ON public.gpws_expansion_momentum
  FOR EACH ROW EXECUTE FUNCTION public.fn_gpws_momentum_signal();
