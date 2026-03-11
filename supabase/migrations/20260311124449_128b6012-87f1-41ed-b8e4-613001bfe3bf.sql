
-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ GLOBAL SCALING STRATEGY ENGINE — Schema                                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 1) Region Intelligence Configuration
CREATE TABLE IF NOT EXISTS public.global_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL UNIQUE,  -- e.g. 'id-main', 'th-bangkok', 'ae-dubai'
  region_name TEXT NOT NULL,
  country_code TEXT NOT NULL,      -- ISO 3166-1 alpha-2 (ID, TH, AE, MY, PH, VN)
  country_name TEXT NOT NULL,
  primary_currency TEXT NOT NULL DEFAULT 'IDR',
  market_maturity_level TEXT NOT NULL DEFAULT 'emerging', -- 'nascent','emerging','developing','mature','saturated'
  data_density_score NUMERIC(5,2) DEFAULT 0,  -- 0-100 how much data we have
  ai_model_variant TEXT NOT NULL DEFAULT 'emerging_market', -- 'indonesia','emerging_market','mature_market','custom'
  compute_tier TEXT NOT NULL DEFAULT 'daily', -- 'realtime','hourly','daily'
  is_active BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,  -- Indonesia = true
  timezone TEXT DEFAULT 'Asia/Jakarta',
  locale TEXT DEFAULT 'id-ID',
  flag_emoji TEXT,
  -- Scoring model overrides
  roi_weight NUMERIC(4,2) DEFAULT 0.30,
  demand_weight NUMERIC(4,2) DEFAULT 0.25,
  growth_weight NUMERIC(4,2) DEFAULT 0.25,
  liquidity_weight NUMERIC(4,2) DEFAULT 0.20,
  risk_multiplier NUMERIC(4,2) DEFAULT 1.0,
  inflation_rate NUMERIC(5,2) DEFAULT 5.0,
  -- Legal / market constraints
  foreign_ownership_allowed BOOLEAN DEFAULT true,
  max_foreign_ownership_pct NUMERIC(5,2) DEFAULT 100,
  rental_regulation_level TEXT DEFAULT 'low', -- 'none','low','moderate','strict'
  capital_gains_tax_pct NUMERIC(5,2) DEFAULT 0,
  stamp_duty_pct NUMERIC(5,2) DEFAULT 0,
  -- Metadata
  expansion_phase TEXT DEFAULT 'planned', -- 'planned','pilot','beta','live','paused'
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Indonesia as primary region
INSERT INTO public.global_regions (region_id, region_name, country_code, country_name, primary_currency, market_maturity_level, ai_model_variant, compute_tier, is_active, is_primary, timezone, locale, flag_emoji, roi_weight, demand_weight, growth_weight, liquidity_weight, risk_multiplier, inflation_rate, foreign_ownership_allowed, max_foreign_ownership_pct, rental_regulation_level, capital_gains_tax_pct, stamp_duty_pct, expansion_phase, launched_at)
VALUES
  ('id-main', 'Indonesia', 'ID', 'Indonesia', 'IDR', 'emerging', 'indonesia', 'realtime', true, true, 'Asia/Jakarta', 'id-ID', '🇮🇩', 0.30, 0.25, 0.25, 0.20, 1.0, 5.5, false, 0, 'moderate', 2.5, 5.0, 'live', now()),
  ('th-main', 'Thailand', 'TH', 'Thailand', 'THB', 'developing', 'emerging_market', 'hourly', false, false, 'Asia/Bangkok', 'th-TH', '🇹🇭', 0.30, 0.20, 0.30, 0.20, 1.1, 3.0, true, 49, 'low', 0, 3.3, 'planned', null),
  ('ae-dubai', 'UAE (Dubai)', 'AE', 'United Arab Emirates', 'AED', 'mature', 'mature_market', 'hourly', false, false, 'Asia/Dubai', 'ar-AE', '🇦🇪', 0.25, 0.20, 0.25, 0.30, 0.8, 2.5, true, 100, 'none', 0, 4.0, 'planned', null),
  ('my-main', 'Malaysia', 'MY', 'Malaysia', 'MYR', 'developing', 'emerging_market', 'daily', false, false, 'Asia/Kuala_Lumpur', 'ms-MY', '🇲🇾', 0.30, 0.25, 0.25, 0.20, 1.0, 3.5, true, 100, 'low', 5, 3.0, 'planned', null),
  ('vn-main', 'Vietnam', 'VN', 'Vietnam', 'VND', 'emerging', 'emerging_market', 'daily', false, false, 'Asia/Ho_Chi_Minh', 'vi-VN', '🇻🇳', 0.35, 0.25, 0.25, 0.15, 1.2, 4.0, false, 0, 'strict', 2, 0.5, 'planned', null),
  ('ph-main', 'Philippines', 'PH', 'Philippines', 'PHP', 'emerging', 'emerging_market', 'daily', false, false, 'Asia/Manila', 'fil-PH', '🇵🇭', 0.30, 0.25, 0.25, 0.20, 1.15, 5.0, false, 40, 'moderate', 6, 1.5, 'planned', null),
  ('sg-main', 'Singapore', 'SG', 'Singapore', 'SGD', 'saturated', 'mature_market', 'hourly', false, false, 'Asia/Singapore', 'en-SG', '🇸🇬', 0.20, 0.15, 0.20, 0.45, 0.7, 2.0, true, 100, 'strict', 0, 20.0, 'planned', null)
