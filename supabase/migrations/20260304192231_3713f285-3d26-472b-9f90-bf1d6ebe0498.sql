
ALTER TABLE public.user_ai_cache 
ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS recompute_needed boolean DEFAULT false;
