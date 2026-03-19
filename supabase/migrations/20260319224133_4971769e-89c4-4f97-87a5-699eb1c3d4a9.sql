-- =============================================
-- AUTONOMOUS SOVEREIGN WEALTH CO-PILOT (ASWC)
-- =============================================

-- 1️⃣ Macro Cycle Interpretation Engine
CREATE TABLE public.aswc_macro_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  country text,
  cycle_indicator text NOT NULL CHECK (cycle_indicator IN ('interest_rate','currency_regime','growth_divergence','capital_rotation','inflation','credit_cycle')),
  current_phase text NOT NULL CHECK (current_phase IN ('expansion','peak','contraction','trough','transition')),
  phase_confidence numeric(5,2) DEFAULT 0,
  indicator_value numeric(12,4),
  indicator_trend text DEFAULT 'stable' CHECK (indicator_trend IN ('declining','stable','rising','accelerating','reversing')),
  rate_differential_bps integer,
  currency_strength_index numeric(6,2),
  growth_divergence_pct numeric(6,3),
  capital_rotation_direction text,
  time_in_phase_months integer,
  estimated_phase_remaining_months integer,
  historical_analog text,
  signal_drivers jsonb DEFAULT '{}',
  implications_re jsonb DEFAULT '{}',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_aswc_macro_region ON public.aswc_macro_cycles(region, cycle_indicator);

-- 2️⃣ Sovereign Portfolio Strategy Generator
CREATE TABLE public.aswc_portfolio_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_name text NOT NULL,
  fund_size_usd numeric(18,2) NOT NULL DEFAULT 0,
  target_return_pct numeric(6,3),
  risk_tolerance text DEFAULT 'moderate' CHECK (risk_tolerance IN ('ultra_conservative','conservative','moderate','growth','aggressive')),
  country_allocations jsonb NOT NULL DEFAULT '{}',
  city_allocations jsonb DEFAULT '{}',
  asset_class_weights jsonb DEFAULT '{}',
  hedging_overlays jsonb DEFAULT '[]',
  entry_timing_signals jsonb DEFAULT '{}',
  rebalance_frequency text DEFAULT 'quarterly' CHECK (rebalance_frequency IN ('monthly','quarterly','semi_annual','annual','event_driven')),
  max_single_country_pct numeric(5,2) DEFAULT 25,
  max_single_city_pct numeric(5,2) DEFAULT 15,
  currency_hedge_ratio numeric(5,3) DEFAULT 0.5,
  liquidity_reserve_pct numeric(5,2) DEFAULT 10,
  vintage_diversification boolean DEFAULT true,
  sharpe_ratio_target numeric(6,4),
  max_drawdown_limit_pct numeric(5,2) DEFAULT 15,
  is_active boolean DEFAULT true,
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3️⃣ Mega-Deal Opportunity Scanner
CREATE TABLE public.aswc_mega_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_name text NOT NULL,
  deal_type text NOT NULL CHECK (deal_type IN ('distressed_portfolio','privatization','infrastructure_land','development_platform','corporate_sale','fund_secondary','debt_acquisition')),
  country text NOT NULL DEFAULT 'ID',
  city text,
  estimated_value_usd numeric(18,2) NOT NULL DEFAULT 0,
  discount_to_nav_pct numeric(6,3),
  estimated_irr_pct numeric(6,3),
  estimated_multiple numeric(4,2),
  asset_count integer DEFAULT 1,
  total_sqm numeric(14,2),
  seller_motivation text,
  urgency text DEFAULT 'standard' CHECK (urgency IN ('immediate','high','standard','monitoring')),
  competition_level text DEFAULT 'moderate' CHECK (competition_level IN ('none','low','moderate','high','auction')),
  due_diligence_status text DEFAULT 'not_started' CHECK (due_diligence_status IN ('not_started','preliminary','advanced','complete')),
  regulatory_approval_needed boolean DEFAULT false,
  key_risks jsonb DEFAULT '[]',
  key_strengths jsonb DEFAULT '[]',
  capital_required_usd numeric(18,2),
  co_investment_available boolean DEFAULT false,
  source_channel text,
  detected_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_aswc_mega_deals_type ON public.aswc_mega_deals(deal_type, is_active);

