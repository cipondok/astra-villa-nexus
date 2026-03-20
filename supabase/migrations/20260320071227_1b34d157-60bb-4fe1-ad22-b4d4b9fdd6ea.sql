
-- ═══════════════════════════════════════════════════════════
-- GLOBAL EXIT & IPO TIMING INTELLIGENCE (GEITI)
-- ═══════════════════════════════════════════════════════════

-- 1) Market Window Detection
CREATE TABLE public.geiti_market_window (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  window_name TEXT NOT NULL,
  window_status TEXT NOT NULL CHECK (window_status IN ('CLOSED','OPENING','OPEN','PEAK','CLOSING')),
  tech_valuation_cycle TEXT DEFAULT 'NEUTRAL' CHECK (tech_valuation_cycle IN ('TROUGH','RECOVERY','EXPANSION','PEAK','CONTRACTION','NEUTRAL')),
  interest_rate_env TEXT DEFAULT 'NEUTRAL' CHECK (interest_rate_env IN ('RISING','PEAK','FALLING','TROUGH','NEUTRAL')),
  global_re_capital_flow TEXT DEFAULT 'STABLE' CHECK (global_re_capital_flow IN ('CONTRACTING','STABLE','EXPANDING','SURGING')),
  ipo_success_rate_pct NUMERIC(5,2) DEFAULT 50,
  sector_comparable_multiples NUMERIC(5,1) DEFAULT 10,
  vix_level NUMERIC(5,2) DEFAULT 20,
  market_sentiment_score NUMERIC(5,2) DEFAULT 50,
  window_confidence NUMERIC(5,2) DEFAULT 50,
  optimal_window_months INT DEFAULT 6,
  risk_of_closure_pct NUMERIC(5,2) DEFAULT 30,
  macro_signals JSONB DEFAULT '{}',
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.geiti_market_window ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geiti_market_window_read" ON public.geiti_market_window FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_geiti_window_status ON public.geiti_market_window(window_status);

-- 2) Platform Readiness Scoring
CREATE TABLE public.geiti_platform_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_name TEXT NOT NULL,
  revenue_arr_usd NUMERIC(14,2) DEFAULT 0,
  revenue_growth_pct NUMERIC(6,2) DEFAULT 0,
  revenue_predictability_score NUMERIC(5,2) DEFAULT 50,
  net_revenue_retention_pct NUMERIC(6,2) DEFAULT 100,
  network_effect_maturity NUMERIC(5,2) DEFAULT 50,
  geographic_diversification_score NUMERIC(5,2) DEFAULT 30,
  cities_active INT DEFAULT 1,
  countries_active INT DEFAULT 1,
  operational_resilience_score NUMERIC(5,2) DEFAULT 50,
  team_completeness_score NUMERIC(5,2) DEFAULT 50,
  governance_readiness_score NUMERIC(5,2) DEFAULT 50,
  audit_readiness BOOLEAN DEFAULT false,
  soc2_compliant BOOLEAN DEFAULT false,
  overall_readiness_score NUMERIC(5,2) DEFAULT 0,
  readiness_tier TEXT DEFAULT 'NOT_READY' CHECK (readiness_tier IN ('NOT_READY','EARLY','BUILDING','READY','OVERDUE')),
  gaps JSONB DEFAULT '[]',
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.geiti_platform_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geiti_readiness_read" ON public.geiti_platform_readiness FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_geiti_readiness_tier ON public.geiti_platform_readiness(readiness_tier);

-- 3) Liquidity Pathway Strategy
CREATE TABLE public.geiti_liquidity_pathway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_name TEXT NOT NULL,
  pathway_type TEXT NOT NULL CHECK (pathway_type IN ('TRADITIONAL_IPO','DIRECT_LISTING','SPAC_MERGER','STRATEGIC_ACQUISITION','PARTIAL_SALE','SECONDARY_PROGRAM','DUAL_TRACK')),
  suitability_score NUMERIC(5,2) DEFAULT 50,
  estimated_valuation_usd NUMERIC(16,2) DEFAULT 0,
  founder_dilution_pct NUMERIC(5,2) DEFAULT 0,
  founder_control_post NUMERIC(5,2) DEFAULT 50,
  time_to_execution_months INT DEFAULT 12,
  complexity_score NUMERIC(5,2) DEFAULT 50,
  regulatory_risk TEXT DEFAULT 'MODERATE',
  capital_raised_usd NUMERIC(14,2) DEFAULT 0,
  liquidity_for_shareholders_usd NUMERIC(14,2) DEFAULT 0,
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  prerequisites JSONB DEFAULT '[]',
  recommended_timing TEXT,
  status TEXT DEFAULT 'EVALUATED' CHECK (status IN ('EVALUATED','SHORTLISTED','PREFERRED','COMMITTED','EXECUTING','COMPLETED')),
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.geiti_liquidity_pathway ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geiti_pathway_read" ON public.geiti_liquidity_pathway FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_geiti_pathway_type ON public.geiti_liquidity_pathway(pathway_type);

