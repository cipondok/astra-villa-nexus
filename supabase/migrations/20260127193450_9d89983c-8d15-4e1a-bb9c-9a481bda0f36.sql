-- =============================================
-- CAMPAIGN 1: REFERRAL PROGRAM
-- =============================================

-- Enhanced referral campaigns table
CREATE TABLE public.referral_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Incentive structure
  referrer_reward_type TEXT NOT NULL DEFAULT 'tokens', -- 'tokens', 'cash', 'discount', 'credits'
  referrer_reward_amount NUMERIC NOT NULL DEFAULT 50,
  referee_reward_type TEXT NOT NULL DEFAULT 'tokens',
  referee_reward_amount NUMERIC NOT NULL DEFAULT 25,
  
  -- Tiers for gamification
  tier_bonuses JSONB DEFAULT '[
    {"tier": 1, "referrals": 5, "bonus_multiplier": 1.2, "badge": "Connector"},
    {"tier": 2, "referrals": 15, "bonus_multiplier": 1.5, "badge": "Networker"},
    {"tier": 3, "referrals": 30, "bonus_multiplier": 2.0, "badge": "Influencer"},
    {"tier": 4, "referrals": 50, "bonus_multiplier": 2.5, "badge": "Ambassador"}
  ]'::jsonb,
  
  -- Sharing mechanisms
  share_channels JSONB DEFAULT '["whatsapp", "instagram", "facebook", "twitter", "email", "link"]'::jsonb,
  share_message_template TEXT DEFAULT 'Join me on ASTRA Villa! Get exclusive property deals and {referee_reward} bonus. Use my code: {referral_code}',
  
  -- Budget tracking
  total_budget NUMERIC DEFAULT 100000000, -- IDR 100M
  spent_budget NUMERIC DEFAULT 0,
  
  -- Success metrics
  target_referrals INTEGER DEFAULT 1000,
  target_conversions INTEGER DEFAULT 300,
  actual_referrals INTEGER DEFAULT 0,
  actual_conversions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Referral tracking with detailed attribution
CREATE TABLE public.referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.referral_campaigns(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL,
  referee_id UUID,
  referral_code TEXT NOT NULL,
  
  -- Tracking data
  click_count INTEGER DEFAULT 0,
  share_channel TEXT, -- whatsapp, facebook, etc.
  landing_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, signed_up, converted, rewarded
  signed_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  
  -- Rewards
  referrer_reward_amount NUMERIC,
  referee_reward_amount NUMERIC,
  bonus_applied NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days')
);

-- =============================================
-- CAMPAIGN 2: UGC CHALLENGE
-- =============================================

CREATE TABLE public.ugc_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL, -- 'dream_home', 'renovation_story', 'neighborhood_love', etc.
  
  -- Timeline
  submission_start TIMESTAMPTZ NOT NULL,
  submission_end TIMESTAMPTZ NOT NULL,
  voting_start TIMESTAMPTZ,
  voting_end TIMESTAMPTZ,
  winners_announced TIMESTAMPTZ,
  
  -- Prizes
  prizes JSONB DEFAULT '[
    {"rank": 1, "title": "Grand Prize", "value": 5000000, "description": "IDR 5M + Featured Profile"},
    {"rank": 2, "title": "Runner Up", "value": 2500000, "description": "IDR 2.5M + Premium Month"},
    {"rank": 3, "title": "Third Place", "value": 1000000, "description": "IDR 1M + Verified Badge"},
    {"rank": "community", "title": "Community Choice", "value": 500000, "description": "IDR 500K + Profile Boost"}
  ]'::jsonb,
  
  -- Rules
  participation_rules JSONB DEFAULT '{
    "min_photos": 3,
    "max_photos": 10,
    "min_description_length": 100,
    "allowed_formats": ["jpg", "png", "mp4"],
    "max_file_size_mb": 50,
    "requires_original_content": true,
    "requires_property_tag": false
  }'::jsonb,
  
  -- Judging
  judging_method TEXT DEFAULT 'hybrid', -- 'community_vote', 'judges', 'hybrid'
  judging_criteria JSONB DEFAULT '[
    {"name": "Creativity", "weight": 30},
    {"name": "Quality", "weight": 25},
    {"name": "Storytelling", "weight": 25},
    {"name": "Engagement", "weight": 20}
  ]'::jsonb,
  
  -- Status & metrics
  status TEXT DEFAULT 'draft', -- draft, active, voting, judging, completed
  total_submissions INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  
  -- Budget
  prize_budget NUMERIC DEFAULT 10000000,
  marketing_budget NUMERIC DEFAULT 5000000,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ugc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.ugc_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of image/video URLs
  property_id UUID, -- Optional link to property
  location TEXT,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Judging scores
  judge_scores JSONB DEFAULT '[]'::jsonb,
  final_score NUMERIC DEFAULT 0,
  rank INTEGER,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, winner
  moderation_notes TEXT,
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ugc_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.ugc_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, user_id)
);

