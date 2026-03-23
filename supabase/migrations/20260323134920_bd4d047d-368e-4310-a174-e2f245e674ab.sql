
-- copilot_actions: tracks every AI recommendation action taken by admin
CREATE TABLE IF NOT EXISTS public.copilot_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  payload_json jsonb DEFAULT '{}',
  executed_by_admin_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  result_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);

ALTER TABLE public.copilot_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage copilot actions"
  ON public.copilot_actions FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Performance indexes for copilot-intelligence queries
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);
CREATE INDEX IF NOT EXISTS idx_copilot_actions_type ON public.copilot_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_copilot_actions_status ON public.copilot_actions(status);
