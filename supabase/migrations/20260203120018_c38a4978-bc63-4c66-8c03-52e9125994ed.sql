-- =============================================
-- PROPERTY MEDIA NETWORK SCHEMA
-- =============================================

-- YouTube Videos Table
CREATE TABLE public.media_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  thumbnail_url TEXT,
  video_type TEXT NOT NULL DEFAULT 'virtual_tour' CHECK (video_type IN ('virtual_tour', 'market_analysis', 'property_showcase', 'neighborhood_guide', 'tutorial', 'interview')),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  duration_seconds INTEGER,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Podcast Episodes Table
CREATE TABLE public.media_podcast_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_number INTEGER NOT NULL,
  season INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  spotify_url TEXT,
  apple_podcasts_url TEXT,
  youtube_url TEXT,
  duration_seconds INTEGER,
  guest_name TEXT,
  guest_title TEXT,
  guest_company TEXT,
  guest_photo_url TEXT,
  topics TEXT[],
  transcript TEXT,
  show_notes TEXT,
  downloads_count INTEGER DEFAULT 0,
  listens_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Newsletter Subscribers Table
CREATE TABLE public.media_newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'popup', 'landing_page', 'social', 'referral', 'event')),
  referral_code TEXT,
  preferences JSONB DEFAULT '{"market_updates": true, "new_listings": true, "research_reports": false, "events": true}'::jsonb,
  subscriber_tier TEXT DEFAULT 'free' CHECK (subscriber_tier IN ('free', 'premium', 'vip')),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  total_emails_sent INTEGER DEFAULT 0,
  total_emails_opened INTEGER DEFAULT 0,
  total_links_clicked INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  last_email_opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Newsletter Campaigns Table
CREATE TABLE public.media_newsletter_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content_html TEXT,
  content_json JSONB,
  campaign_type TEXT DEFAULT 'regular' CHECK (campaign_type IN ('regular', 'automated', 'digest', 'announcement')),
  target_tier TEXT DEFAULT 'all' CHECK (target_tier IN ('all', 'free', 'premium', 'vip')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research Reports Table
CREATE TABLE public.media_research_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  executive_summary TEXT,
  full_content TEXT,
  report_type TEXT NOT NULL DEFAULT 'market_analysis' CHECK (report_type IN ('market_analysis', 'price_trends', 'investment_guide', 'neighborhood_deep_dive', 'annual_review', 'quarterly_update')),
  cover_image_url TEXT,
  pdf_url TEXT,
  data_visualization JSONB,
  locations TEXT[],
  property_types TEXT[],
  time_period TEXT,
  key_findings JSONB,
  methodology TEXT,
  access_tier TEXT DEFAULT 'premium' CHECK (access_tier IN ('free', 'premium', 'vip', 'sponsors_only')),
  price_idr INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events Table
CREATE TABLE public.media_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'virtual_expo' CHECK (event_type IN ('virtual_expo', 'webinar', 'workshop', 'networking', 'property_showcase', 'investor_meetup')),
  format TEXT DEFAULT 'virtual' CHECK (format IN ('virtual', 'in_person', 'hybrid')),
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  virtual_platform TEXT,
  virtual_link TEXT,
  cover_image_url TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  ticket_tiers JSONB DEFAULT '[{"name": "Free", "price": 0, "benefits": ["Access to main sessions"]}, {"name": "VIP", "price": 500000, "benefits": ["All sessions", "Networking", "Recording access"]}]'::jsonb,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  speakers JSONB,
  sponsors JSONB,
  agenda JSONB,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  registration_open BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event Registrations Table
CREATE TABLE public.media_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.media_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  ticket_tier TEXT DEFAULT 'Free',
  ticket_price INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  payment_reference TEXT,
  check_in_status TEXT DEFAULT 'registered' CHECK (check_in_status IN ('registered', 'checked_in', 'no_show')),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  dietary_requirements TEXT,
  questions JSONB,
  registration_source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

-- Sponsorships Table
CREATE TABLE public.media_sponsorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  sponsorship_type TEXT NOT NULL DEFAULT 'content' CHECK (sponsorship_type IN ('content', 'event', 'podcast', 'newsletter', 'research', 'annual')),
  sponsorship_tier TEXT DEFAULT 'silver' CHECK (sponsorship_tier IN ('bronze', 'silver', 'gold', 'platinum', 'title')),
  package_details JSONB,
  amount_idr INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  deliverables JSONB,
  deliverables_completed JSONB,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  amount_paid INTEGER DEFAULT 0,
  contract_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Media Analytics Table
CREATE TABLE public.media_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('youtube', 'podcast', 'newsletter', 'website', 'social', 'events')),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, channel, metric_type)
);

-- Enable RLS on all tables
ALTER TABLE public.media_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published videos" ON public.media_videos FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published podcasts" ON public.media_podcast_episodes FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published reports" ON public.media_research_reports FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published events" ON public.media_events FOR SELECT USING (is_published = true);

-- Newsletter subscriber policies
CREATE POLICY "Users can subscribe to newsletter" ON public.media_newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own subscription" ON public.media_newsletter_subscribers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.media_newsletter_subscribers FOR UPDATE USING (auth.uid() = user_id);

-- Event registration policies
CREATE POLICY "Anyone can register for events" ON public.media_event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own registrations" ON public.media_event_registrations FOR SELECT USING (auth.uid() = user_id);

-- Admin full access using admin_users table check
CREATE POLICY "Admins can manage videos" ON public.media_videos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage podcasts" ON public.media_podcast_episodes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage subscribers" ON public.media_newsletter_subscribers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage campaigns" ON public.media_newsletter_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage reports" ON public.media_research_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage events" ON public.media_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage registrations" ON public.media_event_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage sponsorships" ON public.media_sponsorships FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage analytics" ON public.media_analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_media_videos_type ON public.media_videos(video_type);
CREATE INDEX idx_media_videos_published ON public.media_videos(is_published, published_at DESC);
CREATE INDEX idx_media_podcasts_published ON public.media_podcast_episodes(is_published, published_at DESC);
CREATE INDEX idx_media_subscribers_email ON public.media_newsletter_subscribers(email);
CREATE INDEX idx_media_subscribers_active ON public.media_newsletter_subscribers(is_active, subscriber_tier);
CREATE INDEX idx_media_events_datetime ON public.media_events(start_datetime);
CREATE INDEX idx_media_analytics_date ON public.media_analytics(date, channel);

-- Newsletter subscriber count trigger
CREATE OR REPLACE FUNCTION public.update_newsletter_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.media_analytics (date, channel, metric_type, metric_value)
  VALUES (CURRENT_DATE, 'newsletter', 'new_subscribers', 1)
  ON CONFLICT (date, channel, metric_type) 
  DO UPDATE SET metric_value = media_analytics.metric_value + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_newsletter_subscribe
  AFTER INSERT ON public.media_newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_newsletter_stats();

-- Event registration trigger
CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.media_events 
    SET current_attendees = current_attendees + 1, updated_at = now()
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.media_events 
    SET current_attendees = current_attendees - 1, updated_at = now()
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_event_registration
  AFTER INSERT OR DELETE ON public.media_event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_event_attendee_count();