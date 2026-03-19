
-- ============================================================
-- AI SOVEREIGN REAL ESTATE SUPER-APP ARCHITECTURE
-- ============================================================

-- 1. UNIFIED PROPERTY DISCOVERY OS
CREATE TABLE IF NOT EXISTS superapp_discovery_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  city text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  discovery_rank integer NOT NULL DEFAULT 0,
  deal_gravity_score numeric NOT NULL DEFAULT 0,
  liquidity_momentum numeric NOT NULL DEFAULT 0,
  price_inefficiency_signal numeric NOT NULL DEFAULT 0,
  behavioral_cluster text NOT NULL DEFAULT 'general',
  cross_market_arbitrage_score numeric NOT NULL DEFAULT 0,
  investor_demand_intensity numeric NOT NULL DEFAULT 0,
  discovery_tier text NOT NULL DEFAULT 'standard'
    CHECK (discovery_tier IN ('featured','premium','standard','suppressed')),
  last_recomputed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_superapp_discovery_rank ON superapp_discovery_index(discovery_rank DESC);
CREATE INDEX IF NOT EXISTS idx_superapp_discovery_city ON superapp_discovery_index(city, discovery_tier);
CREATE UNIQUE INDEX IF NOT EXISTS idx_superapp_discovery_property ON superapp_discovery_index(property_id);

ALTER TABLE superapp_discovery_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read discovery index" ON superapp_discovery_index FOR SELECT USING (true);

