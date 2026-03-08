
-- Create seo_ai_actions table for tracking AI optimization history
CREATE TABLE IF NOT EXISTS public.seo_ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'auto_optimize',
  old_score INTEGER DEFAULT 0,
  new_score INTEGER DEFAULT 0,
  old_title TEXT,
  new_title TEXT,
  old_description TEXT,
  new_description TEXT,
  keywords_added TEXT[] DEFAULT '{}',
  threshold_used INTEGER,
  ai_model TEXT,
  triggered_by TEXT DEFAULT 'manual',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_seo_ai_actions_property_id ON public.seo_ai_actions(property_id);
CREATE INDEX IF NOT EXISTS idx_seo_ai_actions_created_at ON public.seo_ai_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_ai_actions_action_type ON public.seo_ai_actions(action_type);

-- Enable RLS
ALTER TABLE public.seo_ai_actions ENABLE ROW LEVEL SECURITY;

-- Admin-only read access (using user_roles table)
CREATE POLICY "Admins can read seo_ai_actions"
  ON public.seo_ai_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
  );

-- Service role can insert (edge functions use service role)
CREATE POLICY "Service role can insert seo_ai_actions"
  ON public.seo_ai_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
