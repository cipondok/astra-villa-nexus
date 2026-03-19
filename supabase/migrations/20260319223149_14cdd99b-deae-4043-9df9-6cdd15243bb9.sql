-- =============================================
-- PLANETARY ASSET TOKENIZATION EXCHANGE (PATE)
-- =============================================

-- 1️⃣ Asset Tokenization Engine
CREATE TABLE public.pate_tokenized_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  token_symbol text NOT NULL,
  token_name text NOT NULL,
  total_supply bigint NOT NULL DEFAULT 1000000,
  circulating_supply bigint NOT NULL DEFAULT 0,
  price_per_token numeric(18,8) NOT NULL DEFAULT 0,
  asset_valuation_usd numeric(18,2) NOT NULL DEFAULT 0,
  jurisdiction text NOT NULL DEFAULT 'ID',
  compliance_status text NOT NULL DEFAULT 'pending_review',
  legal_wrapper text DEFAULT 'SPV',
  revenue_distribution_model text DEFAULT 'pro_rata',
  smart_contract_address text,
  fractionalization_ratio numeric(10,4) DEFAULT 1.0,
  min_investment_usd numeric(12,2) DEFAULT 100,
  max_holders integer DEFAULT 10000,
  current_holders integer DEFAULT 0,
  annual_yield_pct numeric(6,3) DEFAULT 0,
  last_valuation_at timestamptz DEFAULT now(),
  is_trading_active boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2️⃣ Global Liquidity Order Book
CREATE TABLE public.pate_order_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.pate_tokenized_assets(id) ON DELETE CASCADE NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('buy','sell','limit_buy','limit_sell')),
  investor_id uuid NOT NULL,
  quantity bigint NOT NULL,
  price_per_token numeric(18,8) NOT NULL,
  total_value numeric(18,2) NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','partial','filled','cancelled','expired')),
  filled_quantity bigint DEFAULT 0,
  avg_fill_price numeric(18,8),
  ai_spread_adjustment numeric(10,6) DEFAULT 0,
  volatility_dampener_active boolean DEFAULT false,
  cross_border boolean DEFAULT false,
  source_currency text DEFAULT 'USD',
  expires_at timestamptz,
  filled_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pate_order_book_asset ON public.pate_order_book(asset_id, status);
CREATE INDEX idx_pate_order_book_investor ON public.pate_order_book(investor_id);

-- 3️⃣ Trust & Custody Layer
CREATE TABLE public.pate_custody_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.pate_tokenized_assets(id) ON DELETE CASCADE NOT NULL,
  custodian_name text NOT NULL,
  custodian_type text NOT NULL DEFAULT 'institutional' CHECK (custodian_type IN ('institutional','self','qualified','omnibus')),
  custody_status text NOT NULL DEFAULT 'active',
  holder_id uuid NOT NULL,
  token_balance bigint NOT NULL DEFAULT 0,
  locked_balance bigint DEFAULT 0,
  verification_oracle_hash text,
  last_audit_at timestamptz,
  valuation_at_custody numeric(18,2),
  fraud_risk_score numeric(5,2) DEFAULT 0,
  fraud_flags jsonb DEFAULT '[]',
  kyc_verified boolean DEFAULT false,
  aml_cleared boolean DEFAULT false,
  jurisdiction text DEFAULT 'ID',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pate_custody_holder ON public.pate_custody_records(holder_id);
CREATE INDEX idx_pate_custody_asset ON public.pate_custody_records(asset_id);

-- 4️⃣ Yield Streaming Infrastructure
CREATE TABLE public.pate_yield_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.pate_tokenized_assets(id) ON DELETE CASCADE NOT NULL,
  stream_type text NOT NULL CHECK (stream_type IN ('rental_yield','appreciation_reprice','liquidity_incentive','staking_reward')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_yield_usd numeric(18,2) NOT NULL DEFAULT 0,
  yield_per_token numeric(18,8) DEFAULT 0,
  distribution_status text DEFAULT 'pending' CHECK (distribution_status IN ('pending','computing','distributing','completed','failed')),
  recipients_count integer DEFAULT 0,
  distributed_amount numeric(18,2) DEFAULT 0,
  token_reprice_delta numeric(10,4),
  secondary_market_bonus_pct numeric(6,3) DEFAULT 0,
  net_yield_after_fees numeric(18,2),
  platform_fee_pct numeric(5,3) DEFAULT 1.5,
  computed_at timestamptz,
  distributed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pate_yield_asset ON public.pate_yield_streams(asset_id, period_start);

-- 5️⃣ Financial Ecosystem Integration
CREATE TABLE public.pate_financial_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text NOT NULL CHECK (product_type IN ('token_backed_loan','portfolio_margin','synthetic_index','derivative','structured_note')),
  product_name text NOT NULL,
  underlying_assets uuid[] DEFAULT '{}',
  collateral_ratio numeric(6,3) DEFAULT 1.5,
  max_leverage numeric(4,2) DEFAULT 1.0,
  interest_rate_pct numeric(6,3),
  maturity_months integer,
  notional_value_usd numeric(18,2) DEFAULT 0,
  current_nav numeric(18,2) DEFAULT 0,
  participants_count integer DEFAULT 0,
  risk_tier text DEFAULT 'moderate' CHECK (risk_tier IN ('conservative','moderate','aggressive','speculative')),
  regulatory_status text DEFAULT 'sandbox',
  is_active boolean DEFAULT true,
  inception_date date,
  performance_ytd_pct numeric(8,4),
  sharpe_ratio numeric(6,4),
  max_drawdown_pct numeric(6,3),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.pate_tokenized_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pate_order_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pate_custody_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pate_yield_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pate_financial_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tokenized assets" ON public.pate_tokenized_assets FOR SELECT USING (true);
CREATE POLICY "Public read order book" ON public.pate_order_book FOR SELECT USING (true);
CREATE POLICY "Public read custody" ON public.pate_custody_records FOR SELECT USING (true);
CREATE POLICY "Public read yield streams" ON public.pate_yield_streams FOR SELECT USING (true);
CREATE POLICY "Public read financial products" ON public.pate_financial_products FOR SELECT USING (true);

-- Trigger: emit signal on large order fills (whale trades >= $100k)
CREATE OR REPLACE FUNCTION public.fn_pate_large_trade_signal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'filled' AND NEW.total_value >= 100000 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'pate_whale_trade',
      'pate_order',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'asset_id', NEW.asset_id,
        'order_type', NEW.order_type,
        'total_value', NEW.total_value,
        'quantity', NEW.quantity
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pate_whale_trade
  AFTER UPDATE ON public.pate_order_book
  FOR EACH ROW
  WHEN (NEW.status = 'filled' AND OLD.status != 'filled')
  EXECUTE FUNCTION public.fn_pate_large_trade_signal();

-- Seed core financial products
INSERT INTO public.pate_financial_products (product_type, product_name, collateral_ratio, max_leverage, interest_rate_pct, risk_tier, regulatory_status) VALUES
  ('synthetic_index', 'ASTRA Tokenized Property Index', 1.0, 1.0, null, 'moderate', 'sandbox'),
  ('token_backed_loan', 'Property Token Collateral Facility', 1.5, 3.0, 8.5, 'moderate', 'sandbox'),
  ('portfolio_margin', 'Multi-Asset Margin Account', 1.25, 5.0, 6.0, 'aggressive', 'sandbox'),
  ('derivative', 'Property Price Forward Contract', 2.0, 10.0, null, 'speculative', 'concept'),
  ('structured_note', 'Yield-Enhanced Property Note', 1.0, 1.0, 12.0, 'conservative', 'sandbox');