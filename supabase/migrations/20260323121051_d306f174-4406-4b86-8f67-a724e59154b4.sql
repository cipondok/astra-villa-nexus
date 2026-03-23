
-- Phase 1: Escrow Readiness Events
CREATE TABLE IF NOT EXISTS public.escrow_readiness_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,
  investor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  negotiation_stage TEXT NOT NULL DEFAULT 'inquiry',
  price_gap_percentage NUMERIC DEFAULT 0,
  agreement_probability_score NUMERIC DEFAULT 0,
  readiness_status TEXT NOT NULL DEFAULT 'not_ready' CHECK (readiness_status IN ('not_ready', 'approaching_agreement', 'escrow_ready')),
  intent_signals JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.escrow_readiness_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own escrow readiness" ON public.escrow_readiness_events
  FOR SELECT TO authenticated USING (investor_user_id = auth.uid());

CREATE POLICY "Service role full access escrow readiness" ON public.escrow_readiness_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_escrow_readiness_deal ON public.escrow_readiness_events(deal_id);
CREATE INDEX idx_escrow_readiness_investor ON public.escrow_readiness_events(investor_user_id);
CREATE INDEX idx_escrow_readiness_status ON public.escrow_readiness_events(readiness_status);

-- Phase 5: Escrow Commitment Actions (deadline nudges)
CREATE TABLE IF NOT EXISTS public.escrow_commitment_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('deadline_reminder', 'demand_signal', 'advisor_prompt', 'urgency_nudge', 'follow_up')),
  scheduled_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'expired')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.escrow_commitment_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commitment actions" ON public.escrow_commitment_actions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Service role full access commitment actions" ON public.escrow_commitment_actions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_commitment_actions_deal ON public.escrow_commitment_actions(deal_id);
CREATE INDEX idx_commitment_actions_status ON public.escrow_commitment_actions(status, scheduled_time);

-- Phase 8: Escrow Conversion Metrics (aggregated analytics)
CREATE TABLE IF NOT EXISTS public.escrow_conversion_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  deals_reaching_agreement INTEGER DEFAULT 0,
  deals_entering_escrow INTEGER DEFAULT 0,
  escrow_conversion_rate NUMERIC DEFAULT 0,
  average_time_to_escrow_hours NUMERIC DEFAULT 0,
  top_closing_agent_id UUID,
  total_escrow_volume_idr NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.escrow_conversion_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access conversion metrics" ON public.escrow_conversion_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_conversion_metrics_period ON public.escrow_conversion_metrics(period_start, period_end);
