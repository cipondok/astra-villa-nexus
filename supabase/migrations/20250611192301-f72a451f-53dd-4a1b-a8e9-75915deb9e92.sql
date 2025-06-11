
-- Create table for tracking page views and visitor analytics
CREATE TABLE public.web_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking search queries
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  search_query TEXT NOT NULL,
  search_filters JSONB,
  results_count INTEGER,
  clicked_result_id UUID,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daily analytics summary
CREATE TABLE public.daily_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  avg_session_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_web_analytics_visitor_id ON public.web_analytics(visitor_id);
CREATE INDEX idx_web_analytics_user_id ON public.web_analytics(user_id);
CREATE INDEX idx_web_analytics_created_at ON public.web_analytics(created_at);
CREATE INDEX idx_web_analytics_page_path ON public.web_analytics(page_path);
CREATE INDEX idx_search_analytics_query ON public.search_analytics(search_query);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);
CREATE INDEX idx_daily_analytics_date ON public.daily_analytics(date);

-- Enable Row Level Security
ALTER TABLE public.web_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access only
CREATE POLICY "Admin can view all web analytics" 
  ON public.web_analytics 
  FOR SELECT 
  USING (public.check_admin_access());

CREATE POLICY "Admin can insert web analytics" 
  ON public.web_analytics 
  FOR INSERT 
  WITH CHECK (true); -- Allow inserts from anyone for tracking

CREATE POLICY "Admin can view all search analytics" 
  ON public.search_analytics 
  FOR SELECT 
  USING (public.check_admin_access());

CREATE POLICY "Admin can insert search analytics" 
  ON public.search_analytics 
  FOR INSERT 
  WITH CHECK (true); -- Allow inserts from anyone for tracking

CREATE POLICY "Admin can view daily analytics" 
  ON public.daily_analytics 
  FOR ALL 
  USING (public.check_admin_access());

-- Create function to aggregate daily analytics
CREATE OR REPLACE FUNCTION public.aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_analytics (
    date,
    total_visitors,
    unique_visitors,
    total_page_views,
    total_searches,
    new_users,
    returning_users
  )
  VALUES (
    target_date,
    (SELECT COUNT(*) FROM public.web_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(DISTINCT visitor_id) FROM public.web_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM public.web_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM public.search_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(DISTINCT user_id) FROM public.web_analytics 
     WHERE DATE(created_at) = target_date AND user_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.web_analytics w2 
       WHERE w2.user_id = web_analytics.user_id 
       AND DATE(w2.created_at) < target_date
     )),
    (SELECT COUNT(DISTINCT user_id) FROM public.web_analytics 
     WHERE DATE(created_at) = target_date AND user_id IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.web_analytics w2 
       WHERE w2.user_id = web_analytics.user_id 
       AND DATE(w2.created_at) < target_date
     ))
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_visitors = EXCLUDED.total_visitors,
    unique_visitors = EXCLUDED.unique_visitors,
    total_page_views = EXCLUDED.total_page_views,
    total_searches = EXCLUDED.total_searches,
    new_users = EXCLUDED.new_users,
    returning_users = EXCLUDED.returning_users,
    updated_at = now();
END;
$$;
