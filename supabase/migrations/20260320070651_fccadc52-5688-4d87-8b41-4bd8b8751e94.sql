
-- ═══════════════════════════════════════════════════════════
-- MEGA-FUND CREATION BLUEPRINT (MFCB)
-- ═══════════════════════════════════════════════════════════

-- 1) Data-Driven Fund Thesis Engine
CREATE TABLE public.mfcb_fund_thesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_name TEXT NOT NULL,
  thesis_type TEXT NOT NULL CHECK (thesis_type IN ('GROWTH_CORRIDOR','LIQUIDITY_ARBITRAGE','URBAN_REGENERATION','YIELD_HARVEST','CROSS_BORDER_ALPHA','DISTRESSED_TURNAROUND')),
  target_geography TEXT NOT NULL DEFAULT 'Indonesia',
  target_districts JSONB DEFAULT '[]',
  data_signals JSONB DEFAULT '{}',
  heat_score_threshold NUMERIC(5,2) DEFAULT 70,
  liquidity_score_threshold NUMERIC(5,2) DEFAULT 60,
  expected_irr_pct NUMERIC(6,2) DEFAULT 15,
  expected_multiple NUMERIC(4,2) DEFAULT 1.8,
  hold_period_years INT DEFAULT 5,
  conviction_score NUMERIC(5,2) DEFAULT 50,
  narrative TEXT,
  competitive_edge TEXT,
  risk_factors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','BACKTESTED','APPROVED','FUNDRAISING','DEPLOYED','MATURE')),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mfcb_fund_thesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfcb_fund_thesis_read" ON public.mfcb_fund_thesis FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mfcb_thesis_type ON public.mfcb_fund_thesis(thesis_type);
CREATE INDEX idx_mfcb_thesis_status ON public.mfcb_fund_thesis(status);

-- 2) Fund Structure Strategy
CREATE TABLE public.mfcb_fund_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name TEXT NOT NULL,
  fund_type TEXT NOT NULL CHECK (fund_type IN ('CLOSED_END','OPEN_ENDED','CO_INVESTMENT','SPECIAL_OPPORTUNITY','REGIONAL_THEMATIC','EVERGREEN')),
  thesis_id UUID REFERENCES public.mfcb_fund_thesis(id) ON DELETE SET NULL,
  target_aum_usd NUMERIC(16,2) DEFAULT 0,
  current_aum_usd NUMERIC(16,2) DEFAULT 0,
  minimum_commitment_usd NUMERIC(14,2) DEFAULT 1_000_000,
  management_fee_pct NUMERIC(4,2) DEFAULT 2.0,
  carry_pct NUMERIC(4,2) DEFAULT 20,
  hurdle_rate_pct NUMERIC(5,2) DEFAULT 8,
  fund_term_years INT DEFAULT 7,
  investment_period_years INT DEFAULT 3,
  gp_commitment_pct NUMERIC(5,2) DEFAULT 5,
  num_lps INT DEFAULT 0,
  target_lps INT DEFAULT 20,
  deployment_pct NUMERIC(5,2) DEFAULT 0,
  vintage_year INT DEFAULT 2026,
  domicile TEXT DEFAULT 'Singapore',
  regulatory_status TEXT DEFAULT 'STRUCTURING',
  status TEXT DEFAULT 'PLANNING' CHECK (status IN ('PLANNING','STRUCTURING','FUNDRAISING','FIRST_CLOSE','FINAL_CLOSE','INVESTING','HARVESTING','LIQUIDATING')),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mfcb_fund_structure ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfcb_fund_structure_read" ON public.mfcb_fund_structure FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mfcb_structure_type ON public.mfcb_fund_structure(fund_type);

-- 3) Deal Origination Advantage
CREATE TABLE public.mfcb_deal_origination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.mfcb_fund_structure(id) ON DELETE SET NULL,
  deal_name TEXT NOT NULL,
  asset_type TEXT DEFAULT 'Residential',
  city TEXT NOT NULL,
  district TEXT,
  source_channel TEXT NOT NULL CHECK (source_channel IN ('PLATFORM_PIPELINE','AGENT_NETWORK','INSTITUTIONAL_REFERRAL','OFF_MARKET','DISTRESSED_SCREEN','AI_DISCOVERY')),
  deal_value_usd NUMERIC(14,2) DEFAULT 0,
  platform_pricing_advantage_pct NUMERIC(5,2) DEFAULT 0,
  time_to_close_days INT DEFAULT 90,
  competitor_avg_close_days INT DEFAULT 150,
  data_confidence_score NUMERIC(5,2) DEFAULT 50,
  proprietary_signals JSONB DEFAULT '{}',
  pipeline_stage TEXT DEFAULT 'SOURCED' CHECK (pipeline_stage IN ('SOURCED','SCREENING','DUE_DILIGENCE','TERM_SHEET','COMMITTED','CLOSED','EXITED')),
  expected_irr_pct NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mfcb_deal_origination ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfcb_deal_origination_read" ON public.mfcb_deal_origination FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mfcb_deal_source ON public.mfcb_deal_origination(source_channel);
