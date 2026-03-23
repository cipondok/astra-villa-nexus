
-- PHASE 1: Property Market Signals
CREATE TABLE IF NOT EXISTS public.property_market_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  city text NOT NULL,
  district text,
  property_type text,
  signal_type text NOT NULL CHECK (signal_type IN ('price_avg','rental_yield','demand_velocity','inventory_pressure','appreciation_trend','search_frequency','viewing_density','escrow_density')),
  signal_value numeric NOT NULL DEFAULT 0,
  data_source text NOT NULL DEFAULT 'internal' CHECK (data_source IN ('internal','external_api','ai_estimation')),
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pms_city ON public.property_market_signals(city);
CREATE INDEX idx_pms_signal_type ON public.property_market_signals(signal_type);
CREATE INDEX idx_pms_recorded ON public.property_market_signals(recorded_at DESC);
CREATE INDEX idx_pms_property ON public.property_market_signals(property_id);
ALTER TABLE public.property_market_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.property_market_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service insert" ON public.property_market_signals FOR INSERT TO service_role WITH CHECK (true);

-- PHASE 5: Market Zone Metrics
CREATE TABLE IF NOT EXISTS public.market_zone_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  district text,
  buyer_demand_index numeric DEFAULT 0,
  seller_supply_index numeric DEFAULT 0,
  price_momentum_score numeric DEFAULT 0,
  investment_hotspot_rank integer DEFAULT 0,
  search_frequency numeric DEFAULT 0,
  escrow_initiation_density numeric DEFAULT 0,
  listing_conversion_rate numeric DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_mzm_city_district ON public.market_zone_metrics(city, COALESCE(district, ''));
CREATE INDEX idx_mzm_hotspot ON public.market_zone_metrics(investment_hotspot_rank);
ALTER TABLE public.market_zone_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.market_zone_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service insert/update" ON public.market_zone_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- PHASE 4: ROI Forecasts
CREATE TABLE IF NOT EXISTS public.roi_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  forecast_horizon_months integer NOT NULL DEFAULT 12,
  predicted_rental_income numeric DEFAULT 0,
  predicted_price numeric DEFAULT 0,
  predicted_appreciation_pct numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  model_version text DEFAULT 'v1.0',
  forecast_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_roi_property ON public.roi_forecasts(property_id);
CREATE INDEX idx_roi_created ON public.roi_forecasts(created_at DESC);
ALTER TABLE public.roi_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.roi_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service insert" ON public.roi_forecasts FOR INSERT TO service_role WITH CHECK (true);

-- PHASE 6: Investor Recommendations
CREATE TABLE IF NOT EXISTS public.investor_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  recommendation_reason text NOT NULL,
  recommendation_type text DEFAULT 'ai_match',
  confidence_level numeric DEFAULT 0,
  score_components jsonb DEFAULT '{}',
  is_dismissed boolean DEFAULT false,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ir_user ON public.investor_recommendations(user_id);
CREATE INDEX idx_ir_property ON public.investor_recommendations(property_id);
CREATE INDEX idx_ir_confidence ON public.investor_recommendations(confidence_level DESC);
ALTER TABLE public.investor_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own recommendations" ON public.investor_recommendations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow service insert" ON public.investor_recommendations FOR INSERT TO service_role WITH CHECK (true);

-- PHASE 9: AI Pipeline Readiness
CREATE TABLE IF NOT EXISTS public.ai_feature_dataset_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type text NOT NULL,
  record_count integer DEFAULT 0,
  feature_columns text[] DEFAULT '{}',
  file_path text,
  exported_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_feature_dataset_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role" ON public.ai_feature_dataset_exports FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ai_model_training_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  model_version text NOT NULL,
  training_dataset_id uuid REFERENCES public.ai_feature_dataset_exports(id),
  accuracy_metrics jsonb DEFAULT '{}',
  training_duration_ms integer DEFAULT 0,
  status text DEFAULT 'completed',
  trained_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_model_training_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role" ON public.ai_model_training_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ai_prediction_accuracy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  model_version text NOT NULL,
  prediction_type text NOT NULL,
  predicted_value numeric,
  actual_value numeric,
  error_pct numeric,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_apa_model ON public.ai_prediction_accuracy(model_name, model_version);
ALTER TABLE public.ai_prediction_accuracy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role" ON public.ai_prediction_accuracy FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add investment intelligence fields to properties if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='investment_score') THEN
    ALTER TABLE public.properties ADD COLUMN investment_score numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='expected_rental_yield') THEN
    ALTER TABLE public.properties ADD COLUMN expected_rental_yield numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='estimated_price_growth') THEN
    ALTER TABLE public.properties ADD COLUMN estimated_price_growth numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='liquidity_score') THEN
    ALTER TABLE public.properties ADD COLUMN liquidity_score numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='demand_score') THEN
    ALTER TABLE public.properties ADD COLUMN demand_score numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='last_market_evaluated_at') THEN
    ALTER TABLE public.properties ADD COLUMN last_market_evaluated_at timestamptz;
  END IF;
END $$;
