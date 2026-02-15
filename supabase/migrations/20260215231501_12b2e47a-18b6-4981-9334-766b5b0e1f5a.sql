
-- Table for per-property SEO analysis results
CREATE TABLE public.property_seo_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  seo_rating TEXT DEFAULT 'poor',
  -- Generated SEO content
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  seo_hashtags TEXT[] DEFAULT '{}',
  -- Analysis breakdown
  title_score INTEGER DEFAULT 0,
  description_score INTEGER DEFAULT 0,
  keyword_score INTEGER DEFAULT 0,
  hashtag_score INTEGER DEFAULT 0,
  location_score INTEGER DEFAULT 0,
  -- Keyword intelligence
  suggested_keywords TEXT[] DEFAULT '{}',
  missing_keywords TEXT[] DEFAULT '{}',
  ranking_difficulty TEXT DEFAULT 'medium',
  -- Manual overrides
  custom_title TEXT,
  custom_description TEXT,
  custom_keywords TEXT[] DEFAULT '{}',
  custom_hashtags TEXT[] DEFAULT '{}',
  -- Metadata
  ai_model_used TEXT,
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  analysis_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

ALTER TABLE public.property_seo_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SEO analysis" ON public.property_seo_analysis FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert SEO analysis" ON public.property_seo_analysis FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update SEO analysis" ON public.property_seo_analysis FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Table for SEO trend data / keyword intelligence
CREATE TABLE public.seo_trend_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  trend_direction TEXT DEFAULT 'stable', -- rising, falling, stable
  trend_score NUMERIC(5,2) DEFAULT 0,
  competition_level TEXT DEFAULT 'medium', -- low, medium, high
  location_relevance TEXT, -- which province/city
  property_type_relevance TEXT, -- villa, rumah, etc.
  category TEXT DEFAULT 'general', -- general, location, property_type, price
  language TEXT DEFAULT 'id', -- id = Bahasa, en = English
  source TEXT DEFAULT 'internal', -- internal, google, ai_suggested
  ranking_frequency INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(keyword, location_relevance)
);

ALTER TABLE public.seo_trend_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SEO trends" ON public.seo_trend_data FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage SEO trends" ON public.seo_trend_data FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update SEO trends" ON public.seo_trend_data FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Table for keyword ranking history tracking
CREATE TABLE public.keyword_rank_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID REFERENCES public.seo_keywords(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  position INTEGER,
  search_volume INTEGER,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.keyword_rank_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rank history" ON public.keyword_rank_history FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert rank history" ON public.keyword_rank_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_property_seo_property_id ON public.property_seo_analysis(property_id);
CREATE INDEX idx_property_seo_score ON public.property_seo_analysis(seo_score DESC);
CREATE INDEX idx_seo_trends_keyword ON public.seo_trend_data(keyword);
CREATE INDEX idx_seo_trends_location ON public.seo_trend_data(location_relevance);
CREATE INDEX idx_seo_trends_competition ON public.seo_trend_data(competition_level);
CREATE INDEX idx_rank_history_keyword ON public.keyword_rank_history(keyword_id, recorded_at);

-- Seed Indonesian property keyword trends
INSERT INTO public.seo_trend_data (keyword, search_volume, trend_direction, trend_score, competition_level, category, language, source) VALUES
  ('rumah dijual', 110000, 'rising', 92, 'high', 'general', 'id', 'google'),
  ('villa dijual', 74000, 'rising', 88, 'high', 'general', 'id', 'google'),
  ('apartemen dijual', 49000, 'stable', 75, 'high', 'general', 'id', 'google'),
  ('rumah murah', 90000, 'rising', 85, 'high', 'general', 'id', 'google'),
  ('rumah mewah', 33000, 'rising', 78, 'medium', 'general', 'id', 'google'),
  ('villa mewah bali', 22000, 'rising', 90, 'medium', 'location', 'id', 'google'),
  ('rumah dijual jakarta', 45000, 'stable', 82, 'high', 'location', 'id', 'google'),
  ('villa dijual bandung', 18000, 'rising', 76, 'medium', 'location', 'id', 'google'),
  ('properti investasi', 27000, 'rising', 80, 'medium', 'general', 'id', 'google'),
  ('tanah dijual', 55000, 'stable', 70, 'high', 'general', 'id', 'google'),
  ('ruko dijual', 31000, 'stable', 65, 'medium', 'general', 'id', 'google'),
  ('luxury villa indonesia', 12000, 'rising', 85, 'medium', 'general', 'en', 'google'),
  ('bali villa for sale', 18000, 'rising', 88, 'medium', 'location', 'en', 'google'),
  ('jakarta apartment', 9500, 'stable', 72, 'high', 'location', 'en', 'google'),
  ('indonesia real estate', 8000, 'rising', 78, 'medium', 'general', 'en', 'google'),
  ('villa dekat pantai', 15000, 'rising', 82, 'medium', 'general', 'id', 'google'),
  ('rumah dijual surabaya', 28000, 'stable', 75, 'high', 'location', 'id', 'google'),
  ('villa lombok', 11000, 'rising', 84, 'low', 'location', 'id', 'google'),
  ('rumah dijual bandung', 35000, 'stable', 80, 'high', 'location', 'id', 'google'),
  ('investasi properti bali', 14000, 'rising', 86, 'medium', 'location', 'id', 'google')
ON CONFLICT DO NOTHING;

-- Update trigger
CREATE TRIGGER update_property_seo_analysis_updated_at
  BEFORE UPDATE ON public.property_seo_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
