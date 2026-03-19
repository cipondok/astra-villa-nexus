
-- ══════════════════════════════════════════════════════════════
-- APIN: Autonomous Planetary Investment Network
-- ══════════════════════════════════════════════════════════════

-- 1) Investor Intelligence Graph
CREATE TABLE public.apin_investor_graph (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id text NOT NULL,
  investor_type text NOT NULL DEFAULT 'individual', -- 'individual','family_office','institution','sovereign','syndicate'
  city text,
  country text NOT NULL DEFAULT 'ID',
  -- Capital profile
  capital_pool_usd numeric NOT NULL DEFAULT 0,
  deployed_capital_usd numeric NOT NULL DEFAULT 0,
  available_capital_usd numeric NOT NULL DEFAULT 0,
  -- Risk & preference
  risk_tolerance text NOT NULL DEFAULT 'moderate', -- 'conservative','moderate','aggressive','ultra_aggressive'
  preferred_asset_classes text[] NOT NULL DEFAULT '{}',
  geographic_exposure jsonb NOT NULL DEFAULT '{}', -- { "ID": 60, "MY": 20, "TH": 20 }
  -- Performance
  lifetime_roi_pct numeric NOT NULL DEFAULT 0,
  avg_deal_size_usd numeric NOT NULL DEFAULT 0,
  total_transactions int NOT NULL DEFAULT 0,
  win_rate_pct numeric NOT NULL DEFAULT 0, -- % of profitable exits
  -- Graph connections
  network_centrality_score numeric NOT NULL DEFAULT 0, -- 0-100, how connected
  co_investment_count int NOT NULL DEFAULT 0,
  influence_score numeric NOT NULL DEFAULT 0, -- 0-100
  cluster_id text, -- which investor cluster they belong to
  -- Signals
  activity_velocity numeric NOT NULL DEFAULT 0, -- transactions per month
  capital_deployment_momentum numeric NOT NULL DEFAULT 0, -- acceleration
  last_transaction_at timestamptz,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_apin_investor_type ON public.apin_investor_graph(investor_type);
CREATE INDEX idx_apin_investor_influence ON public.apin_investor_graph(influence_score DESC);
CREATE INDEX idx_apin_investor_capital ON public.apin_investor_graph(available_capital_usd DESC);

-- 2) Autonomous Deal Routing Fabric
CREATE TABLE public.apin_deal_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id text NOT NULL,
  deal_type text NOT NULL, -- 'direct_purchase','syndication','tokenized','off_plan','distressed'
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  asset_class text NOT NULL DEFAULT 'residential',
  -- Deal metrics
  deal_value_usd numeric NOT NULL DEFAULT 0,
  expected_roi_pct numeric NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'medium',
  urgency_score numeric NOT NULL DEFAULT 0, -- 0-100
  time_window_hours int NOT NULL DEFAULT 72,
  -- Routing
  matched_investor_count int NOT NULL DEFAULT 0,
  routed_to_investors text[] NOT NULL DEFAULT '{}',
  accepted_by text[] NOT NULL DEFAULT '{}',
  routing_confidence numeric NOT NULL DEFAULT 0, -- 0-100
  routing_algorithm_version text NOT NULL DEFAULT 'v1',
  -- Timing
  optimal_entry_window jsonb, -- { start, end, confidence }
  optimal_exit_months int,
  market_timing_score numeric NOT NULL DEFAULT 0, -- 0-100
  -- Status
  routing_status text NOT NULL DEFAULT 'pending', -- 'pending','matching','routed','accepted','executed','expired'
  executed_at timestamptz,
  execution_price_usd numeric,
  post_execution_roi_pct numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_apin_deal_status ON public.apin_deal_routing(routing_status);
CREATE INDEX idx_apin_deal_urgency ON public.apin_deal_routing(urgency_score DESC);
CREATE INDEX idx_apin_deal_city ON public.apin_deal_routing(city);

