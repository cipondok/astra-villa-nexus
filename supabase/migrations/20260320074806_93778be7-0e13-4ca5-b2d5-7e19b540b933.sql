
-- ============================================================
-- GLOBAL PROPTECH IPO DOMINATION SIMULATOR (GPIDS) SCHEMA
-- ============================================================

-- 1) Pre-IPO Positioning Engine
CREATE TABLE public.gpids_preipo_positioning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_category TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC,
  completion_pct NUMERIC,
  revenue_predictability_score NUMERIC,
  geographic_dominance_index NUMERIC,
  institutional_adoption_pct NUMERIC,
  data_moat_maturity NUMERIC,
  readiness_tier TEXT DEFAULT 'building',
  months_to_ready INTEGER,
  blocker_risks JSONB,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Narrative & Category Leadership
CREATE TABLE public.gpids_narrative_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_frame TEXT NOT NULL,
  positioning_strength NUMERIC,
  media_resonance_score NUMERIC,
  analyst_adoption_pct NUMERIC,
  category_ownership_index NUMERIC,
  comparable_premium_pct NUMERIC,
  investor_recall_rate NUMERIC,
  narrative_consistency NUMERIC,
  key_proof_points JSONB,
  competitive_narrative_gap NUMERIC,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Valuation Expansion Mechanics
CREATE TABLE public.gpids_valuation_expansion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_driver TEXT NOT NULL,
  current_multiple NUMERIC,
  target_multiple NUMERIC,
  expansion_potential_pct NUMERIC,
  recurring_revenue_growth_pct NUMERIC,
  network_effect_strength NUMERIC,
  operating_leverage_score NUMERIC,
  ecosystem_optionality_value NUMERIC,
  tam_expansion_factor NUMERIC,
  investor_demand_index NUMERIC,
  risk_discount_pct NUMERIC,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Timing & Market Window Intelligence
CREATE TABLE public.gpids_timing_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  window_name TEXT NOT NULL,
  macro_liquidity_score NUMERIC,
  sector_sentiment_index NUMERIC,
  interest_rate_environment TEXT DEFAULT 'neutral',
  tech_valuation_trend TEXT DEFAULT 'stable',
  window_openness_pct NUMERIC,
  optimal_filing_months INTEGER,
  competitor_ipo_pipeline INTEGER DEFAULT 0,
  geopolitical_risk_score NUMERIC,
  window_durability_months INTEGER,
  recommendation TEXT DEFAULT 'monitor',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Post-IPO Strategic Dominance
CREATE TABLE public.gpids_postipo_dominance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_domain TEXT NOT NULL,
  capital_allocated_usd NUMERIC,
  expected_roi_multiple NUMERIC,
  expansion_cities_target INTEGER DEFAULT 0,
  acquisition_targets INTEGER DEFAULT 0,
  new_products_planned INTEGER DEFAULT 0,
  market_share_acceleration_pct NUMERIC,
  strategic_power_index NUMERIC,
  execution_timeline_months INTEGER,
  dominance_probability NUMERIC,
  deployment_actions JSONB,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gpids_preipo_cat ON public.gpids_preipo_positioning(milestone_category, readiness_tier);
CREATE INDEX idx_gpids_narrative_frame ON public.gpids_narrative_leadership(narrative_frame, assessed_at DESC);
CREATE INDEX idx_gpids_valuation_driver ON public.gpids_valuation_expansion(valuation_driver, computed_at DESC);
CREATE INDEX idx_gpids_timing_window ON public.gpids_timing_intelligence(window_name, assessed_at DESC);
CREATE INDEX idx_gpids_postipo_domain ON public.gpids_postipo_dominance(strategy_domain, computed_at DESC);

-- RLS
ALTER TABLE public.gpids_preipo_positioning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpids_narrative_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpids_valuation_expansion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpids_timing_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpids_postipo_dominance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read gpids_preipo_positioning" ON public.gpids_preipo_positioning FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpids_narrative_leadership" ON public.gpids_narrative_leadership FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpids_valuation_expansion" ON public.gpids_valuation_expansion FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpids_timing_intelligence" ON public.gpids_timing_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gpids_postipo_dominance" ON public.gpids_postipo_dominance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert gpids_preipo_positioning" ON public.gpids_preipo_positioning FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpids_narrative_leadership" ON public.gpids_narrative_leadership FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpids_valuation_expansion" ON public.gpids_valuation_expansion FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpids_timing_intelligence" ON public.gpids_timing_intelligence FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert gpids_postipo_dominance" ON public.gpids_postipo_dominance FOR INSERT TO service_role WITH CHECK (true);

-- Trigger: emit signal when IPO window opens wide
CREATE OR REPLACE FUNCTION public.trg_gpids_window_open() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.window_openness_pct > 80 AND NEW.recommendation = 'go' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('gpids_ipo_window_open', 'ipo_timing', NEW.id, 'critical',
      jsonb_build_object('window', NEW.window_name, 'openness', NEW.window_openness_pct, 'filing_months', NEW.optimal_filing_months));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gpids_window_open
  AFTER INSERT OR UPDATE ON public.gpids_timing_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.trg_gpids_window_open();