-- 4) Valuation Maximization Framework
CREATE TABLE public.geiti_valuation_maximization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  timing_quarter TEXT NOT NULL,
  investor_demand_score NUMERIC(5,2) DEFAULT 50,
  scarcity_perception_score NUMERIC(5,2) DEFAULT 50,
  growth_premium_multiple NUMERIC(5,1) DEFAULT 10,
  base_revenue_usd NUMERIC(14,2) DEFAULT 0,
  implied_valuation_usd NUMERIC(16,2) DEFAULT 0,
  comparable_median_multiple NUMERIC(5,1) DEFAULT 8,
  premium_over_comparable_pct NUMERIC(6,2) DEFAULT 0,
  narrative_strength_score NUMERIC(5,2) DEFAULT 50,
  institutional_demand_oversubscription NUMERIC(4,1) DEFAULT 1.0,
  pricing_strategy TEXT DEFAULT 'MARKET' CHECK (pricing_strategy IN ('DISCOUNT','MARKET','PREMIUM','AGGRESSIVE')),
  first_day_pop_target_pct NUMERIC(5,2) DEFAULT 15,
  lockup_period_days INT DEFAULT 180,
  greenshoe_pct NUMERIC(4,2) DEFAULT 15,
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.geiti_valuation_maximization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geiti_valuation_read" ON public.geiti_valuation_maximization FOR SELECT TO authenticated USING (true);

-- 5) Post-Listing Strategic Control
CREATE TABLE public.geiti_post_listing_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanism_name TEXT NOT NULL,
  mechanism_type TEXT NOT NULL CHECK (mechanism_type IN ('DUAL_CLASS_SHARES','STAGGERED_BOARD','POISON_PILL','VOTING_AGREEMENT','LOCKUP_STRATEGY','EARNINGS_NARRATIVE','ANALYST_MANAGEMENT','BUYBACK_PROGRAM')),
  effectiveness_score NUMERIC(5,2) DEFAULT 50,
  founder_voting_control_pct NUMERIC(6,3) DEFAULT 50,
  board_independence_pct NUMERIC(5,2) DEFAULT 33,
  investor_relations_strategy TEXT,
  earnings_guidance_approach TEXT DEFAULT 'CONSERVATIVE' CHECK (earnings_guidance_approach IN ('NO_GUIDANCE','CONSERVATIVE','INLINE','AGGRESSIVE')),
  activist_defense_score NUMERIC(5,2) DEFAULT 50,
  long_term_holder_pct NUMERIC(5,2) DEFAULT 40,
  short_interest_threshold_pct NUMERIC(5,2) DEFAULT 10,
  communication_cadence TEXT DEFAULT 'QUARTERLY',
  vision_protection_score NUMERIC(5,2) DEFAULT 50,
  is_active BOOLEAN DEFAULT false,
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.geiti_post_listing_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geiti_control_read" ON public.geiti_post_listing_control FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_geiti_control_type ON public.geiti_post_listing_control(mechanism_type);

-- Trigger: emit signal when market window opens to PEAK
CREATE OR REPLACE FUNCTION notify_geiti_window_peak()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.window_status = 'PEAK' AND (OLD IS NULL OR OLD.window_status <> 'PEAK') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('geiti_window_peak', 'geiti_market_window', NEW.id, 'critical',
      jsonb_build_object('window', NEW.window_name, 'confidence', NEW.window_confidence, 'sentiment', NEW.market_sentiment_score, 'optimal_months', NEW.optimal_window_months));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_geiti_window_peak
AFTER INSERT OR UPDATE ON public.geiti_market_window
FOR EACH ROW EXECUTE FUNCTION notify_geiti_window_peak();