-- 3) Collective Intelligence Learning Loop
CREATE TABLE public.apin_learning_loop (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_cycle_id text NOT NULL,
  cycle_type text NOT NULL, -- 'transaction_outcome','allocation_refinement','prediction_calibration','network_optimization'
  -- Input metrics
  transactions_analyzed int NOT NULL DEFAULT 0,
  prediction_accuracy_before numeric NOT NULL DEFAULT 0,
  prediction_accuracy_after numeric NOT NULL DEFAULT 0,
  accuracy_delta numeric NOT NULL DEFAULT 0,
  -- Model updates
  weights_adjusted jsonb NOT NULL DEFAULT '{}', -- which model weights changed
  allocation_strategy_version text NOT NULL DEFAULT 'v1',
  capital_efficiency_score numeric NOT NULL DEFAULT 0, -- 0-100
  capital_efficiency_delta numeric NOT NULL DEFAULT 0,
  -- Insights
  top_learnings jsonb NOT NULL DEFAULT '[]',
  anomalies_detected int NOT NULL DEFAULT 0,
  market_regime_detected text, -- 'bull','bear','sideways','transition','crisis'
  -- Performance
  global_sharpe_ratio numeric,
  global_sortino_ratio numeric,
  max_drawdown_pct numeric,
  cycle_duration_ms int,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_apin_learning_cycle ON public.apin_learning_loop(cycle_type);
CREATE INDEX idx_apin_learning_accuracy ON public.apin_learning_loop(prediction_accuracy_after DESC);

-- 4) Network Liquidity Amplification Engine
CREATE TABLE public.apin_liquidity_amplification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL DEFAULT 'ID',
  -- Transaction velocity
  transaction_velocity_30d numeric NOT NULL DEFAULT 0, -- deals per day
  velocity_acceleration numeric NOT NULL DEFAULT 0, -- change rate
  avg_settlement_hours numeric NOT NULL DEFAULT 0,
  -- Cross-border
  cross_border_volume_usd numeric NOT NULL DEFAULT 0,
  cross_border_friction_score numeric NOT NULL DEFAULT 0, -- 0-100 (0=frictionless)
  fx_hedging_cost_pct numeric NOT NULL DEFAULT 0,
  active_corridors jsonb NOT NULL DEFAULT '[]', -- [{from, to, volume}]
  -- Emerging market expansion
  emerging_market_participation_pct numeric NOT NULL DEFAULT 0,
  new_investor_onboarding_rate numeric NOT NULL DEFAULT 0, -- per month
  retail_to_institutional_ratio numeric NOT NULL DEFAULT 0,
  -- Flywheel metrics
  liquidity_depth_score numeric NOT NULL DEFAULT 0, -- 0-100
  network_effect_multiplier numeric NOT NULL DEFAULT 1.0,
  flywheel_stage text NOT NULL DEFAULT 'ignition', -- 'ignition','traction','momentum','escape_velocity','dominance'
  -- Amplification
  amplification_factor numeric NOT NULL DEFAULT 1.0,
  projected_volume_90d_usd numeric,
  breakeven_velocity numeric, -- minimum for self-sustaining
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_apin_liq_city ON public.apin_liquidity_amplification(city);
CREATE INDEX idx_apin_liq_depth ON public.apin_liquidity_amplification(liquidity_depth_score DESC);

-- 5) Strategic Influence & Market Leadership Model
CREATE TABLE public.apin_market_leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL, -- 'global','asia_pacific','southeast_asia','indonesia'
  -- Network dominance
  market_share_pct numeric NOT NULL DEFAULT 0,
  total_network_aum_usd numeric NOT NULL DEFAULT 0,
  active_investor_count int NOT NULL DEFAULT 0,
  institutional_partner_count int NOT NULL DEFAULT 0,
  -- Intelligence standard
  data_coverage_pct numeric NOT NULL DEFAULT 0, -- % of market transactions captured
  pricing_authority_score numeric NOT NULL DEFAULT 0, -- 0-100 (market trusts our prices)
  intelligence_dependency_score numeric NOT NULL DEFAULT 0, -- 0-100 (institutions depend on us)
  api_consumer_count int NOT NULL DEFAULT 0,
  -- Competitive moat
  switching_cost_index numeric NOT NULL DEFAULT 0, -- 0-100
  network_lock_in_score numeric NOT NULL DEFAULT 0, -- 0-100
  data_moat_depth_years numeric NOT NULL DEFAULT 0,
  -- Evolution phase
  evolution_phase text NOT NULL DEFAULT 'emerging', -- 'emerging','growing','dominant','standard_setter','essential_infrastructure'
  phase_confidence numeric NOT NULL DEFAULT 0, -- 0-100
  next_phase_trigger text,
  estimated_phase_transition_months int,
  -- Governance
  regulatory_partnerships int NOT NULL DEFAULT 0,
  government_data_agreements int NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_apin_lead_region ON public.apin_market_leadership(region);
CREATE INDEX idx_apin_lead_share ON public.apin_market_leadership(market_share_pct DESC);

-- Trigger: emit signal when deal routing finds high-urgency match
CREATE OR REPLACE FUNCTION public.fn_apin_deal_routed_alert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.routing_status = 'routed' AND NEW.urgency_score >= 85 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'apin_high_urgency_deal',
      'apin_deal_routing',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'deal_id', NEW.deal_id,
        'city', NEW.city,
        'value_usd', NEW.deal_value_usd,
        'urgency', NEW.urgency_score,
        'matched_investors', NEW.matched_investor_count
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apin_deal_routed_alert
AFTER INSERT OR UPDATE ON public.apin_deal_routing
FOR EACH ROW EXECUTE FUNCTION public.fn_apin_deal_routed_alert();

-- RLS
ALTER TABLE public.apin_investor_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apin_deal_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apin_learning_loop ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apin_liquidity_amplification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apin_market_leadership ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read apin_investor_graph" ON public.apin_investor_graph FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read apin_deal_routing" ON public.apin_deal_routing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read apin_learning_loop" ON public.apin_learning_loop FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read apin_liquidity_amplification" ON public.apin_liquidity_amplification FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read apin_market_leadership" ON public.apin_market_leadership FOR SELECT TO authenticated USING (true);

-- Service role write
CREATE POLICY "Service insert apin_investor_graph" ON public.apin_investor_graph FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update apin_investor_graph" ON public.apin_investor_graph FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert apin_deal_routing" ON public.apin_deal_routing FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update apin_deal_routing" ON public.apin_deal_routing FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert apin_learning_loop" ON public.apin_learning_loop FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update apin_learning_loop" ON public.apin_learning_loop FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert apin_liquidity_amplification" ON public.apin_liquidity_amplification FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update apin_liquidity_amplification" ON public.apin_liquidity_amplification FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert apin_market_leadership" ON public.apin_market_leadership FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update apin_market_leadership" ON public.apin_market_leadership FOR UPDATE TO service_role USING (true);
