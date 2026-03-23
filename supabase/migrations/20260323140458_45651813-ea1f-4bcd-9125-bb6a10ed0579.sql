
-- Liquidity Metrics Daily: core velocity analytics per city/segment/day
CREATE TABLE IF NOT EXISTS public.liquidity_metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  city text NOT NULL,
  property_type text,
  price_band text,
  listings_active integer DEFAULT 0,
  inquiries_count integer DEFAULT 0,
  negotiations_count integer DEFAULT 0,
  escrow_started integer DEFAULT 0,
  deals_closed integer DEFAULT 0,
  avg_days_to_inquiry numeric,
  avg_days_to_escrow numeric,
  avg_days_to_close numeric,
  liquidity_velocity_score numeric DEFAULT 0,
  demand_pressure_index numeric DEFAULT 0,
  absorption_rate numeric DEFAULT 0,
  market_classification text DEFAULT 'slow',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date, city, property_type, price_band)
);

ALTER TABLE public.liquidity_metrics_daily ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role full access liquidity_metrics_daily"
    ON public.liquidity_metrics_daily FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth read liquidity_metrics_daily"
    ON public.liquidity_metrics_daily FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_liq_daily_city_type ON public.liquidity_metrics_daily(city, property_type);
CREATE INDEX IF NOT EXISTS idx_liq_daily_date ON public.liquidity_metrics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_liq_daily_velocity ON public.liquidity_metrics_daily(liquidity_velocity_score DESC);

-- Liquidity Forecasts: predictive outputs
CREATE TABLE IF NOT EXISTS public.liquidity_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  property_type text,
  price_band text,
  forecast_date date NOT NULL,
  predicted_absorption_rate numeric,
  predicted_avg_days_to_close numeric,
  predicted_velocity_score numeric,
  surge_probability numeric DEFAULT 0,
  oversupply_risk numeric DEFAULT 0,
  forecast_trend text DEFAULT 'flat',
  confidence_score numeric DEFAULT 0,
  model_version text DEFAULT 'v1_rule_based',
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(city, property_type, price_band, forecast_date)
);

ALTER TABLE public.liquidity_forecasts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role full access liquidity_forecasts"
    ON public.liquidity_forecasts FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth read liquidity_forecasts"
    ON public.liquidity_forecasts FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_liq_forecast_city ON public.liquidity_forecasts(city);
CREATE INDEX IF NOT EXISTS idx_liq_forecast_date ON public.liquidity_forecasts(forecast_date DESC);
CREATE INDEX IF NOT EXISTS idx_liq_forecast_surge ON public.liquidity_forecasts(surge_probability DESC);
