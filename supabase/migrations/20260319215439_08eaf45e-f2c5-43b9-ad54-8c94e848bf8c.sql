
-- ============================================================
-- AUTONOMOUS INSTITUTIONAL FUND LAYER
-- AI-managed capital deployment, scoring, pools & rebalancing
-- ============================================================

-- 1️⃣ FUND OPPORTUNITY SCORING ENGINE
CREATE TABLE IF NOT EXISTS fund_opportunity_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  city text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  -- composite score
  opportunity_score integer NOT NULL DEFAULT 0,
  opportunity_tier text NOT NULL DEFAULT 'standard'
    CHECK (opportunity_tier IN ('elite','strong','standard','weak','avoid')),
  -- component scores (0-100)
  liquidity_acceleration numeric NOT NULL DEFAULT 0,
  price_inefficiency numeric NOT NULL DEFAULT 0,
  deal_close_probability numeric NOT NULL DEFAULT 0,
  district_growth_sequencing numeric NOT NULL DEFAULT 0,
  rental_yield_strength numeric NOT NULL DEFAULT 0,
  capital_inflow_momentum numeric NOT NULL DEFAULT 0,
  -- AI recommendation
  recommended_action text DEFAULT 'monitor',
  recommended_ticket_size numeric DEFAULT 0,
  expected_irr numeric DEFAULT 0,
  expected_hold_months integer DEFAULT 24,
  risk_grade text DEFAULT 'B'
    CHECK (risk_grade IN ('AAA','AA','A','BBB','BB','B','CCC','CC','C','D')),
  last_scored_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fund_opp_property ON fund_opportunity_scores(property_id);
