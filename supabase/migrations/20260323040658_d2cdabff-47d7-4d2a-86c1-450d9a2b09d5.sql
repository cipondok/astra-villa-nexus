
-- Founder Daily KPIs
CREATE TABLE IF NOT EXISTS public.founder_daily_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(record_date, metric_name)
);
ALTER TABLE public.founder_daily_kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read founder_daily_kpis" ON public.founder_daily_kpis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert founder_daily_kpis" ON public.founder_daily_kpis FOR INSERT TO authenticated WITH CHECK (true);

-- Deal Velocity Snapshots
CREATE TABLE IF NOT EXISTS public.founder_deal_velocity_snapshot (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_active_deals INTEGER DEFAULT 0,
  avg_days_in_pipeline NUMERIC DEFAULT 0,
  inquiry_to_escrow_rate NUMERIC DEFAULT 0,
  escrow_to_close_rate NUMERIC DEFAULT 0,
  stalled_deal_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.founder_deal_velocity_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read founder_deal_velocity" ON public.founder_deal_velocity_snapshot FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert founder_deal_velocity" ON public.founder_deal_velocity_snapshot FOR INSERT TO authenticated WITH CHECK (true);

-- Capital Flow Metrics
CREATE TABLE IF NOT EXISTS public.founder_capital_flow_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_total_balance NUMERIC DEFAULT 0,
  new_capital_inflow_today NUMERIC DEFAULT 0,
  escrow_capital_locked NUMERIC DEFAULT 0,
  payouts_released_today NUMERIC DEFAULT 0,
  liquidity_exchange_volume NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.founder_capital_flow_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read founder_capital_flow" ON public.founder_capital_flow_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert founder_capital_flow" ON public.founder_capital_flow_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Supply Metrics
CREATE TABLE IF NOT EXISTS public.founder_supply_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_listings_today INTEGER DEFAULT 0,
  listings_under_verification INTEGER DEFAULT 0,
  avg_listing_quality_score NUMERIC DEFAULT 0,
  high_demand_low_supply_zones INTEGER DEFAULT 0,
  top_agent_activity_score NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.founder_supply_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read founder_supply" ON public.founder_supply_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert founder_supply" ON public.founder_supply_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Growth Snapshots
CREATE TABLE IF NOT EXISTS public.founder_growth_snapshot (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_to_wallet_rate NUMERIC DEFAULT 0,
  wallet_to_escrow_rate NUMERIC DEFAULT 0,
  repeat_investment_rate NUMERIC DEFAULT 0,
  top_investor_geo_regions JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.founder_growth_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read founder_growth" ON public.founder_growth_snapshot FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert founder_growth" ON public.founder_growth_snapshot FOR INSERT TO authenticated WITH CHECK (true);

-- Founder Alerts
CREATE TABLE IF NOT EXISTS public.founder_alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'medium',
  alert_message TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_flag BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.founder_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read founder_alerts" ON public.founder_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert founder_alerts" ON public.founder_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update founder_alerts" ON public.founder_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Trend Metrics
CREATE TABLE IF NOT EXISTS public.founder_trend_metrics (
  trend_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'weekly',
  growth_rate NUMERIC DEFAULT 0,
  comparison_baseline NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.founder_trend_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read founder_trends" ON public.founder_trend_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert founder_trends" ON public.founder_trend_metrics FOR INSERT TO authenticated WITH CHECK (true);
