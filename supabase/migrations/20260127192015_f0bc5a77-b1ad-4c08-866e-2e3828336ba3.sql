-- =============================================
-- COMMUNITY PLATFORM TABLES
-- =============================================

-- Neighborhood Guides (User-Generated)
CREATE TABLE public.neighborhood_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  neighborhood_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content JSONB DEFAULT '[]'::jsonb, -- Rich content blocks
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  highlights JSONB DEFAULT '[]'::jsonb, -- Key highlights
  ratings JSONB DEFAULT '{"safety": 0, "transport": 0, "amenities": 0, "community": 0, "value": 0}'::jsonb,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, pending_review, published, rejected
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Property Q&A Forums
CREATE TABLE public.property_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- general, pricing, location, amenities, legal, neighbors
  is_anonymous BOOLEAN DEFAULT false,
  answer_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- active, hidden, deleted
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.property_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.property_questions(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_owner_response BOOLEAN DEFAULT false,
  is_resident_response BOOLEAN DEFAULT false,
  is_accepted BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ask Current Residents
CREATE TABLE public.resident_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  resident_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_current_resident BOOLEAN DEFAULT true,
  residence_start_date DATE,
  residence_end_date DATE,
  is_verified BOOLEAN DEFAULT false,
  is_available_for_questions BOOLEAN DEFAULT true,
  response_rate DECIMAL(5,2) DEFAULT 0,
  avg_response_time_hours INTEGER,
  topics_willing_to_discuss TEXT[] DEFAULT '{"neighborhood", "amenities", "transport", "community"}',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, resident_id)
);

CREATE TABLE public.resident_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  resident_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  inquirer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT,
  status TEXT DEFAULT 'pending', -- pending, responded, expired
  is_anonymous BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Local Service Provider Directory
CREATE TABLE public.local_service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- plumbing, electrical, cleaning, moving, renovation, etc.
  subcategory TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_whatsapp TEXT,
  website_url TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  service_areas TEXT[] DEFAULT '{}',
  operating_hours JSONB,
  price_range TEXT, -- $, $$, $$$
  services_offered JSONB DEFAULT '[]'::jsonb,
  certifications TEXT[] DEFAULT '{}',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.service_provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.local_service_providers(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  service_used TEXT,
  photos TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Events/Meetups
CREATE TABLE public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- open_house, meetup, workshop, networking, community_cleanup, etc.
  cover_image_url TEXT,
  location_name TEXT,
  location_address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_online BOOLEAN DEFAULT false,
  online_link TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  ticket_price DECIMAL(12,2),
  registration_deadline TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming', -- draft, upcoming, ongoing, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'registered', -- registered, attended, cancelled, no_show
  registration_type TEXT DEFAULT 'attendee', -- attendee, speaker, volunteer
  notes TEXT,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Group Buying Power
CREATE TABLE public.group_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- furniture, appliances, renovation, insurance, internet, etc.
  cover_image_url TEXT,
  provider_name TEXT,
  provider_id UUID REFERENCES public.local_service_providers(id),
  original_price DECIMAL(15,2),
  group_price DECIMAL(15,2),
  discount_percentage DECIMAL(5,2),
  min_participants INTEGER NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  target_neighborhoods TEXT[] DEFAULT '{}',
  target_cities TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- draft, active, target_met, expired, completed
  terms_conditions TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.group_deal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.group_deals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'joined', -- joined, confirmed, paid, cancelled
  joined_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(deal_id, user_id)
);

-- Community Moderation System
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL, -- neighborhood_guide, question, answer, review, event, deal
  content_id UUID NOT NULL,
  reason TEXT NOT NULL, -- spam, inappropriate, misleading, harassment, copyright, other
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
  moderator_id UUID REFERENCES auth.users(id),
  moderator_notes TEXT,
  action_taken TEXT, -- none, warning, hidden, deleted, user_banned
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.community_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT DEFAULT 'moderator', -- moderator, senior_moderator, community_manager
  permissions JSONB DEFAULT '{"can_hide": true, "can_delete": false, "can_ban": false}'::jsonb,
  assigned_categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contribution Incentives
CREATE TABLE public.community_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contribution_type TEXT NOT NULL, -- guide_created, question_asked, answer_given, review_written, event_organized, helpful_vote
  content_id UUID,
  points_earned INTEGER NOT NULL,
  quality_bonus INTEGER DEFAULT 0, -- Extra points for quality
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.community_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  guides_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  events_organized INTEGER DEFAULT 0,
  helpful_votes_received INTEGER DEFAULT 0,
  current_rank INTEGER,
  current_tier TEXT DEFAULT 'newcomer', -- newcomer, contributor, expert, champion, legend
  streak_days INTEGER DEFAULT 0,
  last_contribution_at TIMESTAMPTZ,
  badges_earned JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.neighborhood_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resident_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resident_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Neighborhood Guides - Public read for published, author can edit own
