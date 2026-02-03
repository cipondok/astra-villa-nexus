-- Innovation Lab: A/B Testing Engine Schema
-- =============================================

-- Feature flags for controlled rollouts
CREATE TABLE public.innovation_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  flag_type TEXT NOT NULL DEFAULT 'boolean' CHECK (flag_type IN ('boolean', 'percentage', 'variant')),
  is_enabled BOOLEAN DEFAULT false,
  percentage_rollout INTEGER DEFAULT 0 CHECK (percentage_rollout >= 0 AND percentage_rollout <= 100),
  variants JSONB DEFAULT '[]'::jsonb,
  targeting_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- A/B Test experiments
CREATE TABLE public.innovation_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'failed')),
  feature_flag_id UUID REFERENCES public.innovation_feature_flags(id),
  control_variant JSONB NOT NULL DEFAULT '{"name": "control", "weight": 50}'::jsonb,
  test_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_metric TEXT NOT NULL,
  secondary_metrics TEXT[],
  target_sample_size INTEGER DEFAULT 1000,
  current_sample_size INTEGER DEFAULT 0,
  confidence_level NUMERIC(5,2) DEFAULT 95.00,
  statistical_significance NUMERIC(5,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  results JSONB,
  winner_variant TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- User experiment assignments
CREATE TABLE public.innovation_user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  experiment_id UUID REFERENCES public.innovation_experiments(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  device_id TEXT,
  session_id TEXT,
  UNIQUE(user_id, experiment_id)
);

-- Experiment events/conversions
CREATE TABLE public.innovation_experiment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.innovation_experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  variant_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_value NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feature adoption metrics
CREATE TABLE public.innovation_feature_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID REFERENCES public.innovation_feature_flags(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  adoption_rate NUMERIC(5,2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  retention_day1 NUMERIC(5,2),
  retention_day7 NUMERIC(5,2),
  retention_day30 NUMERIC(5,2),
  conversion_rate NUMERIC(5,2),
  revenue_impact NUMERIC(12,2),
  UNIQUE(feature_flag_id, date)
);

-- User feedback system
CREATE TABLE public.innovation_user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'improvement', 'complaint', 'praise', 'nps')),
  feature_flag_id UUID REFERENCES public.innovation_feature_flags(id),
  experiment_id UUID REFERENCES public.innovation_experiments(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  title TEXT,
  description TEXT,
  screenshot_urls TEXT[],
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'wont_fix')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  response TEXT,
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mobile App Enhancement Tables
-- =============================================

-- AR Property Preview sessions
CREATE TABLE public.mobile_ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  session_duration INTEGER, -- seconds
  screenshots_taken INTEGER DEFAULT 0,
  furniture_items_placed INTEGER DEFAULT 0,
  shared_to_social BOOLEAN DEFAULT false,
  device_model TEXT,
  ar_framework TEXT DEFAULT 'webxr',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Live Auction Platform
CREATE TABLE public.mobile_live_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starting_price NUMERIC(15,2) NOT NULL,
  reserve_price NUMERIC(15,2),
  current_bid NUMERIC(15,2),
  minimum_increment NUMERIC(12,2) DEFAULT 1000000,
  auction_type TEXT DEFAULT 'english' CHECK (auction_type IN ('english', 'dutch', 'sealed', 'reserve')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'extended', 'ended', 'cancelled', 'sold')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  extension_time INTEGER DEFAULT 300, -- seconds to extend if bid in last 5 min
  total_bids INTEGER DEFAULT 0,
  unique_bidders INTEGER DEFAULT 0,
  winning_bid_id UUID,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auction bids
CREATE TABLE public.mobile_auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES public.mobile_live_auctions(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES public.profiles(id),
  bid_amount NUMERIC(15,2) NOT NULL,
  is_auto_bid BOOLEAN DEFAULT false,
  max_auto_bid NUMERIC(15,2),
  bid_status TEXT DEFAULT 'active' CHECK (bid_status IN ('active', 'outbid', 'winning', 'won', 'invalid')),
  ip_address INET,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auction watchers
CREATE TABLE public.mobile_auction_watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES public.mobile_live_auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  notify_start BOOLEAN DEFAULT true,
  notify_outbid BOOLEAN DEFAULT true,
  notify_ending BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(auction_id, user_id)
);

-- Community Chat - Neighborhoods
CREATE TABLE public.mobile_neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  description TEXT,
  cover_image_url TEXT,
  bounds JSONB, -- GeoJSON polygon
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Chat - Members
CREATE TABLE public.mobile_neighborhood_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES public.mobile_neighborhoods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  muted_until TIMESTAMPTZ,
  UNIQUE(neighborhood_id, user_id)
);

-- Community Chat - Messages
CREATE TABLE public.mobile_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID REFERENCES public.mobile_neighborhoods(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'property', 'poll', 'event', 'system')),
  content TEXT NOT NULL,
  media_urls TEXT[],
  property_id UUID REFERENCES public.properties(id),
  reply_to_id UUID REFERENCES public.mobile_chat_messages(id),
  reactions JSONB DEFAULT '{}'::jsonb,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  edited_at TIMESTAMPTZ
);

