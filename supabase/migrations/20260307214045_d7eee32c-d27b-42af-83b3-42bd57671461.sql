-- Table to persist generator checkpoints across devices/sessions
CREATE TABLE public.spg_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkpoint_type text NOT NULL DEFAULT 'auto_run',
  is_auto_mode boolean DEFAULT false,
  completed_provinces text[] DEFAULT '{}',
  current_province text,
  current_offset integer DEFAULT 0,
  total_created integer DEFAULT 0,
  total_skipped integer DEFAULT 0,
  total_errors integer DEFAULT 0,
  provinces_queue text[] DEFAULT '{}',
  current_city text,
  current_area text,
  started_at timestamptz,
  province_name text,
  province_created integer DEFAULT 0,
  province_skipped integer DEFAULT 0,
  province_errors integer DEFAULT 0,
  province_cities text[] DEFAULT '{}',
  province_areas text[] DEFAULT '{}',
  province_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX spg_checkpoints_auto_run_unique ON public.spg_checkpoints (user_id) WHERE checkpoint_type = 'auto_run';
CREATE UNIQUE INDEX spg_checkpoints_done_province_unique ON public.spg_checkpoints (user_id, province_name) WHERE checkpoint_type = 'done_province';

ALTER TABLE public.spg_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checkpoints"
  ON public.spg_checkpoints FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);