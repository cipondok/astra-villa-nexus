
-- Feature kill-switch controls
CREATE TABLE IF NOT EXISTS public.astra_feature_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'beta', 'archived')),
  performance_impact_score numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  last_updated timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_astra_feature_controls_key ON public.astra_feature_controls (feature_key);

ALTER TABLE public.astra_feature_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read feature controls"
  ON public.astra_feature_controls FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage feature controls"
  ON public.astra_feature_controls FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Performance logging
CREATE TABLE IF NOT EXISTS public.astra_performance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  page text DEFAULT '/',
  risk_level text DEFAULT 'green' CHECK (risk_level IN ('green', 'warning', 'critical')),
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_astra_performance_logs_type ON public.astra_performance_logs (metric_type, recorded_at DESC);

ALTER TABLE public.astra_performance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read performance logs"
  ON public.astra_performance_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can insert performance logs"
  ON public.astra_performance_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Seed default feature controls
INSERT INTO public.astra_feature_controls (feature_key, label, status, performance_impact_score, description) VALUES
  ('3d_viewer', '3D Immersive Viewer', 'active', 8, 'Three.js property viewer engine'),
  ('ai_jobs', 'AI Job Queue', 'active', 5, 'Background AI processing system'),
  ('deal_room', 'Deal Room', 'active', 3, 'Transaction negotiation module'),
  ('wallet', 'ASTRA Wallet', 'active', 2, 'Digital wallet and tokens'),
  ('seo_engine', 'SEO Engine', 'active', 4, 'Property SEO analysis system'),
  ('market_intelligence', 'Market Intelligence', 'active', 6, 'Heatmaps and market analysis'),
  ('tokenization', 'Property Tokenization', 'beta', 7, 'Blockchain tokenization module'),
  ('hedge_fund', 'Hedge Fund Mode', 'beta', 9, 'Advanced institutional analytics'),
  ('chatbot', 'AI Chatbot', 'active', 3, 'Customer-facing AI assistant'),
  ('booking', 'Property Booking', 'active', 2, 'Viewing appointment system')
ON CONFLICT (feature_key) DO NOTHING;