CREATE POLICY "Public can view published guides" ON public.neighborhood_guides FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own guides" ON public.neighborhood_guides FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can create guides" ON public.neighborhood_guides FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own guides" ON public.neighborhood_guides FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Property Questions - Public read, authenticated create
CREATE POLICY "Public can view active questions" ON public.property_questions FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated can create questions" ON public.property_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own questions" ON public.property_questions FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Property Answers
CREATE POLICY "Public can view active answers" ON public.property_answers FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated can create answers" ON public.property_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own answers" ON public.property_answers FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Resident Connections
CREATE POLICY "Public can view available residents" ON public.resident_connections FOR SELECT USING (is_available_for_questions = true);
CREATE POLICY "Residents can manage own connections" ON public.resident_connections FOR ALL TO authenticated USING (auth.uid() = resident_id);

-- Resident Inquiries
CREATE POLICY "Users can view own inquiries" ON public.resident_inquiries FOR SELECT TO authenticated USING (auth.uid() = inquirer_id OR auth.uid() = resident_id);
CREATE POLICY "Authenticated can create inquiries" ON public.resident_inquiries FOR INSERT TO authenticated WITH CHECK (auth.uid() = inquirer_id);
CREATE POLICY "Residents can respond to inquiries" ON public.resident_inquiries FOR UPDATE TO authenticated USING (auth.uid() = resident_id);

-- Local Service Providers
CREATE POLICY "Public can view active providers" ON public.local_service_providers FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can manage own providers" ON public.local_service_providers FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Service Provider Reviews
CREATE POLICY "Public can view active reviews" ON public.service_provider_reviews FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated can create reviews" ON public.service_provider_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Community Events
CREATE POLICY "Public can view upcoming events" ON public.community_events FOR SELECT USING (status IN ('upcoming', 'ongoing', 'completed'));
CREATE POLICY "Organizers can manage own events" ON public.community_events FOR ALL TO authenticated USING (auth.uid() = organizer_id);

-- Event Registrations
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registrations" ON public.event_registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Group Deals
CREATE POLICY "Public can view active deals" ON public.group_deals FOR SELECT USING (status IN ('active', 'target_met'));
CREATE POLICY "Creators can manage own deals" ON public.group_deals FOR ALL TO authenticated USING (auth.uid() = creator_id);

-- Group Deal Participants
CREATE POLICY "Users can view own participations" ON public.group_deal_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can join deals" ON public.group_deal_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Content Reports - Only reporter and moderators
CREATE POLICY "Users can view own reports" ON public.content_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.content_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Community Moderators
CREATE POLICY "Public can view moderators" ON public.community_moderators FOR SELECT USING (is_active = true);

-- Community Contributions
CREATE POLICY "Users can view own contributions" ON public.community_contributions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Community Leaderboard - Public read
CREATE POLICY "Public can view leaderboard" ON public.community_leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can view own leaderboard" ON public.community_leaderboard FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_neighborhood_guides_city ON public.neighborhood_guides(city);
CREATE INDEX idx_neighborhood_guides_status ON public.neighborhood_guides(status);
CREATE INDEX idx_property_questions_property ON public.property_questions(property_id);
CREATE INDEX idx_property_answers_question ON public.property_answers(question_id);
CREATE INDEX idx_resident_connections_property ON public.resident_connections(property_id);
CREATE INDEX idx_local_providers_city ON public.local_service_providers(city);
CREATE INDEX idx_local_providers_category ON public.local_service_providers(category);
CREATE INDEX idx_community_events_city ON public.community_events(city);
CREATE INDEX idx_community_events_start ON public.community_events(start_datetime);
CREATE INDEX idx_group_deals_status ON public.group_deals(status);
CREATE INDEX idx_community_leaderboard_points ON public.community_leaderboard(total_points DESC);

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION public.update_community_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_leaderboard (user_id, total_points, last_contribution_at)
  VALUES (NEW.user_id, NEW.points_earned + COALESCE(NEW.quality_bonus, 0), now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = community_leaderboard.total_points + NEW.points_earned + COALESCE(NEW.quality_bonus, 0),
    last_contribution_at = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_leaderboard_on_contribution
AFTER INSERT ON public.community_contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_community_leaderboard();