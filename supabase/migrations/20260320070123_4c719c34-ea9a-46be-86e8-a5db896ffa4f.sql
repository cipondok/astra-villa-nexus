
-- ═══════════════════════════════════════════════════════════
-- FOUNDER CAPITAL STRATEGY SIMULATOR (FCSS)
-- ═══════════════════════════════════════════════════════════

-- 1) Dilution Pathway Simulation
CREATE TABLE public.fcss_dilution_pathway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  round_stage TEXT NOT NULL CHECK (round_stage IN ('BOOTSTRAP','PRE_SEED','SEED','SERIES_A','SERIES_B','GROWTH','PRE_IPO','IPO')),
  round_order INT NOT NULL DEFAULT 0,
  pre_money_valuation_usd NUMERIC(16,2) DEFAULT 0,
  raise_amount_usd NUMERIC(14,2) DEFAULT 0,
  post_money_valuation_usd NUMERIC(16,2) DEFAULT 0,
  dilution_pct NUMERIC(6,3) DEFAULT 0,
  founder_ownership_pre NUMERIC(6,3) DEFAULT 100,
  founder_ownership_post NUMERIC(6,3) DEFAULT 100,
  esop_pool_pct NUMERIC(5,2) DEFAULT 0,
  secondary_liquidity_usd NUMERIC(14,2) DEFAULT 0,
  investor_type TEXT DEFAULT 'Angel',
  pro_rata_exercised BOOLEAN DEFAULT false,
  anti_dilution_type TEXT DEFAULT 'BROAD_WEIGHTED_AVG',
  liquidation_preference NUMERIC(4,2) DEFAULT 1.0,
  participating BOOLEAN DEFAULT false,
  cumulative_dilution_pct NUMERIC(6,3) DEFAULT 0,
  control_score NUMERIC(5,2) DEFAULT 100,
  notes TEXT,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fcss_dilution_pathway ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fcss_dilution_read" ON public.fcss_dilution_pathway FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_fcss_dilution_stage ON public.fcss_dilution_pathway(round_stage);
CREATE INDEX idx_fcss_dilution_scenario ON public.fcss_dilution_pathway(scenario_name);

-- 2) Capital Efficiency Engine
CREATE TABLE public.fcss_capital_efficiency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  month_offset INT NOT NULL DEFAULT 0,
  cash_balance_usd NUMERIC(14,2) DEFAULT 0,
  monthly_burn_usd NUMERIC(12,2) DEFAULT 0,
  monthly_revenue_usd NUMERIC(12,2) DEFAULT 0,
  net_burn_usd NUMERIC(12,2) DEFAULT 0,
  runway_months NUMERIC(5,1) DEFAULT 0,
  burn_multiple NUMERIC(6,2) DEFAULT 0,
  hiring_spend_pct NUMERIC(5,2) DEFAULT 0,
  marketing_spend_pct NUMERIC(5,2) DEFAULT 0,
  product_spend_pct NUMERIC(5,2) DEFAULT 0,
  geo_expansion_spend_pct NUMERIC(5,2) DEFAULT 0,
  capital_efficiency_score NUMERIC(5,2) DEFAULT 50,
  roi_per_dollar_deployed NUMERIC(6,3) DEFAULT 0,
  growth_rate_pct NUMERIC(6,2) DEFAULT 0,
  strategy_type TEXT DEFAULT 'BALANCED' CHECK (strategy_type IN ('AGGRESSIVE','BALANCED','DISCIPLINED','SURVIVAL')),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fcss_capital_efficiency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fcss_efficiency_read" ON public.fcss_capital_efficiency FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_fcss_efficiency_scenario ON public.fcss_capital_efficiency(scenario_name);

