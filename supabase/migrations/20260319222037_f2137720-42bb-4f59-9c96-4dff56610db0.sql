
-- =============================================
-- AI GLOBAL PROPERTY INDEX SYSTEM
-- =============================================

-- 1) Index Definitions (multi-tier structure)
CREATE TABLE public.gpi_index_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_code TEXT NOT NULL UNIQUE,
  index_name TEXT NOT NULL,
  index_tier TEXT NOT NULL CHECK (index_tier IN (
    'flagship', 'regional', 'city', 'luxury', 'rental_yield', 'custom'
  )),
  description TEXT,
  base_value NUMERIC(10,2) NOT NULL DEFAULT 1000,
  base_date DATE NOT NULL DEFAULT '2025-01-01',
  weighting_method TEXT NOT NULL DEFAULT 'composite' CHECK (weighting_method IN (
    'composite', 'equal_weight', 'liquidity_weighted', 'market_cap_weighted'
  )),
  -- Weight configuration
  w_liquidity NUMERIC(4,3) NOT NULL DEFAULT 0.300,
  w_transaction_velocity NUMERIC(4,3) NOT NULL DEFAULT 0.250,
  w_capital_inflow NUMERIC(4,3) NOT NULL DEFAULT 0.250,
  w_price_appreciation NUMERIC(4,3) NOT NULL DEFAULT 0.200,
  rebalance_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (rebalance_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly'
  )),
  is_active BOOLEAN NOT NULL DEFAULT true,
  region_filter TEXT,
  country_filter TEXT,
  city_filter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Index Values (time series)
CREATE TABLE public.gpi_index_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id UUID NOT NULL REFERENCES public.gpi_index_definitions(id) ON DELETE CASCADE,
  value_date DATE NOT NULL,
  index_value NUMERIC(12,4) NOT NULL,
  daily_change_pct NUMERIC(6,4) DEFAULT 0,
  weekly_change_pct NUMERIC(6,4) DEFAULT 0,
  monthly_change_pct NUMERIC(6,4) DEFAULT 0,
  ytd_change_pct NUMERIC(6,4) DEFAULT 0,
  volatility_30d NUMERIC(6,4) DEFAULT 0,
  sharpe_ratio NUMERIC(6,4) DEFAULT 0,
  max_drawdown_pct NUMERIC(6,4) DEFAULT 0,
  constituents_count INTEGER DEFAULT 0,
  total_market_value_usd NUMERIC(18,2) DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(index_id, value_date)
);

CREATE INDEX idx_gpi_values_date ON public.gpi_index_values (index_id, value_date DESC);

-- 3) Index Constituents (what cities/districts compose each index)
CREATE TABLE public.gpi_index_constituents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id UUID NOT NULL REFERENCES public.gpi_index_definitions(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  district TEXT,
  country TEXT NOT NULL DEFAULT 'Indonesia',
  -- Component scores
  liquidity_score NUMERIC(5,2) DEFAULT 0,
  transaction_velocity_score NUMERIC(5,2) DEFAULT 0,
  capital_inflow_score NUMERIC(5,2) DEFAULT 0,
  price_appreciation_score NUMERIC(5,2) DEFAULT 0,
  -- Derived
  composite_score NUMERIC(5,2) DEFAULT 0,
  weight_in_index NUMERIC(6,5) DEFAULT 0,
  market_value_usd NUMERIC(16,2) DEFAULT 0,
  listing_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  UNIQUE(index_id, city, district)
);

CREATE INDEX idx_gpi_constituents_idx ON public.gpi_index_constituents (index_id);

-- 4) Rebalancing Events
CREATE TABLE public.gpi_rebalance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id UUID NOT NULL REFERENCES public.gpi_index_definitions(id) ON DELETE CASCADE,
  rebalance_date DATE NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'scheduled', 'market_shock', 'constituent_change', 'manual'
  )),
  constituents_added INTEGER DEFAULT 0,
  constituents_removed INTEGER DEFAULT 0,
  weight_changes JSONB DEFAULT '{}'::jsonb,
  pre_rebalance_value NUMERIC(12,4),
  post_rebalance_value NUMERIC(12,4),
  stability_safeguard_applied BOOLEAN DEFAULT false,
  shock_absorption_dampener NUMERIC(4,3) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Institutional Subscriptions
