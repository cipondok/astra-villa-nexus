CREATE UNIQUE INDEX IF NOT EXISTS user_sessions_user_fingerprint_unique 
ON public.user_sessions (user_id, device_fingerprint);