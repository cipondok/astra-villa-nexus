-- ============================================
-- SELF-LEARNING MARKET INTELLIGENCE BRAIN
-- Core Schema for Autonomous AI Evolution
-- ============================================

-- 1. MODEL REGISTRY: Track all AI models, versions, shadow testing
CREATE TABLE IF NOT EXISTS ai_model_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  model_version text NOT NULL DEFAULT '1.0.0',
  model_type text NOT NULL DEFAULT 'scoring',
  status text NOT NULL DEFAULT 'shadow',
  accuracy_score numeric DEFAULT 0,
  precision_score numeric DEFAULT 0,
  recall_score numeric DEFAULT 0,
  f1_score numeric DEFAULT 0,
  drift_score numeric DEFAULT 0,
  total_predictions bigint DEFAULT 0,
  correct_predictions bigint DEFAULT 0,
  hyperparameters jsonb DEFAULT '{}',
  feature_weights jsonb DEFAULT '{}',
  training_data_range tstzrange DEFAULT NULL,
  promoted_at timestamptz DEFAULT NULL,
  retired_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(model_name, model_version)
);

-- 2. PREDICTION TRACKING
CREATE TABLE IF NOT EXISTS ai_prediction_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES ai_model_registry(id) ON DELETE SET NULL,
  model_name text NOT NULL,
  prediction_type text NOT NULL,
  property_id uuid DEFAULT NULL,
  city text DEFAULT NULL,
  region text DEFAULT NULL,
  predicted_value numeric NOT NULL,
  actual_value numeric DEFAULT NULL,
  prediction_error numeric DEFAULT NULL,
  absolute_error numeric DEFAULT NULL,
  percentage_error numeric DEFAULT NULL,
  confidence numeric DEFAULT 0.5,
  prediction_horizon_days int DEFAULT 90,
  features_used jsonb DEFAULT '{}',
  resolved_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. MODEL PERFORMANCE HISTORY
CREATE TABLE IF NOT EXISTS ai_model_performance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES ai_model_registry(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_predictions int DEFAULT 0,
  resolved_predictions int DEFAULT 0,
  mae numeric DEFAULT NULL,
  mape numeric DEFAULT NULL,
  rmse numeric DEFAULT NULL,
  r_squared numeric DEFAULT NULL,
  accuracy_bucket jsonb DEFAULT '{}',
  region_accuracy jsonb DEFAULT '{}',
  drift_detected boolean DEFAULT false,
  drift_magnitude numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. INVESTOR CLUSTERS
CREATE TABLE IF NOT EXISTS ai_investor_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_name text NOT NULL,
  cluster_type text NOT NULL DEFAULT 'auto',
  description text DEFAULT NULL,
  centroid_features jsonb NOT NULL DEFAULT '{}',
  member_count int DEFAULT 0,
  avg_portfolio_value numeric DEFAULT 0,
  avg_risk_score numeric DEFAULT 0,
  avg_holding_period_months numeric DEFAULT 0,
  preferred_property_types text[] DEFAULT '{}',
  preferred_locations text[] DEFAULT '{}',
  behavioral_signature jsonb DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_reclustered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_investor_cluster_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cluster_id uuid REFERENCES ai_investor_clusters(id) ON DELETE CASCADE,
  membership_score numeric DEFAULT 0,
  persona_label text DEFAULT NULL,
  risk_appetite text DEFAULT 'moderate',
  investment_style text DEFAULT 'balanced',
  avg_hold_months numeric DEFAULT NULL,
  behavioral_vector jsonb DEFAULT '{}',
  evolution_history jsonb DEFAULT '[]',
  last_action_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, cluster_id)
);

