
-- ============================================================
-- AI CAPITAL GRAVITY ENGINE
-- Predicts, amplifies, and influences global capital flows
-- ============================================================

-- 1️⃣ CAPITAL FLOW PREDICTIONS
CREATE TABLE IF NOT EXISTS capital_flow_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code text NOT NULL,
  city text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  prediction_horizon text NOT NULL DEFAULT '30d'
    CHECK (prediction_horizon IN ('7d','30d','90d','180d','365d')),
  -- institutional
  institutional_inflow_forecast numeric NOT NULL DEFAULT 0,
  institutional_confidence numeric NOT NULL DEFAULT 0,
  institutional_source_markets text[] DEFAULT '{}',
  -- retail
  retail_demand_wave_index numeric NOT NULL DEFAULT 0,
  retail_sentiment_score numeric NOT NULL DEFAULT 0,
  retail_search_momentum numeric NOT NULL DEFAULT 0,
  -- cross-border
  cross_border_migration_score numeric NOT NULL DEFAULT 0,
  cross_border_origin_countries text[] DEFAULT '{}',
  fx_tailwind_index numeric NOT NULL DEFAULT 0,
  -- composite
  capital_gravity_score integer NOT NULL DEFAULT 0,
  gravity_tier text NOT NULL DEFAULT 'neutral'
    CHECK (gravity_tier IN ('magnetic','strong','neutral','weak','repulsive')),
  predicted_capital_volume numeric NOT NULL DEFAULT 0,
  prediction_model_version text DEFAULT 'v1',
  model_accuracy_pct numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(market_code, district, prediction_horizon)
);

CREATE INDEX IF NOT EXISTS idx_cap_flow_gravity ON capital_flow_predictions(capital_gravity_score DESC);
CREATE INDEX IF NOT EXISTS idx_cap_flow_market ON capital_flow_predictions(market_code, gravity_tier);

ALTER TABLE capital_flow_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read capital predictions" ON capital_flow_predictions FOR SELECT USING (true);

-- 2️⃣ LIQUIDITY ACCELERATION SIGNALS
CREATE TABLE IF NOT EXISTS liquidity_acceleration_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code text NOT NULL,
  city text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  -- breakout detection
  signal_type text NOT NULL
    CHECK (signal_type IN (
      'district_breakout','yield_compression','hotspot_emergence',
      'momentum_surge','absorption_spike','demand_cascade',
      'institutional_entry','scarcity_trigger'
    )),
  -- metrics
  signal_strength numeric NOT NULL DEFAULT 0,
  acceleration_rate numeric NOT NULL DEFAULT 0,
  days_to_breakout integer,
  -- context
  baseline_metric numeric DEFAULT 0,
  current_metric numeric DEFAULT 0,
  pct_change numeric DEFAULT 0,
  trigger_conditions jsonb DEFAULT '{}',
  -- status
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('emerging','active','confirmed','fading','expired')),
  confirmed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_liq_accel_district ON liquidity_acceleration_signals(market_code, district);
CREATE INDEX IF NOT EXISTS idx_liq_accel_type ON liquidity_acceleration_signals(signal_type, status);
CREATE INDEX IF NOT EXISTS idx_liq_accel_strength ON liquidity_acceleration_signals(signal_strength DESC);

ALTER TABLE liquidity_acceleration_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read accel signals" ON liquidity_acceleration_signals FOR SELECT USING (true);

-- 3️⃣ YIELD GRADIENT MAP
CREATE TABLE IF NOT EXISTS yield_gradient_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code text NOT NULL,
  city text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  asset_type text NOT NULL DEFAULT 'all',
  -- yield metrics
  gross_rental_yield numeric NOT NULL DEFAULT 0,
  net_rental_yield numeric NOT NULL DEFAULT 0,
  capital_appreciation_12m numeric NOT NULL DEFAULT 0,
  capital_appreciation_36m numeric NOT NULL DEFAULT 0,
  total_return_forecast numeric NOT NULL DEFAULT 0,
  -- risk-adjusted
  risk_adjusted_return numeric NOT NULL DEFAULT 0,
  sharpe_proxy numeric NOT NULL DEFAULT 0,
  volatility numeric NOT NULL DEFAULT 0,
  downside_risk numeric NOT NULL DEFAULT 0,
  -- comparison
  yield_vs_national_avg numeric NOT NULL DEFAULT 0,
  yield_vs_regional_avg numeric NOT NULL DEFAULT 0,
  yield_rank_in_country integer DEFAULT 0,
  yield_rank_global integer DEFAULT 0,
  -- gradient
  yield_gradient_direction text DEFAULT 'stable'
    CHECK (yield_gradient_direction IN ('compressing','stable','expanding','volatile')),
  gradient_velocity numeric DEFAULT 0,
  last_computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(market_code, district, asset_type)
);

