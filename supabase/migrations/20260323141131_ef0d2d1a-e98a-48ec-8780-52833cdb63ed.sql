
-- Property Price Signals
CREATE TABLE IF NOT EXISTS public.property_price_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  city text,
  property_type text,
  listing_price numeric,
  estimated_market_price numeric,
  demand_adjusted_price numeric,
  liquidity_adjusted_price numeric,
  investor_bid_pressure_score numeric DEFAULT 0,
  price_volatility_index numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  signal_source text DEFAULT 'ai_model',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_price_signals_property ON public.property_price_signals(property_id);
CREATE INDEX idx_price_signals_city_type ON public.property_price_signals(city, property_type);
CREATE INDEX idx_price_signals_created ON public.property_price_signals(created_at);

-- Property Bid Signals
CREATE TABLE IF NOT EXISTS public.property_bid_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  simulated_bid_price numeric,
  investor_segment text,
  bid_confidence numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bid_signals_property ON public.property_bid_signals(property_id);

-- Capital Flow Signals
CREATE TABLE IF NOT EXISTS public.capital_flow_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  segment text,
  capital_inflow_score numeric DEFAULT 0,
  avg_ticket_size numeric DEFAULT 0,
  investor_growth_rate numeric DEFAULT 0,
  capital_volume numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_capital_flow_city ON public.capital_flow_signals(city);
CREATE INDEX idx_capital_flow_created ON public.capital_flow_signals(created_at);

-- Enable RLS
ALTER TABLE public.property_price_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_bid_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_flow_signals ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Authenticated read price signals" ON public.property_price_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read bid signals" ON public.property_bid_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read capital flow" ON public.capital_flow_signals FOR SELECT TO authenticated USING (true);

-- Service role insert (edge functions)
CREATE POLICY "Service insert price signals" ON public.property_price_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert bid signals" ON public.property_bid_signals FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert capital flow" ON public.capital_flow_signals FOR INSERT TO service_role WITH CHECK (true);
