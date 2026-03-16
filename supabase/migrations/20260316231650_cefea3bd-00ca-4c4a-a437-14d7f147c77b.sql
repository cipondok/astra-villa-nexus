
-- PART 1: Learning Events — track prediction vs outcome
CREATE TABLE IF NOT EXISTS ai_learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL DEFAULT 'property',
  entity_id uuid,
  prediction_type text NOT NULL,
  predicted_value numeric,
  actual_outcome_value numeric,
  performance_delta numeric GENERATED ALWAYS AS (
    CASE WHEN predicted_value IS NOT NULL AND actual_outcome_value IS NOT NULL
         THEN actual_outcome_value - predicted_value
         ELSE NULL END
  ) STORED,
  accuracy_pct numeric,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX idx_learning_events_type ON ai_learning_events(prediction_type, recorded_at DESC);
CREATE INDEX idx_learning_events_entity ON ai_learning_events(entity_type, entity_id);

ALTER TABLE ai_learning_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read learning_events"
  ON ai_learning_events FOR SELECT TO authenticated USING (true);

-- PART 2: Weight Configuration — adaptive scoring weights
CREATE TABLE IF NOT EXISTS ai_weight_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_name text NOT NULL UNIQUE,
  current_weight numeric NOT NULL DEFAULT 0.2,
  min_weight numeric NOT NULL DEFAULT 0.05,
  max_weight numeric NOT NULL DEFAULT 0.50,
  adjustment_rate numeric NOT NULL DEFAULT 0.01,
  last_adjustment numeric DEFAULT 0,
  effectiveness_score numeric DEFAULT 0.5,
  sample_size integer DEFAULT 0,
  is_locked boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_weight_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read weight_config"
  ON ai_weight_config FOR SELECT TO authenticated USING (true);

-- Seed default weights matching the opportunity scoring formula
INSERT INTO ai_weight_config (factor_name, current_weight, min_weight, max_weight, adjustment_rate) VALUES
  ('roi_projection', 0.30, 0.10, 0.45, 0.01),
  ('demand_score', 0.20, 0.10, 0.35, 0.01),
  ('valuation_gap', 0.20, 0.05, 0.35, 0.01),
  ('inquiry_velocity', 0.15, 0.05, 0.30, 0.01),
  ('rental_yield', 0.10, 0.05, 0.25, 0.01),
  ('luxury_index', 0.05, 0.01, 0.20, 0.005)
ON CONFLICT (factor_name) DO NOTHING;

