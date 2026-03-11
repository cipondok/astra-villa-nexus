
-- 1. Add new scoring columns to property_deal_analysis
ALTER TABLE public.property_deal_analysis 
  ADD COLUMN IF NOT EXISTS deal_confidence smallint DEFAULT 0 CHECK (deal_confidence BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS liquidity_probability smallint DEFAULT 0 CHECK (liquidity_probability BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS flip_potential_score smallint DEFAULT 0 CHECK (flip_potential_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS rental_stability_score smallint DEFAULT 0 CHECK (rental_stability_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS listing_age_days integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS macro_growth_factor numeric DEFAULT 1.0;

-- 2. Create investor_feed_preferences table
CREATE TABLE IF NOT EXISTS public.investor_feed_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_type text NOT NULL DEFAULT 'passive_income' CHECK (strategy_type IN ('aggressive_growth', 'passive_income', 'short_term_flip', 'luxury_preservation')),
  weight_rental_yield numeric NOT NULL DEFAULT 25,
  weight_appreciation numeric NOT NULL DEFAULT 25,
  weight_deal_score numeric NOT NULL DEFAULT 25,
  weight_liquidity numeric NOT NULL DEFAULT 25,
  preferred_cities text[] DEFAULT '{}',
  budget_min numeric DEFAULT 0,
  budget_max numeric DEFAULT 50000000000,
  risk_tolerance text NOT NULL DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- 3. Enable RLS
ALTER TABLE public.investor_feed_preferences ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies
CREATE POLICY "Users can read own preferences" ON public.investor_feed_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.investor_feed_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.investor_feed_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.investor_feed_preferences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_deal_analysis_confidence ON public.property_deal_analysis(deal_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_deal_analysis_liquidity ON public.property_deal_analysis(liquidity_probability DESC);
CREATE INDEX IF NOT EXISTS idx_deal_analysis_flip ON public.property_deal_analysis(flip_potential_score DESC);
CREATE INDEX IF NOT EXISTS idx_deal_analysis_rental_stability ON public.property_deal_analysis(rental_stability_score DESC);
CREATE INDEX IF NOT EXISTS idx_feed_prefs_user ON public.investor_feed_preferences(user_id);
