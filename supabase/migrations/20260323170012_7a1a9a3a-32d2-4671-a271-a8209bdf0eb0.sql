
-- Deal Probability Scoring Engine
CREATE TABLE public.deal_probability_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid,
  city text,
  listing_price numeric,
  demand_signal_score numeric DEFAULT 0,
  investor_intent_density numeric DEFAULT 0,
  inquiry_velocity numeric DEFAULT 0,
  viewing_frequency numeric DEFAULT 0,
  negotiation_activity_level numeric DEFAULT 0,
  pricing_alignment_score numeric DEFAULT 0,
  liquidity_zone_score numeric DEFAULT 0,
  seller_flexibility_index numeric DEFAULT 0,
  overall_close_probability numeric DEFAULT 0,
  predicted_days_to_close numeric,
  confidence_level numeric DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_deal_prob_property ON public.deal_probability_scores (property_id);
CREATE INDEX idx_deal_prob_probability ON public.deal_probability_scores (overall_close_probability DESC);
CREATE INDEX idx_deal_prob_city ON public.deal_probability_scores (city);
CREATE INDEX idx_deal_prob_computed ON public.deal_probability_scores (computed_at DESC);

-- ML training view
CREATE VIEW public.deal_closure_training_dataset AS
SELECT
  dp.property_id,
  dp.city,
  dp.demand_signal_score,
  dp.investor_intent_density,
  dp.inquiry_velocity,
  dp.negotiation_activity_level,
  dp.pricing_alignment_score,
  dp.liquidity_zone_score,
  dp.seller_flexibility_index,
  dp.overall_close_probability,
  dp.listing_price,
  dp.computed_at
FROM public.deal_probability_scores dp
WHERE dp.overall_close_probability IS NOT NULL;

ALTER TABLE public.deal_probability_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read deal probability" ON public.deal_probability_scores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service insert deal probability" ON public.deal_probability_scores
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service update deal probability" ON public.deal_probability_scores
  FOR UPDATE TO service_role USING (true);
