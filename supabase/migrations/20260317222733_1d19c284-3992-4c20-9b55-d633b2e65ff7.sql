
-- Deal tracking CRM for founder-level pipeline management
CREATE TABLE public.founder_deal_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_name TEXT NOT NULL,
  investor_email TEXT,
  investor_phone TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_reference TEXT NOT NULL,
  deal_stage TEXT NOT NULL DEFAULT 'inquiry'
    CHECK (deal_stage IN ('inquiry', 'viewing', 'negotiation', 'closing', 'completed', 'lost')),
  estimated_budget NUMERIC,
  deal_value NUMERIC,
  urgency_level TEXT NOT NULL DEFAULT 'medium'
    CHECK (urgency_level IN ('high', 'medium', 'low')),
  last_follow_up_date DATE,
  next_follow_up_date DATE,
  next_action_note TEXT,
  notes TEXT,
  source TEXT DEFAULT 'direct',
  commission_estimate NUMERIC,
  lost_reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for stage-based queries
CREATE INDEX idx_founder_deal_stage ON public.founder_deal_pipeline(deal_stage);
CREATE INDEX idx_founder_deal_urgency ON public.founder_deal_pipeline(urgency_level);
CREATE INDEX idx_founder_deal_follow_up ON public.founder_deal_pipeline(next_follow_up_date);

-- Enable RLS
ALTER TABLE public.founder_deal_pipeline ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own deals
CREATE POLICY "Users manage own deals"
  ON public.founder_deal_pipeline
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_founder_deal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_founder_deal_updated_at
  BEFORE UPDATE ON public.founder_deal_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION update_founder_deal_updated_at();
