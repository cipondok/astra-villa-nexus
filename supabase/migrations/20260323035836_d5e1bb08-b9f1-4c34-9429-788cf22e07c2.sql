
-- Deal Pipeline Events
CREATE TABLE IF NOT EXISTS public.deal_pipeline_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  property_id UUID,
  buyer_user_id UUID,
  seller_user_id UUID,
  pipeline_stage TEXT NOT NULL DEFAULT 'inquiry_received',
  stage_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_channel TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_pipeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read deal_pipeline_events" ON public.deal_pipeline_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert deal_pipeline_events" ON public.deal_pipeline_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_dpe_deal ON public.deal_pipeline_events(deal_id);
CREATE INDEX idx_dpe_stage ON public.deal_pipeline_events(pipeline_stage);

-- Deal Follow-up Actions
CREATE TABLE IF NOT EXISTS public.deal_followup_actions (
  action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  trigger_reason TEXT,
  action_status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_followup_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read deal_followup_actions" ON public.deal_followup_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert deal_followup_actions" ON public.deal_followup_actions FOR INSERT TO authenticated WITH CHECK (true);

-- Deal Negotiation Insights
CREATE TABLE IF NOT EXISTS public.deal_negotiation_insights (
  insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  suggested_price_range JSONB,
  market_comparison_score NUMERIC DEFAULT 0,
  urgency_signal TEXT,
  ai_confidence NUMERIC DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_negotiation_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read deal_negotiation_insights" ON public.deal_negotiation_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert deal_negotiation_insights" ON public.deal_negotiation_insights FOR INSERT TO authenticated WITH CHECK (true);

-- Escrow Acceleration Metrics
CREATE TABLE IF NOT EXISTS public.deal_escrow_acceleration_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  conversion_score NUMERIC DEFAULT 0,
  wallet_funded BOOLEAN DEFAULT false,
  fast_escrow_eligible BOOLEAN DEFAULT false,
  demand_urgency_level TEXT DEFAULT 'normal',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_escrow_acceleration_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read deal_escrow_acceleration" ON public.deal_escrow_acceleration_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert deal_escrow_acceleration" ON public.deal_escrow_acceleration_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Agent Deal Metrics
CREATE TABLE IF NOT EXISTS public.agent_deal_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_user_id UUID NOT NULL,
  avg_deal_closure_days NUMERIC DEFAULT 0,
  deal_success_rate NUMERIC DEFAULT 0,
  negotiation_efficiency_score NUMERIC DEFAULT 0,
  escrow_conversion_rate NUMERIC DEFAULT 0,
  total_deals INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_deal_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read agent_deal_metrics" ON public.agent_deal_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert agent_deal_metrics" ON public.agent_deal_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Deal Conversion Feature Dataset (AI pipeline)
CREATE TABLE IF NOT EXISTS public.deal_conversion_feature_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  outcome TEXT,
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_conversion_feature_dataset ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read deal_conversion_features" ON public.deal_conversion_feature_dataset FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert deal_conversion_features" ON public.deal_conversion_feature_dataset FOR INSERT TO authenticated WITH CHECK (true);
