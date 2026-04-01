-- Support Predictions table
CREATE TABLE IF NOT EXISTS public.support_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_type text NOT NULL, -- 'trend_spike', 'bottleneck', 'sync_failure'
  affected_area text NOT NULL,   -- 'payment', 'kyc', 'document', 'escrow'
  severity text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  confidence_score numeric DEFAULT 0,
  prediction_text text NOT NULL,
  data_points jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  predicted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Support Risk Signals table
CREATE TABLE IF NOT EXISTS public.support_risk_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  risk_type text NOT NULL,       -- 'false_claim', 'repeated_abuse', 'anomaly'
  risk_level text NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high'
  description text NOT NULL,
  evidence jsonb DEFAULT '{}',
  related_case_ids text[] DEFAULT '{}',
  is_reviewed boolean DEFAULT false,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Support Smart Alerts table
CREATE TABLE IF NOT EXISTS public.support_smart_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,      -- 'conflict_spike', 'volume_surge', 'category_repeat', 'risk_user'
  severity text NOT NULL DEFAULT 'medium',
  affected_area text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  recommended_action text,
  is_dismissed boolean DEFAULT false,
  dismissed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_support_predictions_active ON public.support_predictions(is_active, created_at DESC);
CREATE INDEX idx_support_risk_signals_level ON public.support_risk_signals(risk_level, created_at DESC);
CREATE INDEX idx_support_risk_signals_user ON public.support_risk_signals(user_id);
CREATE INDEX idx_support_smart_alerts_severity ON public.support_smart_alerts(severity, is_dismissed, created_at DESC);

-- RLS
ALTER TABLE public.support_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_smart_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read predictions" ON public.support_predictions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin read risk signals" ON public.support_risk_signals
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin manage risk signals" ON public.support_risk_signals
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin read smart alerts" ON public.support_smart_alerts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin manage smart alerts" ON public.support_smart_alerts
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));