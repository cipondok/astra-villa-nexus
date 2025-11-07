-- Create shared_searches table for collaboration
CREATE TABLE IF NOT EXISTS public.shared_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create push_subscriptions table for Web Push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID NOT NULL,
  subscription JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, search_id)
);

-- Create search_notifications table
CREATE TABLE IF NOT EXISTS public.search_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_match', 'price_drop')),
  property_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for shared_searches
CREATE POLICY "Users can view their own shared searches" 
ON public.shared_searches 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create shared searches" 
ON public.shared_searches 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own shared searches" 
ON public.shared_searches 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shared searches" 
ON public.shared_searches 
FOR DELETE 
USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view active non-expired shared searches" 
ON public.shared_searches 
FOR SELECT 
USING (is_active = true AND expires_at > now());

-- Policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Policies for search_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.search_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.search_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.search_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.shared_searches REPLICA IDENTITY FULL;
ALTER TABLE public.search_notifications REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_searches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.search_notifications;

-- Create indexes
CREATE INDEX idx_shared_searches_owner ON public.shared_searches(owner_id);
CREATE INDEX idx_shared_searches_expires ON public.shared_searches(expires_at);
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX idx_search_notifications_user ON public.search_notifications(user_id, is_read);
CREATE INDEX idx_search_notifications_created ON public.search_notifications(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_shared_searches_updated_at
BEFORE UPDATE ON public.shared_searches
FOR EACH ROW
EXECUTE FUNCTION public.update_user_searches_updated_at();

CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_searches_updated_at();