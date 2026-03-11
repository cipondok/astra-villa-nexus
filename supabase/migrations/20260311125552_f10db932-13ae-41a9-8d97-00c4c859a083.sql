
-- Investor DNA table: one row per user, auto-updated from behavior
CREATE TABLE public.investor_dna (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_tolerance_score smallint DEFAULT 50 CHECK (risk_tolerance_score >= 0 AND risk_tolerance_score <= 100),
  investment_horizon_years numeric DEFAULT 3,
  preferred_property_types text[] DEFAULT '{}',
  preferred_cities text[] DEFAULT '{}',
  budget_range_min bigint DEFAULT 0,
  budget_range_max bigint DEFAULT 0,
  rental_income_pref_weight numeric DEFAULT 0.5 CHECK (rental_income_pref_weight >= 0 AND rental_income_pref_weight <= 1),
  capital_growth_pref_weight numeric DEFAULT 0.5 CHECK (capital_growth_pref_weight >= 0 AND capital_growth_pref_weight <= 1),
  flip_strategy_affinity numeric DEFAULT 0 CHECK (flip_strategy_affinity >= 0 AND flip_strategy_affinity <= 100),
  luxury_bias_score numeric DEFAULT 0 CHECK (luxury_bias_score >= 0 AND luxury_bias_score <= 100),
  diversification_score numeric DEFAULT 0 CHECK (diversification_score >= 0 AND diversification_score <= 100),
  probability_next_purchase numeric DEFAULT 0 CHECK (probability_next_purchase >= 0 AND probability_next_purchase <= 1),
  churn_risk_score numeric DEFAULT 0 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  expected_budget_upgrade numeric DEFAULT 0 CHECK (expected_budget_upgrade >= 0 AND expected_budget_upgrade <= 1),
  geo_expansion_likelihood numeric DEFAULT 0 CHECK (geo_expansion_likelihood >= 0 AND geo_expansion_likelihood <= 1),
  investor_persona text DEFAULT 'balanced' CHECK (investor_persona IN ('conservative', 'balanced', 'aggressive', 'luxury', 'flipper')),
  last_computed_at timestamptz DEFAULT now(),
  version int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Signal log for DNA recomputation
CREATE TABLE public.investor_dna_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  signal_data jsonb DEFAULT '{}',
  property_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dna_signals_user ON public.investor_dna_signals(user_id, created_at DESC);
CREATE INDEX idx_dna_signals_type ON public.investor_dna_signals(signal_type, created_at DESC);

-- RLS
ALTER TABLE public.investor_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_dna_signals ENABLE ROW LEVEL SECURITY;

-- Users can read own DNA
CREATE POLICY "Users read own DNA" ON public.investor_dna
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role (edge functions) can upsert DNA
CREATE POLICY "Service can manage DNA" ON public.investor_dna
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Users can insert own signals
CREATE POLICY "Users insert own signals" ON public.investor_dna_signals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read own signals
CREATE POLICY "Users read own signals" ON public.investor_dna_signals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage signals
CREATE POLICY "Service can manage signals" ON public.investor_dna_signals
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_investor_dna_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_investor_dna_updated
  BEFORE UPDATE ON public.investor_dna
  FOR EACH ROW EXECUTE FUNCTION public.update_investor_dna_timestamp();