-- 5. MARKET PATTERN DISCOVERY
CREATE TABLE IF NOT EXISTS ai_market_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type text NOT NULL,
  severity text DEFAULT 'moderate',
  confidence numeric DEFAULT 0.5,
  location_city text DEFAULT NULL,
  location_district text DEFAULT NULL,
  location_coordinates point DEFAULT NULL,
  pattern_data jsonb NOT NULL DEFAULT '{}',
  signal_strength numeric DEFAULT 0,
  discovery_method text DEFAULT 'statistical',
  supporting_evidence jsonb DEFAULT '[]',
  recommended_action text DEFAULT NULL,
  is_active boolean DEFAULT true,
  first_detected_at timestamptz DEFAULT now(),
  last_confirmed_at timestamptz DEFAULT now(),
  expired_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. STRATEGY SIMULATIONS
CREATE TABLE IF NOT EXISTS ai_strategy_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_type text NOT NULL,
  user_id uuid DEFAULT NULL,
  input_parameters jsonb NOT NULL DEFAULT '{}',
  num_scenarios int DEFAULT 1000,
  results_summary jsonb NOT NULL DEFAULT '{}',
  optimal_strategy jsonb DEFAULT '{}',
  expected_return numeric DEFAULT NULL,
  risk_adjusted_return numeric DEFAULT NULL,
  var_95 numeric DEFAULT NULL,
  max_drawdown numeric DEFAULT NULL,
  capital_efficiency numeric DEFAULT NULL,
  confidence_interval jsonb DEFAULT '{}',
  scenario_distribution jsonb DEFAULT '{}',
  execution_time_ms int DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- 7. LEARNING CYCLE LOG
CREATE TABLE IF NOT EXISTS ai_learning_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_type text NOT NULL,
  status text DEFAULT 'running',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT NULL,
  duration_ms int DEFAULT NULL,
  metrics_before jsonb DEFAULT '{}',
  metrics_after jsonb DEFAULT '{}',
  improvements jsonb DEFAULT '{}',
  models_affected text[] DEFAULT '{}',
  data_points_processed int DEFAULT 0,
  error_message text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- 8. FEATURE IMPORTANCE TRACKING
CREATE TABLE IF NOT EXISTS ai_feature_importance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES ai_model_registry(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  importance_score numeric DEFAULT 0,
  correlation_with_outcome numeric DEFAULT NULL,
  stability_score numeric DEFAULT 0,
  trend text DEFAULT 'stable',
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(model_id, feature_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prediction_log_model ON ai_prediction_log(model_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_log_property ON ai_prediction_log(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prediction_log_unresolved ON ai_prediction_log(prediction_type, created_at) WHERE actual_value IS NULL;
CREATE INDEX IF NOT EXISTS idx_market_patterns_active ON ai_market_patterns(pattern_type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_market_patterns_location ON ai_market_patterns(location_city, location_district) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cluster_membership_user ON ai_investor_cluster_membership(user_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_status ON ai_model_registry(model_name, status);
CREATE INDEX IF NOT EXISTS idx_learning_cycles_type ON ai_learning_cycles(cycle_type, created_at DESC);

-- Enable RLS
ALTER TABLE ai_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prediction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_investor_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_investor_cluster_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_market_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_strategy_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_importance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read model registry" ON ai_model_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read prediction log" ON ai_prediction_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read performance history" ON ai_model_performance_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read clusters" ON ai_investor_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read own cluster membership" ON ai_investor_cluster_membership FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read market patterns" ON ai_market_patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read own simulations" ON ai_strategy_simulations FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Authenticated users can read learning cycles" ON ai_learning_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read feature importance" ON ai_feature_importance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manages model registry" ON ai_model_registry FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages prediction log" ON ai_prediction_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages performance history" ON ai_model_performance_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages clusters" ON ai_investor_clusters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages cluster membership" ON ai_investor_cluster_membership FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages market patterns" ON ai_market_patterns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages simulations" ON ai_strategy_simulations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages learning cycles" ON ai_learning_cycles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages feature importance" ON ai_feature_importance FOR ALL TO service_role USING (true) WITH CHECK (true);