ON CONFLICT (region_id) DO NOTHING;

-- 2) FX Rate Snapshots
CREATE TABLE IF NOT EXISTS public.fx_rate_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  target_currency TEXT NOT NULL,
  rate NUMERIC(18,6) NOT NULL,
  inverse_rate NUMERIC(18,6) NOT NULL,
  source TEXT DEFAULT 'frankfurter',
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(base_currency, target_currency, snapshot_at)
);

CREATE INDEX idx_fx_latest ON public.fx_rate_snapshots(base_currency, target_currency, snapshot_at DESC);

-- 3) Global Opportunity Scores (per-region property aggregation)
CREATE TABLE IF NOT EXISTS public.global_opportunity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL REFERENCES public.global_regions(region_id) ON DELETE CASCADE,
  city TEXT,
  -- Normalized scores (0-100)
  global_roi_score NUMERIC(5,2) DEFAULT 0,
  market_growth_weight NUMERIC(5,2) DEFAULT 0,
  political_risk_adjustment NUMERIC(5,2) DEFAULT 0,
  liquidity_index NUMERIC(5,2) DEFAULT 0,
  capital_entry_barrier NUMERIC(5,2) DEFAULT 0,
  -- Composite
  global_opportunity_score NUMERIC(5,2) DEFAULT 0,
  -- Price intelligence (USD-normalized)
  avg_price_usd NUMERIC(14,2) DEFAULT 0,
  avg_price_per_sqm_usd NUMERIC(10,2) DEFAULT 0,
  median_roi_pct NUMERIC(5,2) DEFAULT 0,
  avg_rental_yield_pct NUMERIC(5,2) DEFAULT 0,
  -- Compute metadata
  property_count INTEGER DEFAULT 0,
  data_freshness_score NUMERIC(5,2) DEFAULT 100,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  fx_rate_at_computation NUMERIC(18,6),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(region_id, city)
);

CREATE INDEX idx_global_opp_score ON public.global_opportunity_scores(global_opportunity_score DESC);
CREATE INDEX idx_global_opp_region ON public.global_opportunity_scores(region_id);

-- 4) Compute Priority Index (for distributed intelligence routing)
CREATE TABLE IF NOT EXISTS public.compute_priority_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL REFERENCES public.global_regions(region_id) ON DELETE CASCADE,
  city TEXT,
  -- Priority signals
  listing_velocity NUMERIC(8,2) DEFAULT 0,     -- new listings/day
  investor_activity NUMERIC(8,2) DEFAULT 0,     -- inquiries + saves/day
  price_volatility NUMERIC(5,2) DEFAULT 0,      -- price stddev %
  search_heat NUMERIC(5,2) DEFAULT 0,           -- search volume score
  -- Computed
  compute_priority NUMERIC(5,2) DEFAULT 50,     -- 0-100
  recommended_tier TEXT DEFAULT 'daily',         -- 'realtime','hourly','daily'
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(region_id, city)
);

-- 5) Global Expansion Readiness
CREATE TABLE IF NOT EXISTS public.global_expansion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL REFERENCES public.global_regions(region_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'phase_change','data_milestone','model_trained','launch','pause'
  from_phase TEXT,
  to_phase TEXT,
  notes TEXT,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6) RPC: Compute global opportunity scores for a region