-- 3) Strategic Optionality Map
CREATE TABLE public.fcss_strategic_optionality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_name TEXT NOT NULL,
  pathway_type TEXT NOT NULL CHECK (pathway_type IN ('ACQUISITION','ORGANIC_SCALE','STRATEGIC_PARTNERSHIP','PLATFORM_LICENSING','FULL_ECOSYSTEM','MERGER')),
  probability_pct NUMERIC(5,2) DEFAULT 20,
  founder_control_impact NUMERIC(5,2) DEFAULT 0,
  valuation_impact_pct NUMERIC(6,2) DEFAULT 0,
  time_to_realization_months INT DEFAULT 24,
  capital_required_usd NUMERIC(14,2) DEFAULT 0,
  independence_score NUMERIC(5,2) DEFAULT 50,
  strategic_value_score NUMERIC(5,2) DEFAULT 50,
  risk_score NUMERIC(5,2) DEFAULT 50,
  prerequisite_milestones JSONB DEFAULT '[]',
  trade_offs JSONB DEFAULT '{}',
  status TEXT DEFAULT 'MAPPED' CHECK (status IN ('MAPPED','EVALUATING','PREFERRED','COMMITTED','EXECUTED')),
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fcss_strategic_optionality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fcss_optionality_read" ON public.fcss_strategic_optionality FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_fcss_optionality_type ON public.fcss_strategic_optionality(pathway_type);

-- 4) Founder Control Preservation
CREATE TABLE public.fcss_control_preservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanism_name TEXT NOT NULL,
  mechanism_type TEXT NOT NULL CHECK (mechanism_type IN ('DUAL_CLASS','BOARD_COMPOSITION','VOTING_RIGHTS','PROTECTIVE_PROVISIONS','VESTING_STRUCTURE','CAPITAL_SEQUENCING')),
  effectiveness_score NUMERIC(5,2) DEFAULT 50,
  implementation_complexity TEXT DEFAULT 'MEDIUM' CHECK (implementation_complexity IN ('LOW','MEDIUM','HIGH','VERY_HIGH')),
  legal_jurisdiction TEXT DEFAULT 'Indonesia',
  applicable_stage TEXT DEFAULT 'ALL',
  founder_voting_pct NUMERIC(6,3) DEFAULT 50,
  board_seats_founder INT DEFAULT 1,
  board_seats_total INT DEFAULT 3,
  protective_provisions JSONB DEFAULT '[]',
  investor_friction_score NUMERIC(5,2) DEFAULT 30,
  longevity_years INT DEFAULT 10,
  notes TEXT,
  is_active BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fcss_control_preservation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fcss_control_read" ON public.fcss_control_preservation FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_fcss_control_type ON public.fcss_control_preservation(mechanism_type);

-- 5) Founder Wealth Projection
CREATE TABLE public.fcss_wealth_projection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  exit_type TEXT NOT NULL CHECK (exit_type IN ('IPO','ACQUISITION','SECONDARY','DIVIDEND','HOLD')),
  exit_timing_year INT NOT NULL DEFAULT 5,
  company_valuation_usd NUMERIC(16,2) DEFAULT 0,
  founder_ownership_pct NUMERIC(6,3) DEFAULT 0,
  gross_equity_value_usd NUMERIC(16,2) DEFAULT 0,
  liquidation_waterfall_usd NUMERIC(14,2) DEFAULT 0,
  net_equity_value_usd NUMERIC(16,2) DEFAULT 0,
  secondary_proceeds_usd NUMERIC(14,2) DEFAULT 0,
  dividends_cumulative_usd NUMERIC(14,2) DEFAULT 0,
  total_wealth_usd NUMERIC(16,2) DEFAULT 0,
  tax_liability_pct NUMERIC(5,2) DEFAULT 25,
  post_tax_wealth_usd NUMERIC(16,2) DEFAULT 0,
  annual_passive_income_usd NUMERIC(14,2) DEFAULT 0,
  wealth_freedom_score NUMERIC(5,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fcss_wealth_projection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fcss_wealth_read" ON public.fcss_wealth_projection FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_fcss_wealth_scenario ON public.fcss_wealth_projection(scenario_name);
CREATE INDEX idx_fcss_wealth_exit ON public.fcss_wealth_projection(exit_type);

-- Trigger: emit signal when founder ownership drops below critical threshold
CREATE OR REPLACE FUNCTION notify_fcss_control_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.founder_ownership_post < 50 AND NEW.round_stage IN ('SERIES_B','GROWTH','PRE_IPO','IPO') THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES ('fcss_control_risk', 'fcss_dilution_pathway', NEW.id, 'critical',
      jsonb_build_object('scenario', NEW.scenario_name, 'stage', NEW.round_stage, 'ownership', NEW.founder_ownership_post, 'control_score', NEW.control_score));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fcss_control_alert
AFTER INSERT ON public.fcss_dilution_pathway
FOR EACH ROW EXECUTE FUNCTION notify_fcss_control_alert();
