
-- ============================================================
-- GLOBAL PROPERTY PRICE INTELLIGENCE ENGINE SCHEMA
-- ============================================================

-- 1. Macro Price Trend Index
CREATE TABLE IF NOT EXISTS public.price_trend_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT,
  country_code TEXT DEFAULT 'ID',
  period TEXT NOT NULL, -- '2026-Q1', '2026-03'
  avg_price_per_sqm NUMERIC DEFAULT 0,
  median_price NUMERIC DEFAULT 0,
  price_change_pct NUMERIC DEFAULT 0,
  transaction_volume INT DEFAULT 0,
  appreciation_velocity NUMERIC DEFAULT 0,
  bubble_risk_score NUMERIC DEFAULT 0,
  growth_trajectory TEXT DEFAULT 'stable', -- accelerating, stable, decelerating, declining
  infrastructure_impact_score NUMERIC DEFAULT 0,
  population_growth_pct NUMERIC DEFAULT 0,
  urban_expansion_index NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_trend_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read price trends" ON public.price_trend_index FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_price_trend_city ON public.price_trend_index(city);
CREATE INDEX IF NOT EXISTS idx_price_trend_period ON public.price_trend_index(period);

-- 2. Micro Location Value Predictions
CREATE TABLE IF NOT EXISTS public.micro_location_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  sub_district TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  current_price_per_sqm NUMERIC DEFAULT 0,
  predicted_price_per_sqm_1y NUMERIC DEFAULT 0,
  predicted_price_per_sqm_3y NUMERIC DEFAULT 0,
  predicted_price_per_sqm_5y NUMERIC DEFAULT 0,
  appreciation_pct_1y NUMERIC DEFAULT 0,
  appreciation_pct_3y NUMERIC DEFAULT 0,
  appreciation_pct_5y NUMERIC DEFAULT 0,
  demand_heat_score NUMERIC DEFAULT 0,
  transport_proximity_score NUMERIC DEFAULT 0,
  lifestyle_infra_score NUMERIC DEFAULT 0,
  commercial_emergence_score NUMERIC DEFAULT 0,
  tourism_value_spike NUMERIC DEFAULT 0,
  liquidity_forecast NUMERIC DEFAULT 0,
  investment_desirability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.micro_location_valuations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read micro valuations" ON public.micro_location_valuations FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_micro_val_city ON public.micro_location_valuations(city, district);

-- 3. Early Growth Zone Detection
CREATE TABLE IF NOT EXISTS public.growth_zone_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  zone_type TEXT NOT NULL, -- emerging_undervalued, future_premium, gentrification, land_banking
  growth_confidence NUMERIC DEFAULT 0,
  current_avg_price NUMERIC DEFAULT 0,
  projected_price_3y NUMERIC DEFAULT 0,
  projected_appreciation_pct NUMERIC DEFAULT 0,
  entry_timing TEXT DEFAULT 'neutral', -- strong_buy, buy, neutral, wait, avoid
  capital_appreciation_horizon TEXT DEFAULT '3-5 years',
  gentrification_signals JSONB DEFAULT '[]',
  developer_activity_score NUMERIC DEFAULT 0,
  infrastructure_pipeline JSONB DEFAULT '[]',
  undervaluation_pct NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '90 days'
);

ALTER TABLE public.growth_zone_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read growth zones" ON public.growth_zone_signals FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_growth_zone_city ON public.growth_zone_signals(city);

-- 4. Market Cycle Classification
CREATE TABLE IF NOT EXISTS public.market_cycle_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country_code TEXT DEFAULT 'ID',
  current_phase TEXT NOT NULL, -- expansion, peak, correction, recovery
  phase_confidence NUMERIC DEFAULT 0,
  phase_duration_months INT DEFAULT 0,
  transition_probability JSONB DEFAULT '{}', -- { "to_peak": 0.3, "to_correction": 0.1 }
  recommended_strategy TEXT DEFAULT 'hold',
  risk_adjusted_roi NUMERIC DEFAULT 0,
  cycle_position_pct NUMERIC DEFAULT 50, -- 0-100 where in the cycle
  leading_indicators JSONB DEFAULT '{}',
  price_momentum NUMERIC DEFAULT 0,
  volume_momentum NUMERIC DEFAULT 0,
  sentiment_score NUMERIC DEFAULT 50,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.market_cycle_classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cycle data" ON public.market_cycle_classifications FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_cycle_city ON public.market_cycle_classifications(city);

-- 5. Price Shock Monitor
CREATE TABLE IF NOT EXISTS public.price_shock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- interest_rate, policy_change, foreign_investment, currency, natural_disaster
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  affected_cities TEXT[] DEFAULT '{}',
  affected_countries TEXT[] DEFAULT '{}',
  shock_description TEXT NOT NULL,
  price_impact_pct NUMERIC DEFAULT 0,
  direction TEXT DEFAULT 'neutral', -- surge, drop, neutral
  confidence NUMERIC DEFAULT 0,
  recommendations JSONB DEFAULT '[]',
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.price_shock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read shock alerts" ON public.price_shock_alerts FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_shock_active ON public.price_shock_alerts(is_active, triggered_at DESC);
