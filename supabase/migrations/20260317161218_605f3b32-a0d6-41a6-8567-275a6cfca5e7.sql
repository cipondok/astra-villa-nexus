
-- Add intelligence feed columns to articles table
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS reading_time_min integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS related_property_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS market_heat_ref jsonb,
  ADD COLUMN IF NOT EXISTS publish_status text DEFAULT 'published';

-- Add index for feed queries
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_trending ON public.articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_articles_publish_status ON public.articles(publish_status);

-- Create saved_articles table for bookmarks
CREATE TABLE IF NOT EXISTS public.saved_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved articles"
  ON public.saved_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save articles"
  ON public.saved_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave articles"
  ON public.saved_articles FOR DELETE
  USING (auth.uid() = user_id);

-- Seed intelligence categories if not exist
INSERT INTO public.content_categories (name, slug, description, is_active)
VALUES
  ('Investment', 'investment', 'Property investment analysis and tips', true),
  ('Market Trends', 'market-trends', 'Real estate market trend reports', true),
  ('Legal Tips', 'legal-tips', 'Property legal and regulatory advice', true),
  ('Developer News', 'developer-news', 'New project launches and developer updates', true),
  ('Rental Insights', 'rental-insights', 'Rental yield and tenant market analysis', true)
ON CONFLICT DO NOTHING;