CREATE INDEX idx_mfcb_deal_pipeline ON public.mfcb_deal_origination(pipeline_stage);

-- 4) Capital Raising Intelligence
CREATE TABLE public.mfcb_capital_raising (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.mfcb_fund_structure(id) ON DELETE SET NULL,
  lp_segment TEXT NOT NULL CHECK (lp_segment IN ('SOVEREIGN_FUND','PENSION','ENDOWMENT','FAMILY_OFFICE','INSURANCE','FUND_OF_FUNDS','HNWI','CORPORATE')),
  target_allocation_usd NUMERIC(14,2) DEFAULT 0,
  committed_usd NUMERIC(14,2) DEFAULT 0,
  pipeline_usd NUMERIC(14,2) DEFAULT 0,
  conversion_probability_pct NUMERIC(5,2) DEFAULT 20,
  mandate_alignment_score NUMERIC(5,2) DEFAULT 50,
  engagement_stage TEXT DEFAULT 'IDENTIFIED' CHECK (engagement_stage IN ('IDENTIFIED','INTRO_SENT','MEETING_SET','DD_PHASE','TERM_NEGOTIATION','SOFT_COMMIT','HARD_COMMIT','FUNDED')),
  key_decision_maker TEXT,
  mandate_requirements JSONB DEFAULT '{}',
  objections JSONB DEFAULT '[]',
  next_milestone TEXT,
  target_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mfcb_capital_raising ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfcb_capital_raising_read" ON public.mfcb_capital_raising FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mfcb_raising_segment ON public.mfcb_capital_raising(lp_segment);

-- 5) Fund Performance Flywheel
CREATE TABLE public.mfcb_performance_flywheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.mfcb_fund_structure(id) ON DELETE SET NULL,
  period_quarter TEXT NOT NULL,
  data_quality_score NUMERIC(5,2) DEFAULT 50,
  deal_quality_score NUMERIC(5,2) DEFAULT 50,
  portfolio_irr_pct NUMERIC(6,2) DEFAULT 0,
  portfolio_tvpi NUMERIC(4,2) DEFAULT 1.0,
  portfolio_dpi NUMERIC(4,2) DEFAULT 0,
  lp_satisfaction_score NUMERIC(5,2) DEFAULT 50,
  follow_on_commitment_pct NUMERIC(5,2) DEFAULT 0,
  aum_growth_pct NUMERIC(6,2) DEFAULT 0,
  platform_influence_score NUMERIC(5,2) DEFAULT 50,
  flywheel_momentum NUMERIC(5,2) DEFAULT 50,
  flywheel_stage TEXT DEFAULT 'IGNITION' CHECK (flywheel_stage IN ('IGNITION','TRACTION','ACCELERATION','DOMINANCE','SELF_SUSTAINING')),
  compounding_rate NUMERIC(5,3) DEFAULT 1.0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mfcb_performance_flywheel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfcb_flywheel_read" ON public.mfcb_performance_flywheel FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_mfcb_flywheel_fund ON public.mfcb_performance_flywheel(fund_id);

-- Trigger: emit signal when fund reaches final close
CREATE OR REPLACE FUNCTION notify_mfcb_fund_milestone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'FINAL_CLOSE' AND (OLD IS NULL OR OLD.status <> 'FINAL_CLOSE') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('mfcb_fund_closed', 'mfcb_fund_structure', NEW.id, 'critical',
      jsonb_build_object('fund', NEW.fund_name, 'aum', NEW.current_aum_usd, 'type', NEW.fund_type, 'lps', NEW.num_lps));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mfcb_fund_milestone
AFTER INSERT OR UPDATE ON public.mfcb_fund_structure
FOR EACH ROW EXECUTE FUNCTION notify_mfcb_fund_milestone();
