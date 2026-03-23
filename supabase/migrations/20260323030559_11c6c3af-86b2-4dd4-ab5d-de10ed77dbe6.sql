
-- PHASE 1: Investment Funds
CREATE TABLE public.investment_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name text NOT NULL,
  fund_type text NOT NULL DEFAULT 'open_end' CHECK (fund_type IN ('open_end','closed_end','syndicate')),
  jurisdiction_code text DEFAULT 'ID',
  base_currency text DEFAULT 'USD',
  fund_manager_user_id uuid REFERENCES auth.users(id),
  target_raise_amount numeric DEFAULT 0,
  committed_capital numeric DEFAULT 0,
  deployed_capital numeric DEFAULT 0,
  fund_status text DEFAULT 'raising' CHECK (fund_status IN ('raising','active','closed','liquidating')),
  management_fee_percent numeric DEFAULT 2.0,
  performance_fee_percent numeric DEFAULT 20.0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.investment_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read funds" ON public.investment_funds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fund managers manage funds" ON public.investment_funds FOR ALL TO authenticated USING (fund_manager_user_id = auth.uid());

-- PHASE 2: Investor Fund Positions
CREATE TABLE public.fund_investor_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  investor_user_id uuid REFERENCES auth.users(id) NOT NULL,
  committed_amount numeric DEFAULT 0,
  contributed_amount numeric DEFAULT 0,
  ownership_units numeric DEFAULT 0,
  nav_per_unit numeric DEFAULT 100,
  unrealized_value numeric DEFAULT 0,
  realized_distributions numeric DEFAULT 0,
  position_status text DEFAULT 'active' CHECK (position_status IN ('active','redeemed','exited')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.fund_investor_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors see own positions" ON public.fund_investor_positions FOR SELECT TO authenticated USING (investor_user_id = auth.uid());
CREATE POLICY "Investors manage own positions" ON public.fund_investor_positions FOR INSERT TO authenticated WITH CHECK (investor_user_id = auth.uid());

-- PHASE 3: Fund Assets
CREATE TABLE public.fund_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES public.properties(id),
  acquisition_cost numeric DEFAULT 0,
  acquisition_date timestamptz DEFAULT now(),
  ownership_percentage numeric DEFAULT 100,
  current_estimated_value numeric DEFAULT 0,
  asset_income_generated numeric DEFAULT 0,
  asset_status text DEFAULT 'active' CHECK (asset_status IN ('active','sold','under_contract')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fund_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read fund assets" ON public.fund_assets FOR SELECT TO authenticated USING (true);

-- PHASE 4: NAV History
CREATE TABLE public.fund_nav_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  nav_per_unit numeric NOT NULL DEFAULT 100,
  total_fund_value numeric DEFAULT 0,
  liabilities numeric DEFAULT 0,
  valuation_timestamp timestamptz DEFAULT now()
);
ALTER TABLE public.fund_nav_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read NAV" ON public.fund_nav_history FOR SELECT TO authenticated USING (true);

-- PHASE 5a: Capital Calls
CREATE TABLE public.fund_capital_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  call_amount numeric NOT NULL,
  due_date timestamptz NOT NULL,
  call_status text DEFAULT 'pending' CHECK (call_status IN ('pending','partially_funded','funded','cancelled')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fund_capital_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read capital calls" ON public.fund_capital_calls FOR SELECT TO authenticated USING (true);

-- PHASE 5b: Distributions
CREATE TABLE public.fund_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  distribution_amount numeric NOT NULL,
  distribution_type text DEFAULT 'income' CHECK (distribution_type IN ('income','exit_profit','liquidation')),
  distribution_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fund_distributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read distributions" ON public.fund_distributions FOR SELECT TO authenticated USING (true);

-- PHASE 6: Fund Unit Transfers (Secondary)
CREATE TABLE public.fund_unit_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  seller_investor_id uuid REFERENCES auth.users(id) NOT NULL,
  buyer_investor_id uuid REFERENCES auth.users(id),
  units_transferred numeric NOT NULL,
  transfer_price numeric NOT NULL,
  settlement_status text DEFAULT 'pending' CHECK (settlement_status IN ('pending','settled','cancelled')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fund_unit_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read transfers" ON public.fund_unit_transfers FOR SELECT TO authenticated USING (seller_investor_id = auth.uid() OR buyer_investor_id = auth.uid());

-- PHASE 9: AI Performance Features
CREATE TABLE public.fund_performance_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  feature_type text NOT NULL,
  feature_data jsonb DEFAULT '{}',
  computed_at timestamptz DEFAULT now()
);
ALTER TABLE public.fund_performance_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read fund features" ON public.fund_performance_features FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_fund_positions_fund ON public.fund_investor_positions(fund_id);
CREATE INDEX idx_fund_positions_investor ON public.fund_investor_positions(investor_user_id);
CREATE INDEX idx_fund_assets_fund ON public.fund_assets(fund_id);
CREATE INDEX idx_fund_nav_fund ON public.fund_nav_history(fund_id);
CREATE INDEX idx_fund_calls_fund ON public.fund_capital_calls(fund_id);
CREATE INDEX idx_fund_distributions_fund ON public.fund_distributions(fund_id);
