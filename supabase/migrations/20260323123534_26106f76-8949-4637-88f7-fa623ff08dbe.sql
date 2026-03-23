
-- Investment Positions (tokenized ownership)
CREATE TABLE public.investment_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID NOT NULL,
  ownership_percentage NUMERIC(6,3) DEFAULT 100.000,
  acquisition_price_idr NUMERIC DEFAULT 0,
  current_estimated_value_idr NUMERIC DEFAULT 0,
  acquisition_date TIMESTAMPTZ DEFAULT now(),
  position_status TEXT DEFAULT 'active',
  source_type TEXT DEFAULT 'primary',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.investment_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own positions" ON public.investment_positions FOR SELECT USING (investor_user_id = auth.uid());
CREATE POLICY "Users insert own positions" ON public.investment_positions FOR INSERT WITH CHECK (investor_user_id = auth.uid());
CREATE POLICY "Users update own positions" ON public.investment_positions FOR UPDATE USING (investor_user_id = auth.uid());

-- Exit Listings (secondary market sell orders)
CREATE TABLE public.exit_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES public.investment_positions(id) ON DELETE CASCADE NOT NULL,
  seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID NOT NULL,
  asking_price_idr NUMERIC NOT NULL,
  min_acceptable_price_idr NUMERIC,
  ownership_percentage NUMERIC(6,3) NOT NULL,
  liquidity_priority_score NUMERIC DEFAULT 50,
  listing_visibility TEXT DEFAULT 'public',
  listing_status TEXT DEFAULT 'active',
  premium_discount_pct NUMERIC DEFAULT 0,
  estimated_exit_days INTEGER,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.exit_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads public exit listings" ON public.exit_listings FOR SELECT USING (listing_visibility = 'public' OR seller_user_id = auth.uid());
CREATE POLICY "Sellers create own listings" ON public.exit_listings FOR INSERT WITH CHECK (seller_user_id = auth.uid());
CREATE POLICY "Sellers update own listings" ON public.exit_listings FOR UPDATE USING (seller_user_id = auth.uid());

-- Liquidity Transfer Ledger (secondary escrow transfers)
CREATE TABLE public.liquidity_transfer_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exit_listing_id UUID REFERENCES public.exit_listings(id) ON DELETE SET NULL,
  position_id UUID REFERENCES public.investment_positions(id) ON DELETE SET NULL,
  seller_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  property_id UUID NOT NULL,
  transfer_amount_idr NUMERIC NOT NULL,
  ownership_percentage NUMERIC(6,3) NOT NULL,
  escrow_status TEXT DEFAULT 'pending',
  escrow_locked_at TIMESTAMPTZ,
  ownership_transferred_at TIMESTAMPTZ,
  seller_payout_at TIMESTAMPTZ,
  platform_fee_idr NUMERIC DEFAULT 0,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.liquidity_transfer_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own transfers" ON public.liquidity_transfer_ledger FOR SELECT USING (seller_user_id = auth.uid() OR buyer_user_id = auth.uid());
CREATE POLICY "Buyers create transfers" ON public.liquidity_transfer_ledger FOR INSERT WITH CHECK (buyer_user_id = auth.uid());

-- Liquidity Market Metrics (analytics snapshots)
CREATE TABLE public.secondary_market_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_date DATE NOT NULL,
  total_secondary_volume_idr NUMERIC DEFAULT 0,
  total_transfers INTEGER DEFAULT 0,
  avg_exit_time_days NUMERIC DEFAULT 0,
  avg_discount_rate_pct NUMERIC DEFAULT 0,
  avg_premium_rate_pct NUMERIC DEFAULT 0,
  active_exit_listings INTEGER DEFAULT 0,
  repeat_secondary_investors INTEGER DEFAULT 0,
  total_platform_fees_idr NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.secondary_market_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read metrics" ON public.secondary_market_metrics FOR SELECT TO authenticated USING (true);
