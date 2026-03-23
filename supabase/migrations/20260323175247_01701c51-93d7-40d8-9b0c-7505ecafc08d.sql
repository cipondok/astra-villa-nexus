
-- Add traffic signal columns to ai_image_jobs
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS traffic_views integer DEFAULT 0;
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS traffic_saves integer DEFAULT 0;
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS traffic_inquiries integer DEFAULT 0;
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS traffic_impressions integer DEFAULT 0;
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS traffic_intent text DEFAULT 'general';
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS daily_budget_slot boolean DEFAULT true;

-- Image generation config table for cost guardrails
CREATE TABLE IF NOT EXISTS public.ai_image_gen_config (
  id text PRIMARY KEY DEFAULT 'default',
  daily_budget_limit integer NOT NULL DEFAULT 200,
  daily_generated_count integer NOT NULL DEFAULT 0,
  max_images_per_property integer NOT NULL DEFAULT 3,
  cooldown_hours integer NOT NULL DEFAULT 72,
  min_traffic_threshold integer NOT NULL DEFAULT 5,
  auto_enqueue_enabled boolean NOT NULL DEFAULT false,
  last_reprioritize_at timestamptz,
  last_budget_reset_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.ai_image_gen_config (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.ai_image_gen_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role access on ai_image_gen_config" ON public.ai_image_gen_config FOR ALL USING (true) WITH CHECK (true);
