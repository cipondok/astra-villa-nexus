
-- PART 1: Missing intelligence columns on properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS demand_heat_score numeric DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rental_yield numeric DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS roi_projection numeric DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS inquiry_velocity numeric DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_demand_heat ON properties(demand_heat_score DESC);
CREATE INDEX IF NOT EXISTS idx_properties_rental_yield ON properties(rental_yield DESC);

-- PART 2: Market Clusters table
CREATE TABLE IF NOT EXISTS market_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text,
  area text,
  center_lat numeric,
  center_lng numeric,
  avg_opportunity_score numeric DEFAULT 0,
  market_heat_score numeric DEFAULT 0,
  property_count integer DEFAULT 0,
  avg_price_per_sqm numeric DEFAULT 0,
  trend_direction text DEFAULT 'Stable',
  cluster_confidence numeric DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_clusters_city ON market_clusters(city);
CREATE INDEX IF NOT EXISTS idx_market_clusters_heat ON market_clusters(market_heat_score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_clusters_city_area ON market_clusters(city, area);

ALTER TABLE market_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read market_clusters"
  ON market_clusters FOR SELECT TO authenticated USING (true);

-- PART 3: Investor Portfolio Snapshots table
CREATE TABLE IF NOT EXISTS investor_portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  total_value numeric DEFAULT 0,
  total_properties integer DEFAULT 0,
  projected_roi numeric DEFAULT 0,
  risk_score numeric DEFAULT 0,
  opportunity_density numeric DEFAULT 0,
  forecast_growth_signal text DEFAULT 'Stable',
  snapshot_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_snap_investor ON investor_portfolio_snapshots(investor_id, snapshot_date DESC);

ALTER TABLE investor_portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own snapshots"
  ON investor_portfolio_snapshots FOR SELECT TO authenticated
  USING (investor_id = auth.uid());

-- PART 4: Worker run log table
CREATE TABLE IF NOT EXISTS intelligence_worker_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_name text NOT NULL,
  status text DEFAULT 'running',
  rows_affected integer DEFAULT 0,
  duration_ms integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_worker_runs_name ON intelligence_worker_runs(worker_name, started_at DESC);

ALTER TABLE intelligence_worker_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read worker_runs"
  ON intelligence_worker_runs FOR SELECT TO authenticated USING (true);
