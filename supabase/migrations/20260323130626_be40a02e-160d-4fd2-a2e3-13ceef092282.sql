
-- ══════════════════════════════════════════════════════════════════════════════
-- REIT-LIKE FUND INFRASTRUCTURE — Missing tables & enhancements
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Add strategy type and inception date to investment_funds if missing
ALTER TABLE public.investment_funds 
  ADD COLUMN IF NOT EXISTS fund_strategy_type TEXT DEFAULT 'mixed' CHECK (fund_strategy_type IN ('income_yield','growth_appreciation','mixed')),
  ADD COLUMN IF NOT EXISTS inception_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS min_subscription_amount NUMERIC DEFAULT 5000000,
  ADD COLUMN IF NOT EXISTS total_units_outstanding NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nav_currency TEXT DEFAULT 'IDR';

-- 2. Fund Property Allocations (asset-level tracking per fund)
CREATE TABLE IF NOT EXISTS public.fund_property_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  acquisition_value_idr NUMERIC NOT NULL DEFAULT 0,
  current_estimated_value_idr NUMERIC NOT NULL DEFAULT 0,
  allocation_percentage NUMERIC(5,2) DEFAULT 0,
  rental_income_monthly_idr NUMERIC DEFAULT 0,
  acquired_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fund_id, property_id)
);

ALTER TABLE public.fund_property_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view fund allocations"
  ON public.fund_property_allocations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Service role manages fund allocations"
  ON public.fund_property_allocations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 3. Fund Redemption Requests
CREATE TABLE IF NOT EXISTS public.fund_redemption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES public.fund_investor_positions(id) ON DELETE CASCADE NOT NULL,
  fund_id UUID REFERENCES public.investment_funds(id) ON DELETE CASCADE NOT NULL,
  investor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_units NUMERIC NOT NULL,
  nav_at_request NUMERIC,
  estimated_payout_idr NUMERIC,
  redemption_status TEXT NOT NULL DEFAULT 'pending' CHECK (redemption_status IN ('pending','approved','processing','settled','rejected','cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_settlement_date DATE,
  settled_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_redemption_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own redemption requests"
  ON public.fund_redemption_requests FOR SELECT
  TO authenticated USING (investor_user_id = auth.uid());

CREATE POLICY "Users can submit redemption requests"
  ON public.fund_redemption_requests FOR INSERT
  TO authenticated WITH CHECK (investor_user_id = auth.uid());

CREATE POLICY "Service role manages redemptions"
  ON public.fund_redemption_requests FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 4. Add average_entry_nav to fund_investor_positions if missing
ALTER TABLE public.fund_investor_positions
  ADD COLUMN IF NOT EXISTS average_entry_nav NUMERIC DEFAULT 1000;

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_fund_prop_alloc_fund ON public.fund_property_allocations(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_redemption_fund ON public.fund_redemption_requests(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_redemption_investor ON public.fund_redemption_requests(investor_user_id);
CREATE INDEX IF NOT EXISTS idx_fund_redemption_status ON public.fund_redemption_requests(redemption_status);
