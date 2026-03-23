-- Add angle support columns to ai_image_jobs
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS angle_type text NOT NULL DEFAULT 'main_exterior_front';
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS angle_set_id uuid;
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS ai_style_profile text DEFAULT 'general';
ALTER TABLE public.ai_image_jobs ADD COLUMN IF NOT EXISTS generation_stage integer DEFAULT 1;

-- Index for querying angles per property
CREATE INDEX IF NOT EXISTS idx_ai_image_jobs_property_angle ON public.ai_image_jobs (property_id, angle_type);

-- Add angle_types config
ALTER TABLE public.ai_image_gen_config ADD COLUMN IF NOT EXISTS enabled_angles text[] DEFAULT ARRAY['main_exterior_front','exterior_angle_side','aerial_drone_view','lifestyle_environment_view','evening_lighting_view'];
ALTER TABLE public.ai_image_gen_config ADD COLUMN IF NOT EXISTS extra_angles_min_traffic integer DEFAULT 15;
ALTER TABLE public.ai_image_gen_config ADD COLUMN IF NOT EXISTS extra_angles_min_price bigint DEFAULT 1000000000;