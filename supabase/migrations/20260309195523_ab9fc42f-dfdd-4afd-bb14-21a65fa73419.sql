CREATE TABLE IF NOT EXISTS public.ai_property_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  parsed_filters JSONB,
  results_count INTEGER,
  intent_summary TEXT,
  source TEXT DEFAULT 'search_page',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_property_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own queries"
  ON public.ai_property_queries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own queries"
  ON public.ai_property_queries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all queries"
  ON public.ai_property_queries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX idx_ai_property_queries_user ON public.ai_property_queries(user_id);
CREATE INDEX idx_ai_property_queries_created ON public.ai_property_queries(created_at DESC);