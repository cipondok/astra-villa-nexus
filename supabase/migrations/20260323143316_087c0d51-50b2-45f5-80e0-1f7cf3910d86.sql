-- PLANET-SCALE REAL ESTATE INTELLIGENCE GRID

CREATE TABLE IF NOT EXISTS global_property_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL DEFAULT 'Indonesia',
  region text NOT NULL,
  city text NOT NULL,
  urban_growth_score numeric DEFAULT 0,
  infrastructure_development_score numeric DEFAULT 0,
  population_mobility_index numeric DEFAULT 0,
  capital_inflow_intensity numeric DEFAULT 0,
  housing_supply_pressure numeric DEFAULT 0,
  affordability_stress_index numeric DEFAULT 0,
  rental_yield_trend numeric DEFAULT 0,
  liquidity_velocity_score numeric DEFAULT 0,
  market_cycle_phase text DEFAULT 'recovery',
  confidence_level numeric DEFAULT 0,
  signal_timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gps_region_city ON global_property_signals(region, city);
CREATE INDEX idx_gps_timestamp ON global_property_signals(signal_timestamp DESC);
CREATE INDEX idx_gps_cycle ON global_property_signals(market_cycle_phase);
CREATE INDEX idx_gps_country ON global_property_signals(country);

ALTER TABLE global_property_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read global_property_signals" ON global_property_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manage global_property_signals" ON global_property_signals FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS capital_flow_network (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_city text NOT NULL,
  source_country text NOT NULL DEFAULT 'Indonesia',
  target_city text NOT NULL,
  target_country text NOT NULL DEFAULT 'Indonesia',
  segment text DEFAULT 'mixed',
  capital_movement_probability numeric DEFAULT 0,
  investment_migration_score numeric DEFAULT 0,
  portfolio_diversification_flow numeric DEFAULT 0,
  investor_cluster_size integer DEFAULT 0,
  flow_volume_usd numeric DEFAULT 0,
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cfn_source ON capital_flow_network(source_city, source_country);
CREATE INDEX idx_cfn_target ON capital_flow_network(target_city, target_country);
CREATE INDEX idx_cfn_measured ON capital_flow_network(measured_at DESC);

ALTER TABLE capital_flow_network ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read capital_flow_network" ON capital_flow_network FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manage capital_flow_network" ON capital_flow_network FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS global_liquidity_balance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  balance_index numeric DEFAULT 50,
  cross_country_absorption numeric DEFAULT 0,
  capital_concentration_risk numeric DEFAULT 0,
  inventory_risk_score numeric DEFAULT 0,
  affordability_stress numeric DEFAULT 0,
  systemic_status text DEFAULT 'balanced',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_glb_region ON global_liquidity_balance(region);
CREATE INDEX idx_glb_computed ON global_liquidity_balance(computed_at DESC);

ALTER TABLE global_liquidity_balance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read global_liquidity_balance" ON global_liquidity_balance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manage global_liquidity_balance" ON global_liquidity_balance FOR ALL TO service_role USING (true) WITH CHECK (true);