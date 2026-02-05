-- SEO Landing Pages Table (auto-generated for states + categories)
CREATE TABLE public.seo_landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  page_type TEXT NOT NULL CHECK (page_type IN ('state', 'category_state', 'property_type_state')),
  state_id TEXT,
  state_name TEXT NOT NULL,
  category TEXT,
  property_type TEXT,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  h1_heading TEXT,
  intro_content TEXT,
  main_content TEXT,
  closing_content TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  internal_links JSONB DEFAULT '[]'::jsonb,
  property_count INTEGER DEFAULT 0,
  avg_price NUMERIC,
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  is_published BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT true,
  ai_model_used TEXT,
  seo_score INTEGER,
  last_ai_update TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SEO Keywords Tracking
CREATE TABLE public.seo_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty_score INTEGER,
  current_position INTEGER,
  previous_position INTEGER,
  position_change INTEGER,
  target_url TEXT,
  landing_page_id UUID REFERENCES public.seo_landing_pages(id) ON DELETE SET NULL,
  competitor_positions JSONB DEFAULT '[]'::jsonb,
  monthly_trend JSONB DEFAULT '[]'::jsonb,
  is_tracked BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Internal Search Analytics
CREATE TABLE public.seo_internal_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type TEXT,
  search_filters JSONB,
  location_filter TEXT,
  property_type_filter TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Competitor Keywords
CREATE TABLE public.seo_competitor_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_domain TEXT NOT NULL,
  competitor_name TEXT,
  keyword TEXT NOT NULL,
  their_position INTEGER,
  our_position INTEGER,
  gap INTEGER,
  search_volume INTEGER,
  opportunity_score INTEGER,
  notes TEXT,
  is_opportunity BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SEO Auto-publish Queue
CREATE TABLE public.seo_publish_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID REFERENCES public.seo_landing_pages(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('generate', 'update', 'publish', 'unpublish')),
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  scheduled_for TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_internal_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_competitor_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_publish_queue ENABLE ROW LEVEL SECURITY;

-- Public read for landing pages (they are SEO pages)
CREATE POLICY "SEO landing pages are publicly readable" ON public.seo_landing_pages
  FOR SELECT USING (is_published = true);

-- Admin full access policies
CREATE POLICY "Admins can manage SEO landing pages" ON public.seo_landing_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage SEO keywords" ON public.seo_keywords
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view internal searches" ON public.seo_internal_searches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can log searches" ON public.seo_internal_searches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage competitor keywords" ON public.seo_competitor_keywords
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage publish queue" ON public.seo_publish_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_seo_landing_pages_slug ON public.seo_landing_pages(slug);
CREATE INDEX idx_seo_landing_pages_state ON public.seo_landing_pages(state_id);
CREATE INDEX idx_seo_landing_pages_type ON public.seo_landing_pages(page_type);
CREATE INDEX idx_seo_keywords_keyword ON public.seo_keywords(keyword);
CREATE INDEX idx_seo_keywords_position ON public.seo_keywords(current_position);
CREATE INDEX idx_seo_internal_searches_query ON public.seo_internal_searches(search_query);
CREATE INDEX idx_seo_internal_searches_created ON public.seo_internal_searches(created_at DESC);
CREATE INDEX idx_seo_publish_queue_status ON public.seo_publish_queue(status);

-- Trigger for updated_at
CREATE TRIGGER update_seo_landing_pages_updated_at
  BEFORE UPDATE ON public.seo_landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_keywords_updated_at
  BEFORE UPDATE ON public.seo_keywords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_competitor_keywords_updated_at
  BEFORE UPDATE ON public.seo_competitor_keywords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();