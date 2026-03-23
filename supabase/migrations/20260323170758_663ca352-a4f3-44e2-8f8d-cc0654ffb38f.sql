
-- Negotiation AI Assistant Engine - live deal tracking
CREATE TABLE public.negotiation_deal_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid,
  property_id uuid,
  buyer_id uuid,
  seller_id uuid,
  negotiation_stage text NOT NULL DEFAULT 'initial'
    CHECK (negotiation_stage IN ('initial','active','offer','counter','escrow_ready')),
  buyer_offer_price numeric,
  seller_counter_price numeric,
  price_gap_percentage numeric DEFAULT 0,
  interaction_frequency_score numeric DEFAULT 0,
  buyer_intent_strength numeric DEFAULT 0,
  seller_flexibility_score numeric DEFAULT 0,
  negotiation_momentum_score numeric DEFAULT 0,
  risk_of_drop_probability numeric DEFAULT 0,
  recommended_next_action text,
  ai_confidence_level numeric DEFAULT 0,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_neg_deal_intel_deal ON public.negotiation_deal_intelligence (deal_id);
CREATE INDEX idx_neg_deal_intel_momentum ON public.negotiation_deal_intelligence (negotiation_momentum_score DESC);
CREATE INDEX idx_neg_deal_intel_risk ON public.negotiation_deal_intelligence (risk_of_drop_probability DESC);
CREATE INDEX idx_neg_deal_intel_property ON public.negotiation_deal_intelligence (property_id);

ALTER TABLE public.negotiation_deal_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read neg deal intel" ON public.negotiation_deal_intelligence
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service write neg deal intel" ON public.negotiation_deal_intelligence
  FOR ALL TO service_role USING (true) WITH CHECK (true);
