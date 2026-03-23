
-- Property Ownership Units (fractional ownership)
CREATE TABLE public.property_ownership_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  current_owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ownership_percentage NUMERIC(8,4) NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  acquisition_reference TEXT,
  lock_status TEXT NOT NULL DEFAULT 'tradable' CHECK (lock_status IN ('tradable','locked','under_sale')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sell Orders
CREATE TABLE public.liquidity_sell_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.property_ownership_units(id) NOT NULL,
  property_id UUID NOT NULL,
  percentage_for_sale NUMERIC(8,4) NOT NULL,
  asking_price_total NUMERIC(18,2) NOT NULL,
  price_per_percent NUMERIC(18,2) NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'open' CHECK (order_status IN ('open','matched','cancelled','expired')),
  expiry_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buy Orders
CREATE TABLE public.liquidity_buy_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_property_id UUID NOT NULL,
  desired_percentage NUMERIC(8,4) NOT NULL,
  max_price_per_percent NUMERIC(18,2) NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'open' CHECK (order_status IN ('open','matched','cancelled','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trade Executions
CREATE TABLE public.liquidity_trade_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sell_order_id UUID REFERENCES public.liquidity_sell_orders(id),
  buy_order_id UUID REFERENCES public.liquidity_buy_orders(id),
  executed_percentage NUMERIC(8,4) NOT NULL,
  execution_price NUMERIC(18,2) NOT NULL,
  buyer_user_id UUID REFERENCES auth.users(id),
  seller_user_id UUID REFERENCES auth.users(id),
  property_id UUID NOT NULL,
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending','escrow_held','settled','failed')),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Liquidity Market Metrics
CREATE TABLE public.liquidity_market_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE,
  last_trade_price_per_percent NUMERIC(18,2),
  liquidity_depth_score NUMERIC(5,2) DEFAULT 0,
  bid_ask_spread NUMERIC(18,2) DEFAULT 0,
  volume_30d NUMERIC(18,2) DEFAULT 0,
  price_momentum NUMERIC(8,4) DEFAULT 0,
  total_sell_orders_open INT DEFAULT 0,
  total_buy_orders_open INT DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ownership_units_property ON public.property_ownership_units(property_id);
CREATE INDEX idx_ownership_units_owner ON public.property_ownership_units(current_owner_user_id);
CREATE INDEX idx_sell_orders_property ON public.liquidity_sell_orders(property_id, order_status);
CREATE INDEX idx_buy_orders_property ON public.liquidity_buy_orders(target_property_id, order_status);
CREATE INDEX idx_trade_exec_property ON public.liquidity_trade_executions(property_id);

-- RLS
ALTER TABLE public.property_ownership_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_sell_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_buy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_trade_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_market_metrics ENABLE ROW LEVEL SECURITY;

-- Ownership units: owners can read their own
CREATE POLICY "Users read own units" ON public.property_ownership_units FOR SELECT TO authenticated USING (current_owner_user_id = auth.uid());
CREATE POLICY "Public read units" ON public.property_ownership_units FOR SELECT TO anon USING (true);

-- Sell orders: public read, owner insert
CREATE POLICY "Read sell orders" ON public.liquidity_sell_orders FOR SELECT USING (true);
CREATE POLICY "Create own sell orders" ON public.liquidity_sell_orders FOR INSERT TO authenticated WITH CHECK (seller_user_id = auth.uid());

-- Buy orders: public read, owner insert
CREATE POLICY "Read buy orders" ON public.liquidity_buy_orders FOR SELECT USING (true);
CREATE POLICY "Create own buy orders" ON public.liquidity_buy_orders FOR INSERT TO authenticated WITH CHECK (buyer_user_id = auth.uid());

-- Trade executions: participants can read
CREATE POLICY "Read trade executions" ON public.liquidity_trade_executions FOR SELECT USING (true);

-- Market metrics: public read
CREATE POLICY "Read market metrics" ON public.liquidity_market_metrics FOR SELECT USING (true);