-- =============================================
-- CAMPAIGN 3: LOCAL BUSINESS PARTNERSHIPS
-- =============================================

CREATE TABLE public.partner_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Campaign period
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Partner types targeted
  target_partner_types JSONB DEFAULT '[
    "interior_designer",
    "moving_company",
    "home_insurance",
    "mortgage_broker",
    "furniture_store",
    "cleaning_service",
    "renovation_contractor",
    "smart_home_installer"
  ]'::jsonb,
  
  -- Value proposition
  value_proposition JSONB DEFAULT '{
    "for_partners": ["Access to qualified leads", "Co-branded marketing", "Platform visibility", "Customer insights"],
    "for_platform": ["Additional revenue", "Enhanced user experience", "Content generation", "Market expansion"]
  }'::jsonb,
  
  -- Budget
  marketing_budget NUMERIC DEFAULT 25000000,
  partner_incentive_budget NUMERIC DEFAULT 15000000,
  
  -- Metrics
  target_partners INTEGER DEFAULT 50,
  signed_partners INTEGER DEFAULT 0,
  total_leads_generated INTEGER DEFAULT 0,
  total_revenue_generated NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.business_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.partner_campaigns(id) ON DELETE SET NULL,
  
  -- Business info
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  logo_url TEXT,
  
  -- Location coverage
  service_areas JSONB DEFAULT '[]'::jsonb, -- Array of location IDs
  
  -- Partnership terms
  partnership_tier TEXT DEFAULT 'basic', -- basic, premium, exclusive
  commission_rate NUMERIC DEFAULT 5, -- percentage
  lead_cost NUMERIC DEFAULT 50000, -- cost per qualified lead
  
  -- Co-marketing
  co_marketing_approved BOOLEAN DEFAULT false,
  marketing_materials JSONB DEFAULT '[]'::jsonb,
  featured_on_platform BOOLEAN DEFAULT false,
  
  -- Performance
  leads_received INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  customer_rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, active, suspended, terminated
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.partner_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.business_partners(id) ON DELETE CASCADE,
  user_id UUID,
  property_id UUID,
  
  -- Lead info
  lead_type TEXT NOT NULL, -- consultation, quote, service_request
  lead_source TEXT, -- property_page, checkout, recommendation
  
  -- Contact details
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  preferred_contact_method TEXT DEFAULT 'whatsapp',
  
  -- Request details
  service_needed TEXT,
  budget_range TEXT,
  timeline TEXT,
  notes TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
  partner_response_time INTEGER, -- minutes
  conversion_value NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;

-- Referral campaigns - public read
CREATE POLICY "Anyone can view active referral campaigns"
  ON public.referral_campaigns FOR SELECT
  USING (is_active = true);

-- Referral tracking - users can see their own
CREATE POLICY "Users can view own referral tracking"
  ON public.referral_tracking FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referral tracking"
  ON public.referral_tracking FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- UGC challenges - public read
CREATE POLICY "Anyone can view active challenges"
  ON public.ugc_challenges FOR SELECT
  USING (status IN ('active', 'voting', 'completed'));

-- UGC submissions - public read approved, users manage own
CREATE POLICY "Anyone can view approved submissions"
  ON public.ugc_submissions FOR SELECT
  USING (status IN ('approved', 'winner') OR auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON public.ugc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON public.ugc_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- UGC votes - authenticated users
CREATE POLICY "Authenticated users can vote"
  ON public.ugc_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all votes"
  ON public.ugc_votes FOR SELECT
  USING (true);

-- Partner campaigns - public read
CREATE POLICY "Anyone can view active partner campaigns"
  ON public.partner_campaigns FOR SELECT
  USING (is_active = true);

-- Business partners - public read active
CREATE POLICY "Anyone can view active partners"
  ON public.business_partners FOR SELECT
  USING (status = 'active');

-- Partner leads - partners and users see own
CREATE POLICY "Users can create partner leads"
  ON public.partner_leads FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX idx_referral_tracking_referrer ON public.referral_tracking(referrer_id);
CREATE INDEX idx_referral_tracking_code ON public.referral_tracking(referral_code);
CREATE INDEX idx_referral_tracking_status ON public.referral_tracking(status);
CREATE INDEX idx_ugc_submissions_challenge ON public.ugc_submissions(challenge_id);
CREATE INDEX idx_ugc_submissions_user ON public.ugc_submissions(user_id);
CREATE INDEX idx_ugc_votes_submission ON public.ugc_votes(submission_id);
CREATE INDEX idx_business_partners_type ON public.business_partners(business_type);
CREATE INDEX idx_partner_leads_partner ON public.partner_leads(partner_id);