-- Quick Wins Viral Growth Campaigns

-- Main campaigns table
CREATE TABLE public.viral_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('referral_milestone', 'listing_competition', 'photo_contest', 'agent_leaderboard', 'first_time_bonus')),
  campaign_name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  goal_target INTEGER,
  current_progress INTEGER DEFAULT 0,
  reward_type TEXT CHECK (reward_type IN ('subscription', 'cash', 'credit', 'tokens', 'badge')),
  reward_value NUMERIC,
  reward_description TEXT,
  rules JSONB,
  eligibility_criteria JSONB,
  total_participants INTEGER DEFAULT 0,
  total_rewards_distributed NUMERIC DEFAULT 0,
  budget NUMERIC,
  spent_budget NUMERIC DEFAULT 0,
  featured_image_url TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referral milestone campaigns (Refer 3 Friends, Get 6 Months Free)
CREATE TABLE public.referral_milestone_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.viral_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrals_required INTEGER NOT NULL DEFAULT 3,
  referrals_completed INTEGER DEFAULT 0,
  referral_codes TEXT[],
  reward_months_free INTEGER DEFAULT 6,
  milestone_reached_at TIMESTAMPTZ,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  subscription_extended_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Listing competition entries
CREATE TABLE public.listing_competition_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.viral_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  listing_quality_score NUMERIC DEFAULT 0,
  photo_count INTEGER DEFAULT 0,
  description_score NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  total_score NUMERIC DEFAULT 0,
  rank INTEGER,
  prize_amount NUMERIC,
  prize_claimed BOOLEAN DEFAULT false,
  prize_claimed_at TIMESTAMPTZ,
  admin_notes TEXT,
  disqualified BOOLEAN DEFAULT false,
  disqualified_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Photo contest entries (Most Beautiful Home)
CREATE TABLE public.photo_contest_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.viral_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id),
  photo_url TEXT NOT NULL,
  photo_title TEXT,
  photo_description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('exterior', 'interior', 'garden', 'view', 'general')),
  vote_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  admin_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 0,
  rank INTEGER,
  prize_amount NUMERIC,
  prize_claimed BOOLEAN DEFAULT false,
  prize_claimed_at TIMESTAMPTZ,
  is_winner BOOLEAN DEFAULT false,
  winner_position INTEGER,
  featured BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Photo contest votes
CREATE TABLE public.photo_contest_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES public.photo_contest_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT DEFAULT 'upvote' CHECK (vote_type IN ('upvote', 'love', 'wow')),
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

-- Agent leaderboard with monthly rewards
CREATE TABLE public.agent_leaderboard_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.viral_campaigns(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  total_listings INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  response_rate NUMERIC DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  reward_tier TEXT CHECK (reward_tier IN ('gold', 'silver', 'bronze', 'top10', 'top50')),
  reward_amount NUMERIC,
  reward_type TEXT,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  badge_earned TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, month_year)
);

-- First-time user bonus tracking
CREATE TABLE public.first_time_user_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.viral_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  bonus_amount NUMERIC NOT NULL DEFAULT 50,
  bonus_type TEXT DEFAULT 'credit' CHECK (bonus_type IN ('credit', 'tokens', 'discount')),
  bonus_code TEXT,
  expires_at TIMESTAMPTZ,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  used_for TEXT,
  transaction_id UUID,
  signup_source TEXT,
  signup_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign analytics
CREATE TABLE public.viral_campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.viral_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  new_participants INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  rewards_distributed NUMERIC DEFAULT 0,
  viral_coefficient NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  referrals_generated INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  cost_per_acquisition NUMERIC,
  roi NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Enable RLS
ALTER TABLE public.viral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_milestone_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_contest_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_leaderboard_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.first_time_user_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Admin policies using admin_users table
CREATE POLICY "Admin full access viral_campaigns" ON public.viral_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin full access referral_milestone" ON public.referral_milestone_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin full access listing_competition" ON public.listing_competition_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin full access photo_contest" ON public.photo_contest_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin full access photo_votes" ON public.photo_contest_votes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin full access agent_leaderboard" ON public.agent_leaderboard_rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin full access first_time_bonus" ON public.first_time_user_bonuses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admin full access campaign_analytics" ON public.viral_campaign_analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- User policies
CREATE POLICY "Users view active campaigns" ON public.viral_campaigns FOR SELECT USING (is_active = true);

