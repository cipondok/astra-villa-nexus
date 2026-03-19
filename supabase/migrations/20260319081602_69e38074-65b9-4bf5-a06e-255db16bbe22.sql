
-- ═══════════════════════════════════════════════════════════
-- ML VALUATION ENGINE SCHEMA
-- Continuous fair market value estimation infrastructure
-- ═══════════════════════════════════════════════════════════

-- 1. Model version registry — tracks model iterations and performance
CREATE TABLE public.ml_valuation_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  model_type text NOT NULL DEFAULT 'comparable_adjusted',
  description text,
  feature_weights jsonb NOT NULL DEFAULT '{}',
  training_sample_size integer NOT NULL DEFAULT 0,
  mae numeric DEFAULT 0,
  mape numeric DEFAULT 0,
  r_squared numeric DEFAULT 0,
  median_error_pct numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  is_shadow boolean NOT NULL DEFAULT false,
  trained_at timestamptz NOT NULL DEFAULT now(),
  promoted_at timestamptz,
  retired_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Valuation predictions — every estimate the model produces
CREATE TABLE public.ml_valuation_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  model_id uuid REFERENCES public.ml_valuation_models(id) ON DELETE SET NULL,
  predicted_value numeric NOT NULL,
  predicted_range_low numeric NOT NULL,
  predicted_range_high numeric NOT NULL,
  confidence_score numeric NOT NULL DEFAULT 50,
  trend_direction text NOT NULL DEFAULT 'stable',
  trend_magnitude numeric DEFAULT 0,
  price_per_sqm numeric DEFAULT 0,
  comparables_used integer DEFAULT 0,
  feature_contributions jsonb DEFAULT '{}',
  macro_adjustments jsonb DEFAULT '{}',
  demand_multiplier numeric DEFAULT 1.0,
  seasonality_factor numeric DEFAULT 1.0,
  city text,
  property_type text,
  valid_until timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ml_val_pred_property ON public.ml_valuation_predictions(property_id);
CREATE INDEX idx_ml_val_pred_created ON public.ml_valuation_predictions(created_at DESC);
CREATE INDEX idx_ml_val_pred_city ON public.ml_valuation_predictions(city);

-- 3. Feedback signals — actual transaction outcomes for learning
CREATE TABLE public.ml_valuation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES public.ml_valuation_predictions(id) ON DELETE SET NULL,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  predicted_value numeric NOT NULL,
  actual_value numeric NOT NULL,
  error_amount numeric GENERATED ALWAYS AS (actual_value - predicted_value) STORED,
  error_pct numeric GENERATED ALWAYS AS (
    CASE WHEN predicted_value > 0
      THEN ROUND(((actual_value - predicted_value) / predicted_value) * 100, 2)
      ELSE 0
    END
  ) STORED,
  feedback_type text NOT NULL DEFAULT 'transaction',
  feedback_source text DEFAULT 'system',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ml_val_fb_property ON public.ml_valuation_feedback(property_id);
CREATE INDEX idx_ml_val_fb_created ON public.ml_valuation_feedback(created_at DESC);

-- 4. Model training runs — audit log for learning cycles
CREATE TABLE public.ml_valuation_training_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES public.ml_valuation_models(id) ON DELETE SET NULL,
  trigger_source text NOT NULL DEFAULT 'scheduled',
  training_samples integer DEFAULT 0,
  validation_samples integer DEFAULT 0,
  mae_before numeric,
  mae_after numeric,
  mape_before numeric,
  mape_after numeric,
  r_squared_before numeric,
  r_squared_after numeric,
  weight_adjustments jsonb DEFAULT '{}',
  drift_detected boolean DEFAULT false,
  drift_magnitude numeric DEFAULT 0,
  duration_ms integer DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. City-level aggregate stats for macro signals
CREATE TABLE public.ml_valuation_city_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text,
  avg_price_per_sqm numeric DEFAULT 0,
  median_price_per_sqm numeric DEFAULT 0,
  sample_count integer DEFAULT 0,
  yoy_change_pct numeric DEFAULT 0,
  qoq_change_pct numeric DEFAULT 0,
  demand_index numeric DEFAULT 50,
  supply_index numeric DEFAULT 50,
  absorption_rate numeric DEFAULT 0,
  avg_days_on_market numeric DEFAULT 0,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(city, property_type, snapshot_date)
);

CREATE INDEX idx_ml_val_city_stats ON public.ml_valuation_city_stats(city, snapshot_date DESC);

-- RLS policies
ALTER TABLE public.ml_valuation_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_valuation_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_valuation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_valuation_training_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_valuation_city_stats ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated users
CREATE POLICY "Authenticated read ml_valuation_models"
  ON public.ml_valuation_models FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read ml_valuation_predictions"
  ON public.ml_valuation_predictions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read ml_valuation_feedback"
  ON public.ml_valuation_feedback FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read ml_valuation_training_runs"
  ON public.ml_valuation_training_runs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read ml_valuation_city_stats"
  ON public.ml_valuation_city_stats FOR SELECT TO authenticated USING (true);

-- Service role insert for edge functions (implicit via service key)
