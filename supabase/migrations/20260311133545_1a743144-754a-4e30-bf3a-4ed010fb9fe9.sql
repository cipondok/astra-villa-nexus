
-- Deal Hunter notification table for DNA-matched investor alerts
CREATE TABLE public.deal_hunter_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL,
  property_id UUID NOT NULL,
  deal_classification TEXT NOT NULL DEFAULT 'hot_deal',
  deal_tier TEXT NOT NULL DEFAULT 'public',
  deal_score NUMERIC NOT NULL DEFAULT 0,
  urgency_score NUMERIC NOT NULL DEFAULT 0,
  match_reason JSONB NOT NULL DEFAULT '[]'::jsonb,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  property_title TEXT,
  property_city TEXT,
  property_price NUMERIC,
  thumbnail_url TEXT,
  undervaluation_percent NUMERIC DEFAULT 0,
  estimated_fair_value NUMERIC DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  channel TEXT NOT NULL DEFAULT 'in_app',
  email_sent BOOLEAN NOT NULL DEFAULT false,
  push_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dhn_user_unread ON public.deal_hunter_notifications (user_id, is_read) WHERE NOT is_dismissed;
CREATE INDEX idx_dhn_user_created ON public.deal_hunter_notifications (user_id, created_at DESC);
CREATE INDEX idx_dhn_expires ON public.deal_hunter_notifications (expires_at) WHERE expires_at IS NOT NULL;

-- RLS
ALTER TABLE public.deal_hunter_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.deal_hunter_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.deal_hunter_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.deal_hunter_notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can view all notifications"
  ON public.deal_hunter_notifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