CREATE TABLE public.gpi_institutional_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN (
    'fund_manager', 'etf_provider', 'pension_fund', 'sovereign_fund',
    'family_office', 'bank', 'insurance', 'research'
  )),
  contact_email TEXT,
  api_key_hash TEXT,
  access_tier TEXT NOT NULL DEFAULT 'basic' CHECK (access_tier IN (
    'basic', 'professional', 'enterprise', 'sovereign'
  )),
  indexes_subscribed TEXT[] DEFAULT '{}',
  data_feed_type TEXT DEFAULT 'daily' CHECK (data_feed_type IN (
    'realtime', 'daily', 'weekly', 'monthly'
  )),
  is_active BOOLEAN NOT NULL DEFAULT true,
  contracted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) RLS
ALTER TABLE public.gpi_index_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpi_index_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpi_index_constituents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpi_rebalance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpi_institutional_access ENABLE ROW LEVEL SECURITY;

-- Read for authenticated
CREATE POLICY "Auth read index defs" ON public.gpi_index_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read index values" ON public.gpi_index_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read constituents" ON public.gpi_index_constituents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read rebalance" ON public.gpi_rebalance_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst access" ON public.gpi_institutional_access FOR SELECT TO authenticated USING (true);

-- Service write
CREATE POLICY "Service manage index defs" ON public.gpi_index_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage index values" ON public.gpi_index_values FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage constituents" ON public.gpi_index_constituents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage rebalance" ON public.gpi_rebalance_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service manage inst access" ON public.gpi_institutional_access FOR ALL USING (true) WITH CHECK (true);

-- 7) Trigger: emit signal on major index movement
CREATE OR REPLACE FUNCTION public.trg_gpi_major_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF ABS(NEW.daily_change_pct) >= 2.0 THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'gpi_major_movement',
      'gpi_index',
      NEW.index_id::text,
      CASE WHEN ABS(NEW.daily_change_pct) >= 5.0 THEN 'critical' ELSE 'high' END,
      jsonb_build_object(
        'index_id', NEW.index_id,
        'value_date', NEW.value_date,
        'index_value', NEW.index_value,
        'daily_change_pct', NEW.daily_change_pct,
        'volatility_30d', NEW.volatility_30d
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gpi_index_movement
  AFTER INSERT ON public.gpi_index_values
  FOR EACH ROW EXECUTE FUNCTION public.trg_gpi_major_movement();

-- 8) Seed default index definitions
INSERT INTO public.gpi_index_definitions (index_code, index_name, index_tier, description, w_liquidity, w_transaction_velocity, w_capital_inflow, w_price_appreciation, rebalance_frequency)
VALUES
  ('ASTRA-GPI', 'ASTRA Global Property Index', 'flagship', 'Flagship composite index tracking all-market property performance', 0.300, 0.250, 0.250, 0.200, 'monthly'),
  ('ASTRA-IDX', 'ASTRA Indonesia Index', 'regional', 'Indonesia-wide property market performance', 0.280, 0.270, 0.230, 0.220, 'monthly'),
  ('ASTRA-BALI', 'ASTRA Bali Growth Index', 'city', 'Bali property market growth tracker', 0.250, 0.250, 0.300, 0.200, 'weekly'),
  ('ASTRA-JKT', 'ASTRA Jakarta Metro Index', 'city', 'Greater Jakarta property performance', 0.300, 0.280, 0.220, 0.200, 'weekly'),
  ('ASTRA-LUX', 'ASTRA Luxury Property Index', 'luxury', 'Premium and luxury segment performance tracker', 0.200, 0.200, 0.300, 0.300, 'monthly'),
  ('ASTRA-RYI', 'ASTRA Rental Yield Index', 'rental_yield', 'Rental income and yield stability benchmark', 0.350, 0.200, 0.150, 0.300, 'monthly');