-- 4️⃣ Political & Regulatory Risk Intelligence
CREATE TABLE public.aswc_political_risk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text,
  composite_risk_score numeric(5,2) NOT NULL DEFAULT 50,
  policy_stability numeric(5,2) DEFAULT 50,
  ownership_restriction_score numeric(5,2) DEFAULT 50,
  tax_regime_risk numeric(5,2) DEFAULT 50,
  geopolitical_exposure numeric(5,2) DEFAULT 50,
  rule_of_law_index numeric(5,2) DEFAULT 50,
  expropriation_risk numeric(5,2) DEFAULT 10,
  capital_controls_risk numeric(5,2) DEFAULT 30,
  sanctions_exposure numeric(5,2) DEFAULT 10,
  election_cycle_impact text DEFAULT 'neutral' CHECK (election_cycle_impact IN ('positive','neutral','negative','uncertain')),
  next_election_date date,
  recent_policy_changes jsonb DEFAULT '[]',
  risk_trend text DEFAULT 'stable' CHECK (risk_trend IN ('improving','stable','deteriorating','volatile')),
  investment_implications text,
  hedging_recommendations jsonb DEFAULT '[]',
  data_sources jsonb DEFAULT '[]',
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_aswc_political_country ON public.aswc_political_risk(country);

-- 5️⃣ Autonomous Capital Deployment Protocol
CREATE TABLE public.aswc_deployment_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES public.aswc_portfolio_strategies(id) ON DELETE SET NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('deploy','rebalance','exit','hedge','increase','decrease','hold','emergency_exit')),
  target_country text NOT NULL,
  target_city text,
  target_asset_class text,
  allocation_change_pct numeric(6,3),
  capital_amount_usd numeric(18,2),
  urgency text DEFAULT 'standard' CHECK (urgency IN ('immediate','high','standard','low')),
  confidence numeric(5,2) DEFAULT 0,
  trigger_reasons jsonb NOT NULL DEFAULT '[]',
  macro_context jsonb DEFAULT '{}',
  risk_assessment jsonb DEFAULT '{}',
  execution_window_days integer DEFAULT 30,
  is_executed boolean DEFAULT false,
  executed_at timestamptz,
  execution_notes text,
  approved_by text,
  wealth_preservation_score numeric(5,2) DEFAULT 0,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_aswc_deploy_strategy ON public.aswc_deployment_signals(strategy_id, signal_type);
CREATE INDEX idx_aswc_deploy_pending ON public.aswc_deployment_signals(is_executed, urgency);

-- RLS
ALTER TABLE public.aswc_macro_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aswc_portfolio_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aswc_mega_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aswc_political_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aswc_deployment_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read macro cycles" ON public.aswc_macro_cycles FOR SELECT USING (true);
CREATE POLICY "Public read portfolio strategies" ON public.aswc_portfolio_strategies FOR SELECT USING (true);
CREATE POLICY "Public read mega deals" ON public.aswc_mega_deals FOR SELECT USING (true);
CREATE POLICY "Public read political risk" ON public.aswc_political_risk FOR SELECT USING (true);
CREATE POLICY "Public read deployment signals" ON public.aswc_deployment_signals FOR SELECT USING (true);

-- Trigger: emit critical signal on immediate deployment or emergency exit
CREATE OR REPLACE FUNCTION public.fn_aswc_critical_deployment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.urgency = 'immediate' OR NEW.signal_type = 'emergency_exit' THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'aswc_critical_deployment',
      'aswc_deployment',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'signal_type', NEW.signal_type,
        'target_country', NEW.target_country,
        'target_city', NEW.target_city,
        'capital_amount', NEW.capital_amount_usd,
        'urgency', NEW.urgency,
        'confidence', NEW.confidence
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_aswc_critical_deployment
  AFTER INSERT ON public.aswc_deployment_signals
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_aswc_critical_deployment();