
-- Investor Portfolios
CREATE TABLE public.investor_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  base_currency text NOT NULL DEFAULT 'IDR',
  total_invested_amount numeric DEFAULT 0,
  current_estimated_value numeric DEFAULT 0,
  unrealized_gain_loss numeric DEFAULT 0,
  realized_profit numeric DEFAULT 0,
  diversification_score numeric DEFAULT 0,
  risk_exposure_score numeric DEFAULT 0,
  portfolio_liquidity_score numeric DEFAULT 0,
  last_evaluated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Portfolio Assets
CREATE TABLE public.portfolio_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.investor_portfolios(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  acquisition_price numeric NOT NULL DEFAULT 0,
  acquisition_date date,
  ownership_percentage numeric DEFAULT 100,
  current_estimated_value numeric DEFAULT 0,
  rental_income_accumulated numeric DEFAULT 0,
  asset_roi numeric DEFAULT 0,
  asset_status text NOT NULL DEFAULT 'active' CHECK (asset_status IN ('active','sold','under_contract')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Portfolio Value History
CREATE TABLE public.portfolio_value_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.investor_portfolios(id) ON DELETE CASCADE NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  total_value numeric NOT NULL DEFAULT 0,
  total_invested numeric NOT NULL DEFAULT 0,
  unrealized_gain numeric DEFAULT 0,
  weighted_roi numeric DEFAULT 0,
  asset_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Wealth Forecasts
CREATE TABLE public.wealth_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.investor_portfolios(id) ON DELETE CASCADE NOT NULL,
  forecast_horizon_months integer NOT NULL,
  projected_portfolio_value numeric DEFAULT 0,
  projected_cashflow numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  model_version text DEFAULT 'v1.0',
  generated_at timestamptz NOT NULL DEFAULT now()
);

-- Portfolio Risk Metrics
CREATE TABLE public.portfolio_risk_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.investor_portfolios(id) ON DELETE CASCADE NOT NULL,
  city_concentration_ratio numeric DEFAULT 0,
  property_type_allocation jsonb DEFAULT '{}',
  liquidity_exposure numeric DEFAULT 0,
  high_risk_asset_pct numeric DEFAULT 0,
  alerts jsonb DEFAULT '[]',
  computed_at timestamptz NOT NULL DEFAULT now()
);

-- Portfolio Recommendations
CREATE TABLE public.portfolio_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.investor_portfolios(id) ON DELETE CASCADE NOT NULL,
  suggested_action text NOT NULL CHECK (suggested_action IN ('buy','hold','rebalance','exit')),
  target_property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  reasoning_text text,
  expected_impact_score numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Portfolio Feature Datasets (AI pipeline)
CREATE TABLE public.portfolio_feature_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.investor_portfolios(id) ON DELETE CASCADE NOT NULL,
  feature_vector jsonb NOT NULL DEFAULT '{}',
  label_data jsonb DEFAULT '{}',
  dataset_version text DEFAULT 'v1.0',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.investor_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_value_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wealth_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_risk_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_feature_datasets ENABLE ROW LEVEL SECURITY;

-- Users can read their own portfolios
CREATE POLICY "Users read own portfolios" ON public.investor_portfolios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own portfolios" ON public.investor_portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own portfolios" ON public.investor_portfolios FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Service role / edge functions can manage all
CREATE POLICY "Service manages portfolio assets" ON public.portfolio_assets FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.investor_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

CREATE POLICY "Service manages value history" ON public.portfolio_value_history FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.investor_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

CREATE POLICY "Service manages wealth forecasts" ON public.wealth_forecasts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.investor_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

CREATE POLICY "Service manages risk metrics" ON public.portfolio_risk_metrics FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.investor_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

CREATE POLICY "Service manages recommendations" ON public.portfolio_recommendations FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.investor_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

CREATE POLICY "Service manages feature datasets" ON public.portfolio_feature_datasets FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.investor_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_investor_portfolios_user ON public.investor_portfolios(user_id);
CREATE INDEX idx_portfolio_assets_portfolio ON public.portfolio_assets(portfolio_id);
CREATE INDEX idx_portfolio_value_history_portfolio ON public.portfolio_value_history(portfolio_id, snapshot_date);
CREATE INDEX idx_wealth_forecasts_portfolio ON public.wealth_forecasts(portfolio_id);
CREATE INDEX idx_portfolio_risk_metrics_portfolio ON public.portfolio_risk_metrics(portfolio_id);
CREATE INDEX idx_portfolio_recommendations_portfolio ON public.portfolio_recommendations(portfolio_id);
