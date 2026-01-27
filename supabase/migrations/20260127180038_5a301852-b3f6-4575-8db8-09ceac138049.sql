-- User preference profiles for explicit preferences
CREATE TABLE public.user_preference_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Explicit preferences
  min_budget NUMERIC,
  max_budget NUMERIC,
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_property_types TEXT[] DEFAULT '{}',
  min_bedrooms INTEGER,
  max_bedrooms INTEGER,
  min_bathrooms INTEGER,
  min_land_size NUMERIC,
  max_land_size NUMERIC,
  must_have_features TEXT[] DEFAULT '{}',
  deal_breakers TEXT[] DEFAULT '{}',
  
  -- Preference weights (learned over time)
  location_weight NUMERIC DEFAULT 0.25,
  price_weight NUMERIC DEFAULT 0.25,
  size_weight NUMERIC DEFAULT 0.20,
  features_weight NUMERIC DEFAULT 0.15,
  type_weight NUMERIC DEFAULT 0.15,
  
  -- Discovery preferences
  discovery_openness NUMERIC DEFAULT 0.2, -- 0-1 scale
  preferred_discovery_types TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Implicit behavior signals
CREATE TABLE public.user_behavior_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,
  
  -- Behavior metrics
  signal_type TEXT NOT NULL, -- 'view', 'dwell', 'save', 'share', 'inquiry', 'revisit', 'compare'
  signal_strength NUMERIC DEFAULT 1.0, -- Weighted importance
  
  -- Context
  time_spent_seconds INTEGER,
  scroll_depth NUMERIC, -- 0-100
  photos_viewed INTEGER,
  sections_expanded TEXT[],
  comparison_properties UUID[],
  
  -- Property snapshot at time of interaction
  property_snapshot JSONB,
  
  -- Session context
  session_id TEXT,
  device_type TEXT,
  referrer TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Learned preference patterns
CREATE TABLE public.learned_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Learned patterns
  pattern_type TEXT NOT NULL, -- 'price_tendency', 'location_cluster', 'feature_affinity', 'style_preference'
  pattern_key TEXT NOT NULL,
  pattern_value JSONB NOT NULL,
  confidence_score NUMERIC DEFAULT 0.5, -- 0-1
  sample_count INTEGER DEFAULT 1,
  
  -- Decay tracking
  last_reinforced_at TIMESTAMPTZ DEFAULT now(),
  decay_factor NUMERIC DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pattern_type, pattern_key)
);

-- Recommendation history with feedback
CREATE TABLE public.recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL,
  
  -- Match details
  overall_score NUMERIC NOT NULL,
  preference_score NUMERIC, -- 80% component
  discovery_score NUMERIC, -- 20% component
  
  -- Explanation breakdown
  match_reasons JSONB NOT NULL, -- Array of {factor, score, explanation}
  discovery_reasons JSONB, -- Why this is a discovery match
  
  -- User feedback
  user_feedback TEXT, -- 'liked', 'disliked', 'saved', 'inquired', 'ignored'
  feedback_at TIMESTAMPTZ,
  
  -- Context
  recommendation_context TEXT, -- 'homepage', 'search', 'similar', 'email'
  position_shown INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Market trends for external factors
CREATE TABLE public.market_trend_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  property_type TEXT,
  
  -- Trend metrics
  price_trend NUMERIC, -- -1 to 1 (declining to rising)
  demand_score NUMERIC, -- 0-100
  seasonality_factor NUMERIC DEFAULT 1.0,
  avg_days_on_market INTEGER,
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(location, property_type, period_start)
);

-- Enable RLS
ALTER TABLE public.user_preference_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_trend_factors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own preferences" ON public.user_preference_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own behavior" ON public.user_behavior_signals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learned preferences" ON public.learned_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations" ON public.recommendation_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Market trends are public" ON public.market_trend_factors
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_behavior_signals_user ON public.user_behavior_signals(user_id, created_at DESC);
CREATE INDEX idx_behavior_signals_property ON public.user_behavior_signals(property_id);
CREATE INDEX idx_learned_prefs_user ON public.learned_preferences(user_id, pattern_type);
CREATE INDEX idx_rec_history_user ON public.recommendation_history(user_id, created_at DESC);
CREATE INDEX idx_market_trends_location ON public.market_trend_factors(location, period_start DESC);