-- PART 3: Recommendation effectiveness tracking
CREATE TABLE IF NOT EXISTS ai_recommendation_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES ai_investment_recommendations(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  recommendation_type text,
  action_signal text,
  confidence_at_creation numeric,
  outcome_type text,
  outcome_value numeric,
  outcome_delta numeric,
  success boolean,
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rec_outcomes_type ON ai_recommendation_outcomes(recommendation_type, success);

ALTER TABLE ai_recommendation_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read rec_outcomes"
  ON ai_recommendation_outcomes FOR SELECT TO authenticated USING (true);

-- PART 4: Learning Engine RPCs

-- Record a learning event
CREATE OR REPLACE FUNCTION record_learning_event(
  p_entity_type text,
  p_entity_id uuid,
  p_prediction_type text,
  p_predicted numeric,
  p_actual numeric,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  evt_id uuid;
  acc numeric;
BEGIN
  IF p_predicted IS NOT NULL AND p_predicted != 0 THEN
    acc := LEAST(100, GREATEST(0, 100 - ABS((p_actual - p_predicted) / p_predicted * 100)));
  END IF;

  INSERT INTO ai_learning_events (entity_type, entity_id, prediction_type, predicted_value, actual_outcome_value, accuracy_pct, metadata)
  VALUES (p_entity_type, p_entity_id, p_prediction_type, p_predicted, p_actual, acc, p_metadata)
  RETURNING id INTO evt_id;

  RETURN evt_id;
END;
$$;

-- Execute learning cycle: analyze outcomes and adjust weights
CREATE OR REPLACE FUNCTION execute_learning_cycle()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cycle_id uuid;
  factor RECORD;
  avg_accuracy numeric;
  factor_effectiveness numeric;
  weight_adjustment numeric;
  weights_before jsonb;
  weights_after jsonb;
  total_events integer;
  improvements jsonb := '{}';
BEGIN
  -- Log cycle start
  INSERT INTO ai_learning_cycles (cycle_type, status, started_at)
  VALUES ('weight_optimization', 'running', now())
  RETURNING id INTO cycle_id;

  -- Capture current weights
  SELECT jsonb_object_agg(factor_name, current_weight)
  INTO weights_before
  FROM ai_weight_config;

  -- Count recent learning events (last 7 days)
  SELECT count(*) INTO total_events
  FROM ai_learning_events
  WHERE recorded_at > now() - interval '7 days';

  -- For each weight factor, compute effectiveness from correlated outcomes
  FOR factor IN SELECT * FROM ai_weight_config WHERE is_locked = false
  LOOP
    -- Compute average accuracy for events correlated with this factor
    SELECT AVG(accuracy_pct), count(*)
    INTO factor_effectiveness, factor.sample_size
    FROM ai_learning_events
    WHERE recorded_at > now() - interval '30 days'
      AND prediction_type IN ('opportunity_score', 'price_prediction', 'deal_score');

    IF factor_effectiveness IS NULL THEN
      factor_effectiveness := 50;
    END IF;

    -- Determine adjustment direction and magnitude
    -- If accuracy > 70%, nudge weight slightly up (it's contributing positively)
    -- If accuracy < 40%, nudge weight down
    IF factor_effectiveness > 70 THEN
      weight_adjustment := factor.adjustment_rate;
    ELSIF factor_effectiveness < 40 THEN
      weight_adjustment := -factor.adjustment_rate;
    ELSE
      weight_adjustment := 0;
    END IF;

    -- Apply bounded adjustment
    IF weight_adjustment != 0 THEN
      UPDATE ai_weight_config
      SET current_weight = LEAST(max_weight, GREATEST(min_weight, current_weight + weight_adjustment)),
          last_adjustment = weight_adjustment,
          effectiveness_score = factor_effectiveness,
          sample_size = COALESCE(factor.sample_size, 0),
          updated_at = now()
      WHERE factor_name = factor.factor_name;
    ELSE
      UPDATE ai_weight_config
      SET effectiveness_score = factor_effectiveness,
          sample_size = COALESCE(factor.sample_size, 0),
          last_adjustment = 0,
          updated_at = now()
      WHERE factor_name = factor.factor_name;
    END IF;
  END LOOP;

  -- Normalize weights to sum to 1.0
  DECLARE
    total_weight numeric;
  BEGIN
    SELECT sum(current_weight) INTO total_weight FROM ai_weight_config;
    IF total_weight > 0 AND total_weight != 1.0 THEN
      UPDATE ai_weight_config
      SET current_weight = current_weight / total_weight,
          updated_at = now();
    END IF;
  END;

  -- Capture updated weights
  SELECT jsonb_object_agg(factor_name, round(current_weight, 4))
  INTO weights_after
  FROM ai_weight_config;

  -- Compute overall model accuracy
  SELECT AVG(accuracy_pct) INTO avg_accuracy
  FROM ai_learning_events
  WHERE recorded_at > now() - interval '7 days';

  -- Save snapshot
  INSERT INTO ai_learning_snapshots (
    snapshot_type, total_signals_processed, weights_before, weights_after,
    adjustments, model_accuracy, confidence_score, learning_rate
  ) VALUES (
    'weight_optimization', total_events, weights_before, weights_after,
    weights_after, COALESCE(avg_accuracy, 50), COALESCE(avg_accuracy, 50), 0.01
  );

  -- Update cycle
  UPDATE ai_learning_cycles
  SET status = 'completed',
      completed_at = now(),
      duration_ms = EXTRACT(EPOCH FROM (now() - started_at)) * 1000,
      metrics_before = jsonb_build_object('weights', weights_before),
      metrics_after = jsonb_build_object('weights', weights_after, 'accuracy', avg_accuracy),
      data_points_processed = total_events,
      improvements = jsonb_build_object('weight_changes', weights_after)
  WHERE id = cycle_id;

  RETURN jsonb_build_object(
    'cycle_id', cycle_id,
    'events_analyzed', total_events,
    'weights_before', weights_before,
    'weights_after', weights_after,
    'model_accuracy', avg_accuracy,
    'status', 'completed'
  );
END;
$$;

-- Get learning system stats
CREATE OR REPLACE FUNCTION get_learning_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_learning_events', (SELECT count(*) FROM ai_learning_events),
    'events_last_7d', (SELECT count(*) FROM ai_learning_events WHERE recorded_at > now() - interval '7 days'),
    'avg_accuracy_7d', (SELECT round(avg(accuracy_pct), 1) FROM ai_learning_events WHERE recorded_at > now() - interval '7 days'),
    'avg_accuracy_30d', (SELECT round(avg(accuracy_pct), 1) FROM ai_learning_events WHERE recorded_at > now() - interval '30 days'),
    'total_cycles', (SELECT count(*) FROM ai_learning_cycles),
    'last_cycle_at', (SELECT max(completed_at) FROM ai_learning_cycles WHERE status = 'completed'),
    'total_snapshots', (SELECT count(*) FROM ai_learning_snapshots),
    'current_weights', (SELECT jsonb_object_agg(factor_name, jsonb_build_object('weight', round(current_weight, 4), 'effectiveness', round(effectiveness_score, 1), 'locked', is_locked)) FROM ai_weight_config),
    'recommendation_success_rate', (
      SELECT round(avg(CASE WHEN success THEN 100 ELSE 0 END), 1)
      FROM ai_recommendation_outcomes
      WHERE recorded_at > now() - interval '30 days'
    )
  );
$$;
