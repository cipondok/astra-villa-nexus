
-- 1. AI Behavior Tracking
CREATE TABLE public.ai_behavior_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'view', 'scroll', 'click', 'search', 'save', 'inquiry'
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  event_data JSONB DEFAULT '{}',
  duration_ms INTEGER,
  page_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_behavior_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own behavior" ON public.ai_behavior_tracking
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own behavior" ON public.ai_behavior_tracking
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_ai_behavior_user ON public.ai_behavior_tracking(user_id, created_at DESC);
CREATE INDEX idx_ai_behavior_property ON public.ai_behavior_tracking(property_id, event_type);
CREATE INDEX idx_ai_behavior_event ON public.ai_behavior_tracking(event_type, created_at DESC);

-- 2. Investment Metrics (per-property computed/cached metrics)
CREATE TABLE public.investment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  rental_yield_pct NUMERIC(5,2),
  capital_appreciation_pct NUMERIC(5,2),
  break_even_years NUMERIC(4,1),
  investment_score INTEGER CHECK (investment_score BETWEEN 0 AND 100),
  area_growth_pct NUMERIC(5,2),
  demand_score INTEGER CHECK (demand_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  comparable_count INTEGER DEFAULT 0,
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

ALTER TABLE public.investment_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view investment metrics" ON public.investment_metrics
  FOR SELECT USING (true);

CREATE INDEX idx_investment_metrics_score ON public.investment_metrics(investment_score DESC);
CREATE INDEX idx_investment_metrics_yield ON public.investment_metrics(rental_yield_pct DESC);
CREATE INDEX idx_investment_metrics_property ON public.investment_metrics(property_id);

-- 3. 3D Assets
CREATE TABLE public.threed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('glb', 'gltf', 'panorama_360', 'drone_video', 'ai_staging', 'floor_plan_3d')),
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'ready' CHECK (processing_status IN ('uploading', 'processing', 'ready', 'failed')),
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.threed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view 3D assets" ON public.threed_assets
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage 3D assets" ON public.threed_assets
  FOR ALL TO authenticated USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE INDEX idx_threed_assets_property ON public.threed_assets(property_id, asset_type);
CREATE INDEX idx_threed_assets_type ON public.threed_assets(asset_type, processing_status);

-- 4. Transaction Logs (all revenue events)
CREATE TABLE public.transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'subscription_payment', 'featured_listing', 'boost_purchase',
    'token_purchase', 'token_transfer', 'consulting_fee',
    'developer_partnership', 'data_subscription', 'refund'
  )),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  reference_id TEXT, -- external payment ref
  reference_type TEXT, -- 'stripe', 'midtrans', 'astra_token', 'bank_transfer'
  description TEXT,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transaction_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transaction_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_transaction_logs_user ON public.transaction_logs(user_id, created_at DESC);
CREATE INDEX idx_transaction_logs_type ON public.transaction_logs(transaction_type, status);
CREATE INDEX idx_transaction_logs_status ON public.transaction_logs(status, created_at DESC);
CREATE INDEX idx_transaction_logs_ref ON public.transaction_logs(reference_type, reference_id);