CREATE POLICY "Users view own referral progress" ON public.referral_milestone_campaigns FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users join referral campaign" ON public.referral_milestone_campaigns FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own referral" ON public.referral_milestone_campaigns FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users view own listing entries" ON public.listing_competition_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users submit listing entry" ON public.listing_competition_entries FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view approved photos" ON public.photo_contest_entries FOR SELECT USING (approved = true OR user_id = auth.uid());
CREATE POLICY "Users submit photo" ON public.photo_contest_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own photo" ON public.photo_contest_entries FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users vote once per entry" ON public.photo_contest_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view votes" ON public.photo_contest_votes FOR SELECT USING (true);

CREATE POLICY "Users view own leaderboard" ON public.agent_leaderboard_rewards FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Public view leaderboard" ON public.agent_leaderboard_rewards FOR SELECT USING (true);

CREATE POLICY "Users view own bonus" ON public.first_time_user_bonuses FOR SELECT USING (user_id = auth.uid());

-- Seed initial campaigns
INSERT INTO public.viral_campaigns (campaign_type, campaign_name, description, reward_type, reward_value, reward_description, rules, budget, is_active) VALUES
('referral_milestone', 'Refer 3 Friends, Get 6 Months Free', 'Invite 3 friends who sign up and verify their accounts. Get 6 months of Premium subscription absolutely FREE!', 'subscription', 6, '6 Months Premium Free', '{"referrals_required": 3, "verification_required": true, "new_users_only": true}', 50000, true),
('listing_competition', 'Best Property Listing Competition', 'Create the most engaging property listing with high-quality photos and detailed descriptions. Top 10 winners get cash prizes!', 'cash', 5000, 'Cash prizes for top listings', '{"min_photos": 5, "min_description_length": 500, "scoring": ["quality", "engagement", "completeness"]}', 25000, true),
('photo_contest', 'Most Beautiful Home Photo Contest', 'Share stunning photos of your property. The community votes for their favorites. Win amazing prizes!', 'cash', 2500, 'Cash prizes + Featured placement', '{"categories": ["exterior", "interior", "garden", "view"], "voting_period_days": 14, "max_entries_per_user": 3}', 15000, true),
('agent_leaderboard', 'Agent of the Month Awards', 'Top performing agents each month win exclusive rewards, badges, and cash bonuses. Climb the leaderboard!', 'cash', 10000, 'Monthly cash rewards + badges', '{"tiers": {"gold": 5000, "silver": 3000, "bronze": 2000}, "metrics": ["sales", "listings", "reviews"]}', 120000, true),
('first_time_bonus', 'Welcome Bonus - $50 Credit', 'New users get $50 credit to use on any premium feature. Limited time offer!', 'credit', 50, '$50 credit for new users', '{"valid_days": 30, "minimum_action": "complete_profile", "one_per_user": true}', 100000, true);

-- Create indexes
CREATE INDEX idx_viral_campaigns_type ON public.viral_campaigns(campaign_type);
CREATE INDEX idx_viral_campaigns_active ON public.viral_campaigns(is_active);
CREATE INDEX idx_referral_milestone_user ON public.referral_milestone_campaigns(user_id);
CREATE INDEX idx_listing_competition_score ON public.listing_competition_entries(total_score DESC);
CREATE INDEX idx_photo_contest_votes ON public.photo_contest_entries(vote_count DESC);
CREATE INDEX idx_agent_leaderboard_month ON public.agent_leaderboard_rewards(month_year);
CREATE INDEX idx_agent_leaderboard_rank ON public.agent_leaderboard_rewards(rank);
CREATE INDEX idx_first_time_bonus_user ON public.first_time_user_bonuses(user_id);

-- Trigger to update vote counts
CREATE OR REPLACE FUNCTION update_photo_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.photo_contest_entries SET vote_count = vote_count + 1 WHERE id = NEW.entry_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.photo_contest_entries SET vote_count = GREATEST(0, vote_count - 1) WHERE id = OLD.entry_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_photo_vote_change
AFTER INSERT OR DELETE ON public.photo_contest_votes
FOR EACH ROW EXECUTE FUNCTION update_photo_vote_count();

-- Updated at triggers
CREATE TRIGGER update_viral_campaigns_updated_at
BEFORE UPDATE ON public.viral_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_milestone_updated_at
BEFORE UPDATE ON public.referral_milestone_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_competition_updated_at
BEFORE UPDATE ON public.listing_competition_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photo_contest_updated_at
BEFORE UPDATE ON public.photo_contest_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();