-- Create share_analytics table for tracking share performance
CREATE TABLE IF NOT EXISTS public.share_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.shared_searches(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'referrer')),
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_share_analytics_share_id ON public.share_analytics(share_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_event_type ON public.share_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_share_analytics_timestamp ON public.share_analytics(timestamp DESC);

-- Enable RLS
ALTER TABLE public.share_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view analytics for their own shares
CREATE POLICY "Users can view their share analytics"
  ON public.share_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_searches ss
      WHERE ss.id = share_analytics.share_id
        AND ss.owner_id = auth.uid()
    )
  );

-- Policy: Allow anonymous inserts for tracking (no auth required for views/clicks)
CREATE POLICY "Anyone can insert analytics events"
  ON public.share_analytics
  FOR INSERT
  WITH CHECK (true);

-- Add notification history columns to search_notifications table
ALTER TABLE public.search_notifications
ADD COLUMN IF NOT EXISTS filter_type TEXT DEFAULT 'all';

-- Create index for notification history queries
CREATE INDEX IF NOT EXISTS idx_search_notifications_user_created ON public.search_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_notifications_type ON public.search_notifications(notification_type);

COMMENT ON TABLE public.share_analytics IS 'Tracks views, clicks, and referrers for shared search links';
COMMENT ON COLUMN public.share_analytics.event_type IS 'Type of event: view, click, or referrer';
COMMENT ON COLUMN public.share_analytics.metadata IS 'Additional event data (e.g., property_id for clicks)';
