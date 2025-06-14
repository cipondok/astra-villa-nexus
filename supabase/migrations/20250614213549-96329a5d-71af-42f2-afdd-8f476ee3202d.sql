
-- Add availability status and last seen timestamp to profiles
ALTER TABLE public.profiles
ADD COLUMN availability_status TEXT DEFAULT 'offline',
ADD COLUMN last_seen_at TIMESTAMPTZ DEFAULT now();

COMMENT ON COLUMN public.profiles.availability_status IS 'User availability status, e.g., online, offline, busy';
COMMENT ON COLUMN public.profiles.last_seen_at IS 'Timestamp of the last user activity';
