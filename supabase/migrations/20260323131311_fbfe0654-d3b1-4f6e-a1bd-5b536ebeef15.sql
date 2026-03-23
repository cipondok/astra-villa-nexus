
-- ══════════════════════════════════════════════════════════════════════════════
-- GLOBAL MULTI-COUNTRY MARKETPLACE EXPANSION INFRASTRUCTURE
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Platform Countries Configuration
CREATE TABLE IF NOT EXISTS public.platform_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'IDR',
  regulatory_status TEXT NOT NULL DEFAULT 'planned' CHECK (regulatory_status IN ('planned','pilot','active','restricted')),
  launch_priority_score NUMERIC(3,1) DEFAULT 0,
  local_partner_required BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  flag_emoji TEXT,
  property_tax_model TEXT,
  foreign_ownership_rules TEXT,
  escrow_regulation_type TEXT DEFAULT 'platform_managed',
  compliance_requirements JSONB DEFAULT '[]'::jsonb,
  supported_property_types TEXT[] DEFAULT ARRAY['villa','apartment','house','land'],
  min_investment_amount NUMERIC DEFAULT 0,
  max_foreign_ownership_pct NUMERIC(5,2) DEFAULT 100,
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view countries" ON public.platform_countries FOR SELECT USING (true);
CREATE POLICY "Service role manages countries" ON public.platform_countries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. FX Conversion Ledger (transactional FX records)
CREATE TABLE IF NOT EXISTS public.fx_conversion_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  source_amount NUMERIC NOT NULL,
  fx_rate NUMERIC NOT NULL,
  converted_amount NUMERIC NOT NULL,
  fx_provider TEXT DEFAULT 'frankfurter',
  fee_amount NUMERIC DEFAULT 0,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fx_conversion_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own FX records" ON public.fx_conversion_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Service role manages FX" ON public.fx_conversion_ledger FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_fx_ledger_user ON public.fx_conversion_ledger(user_id);
CREATE INDEX idx_fx_ledger_created ON public.fx_conversion_ledger(created_at DESC);

-- 3. Gateway Routing Profiles
CREATE TABLE IF NOT EXISTS public.gateway_routing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  region_label TEXT,
  preferred_provider TEXT NOT NULL DEFAULT 'midtrans',
  fallback_provider TEXT,
  supported_methods TEXT[] DEFAULT ARRAY['bank_transfer','e_wallet','credit_card'],
  settlement_currency TEXT NOT NULL DEFAULT 'IDR',
  settlement_latency_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  compliance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_code, preferred_provider)
);

ALTER TABLE public.gateway_routing_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gateway profiles" ON public.gateway_routing_profiles FOR SELECT USING (true);
CREATE POLICY "Service role manages gateways" ON public.gateway_routing_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Global Market Insights
CREATE TABLE IF NOT EXISTS public.global_market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  demand_index NUMERIC(5,2) DEFAULT 0,
  yield_benchmark_pct NUMERIC(5,2) DEFAULT 0,
  liquidity_score NUMERIC(5,2) DEFAULT 0,
  risk_indicator TEXT DEFAULT 'moderate' CHECK (risk_indicator IN ('low','moderate','high','very_high')),
  avg_price_per_sqm_usd NUMERIC,
  absorption_rate_pct NUMERIC(5,2),
  investor_inquiry_density NUMERIC,
  macro_trend TEXT,
  data_confidence_pct NUMERIC(5,2) DEFAULT 50,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_code, city, district)
);

ALTER TABLE public.global_market_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view market insights" ON public.global_market_insights FOR SELECT USING (true);
CREATE POLICY "Service role manages insights" ON public.global_market_insights FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_global_insights_country ON public.global_market_insights(country_code);

-- 5. Investor Region Permissions
CREATE TABLE IF NOT EXISTS public.investor_region_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  allowed_country_codes TEXT[] DEFAULT ARRAY['ID'],
  accreditation_level TEXT DEFAULT 'retail' CHECK (accreditation_level IN ('retail','accredited','qualified','institutional')),
  cross_border_limit_usd NUMERIC DEFAULT 0,
  cross_border_used_usd NUMERIC DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(investor_user_id)
);

ALTER TABLE public.investor_region_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own permissions" ON public.investor_region_permissions FOR SELECT TO authenticated USING (investor_user_id = auth.uid());
CREATE POLICY "Service role manages permissions" ON public.investor_region_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Cross-Border Escrow Records
CREATE TABLE IF NOT EXISTS public.crossborder_escrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID,
  deal_id UUID,
  origin_country TEXT NOT NULL,
  asset_country TEXT NOT NULL,
  investor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settlement_currency TEXT NOT NULL DEFAULT 'IDR',
  source_amount NUMERIC NOT NULL DEFAULT 0,
  converted_amount_idr NUMERIC NOT NULL DEFAULT 0,
  fx_rate_applied NUMERIC,
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending','cleared','flagged','blocked')),
  custody_partner TEXT,
  jurisdiction_tag TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crossborder_escrow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own escrow records" ON public.crossborder_escrow_records FOR SELECT TO authenticated USING (investor_user_id = auth.uid());
CREATE POLICY "Service role manages escrow" ON public.crossborder_escrow_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_xborder_escrow_investor ON public.crossborder_escrow_records(investor_user_id);

-- 7. Regional Partner Registry
CREATE TABLE IF NOT EXISTS public.regional_partner_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('agent_network','developer','legal_firm','inspection_service','payment_provider','escrow_partner')),
  reliability_score NUMERIC(3,1) DEFAULT 5.0,
  onboarding_status TEXT DEFAULT 'pending' CHECK (onboarding_status IN ('pending','onboarding','active','suspended','terminated')),
  contact_email TEXT,
  contact_phone TEXT,
  service_coverage TEXT[],
  contract_start_date DATE,
  contract_end_date DATE,
  total_transactions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.regional_partner_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view partners" ON public.regional_partner_registry FOR SELECT USING (true);
CREATE POLICY "Service role manages partners" ON public.regional_partner_registry FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_partner_country ON public.regional_partner_registry(country_code);

-- Seed Indonesia as first country
INSERT INTO public.platform_countries (country_code, country_name, base_currency, regulatory_status, launch_priority_score, local_partner_required, timezone, flag_emoji, escrow_regulation_type, launched_at)
VALUES ('ID', 'Indonesia', 'IDR', 'active', 10.0, false, 'Asia/Jakarta', '🇮🇩', 'platform_managed', now())
ON CONFLICT (country_code) DO NOTHING;

-- Seed Indonesia gateway
INSERT INTO public.gateway_routing_profiles (country_code, region_label, preferred_provider, fallback_provider, supported_methods, settlement_currency)
VALUES ('ID', 'Indonesia - Primary', 'midtrans', 'xendit', ARRAY['bank_transfer','e_wallet','qris','credit_card'], 'IDR')
ON CONFLICT (country_code, preferred_provider) DO NOTHING;