CREATE INDEX IF NOT EXISTS idx_fund_opp_score ON fund_opportunity_scores(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_fund_opp_tier ON fund_opportunity_scores(opportunity_tier, city);

ALTER TABLE fund_opportunity_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fund scores" ON fund_opportunity_scores FOR SELECT USING (true);

-- 2️⃣ INSTITUTIONAL LIQUIDITY POOLS
CREATE TABLE IF NOT EXISTS fund_liquidity_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_name text NOT NULL,
  pool_type text NOT NULL DEFAULT 'open'
    CHECK (pool_type IN ('open','closed','syndicated','fractional')),
  -- capital structure
  target_raise numeric NOT NULL DEFAULT 0,
  total_committed numeric NOT NULL DEFAULT 0,
  total_deployed numeric NOT NULL DEFAULT 0,
  total_returned numeric NOT NULL DEFAULT 0,
  available_capital numeric NOT NULL DEFAULT 0,
  -- participants
  total_investors integer NOT NULL DEFAULT 0,
  min_ticket_size numeric NOT NULL DEFAULT 0,
  max_ticket_size numeric,
  -- strategy
  investment_strategy text NOT NULL DEFAULT 'balanced'
    CHECK (investment_strategy IN ('aggressive_growth','growth','balanced','income','conservative')),
  target_cities text[] DEFAULT '{}',
  target_asset_types text[] DEFAULT '{}',
  target_irr numeric NOT NULL DEFAULT 12,
  max_single_asset_pct numeric NOT NULL DEFAULT 15,
  -- performance
  current_irr numeric NOT NULL DEFAULT 0,
  current_tvpi numeric NOT NULL DEFAULT 1.0,
  current_dpi numeric NOT NULL DEFAULT 0,
  cash_yield numeric NOT NULL DEFAULT 0,
  -- status
  status text NOT NULL DEFAULT 'fundraising'
    CHECK (status IN ('fundraising','deploying','fully_deployed','harvesting','closed','liquidated')),
  vintage_year integer NOT NULL DEFAULT 2026,
  fund_term_months integer NOT NULL DEFAULT 60,
  inception_date date,
  maturity_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fund_pools_status ON fund_liquidity_pools(status);

ALTER TABLE fund_liquidity_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pools" ON fund_liquidity_pools FOR SELECT USING (true);

-- 3️⃣ POOL PARTICIPATIONS (investor allocations)
CREATE TABLE IF NOT EXISTS fund_pool_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES fund_liquidity_pools(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL,
  -- commitment
  committed_amount numeric NOT NULL DEFAULT 0,
  called_amount numeric NOT NULL DEFAULT 0,
  distributed_amount numeric NOT NULL DEFAULT 0,
  ownership_pct numeric NOT NULL DEFAULT 0,
  -- performance
  investor_irr numeric NOT NULL DEFAULT 0,
  investor_tvpi numeric NOT NULL DEFAULT 1.0,
  unrealized_value numeric NOT NULL DEFAULT 0,
  -- status
  participation_status text NOT NULL DEFAULT 'active'
    CHECK (participation_status IN ('pending','active','partially_redeemed','redeemed','defaulted')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_distribution_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pool_id, investor_id)
);

CREATE INDEX IF NOT EXISTS idx_fund_participation_investor ON fund_pool_participations(investor_id);

ALTER TABLE fund_pool_participations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors see own participations" ON fund_pool_participations
  FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors join pools" ON fund_pool_participations
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- 4️⃣ FUND DEPLOYMENTS (capital → property allocations)
CREATE TABLE IF NOT EXISTS fund_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES fund_liquidity_pools(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  -- allocation
  deployed_amount numeric NOT NULL DEFAULT 0,
  deployment_pct_of_pool numeric NOT NULL DEFAULT 0,
  -- performance tracking
  current_valuation numeric NOT NULL DEFAULT 0,
  unrealized_gain_pct numeric NOT NULL DEFAULT 0,
  monthly_cashflow numeric NOT NULL DEFAULT 0,
  annualized_return numeric NOT NULL DEFAULT 0,
  -- risk
  risk_grade text DEFAULT 'B',
  impairment_flag boolean NOT NULL DEFAULT false,
  impairment_amount numeric DEFAULT 0,
  -- lifecycle
  deployment_status text NOT NULL DEFAULT 'active'
    CHECK (deployment_status IN ('pending','active','underperforming','exit_planned','exited','written_off')),
  deployed_at timestamptz NOT NULL DEFAULT now(),
  exit_date date,
  exit_proceeds numeric DEFAULT 0,
  exit_multiple numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fund_deploy_pool ON fund_deployments(pool_id, deployment_status);
CREATE INDEX IF NOT EXISTS idx_fund_deploy_property ON fund_deployments(property_id);

ALTER TABLE fund_deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read deployments" ON fund_deployments FOR SELECT USING (true);

-- 5️⃣ AUTONOMOUS PORTFOLIO REBALANCER
CREATE TABLE IF NOT EXISTS fund_rebalance_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES fund_liquidity_pools(id) ON DELETE CASCADE,
  deployment_id uuid REFERENCES fund_deployments(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  -- signal
  signal_type text NOT NULL
    CHECK (signal_type IN (
      'overexposure_alert','underperformance','exit_window',
      'reinvestment_opportunity','downturn_hedge','yield_optimization',
      'geographic_rebalance','sector_rotation'
    )),
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('critical','high','medium','low','info')),
  -- details
  current_allocation_pct numeric DEFAULT 0,
  recommended_allocation_pct numeric DEFAULT 0,
  expected_impact_irr numeric DEFAULT 0,
  rationale text,
  -- action
  recommended_action text NOT NULL DEFAULT 'review',
  auto_executable boolean NOT NULL DEFAULT false,
  executed_at timestamptz,
  execution_result text,
  is_acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fund_rebalance_pool ON fund_rebalance_signals(pool_id, signal_type);
CREATE INDEX IF NOT EXISTS idx_fund_rebalance_severity ON fund_rebalance_signals(severity, is_acknowledged);

ALTER TABLE fund_rebalance_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rebalance signals" ON fund_rebalance_signals FOR SELECT USING (true);

-- 6️⃣ FUND PERFORMANCE INTELLIGENCE
CREATE TABLE IF NOT EXISTS fund_performance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES fund_liquidity_pools(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  -- returns
  gross_irr numeric NOT NULL DEFAULT 0,
  net_irr numeric NOT NULL DEFAULT 0,
  tvpi numeric NOT NULL DEFAULT 1.0,
  dpi numeric NOT NULL DEFAULT 0,
  rvpi numeric NOT NULL DEFAULT 1.0,
  -- cashflow
  period_cashflow numeric NOT NULL DEFAULT 0,
  cumulative_distributions numeric NOT NULL DEFAULT 0,
  nav numeric NOT NULL DEFAULT 0,
  -- risk metrics
  volatility numeric NOT NULL DEFAULT 0,
  sharpe_ratio numeric NOT NULL DEFAULT 0,
  max_drawdown numeric NOT NULL DEFAULT 0,
  var_95 numeric NOT NULL DEFAULT 0,
  cashflow_stability_index numeric NOT NULL DEFAULT 0,
  -- velocity
  capital_deployment_velocity numeric NOT NULL DEFAULT 0,
  capital_return_velocity numeric NOT NULL DEFAULT 0,
  deal_pipeline_count integer NOT NULL DEFAULT 0,
  -- benchmarks
  benchmark_irr numeric DEFAULT 0,
  alpha numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pool_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_fund_perf_pool_date ON fund_performance_snapshots(pool_id, snapshot_date DESC);

ALTER TABLE fund_performance_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read performance" ON fund_performance_snapshots FOR SELECT USING (true);

-- Trigger: emit signal when rebalance is critical
CREATE OR REPLACE FUNCTION emit_fund_rebalance_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.severity IN ('critical', 'high') THEN
    INSERT INTO ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'fund_rebalance_alert',
      'fund_rebalance_signals',
      NEW.id::text,
      CASE WHEN NEW.severity = 'critical' THEN 'critical' ELSE 'high' END,
      jsonb_build_object(
        'pool_id', NEW.pool_id,
        'signal_type', NEW.signal_type,
        'severity', NEW.severity,
        'recommended_action', NEW.recommended_action
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fund_rebalance_signal
  AFTER INSERT ON fund_rebalance_signals
  FOR EACH ROW EXECUTE FUNCTION emit_fund_rebalance_signal();
