-- Security incident response notes table
CREATE TABLE IF NOT EXISTS public.security_incident_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES public.security_alerts(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL,
  note text NOT NULL,
  action_taken text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_incident_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage incident notes"
  ON public.security_incident_notes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_incident_notes_alert ON public.security_incident_notes(alert_id);

ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS escalation_level text DEFAULT 'normal';
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS resolved_by uuid;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS investigation_status text DEFAULT 'open';