CREATE INDEX IF NOT EXISTS idx_yield_grad_return ON yield_gradient_map(risk_adjusted_return DESC);
CREATE INDEX IF NOT EXISTS idx_yield_grad_market ON yield_gradient_map(market_code, yield_gradient_direction);

ALTER TABLE yield_gradient_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read yield map" ON yield_gradient_map FOR SELECT USING (true);

-- 4️⃣ CAPITAL INFLUENCE ACTIONS
CREATE TABLE IF NOT EXISTS capital_influence_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code text NOT NULL,
  district text NOT NULL DEFAULT '',
  -- influence mechanism
  action_type text NOT NULL
    CHECK (action_type IN (
      'priority_highlight','urgency_signal','competitive_pressure',
      'scarcity_nudge','yield_spotlight','momentum_broadcast',
      'institutional_signal','breakout_alert'
    )),
  target_audience text NOT NULL DEFAULT 'all'
    CHECK (target_audience IN ('all','investors','institutional','agents','developers')),
  -- content
  headline text NOT NULL,
  narrative text,
  supporting_data jsonb DEFAULT '{}',
  -- delivery
  delivery_channel text NOT NULL DEFAULT 'platform'
    CHECK (delivery_channel IN ('platform','push','email','dashboard','api')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('critical','high','normal','low')),
  -- effectiveness
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  capital_influenced numeric NOT NULL DEFAULT 0,
  -- lifecycle
  is_active boolean NOT NULL DEFAULT true,
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cap_influence_active ON capital_influence_actions(is_active, priority) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cap_influence_market ON capital_influence_actions(market_code, action_type);

ALTER TABLE capital_influence_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read influence actions" ON capital_influence_actions FOR SELECT USING (true);

-- 5️⃣ CAPITAL NETWORK EFFECT METRICS
CREATE TABLE IF NOT EXISTS capital_network_effect_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code text NOT NULL,
  city text NOT NULL DEFAULT '',
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  -- investor density
  active_investors integer NOT NULL DEFAULT 0,
  new_investors_30d integer NOT NULL DEFAULT 0,
  investor_growth_rate numeric NOT NULL DEFAULT 0,
  -- liquidity depth
  total_liquidity_volume numeric NOT NULL DEFAULT 0,
  avg_days_to_close numeric NOT NULL DEFAULT 0,
  liquidity_depth_index numeric NOT NULL DEFAULT 0,
  -- deal velocity
  deals_closed_30d integer NOT NULL DEFAULT 0,
  deal_velocity_acceleration numeric NOT NULL DEFAULT 0,
  avg_deal_size numeric NOT NULL DEFAULT 0,
  -- capital attraction
  capital_inflow_30d numeric NOT NULL DEFAULT 0,
  capital_multiplier numeric NOT NULL DEFAULT 1.0,
  flywheel_rpm numeric NOT NULL DEFAULT 0,
  -- network maturity
  network_maturity_phase text DEFAULT 'nascent'
    CHECK (network_maturity_phase IN ('nascent','growing','accelerating','critical_mass','dominant')),
  time_to_critical_mass_days integer,
  metcalfe_value_proxy numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(market_code, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_cap_network_market ON capital_network_effect_metrics(market_code, snapshot_date DESC);

ALTER TABLE capital_network_effect_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read network metrics" ON capital_network_effect_metrics FOR SELECT USING (true);

-- Trigger: magnetic gravity zones emit to AI signal bus
CREATE OR REPLACE FUNCTION emit_capital_gravity_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.gravity_tier = 'magnetic' AND NEW.capital_gravity_score >= 85 THEN
    INSERT INTO ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'capital_gravity_magnetic_zone',
      'capital_flow_predictions',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'market_code', NEW.market_code,
        'district', NEW.district,
        'gravity_score', NEW.capital_gravity_score,
        'predicted_volume', NEW.predicted_capital_volume
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_capital_gravity_signal
  AFTER INSERT OR UPDATE OF gravity_tier ON capital_flow_predictions
  FOR EACH ROW EXECUTE FUNCTION emit_capital_gravity_signal();