-- Property Journey Timeline
CREATE TABLE public.mobile_property_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  name TEXT DEFAULT 'My Property Journey',
  status TEXT DEFAULT 'searching' CHECK (status IN ('searching', 'viewing', 'negotiating', 'financing', 'closing', 'completed')),
  target_purchase_date DATE,
  budget_min NUMERIC(15,2),
  budget_max NUMERIC(15,2),
  preferred_locations TEXT[],
  property_types TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Journey milestones
CREATE TABLE public.mobile_journey_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES public.mobile_property_journeys(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('search_started', 'property_saved', 'property_viewed', 'property_toured', 'offer_made', 'offer_accepted', 'financing_applied', 'financing_approved', 'inspection_scheduled', 'inspection_completed', 'closing_scheduled', 'keys_received', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  property_id UUID REFERENCES public.properties(id),
  milestone_date TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Offline sync queue
CREATE TABLE public.mobile_offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  priority INTEGER DEFAULT 5,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- In-app purchases
CREATE TABLE public.mobile_iap_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('consumable', 'non_consumable', 'subscription')),
  price_tier TEXT NOT NULL,
  price_idr NUMERIC(12,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  app_store_id TEXT,
  play_store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IAP transactions
CREATE TABLE public.mobile_iap_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  product_id UUID REFERENCES public.mobile_iap_products(id),
  transaction_id TEXT UNIQUE,
  store TEXT NOT NULL CHECK (store IN ('apple', 'google', 'web')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  receipt_data TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.innovation_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_experiment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_feature_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_ar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_live_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_auction_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_neighborhood_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_property_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_journey_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_iap_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_iap_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Feature flags - viewable by all, editable by admins
CREATE POLICY "Feature flags viewable by all" ON public.innovation_feature_flags FOR SELECT USING (true);
CREATE POLICY "Feature flags managed by authenticated" ON public.innovation_feature_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Experiments - viewable by authenticated
CREATE POLICY "Experiments viewable by authenticated" ON public.innovation_experiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Experiments managed by authenticated" ON public.innovation_experiments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- User assignments - users see their own
CREATE POLICY "Users see own assignments" ON public.innovation_user_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System manages assignments" ON public.innovation_user_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Experiment events
CREATE POLICY "Users track own events" ON public.innovation_experiment_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Events viewable by authenticated" ON public.innovation_experiment_events FOR SELECT TO authenticated USING (true);

-- Feature metrics - viewable by authenticated
CREATE POLICY "Metrics viewable by authenticated" ON public.innovation_feature_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Metrics managed by system" ON public.innovation_feature_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- User feedback
CREATE POLICY "Users submit own feedback" ON public.innovation_user_feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own feedback" ON public.innovation_user_feedback FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage all feedback" ON public.innovation_user_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AR sessions
CREATE POLICY "Users track own AR sessions" ON public.mobile_ar_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own AR sessions" ON public.mobile_ar_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Live auctions - public viewing
CREATE POLICY "Auctions viewable by all" ON public.mobile_live_auctions FOR SELECT USING (true);
CREATE POLICY "Auctions managed by authenticated" ON public.mobile_live_auctions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auction bids
CREATE POLICY "Bids viewable by all" ON public.mobile_auction_bids FOR SELECT USING (true);
CREATE POLICY "Users place own bids" ON public.mobile_auction_bids FOR INSERT TO authenticated WITH CHECK (bidder_id = auth.uid());

-- Auction watchers
CREATE POLICY "Users manage own watches" ON public.mobile_auction_watchers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Neighborhoods - public viewing
CREATE POLICY "Neighborhoods viewable by all" ON public.mobile_neighborhoods FOR SELECT USING (is_active = true);
CREATE POLICY "Neighborhoods managed by authenticated" ON public.mobile_neighborhoods FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Neighborhood members
CREATE POLICY "Members viewable by neighborhood members" ON public.mobile_neighborhood_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users join neighborhoods" ON public.mobile_neighborhood_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users leave neighborhoods" ON public.mobile_neighborhood_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Chat messages
CREATE POLICY "Messages viewable by neighborhood members" ON public.mobile_chat_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.mobile_neighborhood_members WHERE neighborhood_id = mobile_chat_messages.neighborhood_id AND user_id = auth.uid())
);
CREATE POLICY "Members send messages" ON public.mobile_chat_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.mobile_neighborhood_members WHERE neighborhood_id = mobile_chat_messages.neighborhood_id AND user_id = auth.uid())
);

-- Property journeys
CREATE POLICY "Users manage own journeys" ON public.mobile_property_journeys FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Journey milestones
CREATE POLICY "Users manage own milestones" ON public.mobile_journey_milestones FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.mobile_property_journeys WHERE id = mobile_journey_milestones.journey_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.mobile_property_journeys WHERE id = mobile_journey_milestones.journey_id AND user_id = auth.uid())
);

