ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_type text NOT NULL DEFAULT 'free'
CHECK (subscription_type IN ('free', 'pro', 'enterprise'));