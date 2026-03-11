
-- Deal Hunter Opportunities table
CREATE TABLE IF NOT EXISTS public.deal_hunter_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  deal_opportunity_signal_score smallint NOT NULL DEFAULT 0,
  deal_strength_index smallint NOT NULL DEFAULT 0,
  undervaluation_percent numeric DEFAULT 0,
  estimated_fair_value bigint DEFAULT 0,
  deal_classification text NOT NULL DEFAULT 'speculative',
  urgency_score smallint NOT NULL DEFAULT 0,
  sell_probability_30d numeric DEFAULT 0,
  price_velocity numeric DEFAULT 0,
  optimal_entry_window_days int DEFAULT 30,
  deal_tier text NOT NULL DEFAULT 'public',
  signals text[] DEFAULT '{}',
  signal_metadata jsonb DEFAULT '{}',
  surfaced_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  scan_version int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deal_hunter_signal_score ON public.deal_hunter_opportunities(deal_opportunity_signal_score DESC);
CREATE INDEX IF NOT EXISTS idx_deal_hunter_urgency ON public.deal_hunter_opportunities(urgency_score DESC);
CREATE INDEX IF NOT EXISTS idx_deal_hunter_tier ON public.deal_hunter_opportunities(deal_tier);
CREATE INDEX IF NOT EXISTS idx_deal_hunter_classification ON public.deal_hunter_opportunities(deal_classification);

-- RLS
ALTER TABLE public.deal_hunter_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read deal opportunities"
  ON public.deal_hunter_opportunities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage deal opportunities"
  ON public.deal_hunter_opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_deal_hunter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deal_hunter_updated_at
  BEFORE UPDATE ON public.deal_hunter_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_deal_hunter_updated_at();
