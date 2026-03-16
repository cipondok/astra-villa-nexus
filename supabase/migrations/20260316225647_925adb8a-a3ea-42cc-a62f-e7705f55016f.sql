
-- RLS for autopilot_worker_runs — read-only for authenticated, full for service_role
ALTER TABLE public.autopilot_worker_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read worker runs"
  ON public.autopilot_worker_runs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role manages worker runs"
  ON public.autopilot_worker_runs FOR ALL TO service_role
  USING (true) WITH CHECK (true);
