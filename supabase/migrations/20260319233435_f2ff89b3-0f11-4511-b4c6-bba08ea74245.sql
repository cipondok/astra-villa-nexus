
-- ══════════════════════════════════════════════════════
-- GLOBAL MONOPOLY MOAT ARCHITECTURE (GMMA)
-- ══════════════════════════════════════════════════════

-- 1️⃣ Intelligence Data Gravity Moat
CREATE TABLE public.gmma_data_gravity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'ID',
  behavioral_signals_ingested BIGINT DEFAULT 0,
  transaction_velocity_patterns BIGINT DEFAULT 0,
  localized_liquidity_records BIGINT DEFAULT 0,
  prediction_superiority_index NUMERIC DEFAULT 0,
  data_half_life_months NUMERIC DEFAULT 36,
  replication_cost_estimate_usd NUMERIC DEFAULT 0,
  gravity_tier TEXT DEFAULT 'accumulating',
  compounding_rate_monthly NUMERIC DEFAULT 0,
  moat_depth_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2️⃣ Network Effect Lock-In
CREATE TABLE public.gmma_network_lockin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT,
  investor_count INTEGER DEFAULT 0,
  deal_count INTEGER DEFAULT 0,
  vendor_count INTEGER DEFAULT 0,
  investor_to_deal_ratio NUMERIC DEFAULT 0,
  deal_to_vendor_ratio NUMERIC DEFAULT 0,
  feedback_loop_strength NUMERIC DEFAULT 0,
  network_density NUMERIC DEFAULT 0,
  irreversibility_index NUMERIC DEFAULT 0,
  churn_resistance NUMERIC DEFAULT 0,
  lock_in_tier TEXT DEFAULT 'forming',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3️⃣ Capital Routing Dependency
CREATE TABLE public.gmma_capital_dependency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type TEXT NOT NULL DEFAULT 'institutional',
  flow_volume_usd NUMERIC DEFAULT 0,
  platform_share_pct NUMERIC DEFAULT 0,
  alternative_friction_score NUMERIC DEFAULT 0,
  switching_cost_usd NUMERIC DEFAULT 0,
  dependency_depth TEXT DEFAULT 'optional',
  institutional_contracts INTEGER DEFAULT 0,
  developer_pipelines INTEGER DEFAULT 0,
  secondary_market_volume_usd NUMERIC DEFAULT 0,
  structural_lock_in BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4️⃣ Workflow Infrastructure Integration
CREATE TABLE public.gmma_workflow_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_type TEXT NOT NULL DEFAULT 'developer',
  integration_depth TEXT DEFAULT 'surface',
  daily_active_workflows INTEGER DEFAULT 0,
  api_calls_monthly BIGINT DEFAULT 0,
  data_stored_gb NUMERIC DEFAULT 0,
  switching_cost_hours NUMERIC DEFAULT 0,
  replacement_complexity TEXT DEFAULT 'low',
  embedded_processes INTEGER DEFAULT 0,
  retention_probability NUMERIC DEFAULT 50,
  integration_tier TEXT DEFAULT 'peripheral',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5️⃣ Brand Authority & Category Ownership
CREATE TABLE public.gmma_brand_authority (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'proptech_intelligence',
  brand_recognition_score NUMERIC DEFAULT 0,
  category_definition_power NUMERIC DEFAULT 0,
  standard_setting_influence NUMERIC DEFAULT 0,
  default_platform_probability NUMERIC DEFAULT 0,
  media_authority_index NUMERIC DEFAULT 0,
  thought_leadership_pieces INTEGER DEFAULT 0,
  industry_citations INTEGER DEFAULT 0,
  awards_recognitions INTEGER DEFAULT 0,
  authority_tier TEXT DEFAULT 'emerging',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gmma_gravity_city ON public.gmma_data_gravity(city);
CREATE INDEX idx_gmma_gravity_depth ON public.gmma_data_gravity(moat_depth_score DESC);
CREATE INDEX idx_gmma_lockin_strength ON public.gmma_network_lockin(feedback_loop_strength DESC);
CREATE INDEX idx_gmma_capital_channel ON public.gmma_capital_dependency(channel_type);
CREATE INDEX idx_gmma_workflow_type ON public.gmma_workflow_integration(participant_type);
CREATE INDEX idx_gmma_brand_category ON public.gmma_brand_authority(category);

-- Trigger: emit signal when moat reaches fortress level
CREATE OR REPLACE FUNCTION public.fn_gmma_fortress_moat()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.moat_depth_score >= 85 AND NEW.gravity_tier = 'fortress' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gmma_fortress_moat_achieved',
      'gmma_data_gravity',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'city', NEW.city,
        'moat_depth', NEW.moat_depth_score,
        'replication_cost', NEW.replication_cost_estimate_usd
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gmma_fortress_moat
AFTER INSERT OR UPDATE ON public.gmma_data_gravity
FOR EACH ROW EXECUTE FUNCTION public.fn_gmma_fortress_moat();

-- RLS
ALTER TABLE public.gmma_data_gravity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmma_network_lockin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmma_capital_dependency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmma_workflow_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmma_brand_authority ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read gmma_data_gravity" ON public.gmma_data_gravity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read gmma_network_lockin" ON public.gmma_network_lockin FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read gmma_capital_dependency" ON public.gmma_capital_dependency FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read gmma_workflow_integration" ON public.gmma_workflow_integration FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read gmma_brand_authority" ON public.gmma_brand_authority FOR SELECT TO authenticated USING (true);
