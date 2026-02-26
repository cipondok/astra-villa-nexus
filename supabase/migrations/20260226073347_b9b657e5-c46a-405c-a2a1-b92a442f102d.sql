
-- Rental notification settings per user
CREATE TABLE public.rental_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Payment notifications
  payment_due_reminder BOOLEAN NOT NULL DEFAULT true,
  payment_due_days_before INTEGER NOT NULL DEFAULT 3,
  payment_overdue_alert BOOLEAN NOT NULL DEFAULT true,
  -- Lease notifications
  lease_expiry_reminder BOOLEAN NOT NULL DEFAULT true,
  lease_expiry_days_before INTEGER NOT NULL DEFAULT 30,
  -- Maintenance notifications
  maintenance_status_update BOOLEAN NOT NULL DEFAULT true,
  maintenance_new_request BOOLEAN NOT NULL DEFAULT true,
  -- Inspection notifications
  inspection_scheduled BOOLEAN NOT NULL DEFAULT true,
  inspection_days_before INTEGER NOT NULL DEFAULT 2,
  -- Deposit notifications
  deposit_status_change BOOLEAN NOT NULL DEFAULT true,
  -- General
  chat_messages BOOLEAN NOT NULL DEFAULT true,
  document_uploads BOOLEAN NOT NULL DEFAULT true,
  booking_status_change BOOLEAN NOT NULL DEFAULT true,
  -- Delivery preferences
  notify_in_app BOOLEAN NOT NULL DEFAULT true,
  notify_email BOOLEAN NOT NULL DEFAULT false,
  notify_push BOOLEAN NOT NULL DEFAULT false,
  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.rental_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification settings"
  ON public.rental_notification_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Rental notification log for tracking sent notifications
CREATE TABLE public.rental_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rental_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification log"
  ON public.rental_notification_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification log"
  ON public.rental_notification_log
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX idx_rental_notif_log_user ON public.rental_notification_log(user_id, created_at DESC);
CREATE INDEX idx_rental_notif_log_unread ON public.rental_notification_log(user_id, is_read) WHERE is_read = false;
