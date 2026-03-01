
CREATE TABLE IF NOT EXISTS public.ai_generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  content_type text,
  content text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_generated_property
ON public.ai_generated_content(property_id);

ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on ai_generated_content"
  ON public.ai_generated_content
  FOR SELECT
  USING (true);
