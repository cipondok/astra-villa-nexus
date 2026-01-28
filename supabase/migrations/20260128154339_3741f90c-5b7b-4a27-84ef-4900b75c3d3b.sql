-- Add columns to push_subscriptions table for proper web push support
-- These columns store the actual subscription data needed for sending notifications

-- First check if columns exist and add if they don't
DO $$ 
BEGIN
  -- Add endpoint column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'endpoint') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN endpoint TEXT;
  END IF;

  -- Add p256dh_key column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'p256dh_key') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN p256dh_key TEXT;
  END IF;

  -- Add auth_key column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'auth_key') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN auth_key TEXT;
  END IF;

  -- Add device_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'device_type') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN device_type TEXT DEFAULT 'web';
  END IF;

  -- Add device_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'device_name') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN device_name TEXT;
  END IF;

  -- Add browser column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'browser') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN browser TEXT;
  END IF;

  -- Make search_id nullable since not all subscriptions are tied to searches
  ALTER TABLE public.push_subscriptions ALTER COLUMN search_id DROP NOT NULL;
END $$;

-- Create unique index on endpoint to prevent duplicate subscriptions
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
ON public.push_subscriptions(endpoint) WHERE endpoint IS NOT NULL;

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active 
ON public.push_subscriptions(user_id, is_active);

-- Create notification_analytics table for tracking notification performance
CREATE TABLE IF NOT EXISTS public.notification_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  notification_id UUID,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification_analytics
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_analytics
CREATE POLICY "Users can view own notification analytics" 
ON public.notification_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification analytics" 
ON public.notification_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all notification analytics"
ON public.notification_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_type 
ON public.notification_analytics(user_id, event_type, created_at DESC);

-- Add GDPR consent tracking to notification_preferences
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notification_preferences' AND column_name = 'gdpr_consent_at') THEN
    ALTER TABLE public.notification_preferences ADD COLUMN gdpr_consent_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notification_preferences' AND column_name = 'consent_ip') THEN
    ALTER TABLE public.notification_preferences ADD COLUMN consent_ip INET;
  END IF;
END $$;