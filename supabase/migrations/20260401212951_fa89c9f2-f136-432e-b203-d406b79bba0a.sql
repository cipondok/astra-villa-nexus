
-- Add columns for real-time notification support
ALTER TABLE public.support_smart_alerts 
  ADD COLUMN IF NOT EXISTS notification_channels jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS alert_hash text,
  ADD COLUMN IF NOT EXISTS notified_externally boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS group_key text,
  ADD COLUMN IF NOT EXISTS notification_message text;

-- Create unique index on alert_hash to prevent duplicates (only for non-null hashes)
CREATE UNIQUE INDEX IF NOT EXISTS idx_support_smart_alerts_hash 
  ON public.support_smart_alerts (alert_hash) WHERE alert_hash IS NOT NULL;

-- Index for real-time queries
CREATE INDEX IF NOT EXISTS idx_support_smart_alerts_active 
  ON public.support_smart_alerts (is_dismissed, created_at DESC);

-- Enable realtime on support_smart_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_smart_alerts;
