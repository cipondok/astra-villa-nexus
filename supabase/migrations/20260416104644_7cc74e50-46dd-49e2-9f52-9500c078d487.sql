
-- User Segments table
CREATE TABLE public.user_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  segment_tags TEXT[] NOT NULL DEFAULT '{}',
  behavior_type TEXT CHECK (behavior_type IN ('fast_decision', 'hesitant', 'returning', 'first_time', 'browser')),
  budget_tier TEXT CHECK (budget_tier IN ('low', 'mid', 'high', 'ultra')),
  location_type TEXT CHECK (location_type IN ('local', 'international')),
  intent_score INTEGER DEFAULT 0 CHECK (intent_score BETWEEN 0 AND 100),
  confidence NUMERIC(4,2) DEFAULT 0.5,
  page_views INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  properties_viewed INTEGER DEFAULT 0,
  ctas_clicked INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own segments" ON public.user_segments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own segments" ON public.user_segments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own segments" ON public.user_segments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anon can insert segments by session" ON public.user_segments
  FOR INSERT WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE INDEX idx_user_segments_user ON public.user_segments(user_id);
CREATE INDEX idx_user_segments_tags ON public.user_segments USING GIN(segment_tags);

-- A/B Test Variants table
CREATE TABLE public.ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  variant_key TEXT NOT NULL,
  variant_text TEXT NOT NULL,
  variant_style JSONB DEFAULT '{}',
  target_segment TEXT[] DEFAULT '{}',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  click_rate NUMERIC(6,4) DEFAULT 0,
  conversion_rate NUMERIC(6,4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_winner BOOLEAN DEFAULT false,
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(test_name, variant_key)
);

ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active variants" ON public.ab_test_variants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can track impressions" ON public.ab_test_variants
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX idx_ab_variants_test ON public.ab_test_variants(test_name);
CREATE INDEX idx_ab_variants_active ON public.ab_test_variants(is_active, test_name);

-- Conversion Scores table
CREATE TABLE public.conversion_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  score INTEGER DEFAULT 50 CHECK (score BETWEEN 0 AND 100),
  factors JSONB DEFAULT '{}',
  trend TEXT CHECK (trend IN ('rising', 'stable', 'declining')),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  recommended_actions TEXT[] DEFAULT '{}',
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversion_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.conversion_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own scores" ON public.conversion_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON public.conversion_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anon can insert by session" ON public.conversion_scores
  FOR INSERT WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE INDEX idx_conversion_scores_user ON public.conversion_scores(user_id);
CREATE INDEX idx_conversion_scores_score ON public.conversion_scores(score);

-- Optimization Logs table
CREATE TABLE public.optimization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('daily', 'weekly', 'manual', 'triggered')),
  changes_made JSONB DEFAULT '[]',
  metrics_before JSONB DEFAULT '{}',
  metrics_after JSONB DEFAULT '{}',
  performance_delta NUMERIC(6,2) DEFAULT 0,
  tests_evaluated INTEGER DEFAULT 0,
  variants_promoted INTEGER DEFAULT 0,
  variants_disabled INTEGER DEFAULT 0,
  segments_updated INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.optimization_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read logs" ON public.optimization_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert logs" ON public.optimization_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Helper function to get segment distribution
CREATE OR REPLACE FUNCTION public.get_segment_distribution()
RETURNS TABLE(segment_tag TEXT, user_count BIGINT) 
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unnest(segment_tags) as segment_tag, count(*) as user_count
  FROM user_segments
  WHERE last_activity_at > now() - interval '30 days'
  GROUP BY segment_tag
  ORDER BY user_count DESC;
$$;

-- Helper function to get top performing variants
CREATE OR REPLACE FUNCTION public.get_top_variants(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(id UUID, test_name TEXT, variant_key TEXT, variant_text TEXT, impressions INTEGER, clicks INTEGER, conversions INTEGER, click_rate NUMERIC, conversion_rate NUMERIC, is_winner BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, test_name, variant_key, variant_text, impressions, clicks, conversions, click_rate, conversion_rate, is_winner
  FROM ab_test_variants
  WHERE is_active = true AND impressions > 10
  ORDER BY conversion_rate DESC
  LIMIT limit_count;
$$;

-- Auto-update timestamps trigger
CREATE TRIGGER update_user_segments_timestamp
  BEFORE UPDATE ON public.user_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_variants_timestamp
  BEFORE UPDATE ON public.ab_test_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversion_scores_timestamp
  BEFORE UPDATE ON public.conversion_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
