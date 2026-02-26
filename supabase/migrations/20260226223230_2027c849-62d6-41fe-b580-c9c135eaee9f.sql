
-- Add device_fingerprint column if not exists
ALTER TABLE public.user_sessions ADD COLUMN IF NOT EXISTS device_fingerprint text;
