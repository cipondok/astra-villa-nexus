
-- AI Image Generation Job Queue
CREATE TABLE public.ai_image_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  priority_score numeric NOT NULL DEFAULT 0,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  prompt_hash text,
  prompt_text text,
  error_message text,
  result_image_url text,
  result_thumbnail_url text,
  worker_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX idx_ai_image_jobs_status_priority ON public.ai_image_jobs (status, priority_score DESC);
CREATE INDEX idx_ai_image_jobs_property ON public.ai_image_jobs (property_id);
CREATE UNIQUE INDEX idx_ai_image_jobs_pending_dedup ON public.ai_image_jobs (property_id) WHERE status IN ('pending', 'processing');

-- Add ai_generated tracking to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS image_generated_at timestamptz;

-- RLS
ALTER TABLE public.ai_image_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on ai_image_jobs" ON public.ai_image_jobs FOR ALL USING (true) WITH CHECK (true);