-- 2. AUTONOMOUS TRANSACTION LAYER
CREATE TABLE IF NOT EXISTS superapp_transaction_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid,
  agent_id uuid,
  pipeline_stage text NOT NULL DEFAULT 'discovery'
    CHECK (pipeline_stage IN (
      'discovery','viewing_scheduled','viewing_completed',
      'offer_submitted','negotiation','escrow_initiated',
      'legal_verification','commission_calculated',
      'closing','completed','cancelled'
    )),
  viewing_scheduled_at timestamptz,
  escrow_amount numeric,
  escrow_status text DEFAULT 'pending',
  legal_verification_status text DEFAULT 'pending',
  commission_rate numeric DEFAULT 0,
  commission_amount numeric DEFAULT 0,
  close_probability numeric NOT NULL DEFAULT 0,
  urgency_score numeric NOT NULL DEFAULT 0,
  recommended_action text,
  stage_entered_at timestamptz NOT NULL DEFAULT now(),
  expected_close_date date,
  actual_close_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_superapp_txn_buyer ON superapp_transaction_pipeline(buyer_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_superapp_txn_stage ON superapp_transaction_pipeline(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_superapp_txn_property ON superapp_transaction_pipeline(property_id);

ALTER TABLE superapp_transaction_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own transactions" ON superapp_transaction_pipeline
  FOR SELECT USING (auth.uid() IN (buyer_id, seller_id, agent_id));
CREATE POLICY "Buyers create transactions" ON superapp_transaction_pipeline
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 3. ASSET LIFECYCLE INTELLIGENCE
CREATE TABLE IF NOT EXISTS asset_lifecycle_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  lifecycle_phase text NOT NULL DEFAULT 'acquisition'
    CHECK (lifecycle_phase IN (
      'acquisition','renovation','leasing','stabilized',
      'portfolio_optimization','exit_preparation','exited'
    )),
  acquisition_price numeric,
  acquisition_date date,
  acquisition_costs numeric DEFAULT 0,
  renovation_budget numeric DEFAULT 0,
  renovation_spent numeric DEFAULT 0,
  renovation_completion_pct numeric DEFAULT 0,
  monthly_rental_income numeric DEFAULT 0,
  occupancy_rate numeric DEFAULT 0,
  lease_expiry_date date,
  current_valuation numeric DEFAULT 0,
  unrealized_gain_pct numeric DEFAULT 0,
  cap_rate numeric DEFAULT 0,
  cash_on_cash_return numeric DEFAULT 0,
  optimal_exit_window text,
  exit_price_estimate numeric DEFAULT 0,
  holding_period_months integer DEFAULT 0,
  total_roi_pct numeric DEFAULT 0,
  lifecycle_health_score integer NOT NULL DEFAULT 50,
  ai_recommendation text,
  next_milestone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_lifecycle_property ON asset_lifecycle_tracker(property_id);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_owner ON asset_lifecycle_tracker(owner_id, lifecycle_phase);

ALTER TABLE asset_lifecycle_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners see own assets" ON asset_lifecycle_tracker
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners manage own assets" ON asset_lifecycle_tracker
  FOR ALL USING (auth.uid() = owner_id);

-- 4. VENDOR SERVICES MICRO-SUPER-APP
CREATE TABLE IF NOT EXISTS superapp_service_hub (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  requester_id uuid NOT NULL,
  vendor_id uuid,
  service_vertical text NOT NULL
    CHECK (service_vertical IN (
      'construction','interior_design','legal',
      'mortgage','property_management','insurance',
      'inspection','cleaning','smart_home'
    )),
  service_type text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','quoted','accepted','in_progress','completed','cancelled','disputed')),
  quoted_price numeric DEFAULT 0,
  final_price numeric DEFAULT 0,
  platform_fee_pct numeric DEFAULT 5,
  platform_fee_amount numeric DEFAULT 0,
  quality_score numeric,
  completion_rating numeric,
  requested_at timestamptz NOT NULL DEFAULT now(),
  quoted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_hub_requester ON superapp_service_hub(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_service_hub_vendor ON superapp_service_hub(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_service_hub_vertical ON superapp_service_hub(service_vertical);

ALTER TABLE superapp_service_hub ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own service requests" ON superapp_service_hub
  FOR SELECT USING (auth.uid() IN (requester_id, vendor_id));
CREATE POLICY "Users create service requests" ON superapp_service_hub
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- 5. INVESTOR WEALTH INTELLIGENCE
CREATE TABLE IF NOT EXISTS investor_wealth_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_portfolio_value numeric NOT NULL DEFAULT 0,
  total_assets integer NOT NULL DEFAULT 0,
  total_monthly_cashflow numeric NOT NULL DEFAULT 0,
  weighted_avg_cap_rate numeric NOT NULL DEFAULT 0,
  portfolio_risk_score integer NOT NULL DEFAULT 50,
  geographic_concentration_risk numeric NOT NULL DEFAULT 0,
  asset_type_concentration_risk numeric NOT NULL DEFAULT 0,
  vacancy_risk numeric NOT NULL DEFAULT 0,
  leverage_ratio numeric NOT NULL DEFAULT 0,
  projected_annual_cashflow numeric NOT NULL DEFAULT 0,
  cashflow_growth_rate numeric NOT NULL DEFAULT 0,
  break_even_months integer,
  rotation_signal text DEFAULT 'hold'
    CHECK (rotation_signal IN ('accumulate','hold','rebalance','reduce','exit')),
  rotation_confidence numeric NOT NULL DEFAULT 0,
  target_allocation jsonb DEFAULT '{}',
  wealth_trajectory_12m numeric NOT NULL DEFAULT 0,
  wealth_trajectory_36m numeric NOT NULL DEFAULT 0,
  fire_number_progress_pct numeric NOT NULL DEFAULT 0,
  top_recommendation text,
  risk_narrative text,
  opportunity_pipeline_count integer NOT NULL DEFAULT 0,
  last_computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wealth_intel_user ON investor_wealth_intelligence(user_id);

ALTER TABLE investor_wealth_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own wealth data" ON investor_wealth_intelligence
  FOR SELECT USING (auth.uid() = user_id);

-- 6. SUPER-APP UNIFIED IDENTITY LAYER
CREATE TABLE IF NOT EXISTS superapp_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  verified_at timestamptz,
  trust_score integer NOT NULL DEFAULT 50,
  is_investor boolean NOT NULL DEFAULT false,
  is_agent boolean NOT NULL DEFAULT false,
  is_vendor boolean NOT NULL DEFAULT false,
  is_developer boolean NOT NULL DEFAULT false,
  is_property_owner boolean NOT NULL DEFAULT false,
  primary_role text NOT NULL DEFAULT 'investor',
  total_transactions integer NOT NULL DEFAULT 0,
  total_portfolio_value numeric NOT NULL DEFAULT 0,
  platform_tenure_days integer NOT NULL DEFAULT 0,
  engagement_streak_days integer NOT NULL DEFAULT 0,
  loyalty_tier text NOT NULL DEFAULT 'bronze'
    CHECK (loyalty_tier IN ('bronze','silver','gold','platinum','diamond')),
  loyalty_points integer NOT NULL DEFAULT 0,
  switching_cost_index numeric NOT NULL DEFAULT 0,
  last_discovery_at timestamptz,
  last_transaction_at timestamptz,
  last_service_request_at timestamptz,
  active_pipelines integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_identity_trust ON superapp_identity(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_identity_loyalty ON superapp_identity(loyalty_tier);

ALTER TABLE superapp_identity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read identity" ON superapp_identity FOR SELECT USING (true);

-- 7. SUPER-APP ORCHESTRATION STATE
CREATE TABLE IF NOT EXISTS superapp_orchestration_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name text NOT NULL,
  city text NOT NULL DEFAULT 'global',
  health_score integer NOT NULL DEFAULT 0,
  throughput_rpm integer NOT NULL DEFAULT 0,
  error_rate numeric NOT NULL DEFAULT 0,
  last_sync_at timestamptz NOT NULL DEFAULT now(),
  sync_latency_ms integer NOT NULL DEFAULT 0,
  upstream_modules text[] DEFAULT '{}',
  downstream_modules text[] DEFAULT '{}',
  bottleneck_detected boolean NOT NULL DEFAULT false,
  bottleneck_reason text,
  lifecycle_coverage_pct numeric NOT NULL DEFAULT 0,
  active_users_in_module integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(module_name, city)
);

ALTER TABLE superapp_orchestration_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read orchestration" ON superapp_orchestration_state FOR SELECT USING (true);

-- Signal trigger for lifecycle transitions
CREATE OR REPLACE FUNCTION emit_superapp_lifecycle_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
  VALUES (
    'superapp_lifecycle_transition',
    TG_TABLE_NAME,
    NEW.id::text,
    CASE
      WHEN TG_TABLE_NAME = 'superapp_transaction_pipeline' AND NEW.pipeline_stage = 'completed' THEN 'critical'
      WHEN TG_TABLE_NAME = 'asset_lifecycle_tracker' AND NEW.lifecycle_phase = 'exit_preparation' THEN 'high'
      ELSE 'normal'
    END,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'stage', COALESCE(NEW.pipeline_stage, NEW.lifecycle_phase, NEW.status, 'unknown'),
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_superapp_txn_lifecycle
  AFTER INSERT OR UPDATE OF pipeline_stage ON superapp_transaction_pipeline
  FOR EACH ROW EXECUTE FUNCTION emit_superapp_lifecycle_signal();

CREATE TRIGGER trg_superapp_asset_lifecycle
  AFTER INSERT OR UPDATE OF lifecycle_phase ON asset_lifecycle_tracker
  FOR EACH ROW EXECUTE FUNCTION emit_superapp_lifecycle_signal();

CREATE TRIGGER trg_superapp_service_lifecycle
  AFTER INSERT OR UPDATE OF status ON superapp_service_hub
  FOR EACH ROW EXECUTE FUNCTION emit_superapp_lifecycle_signal();
