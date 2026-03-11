
-- Developer Activity Signals
CREATE TABLE IF NOT EXISTS public.launch_radar_developer_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_name text NOT NULL,
  city text NOT NULL,
  district text,
  signal_type text NOT NULL, -- land_acquisition, permit_filing, zoning_change, contractor_mobilization, architectural_planning, utility_prep
  activity_intensity_score numeric DEFAULT 0,
  launch_probability numeric DEFAULT 0,
  estimated_project_scale text, -- small, medium, large, mega
  estimated_units integer,
  estimated_launch_date text,
  signal_details jsonb DEFAULT '{}'::jsonb,
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Pre-Launch Pricing Predictions
CREATE TABLE IF NOT EXISTS public.launch_radar_price_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.launch_radar_developer_signals(id) ON DELETE CASCADE,
  developer_name text NOT NULL,
  city text NOT NULL,
  expected_launch_price_sqm numeric,
  expected_resale_price_sqm numeric,
  early_bird_discount_pct numeric,
  phase_price_escalation jsonb DEFAULT '[]'::jsonb,
  early_entry_profit_score numeric DEFAULT 0,
  expected_capital_gain_pct numeric DEFAULT 0,
  optimal_booking_window text,
  arbitrage_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Demand Forecasts
CREATE TABLE IF NOT EXISTS public.launch_radar_demand_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.launch_radar_developer_signals(id) ON DELETE CASCADE,
  city text NOT NULL,
  district text,
  sales_velocity_score numeric DEFAULT 0,
  inventory_sellout_probability numeric DEFAULT 0,
  buyer_absorption_speed text, -- fast, moderate, slow
  foreign_investor_attraction numeric DEFAULT 0,
  rental_demand_readiness numeric DEFAULT 0,
  post_launch_appreciation_pct numeric DEFAULT 0,
  target_segments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Developer Risk Scores
CREATE TABLE IF NOT EXISTS public.launch_radar_developer_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_name text NOT NULL,
  track_record_score numeric DEFAULT 0,
  completion_reliability numeric DEFAULT 0,
  quality_perception_index numeric DEFAULT 0,
  financial_strength numeric DEFAULT 0,
  execution_risk_rating text DEFAULT 'moderate', -- low, moderate, high, critical
  delay_probability numeric DEFAULT 0,
  investment_safety_index numeric DEFAULT 0,
  completed_projects integer DEFAULT 0,
  total_projects integer DEFAULT 0,
  avg_delay_months numeric DEFAULT 0,
  risk_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Radar Alerts
CREATE TABLE IF NOT EXISTS public.launch_radar_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.launch_radar_developer_signals(id) ON DELETE CASCADE,
  alert_type text NOT NULL, -- new_signal, price_opportunity, high_demand, low_risk_developer, booking_window
  priority text DEFAULT 'medium', -- low, medium, high, critical
  title text NOT NULL,
  message text,
  city text,
  developer_name text,
  investment_score numeric DEFAULT 0,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.launch_radar_developer_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_radar_price_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_radar_demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_radar_developer_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_radar_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read launch radar signals" ON public.launch_radar_developer_signals FOR SELECT USING (true);
CREATE POLICY "Anyone can read price predictions" ON public.launch_radar_price_predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can read demand forecasts" ON public.launch_radar_demand_forecasts FOR SELECT USING (true);
CREATE POLICY "Anyone can read developer risks" ON public.launch_radar_developer_risks FOR SELECT USING (true);
CREATE POLICY "Anyone can read radar alerts" ON public.launch_radar_alerts FOR SELECT USING (true);

CREATE POLICY "Service can insert launch radar signals" ON public.launch_radar_developer_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert price predictions" ON public.launch_radar_price_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert demand forecasts" ON public.launch_radar_demand_forecasts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert developer risks" ON public.launch_radar_developer_risks FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert radar alerts" ON public.launch_radar_alerts FOR INSERT WITH CHECK (true);
