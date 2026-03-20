
-- ═══════════════════════════════════════════════════════════
-- GLOBAL IPO WAR STRATEGY (GIWS) SCHEMA
-- ═══════════════════════════════════════════════════════════

-- 1. IPO Readiness Intelligence
CREATE TABLE public.giws_ipo_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  readiness_domain TEXT NOT NULL DEFAULT 'financial_reporting',
  domain_label TEXT NOT NULL,
  maturity_score NUMERIC NOT NULL DEFAULT 0,
  target_score NUMERIC DEFAULT 90,
  gap_pct NUMERIC DEFAULT 0,
  compliance_items_total INT DEFAULT 0,
  compliance_items_met INT DEFAULT 0,
  critical_blockers TEXT[] DEFAULT '{}',
  remediation_actions JSONB DEFAULT '[]',
  estimated_months_to_ready INT DEFAULT 0,
  auditor_feedback TEXT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Competitive Public Market Positioning
CREATE TABLE public.giws_market_positioning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  positioning_axis TEXT NOT NULL DEFAULT 'category_leadership',
  narrative_theme TEXT NOT NULL,
  differentiation_score NUMERIC NOT NULL DEFAULT 50,
  legacy_gap_advantage NUMERIC DEFAULT 0,
  technology_moat_depth NUMERIC DEFAULT 0,
  investor_narrative_clarity NUMERIC DEFAULT 50,
  comparable_company TEXT,
  comparable_multiple NUMERIC DEFAULT 0,
  target_multiple NUMERIC DEFAULT 0,
  positioning_strength TEXT DEFAULT 'emerging',
  key_proof_points JSONB DEFAULT '[]',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Investor Demand Structuring
CREATE TABLE public.giws_investor_demand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_source TEXT NOT NULL DEFAULT 'institutional',
  source_name TEXT,
  interest_level TEXT DEFAULT 'monitoring',
  coverage_status TEXT DEFAULT 'none',
  capital_commitment_indicative_usd NUMERIC DEFAULT 0,
  engagement_touchpoints INT DEFAULT 0,
  partnership_signal_strength NUMERIC DEFAULT 0,
  ecosystem_visibility_score NUMERIC DEFAULT 0,
  due_diligence_stage TEXT DEFAULT 'not_started',
  sentiment_toward_sector TEXT DEFAULT 'neutral',
  last_engagement_at TIMESTAMPTZ,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Listing Timing Strategy
CREATE TABLE public.giws_listing_timing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  macro_cycle_phase TEXT DEFAULT 'neutral',
  sector_sentiment TEXT DEFAULT 'neutral',
  internal_milestone_readiness NUMERIC DEFAULT 0,
  capital_market_receptiveness NUMERIC DEFAULT 50,
  comparable_ipo_performance NUMERIC DEFAULT 0,
  optimal_window_start TEXT,
  optimal_window_end TEXT,
  timing_confidence NUMERIC DEFAULT 0,
  risk_if_early TEXT,
  risk_if_late TEXT,
  recommended_action TEXT DEFAULT 'monitor',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Post-Listing Stability Architecture
CREATE TABLE public.giws_post_listing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stability_dimension TEXT NOT NULL DEFAULT 'market_confidence',
  current_score NUMERIC NOT NULL DEFAULT 50,
  previous_score NUMERIC DEFAULT 50,
  score_trend TEXT DEFAULT 'stable',
  communication_cadence TEXT DEFAULT 'quarterly',
  analyst_coverage_count INT DEFAULT 0,
  shareholder_concentration_pct NUMERIC DEFAULT 0,
  lockup_expiry_risk NUMERIC DEFAULT 0,
  roadmap_transparency_index NUMERIC DEFAULT 50,
  earnings_beat_streak INT DEFAULT 0,
  stabilization_mechanisms JSONB DEFAULT '[]',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_giws_readiness_domain ON public.giws_ipo_readiness(readiness_domain);
CREATE INDEX idx_giws_readiness_assessed ON public.giws_ipo_readiness(assessed_at DESC);
CREATE INDEX idx_giws_positioning_axis ON public.giws_market_positioning(positioning_axis);
CREATE INDEX idx_giws_demand_source ON public.giws_investor_demand(demand_source);
CREATE INDEX idx_giws_demand_assessed ON public.giws_investor_demand(assessed_at DESC);
CREATE INDEX idx_giws_timing_assessed ON public.giws_listing_timing(assessed_at DESC);
CREATE INDEX idx_giws_post_dimension ON public.giws_post_listing(stability_dimension);
CREATE INDEX idx_giws_post_assessed ON public.giws_post_listing(assessed_at DESC);

-- RLS
ALTER TABLE public.giws_ipo_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giws_market_positioning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giws_investor_demand ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giws_listing_timing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giws_post_listing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read giws_ipo_readiness" ON public.giws_ipo_readiness FOR SELECT USING (true);
CREATE POLICY "Allow read giws_market_positioning" ON public.giws_market_positioning FOR SELECT USING (true);
CREATE POLICY "Allow read giws_investor_demand" ON public.giws_investor_demand FOR SELECT USING (true);
CREATE POLICY "Allow read giws_listing_timing" ON public.giws_listing_timing FOR SELECT USING (true);
CREATE POLICY "Allow read giws_post_listing" ON public.giws_post_listing FOR SELECT USING (true);

-- Trigger: emit signal when readiness gap is critical
CREATE OR REPLACE FUNCTION public.fn_giws_readiness_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.maturity_score < 40 AND NEW.estimated_months_to_ready > 12 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'giws_readiness_gap',
      'giws_readiness',
      NEW.id::text,
      'high',
      jsonb_build_object(
        'domain', NEW.readiness_domain,
        'maturity_score', NEW.maturity_score,
        'months_to_ready', NEW.estimated_months_to_ready,
        'blockers', NEW.critical_blockers
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_giws_readiness_alert
  AFTER INSERT ON public.giws_ipo_readiness
  FOR EACH ROW EXECUTE FUNCTION public.fn_giws_readiness_alert();