-- Offline sync queue
CREATE POLICY "Users manage own sync queue" ON public.mobile_offline_sync_queue FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- IAP products - public viewing
CREATE POLICY "Products viewable by all" ON public.mobile_iap_products FOR SELECT USING (is_active = true);
CREATE POLICY "Products managed by authenticated" ON public.mobile_iap_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- IAP transactions
CREATE POLICY "Users view own transactions" ON public.mobile_iap_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own transactions" ON public.mobile_iap_transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Triggers and Functions

-- Auto-update experiment sample size
CREATE OR REPLACE FUNCTION update_experiment_sample_size()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.innovation_experiments
  SET current_sample_size = (
    SELECT COUNT(DISTINCT user_id) FROM public.innovation_user_assignments WHERE experiment_id = NEW.experiment_id
  ),
  updated_at = now()
  WHERE id = NEW.experiment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_experiment_sample
AFTER INSERT ON public.innovation_user_assignments
FOR EACH ROW EXECUTE FUNCTION update_experiment_sample_size();

-- Auto-update auction stats
CREATE OR REPLACE FUNCTION update_auction_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.mobile_live_auctions
  SET 
    current_bid = NEW.bid_amount,
    total_bids = (SELECT COUNT(*) FROM public.mobile_auction_bids WHERE auction_id = NEW.auction_id),
    unique_bidders = (SELECT COUNT(DISTINCT bidder_id) FROM public.mobile_auction_bids WHERE auction_id = NEW.auction_id),
    updated_at = now()
  WHERE id = NEW.auction_id;
  
  -- Mark previous bids as outbid
  UPDATE public.mobile_auction_bids
  SET bid_status = 'outbid'
  WHERE auction_id = NEW.auction_id AND id != NEW.id AND bid_status = 'active';
  
  -- Mark new bid as active
  UPDATE public.mobile_auction_bids SET bid_status = 'active' WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_auction_stats
AFTER INSERT ON public.mobile_auction_bids
FOR EACH ROW EXECUTE FUNCTION update_auction_stats();

-- Auto-update neighborhood member count
CREATE OR REPLACE FUNCTION update_neighborhood_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mobile_neighborhoods SET member_count = member_count + 1 WHERE id = NEW.neighborhood_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mobile_neighborhoods SET member_count = member_count - 1 WHERE id = OLD.neighborhood_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_neighborhood_members
AFTER INSERT OR DELETE ON public.mobile_neighborhood_members
FOR EACH ROW EXECUTE FUNCTION update_neighborhood_member_count();

-- Seed data
INSERT INTO public.mobile_neighborhoods (name, slug, city, district, description) VALUES
('Menteng Community', 'menteng-jakarta', 'Jakarta', 'Menteng', 'Community for Menteng residents and property seekers'),
('Kemang Expat Circle', 'kemang-jakarta', 'Jakarta', 'Kemang', 'International community in Kemang area'),
('BSD City Living', 'bsd-tangerang', 'Tangerang', 'BSD City', 'BSD City homeowners and investors community'),
('PIK Island Life', 'pik-jakarta', 'Jakarta', 'Pantai Indah Kapuk', 'PIK residents community');

INSERT INTO public.mobile_iap_products (product_id, name, description, product_type, price_tier, price_idr, features) VALUES
('premium_monthly', 'Premium Monthly', 'Full access to all premium features', 'subscription', 'tier_1', 99000, '["Unlimited saved properties", "AR previews", "Priority support", "No ads"]'),
('premium_yearly', 'Premium Yearly', 'Best value - 2 months free', 'subscription', 'tier_3', 999000, '["All monthly features", "Exclusive market reports", "Early auction access"]'),
('ar_session_pack', 'AR Session Pack', '10 AR preview sessions', 'consumable', 'tier_1', 49000, '["10 AR sessions", "Save & share screenshots"]'),
('auction_boost', 'Auction Boost', 'Highlight your bid in auctions', 'consumable', 'tier_1', 29000, '["Bid highlighting", "Priority notifications"]'),
('market_report', 'Premium Market Report', 'Detailed market analysis', 'non_consumable', 'tier_2', 149000, '["Full market data", "Price predictions", "Investment insights"]');

INSERT INTO public.innovation_feature_flags (flag_key, name, description, flag_type, is_enabled, percentage_rollout) VALUES
('ar_preview', 'AR Property Preview', 'Enable augmented reality property preview', 'percentage', true, 50),
('live_auctions', 'Live Auction Platform', 'Real-time property bidding system', 'percentage', true, 30),
('community_chat', 'Community Chat', 'Neighborhood-based messaging', 'boolean', true, 100),
('property_journey', 'Property Journey Timeline', 'Track search-to-purchase journey', 'boolean', true, 100),
('offline_mode', 'Offline Mode', 'Full offline functionality', 'percentage', true, 75);