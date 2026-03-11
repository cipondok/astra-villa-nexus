
-- 1. Property AI Insights: deal explanations, risk analysis, exit timing, persona fit
CREATE TABLE IF NOT EXISTS public.property_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  insight_type text NOT NULL DEFAULT 'deal_explanation',
  why_good_deal text,
  risks jsonb DEFAULT '[]'::jsonb,
  exit_strategy jsonb DEFAULT '{}'::jsonb,
  best_for_persona text,
  recommendation_level text DEFAULT 'moderate',
  projected_roi numeric,
  confidence_score numeric DEFAULT 0,
  comparable_ids uuid[] DEFAULT '{}',
  raw_reasoning text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_ai_insights_property ON public.property_ai_insights(property_id);
CREATE INDEX IF NOT EXISTS idx_property_ai_insights_type ON public.property_ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_property_ai_insights_expires ON public.property_ai_insights(expires_at);

ALTER TABLE public.property_ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read property insights"
  ON public.property_ai_insights FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Service role can manage insights"
  ON public.property_ai_insights FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 2. Copilot Investment Alerts: predictive market signals
CREATE TABLE IF NOT EXISTS public.copilot_investment_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  city text,
  state text,
  property_type text,
  severity text DEFAULT 'info',
  trend_direction text DEFAULT 'neutral',
  trend_magnitude numeric DEFAULT 0,
  data_points jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '3 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_alerts_active ON public.copilot_investment_alerts(is_active, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_copilot_alerts_city ON public.copilot_investment_alerts(city);

ALTER TABLE public.copilot_investment_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read copilot alerts"
  ON public.copilot_investment_alerts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Service role manages copilot alerts"
  ON public.copilot_investment_alerts FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 3. Copilot conversation history
CREATE TABLE IF NOT EXISTS public.copilot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New Conversation',
  context_type text DEFAULT 'general',
  context_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.copilot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.copilot_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_conv_user ON public.copilot_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_copilot_msg_conv ON public.copilot_messages(conversation_id, created_at);

ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own copilot conversations"
  ON public.copilot_conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own copilot messages"
  ON public.copilot_messages FOR SELECT
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM public.copilot_conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users insert own copilot messages"
  ON public.copilot_messages FOR INSERT
  TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.copilot_conversations WHERE user_id = auth.uid()
  ));