CREATE OR REPLACE FUNCTION public.compute_global_opportunity(p_region_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reg RECORD;
  city_rec RECORD;
  fx_rate NUMERIC;
  upserted INTEGER := 0;
BEGIN
  -- Get region config
  SELECT * INTO reg FROM global_regions WHERE region_id = p_region_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Region not found'); END IF;

  -- Get latest FX rate (region currency to USD)
  SELECT r.rate INTO fx_rate
  FROM fx_rate_snapshots r
  WHERE r.base_currency = 'USD' AND r.target_currency = reg.primary_currency
  ORDER BY r.snapshot_at DESC LIMIT 1;

  IF fx_rate IS NULL OR fx_rate = 0 THEN fx_rate := 1; END IF;

  -- For the primary region (Indonesia), compute per-city scores
  IF reg.is_primary THEN
    FOR city_rec IN
      SELECT city,
        count(*) as prop_count,
        avg(price) as avg_price,
        avg(CASE WHEN building_area_sqm > 0 THEN price / building_area_sqm ELSE NULL END) as avg_psm,
        avg(investment_score) as avg_inv_score,
        avg(demand_heat_score) as avg_demand
      FROM properties
      WHERE status = 'available' AND city IS NOT NULL
      GROUP BY city
      HAVING count(*) >= 3
    LOOP
      -- Normalize price to USD
      INSERT INTO global_opportunity_scores (
        region_id, city,
        global_roi_score, market_growth_weight, political_risk_adjustment,
        liquidity_index, capital_entry_barrier, global_opportunity_score,
        avg_price_usd, avg_price_per_sqm_usd,
        property_count, fx_rate_at_computation, last_computed_at
      ) VALUES (
        p_region_id, city_rec.city,
        LEAST(COALESCE(city_rec.avg_inv_score, 0) * reg.roi_weight * 3.3, 100),
        LEAST(COALESCE(city_rec.avg_demand, 0) * reg.growth_weight * 4, 100),
        GREATEST(100 - (reg.risk_multiplier * 20), 0),
        LEAST(CASE WHEN city_rec.prop_count > 100 THEN 90 WHEN city_rec.prop_count > 30 THEN 60 ELSE 30 END, 100),
        CASE WHEN city_rec.avg_price / fx_rate < 100000 THEN 90
             WHEN city_rec.avg_price / fx_rate < 500000 THEN 60
             ELSE 30 END,
        -- Weighted composite
        (LEAST(COALESCE(city_rec.avg_inv_score, 0) * reg.roi_weight * 3.3, 100) * 0.30 +
         LEAST(COALESCE(city_rec.avg_demand, 0) * reg.growth_weight * 4, 100) * 0.25 +
         GREATEST(100 - (reg.risk_multiplier * 20), 0) * 0.15 +
         LEAST(CASE WHEN city_rec.prop_count > 100 THEN 90 WHEN city_rec.prop_count > 30 THEN 60 ELSE 30 END, 100) * 0.15 +
         CASE WHEN city_rec.avg_price / fx_rate < 100000 THEN 90
              WHEN city_rec.avg_price / fx_rate < 500000 THEN 60
              ELSE 30 END * 0.15),
        ROUND(city_rec.avg_price / fx_rate, 2),
        ROUND(COALESCE(city_rec.avg_psm, 0) / fx_rate, 2),
        city_rec.prop_count, fx_rate, now()
      )
      ON CONFLICT (region_id, city) DO UPDATE SET
        global_roi_score = EXCLUDED.global_roi_score,
        market_growth_weight = EXCLUDED.market_growth_weight,
        political_risk_adjustment = EXCLUDED.political_risk_adjustment,
        liquidity_index = EXCLUDED.liquidity_index,
        capital_entry_barrier = EXCLUDED.capital_entry_barrier,
        global_opportunity_score = EXCLUDED.global_opportunity_score,
        avg_price_usd = EXCLUDED.avg_price_usd,
        avg_price_per_sqm_usd = EXCLUDED.avg_price_per_sqm_usd,
        property_count = EXCLUDED.property_count,
        fx_rate_at_computation = EXCLUDED.fx_rate_at_computation,
        last_computed_at = EXCLUDED.last_computed_at,
        updated_at = now();

      upserted := upserted + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('region', p_region_id, 'cities_scored', upserted, 'fx_rate', fx_rate);
END;
$$;

-- RLS
ALTER TABLE public.global_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rate_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_opportunity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_priority_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_expansion_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read regions" ON public.global_regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read fx" ON public.fx_rate_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read global scores" ON public.global_opportunity_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read compute priority" ON public.compute_priority_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read expansion log" ON public.global_expansion_log FOR SELECT TO authenticated USING (true);
