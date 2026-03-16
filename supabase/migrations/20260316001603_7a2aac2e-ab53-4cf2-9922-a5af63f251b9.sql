
-- Launch roadmap phases
CREATE TABLE IF NOT EXISTS public.launch_roadmap_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_key text UNIQUE NOT NULL,
  phase_name text NOT NULL,
  phase_order int NOT NULL,
  target_start_date date,
  target_end_date date,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Launch roadmap tasks
CREATE TABLE IF NOT EXISTS public.launch_roadmap_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.launch_roadmap_phases(id) ON DELETE CASCADE,
  task_title text NOT NULL,
  task_description text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','blocked')),
  assigned_to text,
  completed_at timestamptz,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.launch_roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_roadmap_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view roadmap phases" ON public.launch_roadmap_phases
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage roadmap phases" ON public.launch_roadmap_phases
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view roadmap tasks" ON public.launch_roadmap_tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage roadmap tasks" ON public.launch_roadmap_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_roadmap_tasks_phase ON public.launch_roadmap_tasks(phase_id);
CREATE INDEX idx_roadmap_tasks_status ON public.launch_roadmap_tasks(status);
CREATE INDEX idx_roadmap_phases_order ON public.launch_roadmap_phases(phase_order);
