-- =====================================================
-- GAMIFICATION SYSTEM - Complete Implementation
-- =====================================================

-- 1. GAMIFICATION CONFIG TABLE (Admin-managed settings)
CREATE TABLE public.gamification_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default XP values for actions
INSERT INTO public.gamification_config (config_key, config_value, description) VALUES
('xp_daily_login', '{"xp": 5}', 'XP earned for daily login'),
('xp_complete_profile', '{"xp": 100}', 'XP for completing profile'),
('xp_list_property', '{"agent": 50, "homeowner": 75}', 'XP for listing a property'),
('xp_property_viewed', '{"xp": 2}', 'XP when your property is viewed'),
('xp_inquiry_received', '{"xp": 10}', 'XP when receiving an inquiry'),
('xp_save_property', '{"xp": 3}', 'XP for saving a property'),
('xp_send_inquiry', '{"xp": 10}', 'XP for sending an inquiry'),
('xp_book_viewing', '{"agent": 15, "searcher": 20}', 'XP for booking/receiving a viewing'),
('xp_write_review', '{"xp": 25}', 'XP for writing a review'),
('xp_referral_signup', '{"agent": 100, "homeowner": 100, "searcher": 50}', 'XP for successful referral'),
('xp_share_listing', '{"agent": 5, "homeowner": 10, "searcher": 5}', 'XP for sharing a listing'),
('level_thresholds', '{"levels": [0, 100, 300, 600, 1000, 2000, 4000, 7500, 12000, 20000]}', 'XP thresholds for each level');

-- 2. USER GAMIFICATION STATS TABLE
CREATE TABLE public.user_gamification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  total_logins INTEGER DEFAULT 0,
  user_type TEXT DEFAULT 'searcher', -- 'agent', 'homeowner', 'searcher'
  properties_listed INTEGER DEFAULT 0,
  inquiries_sent INTEGER DEFAULT 0,
  inquiries_received INTEGER DEFAULT 0,
  reviews_written INTEGER DEFAULT 0,
  properties_saved INTEGER DEFAULT 0,
  properties_shared INTEGER DEFAULT 0,
  viewings_booked INTEGER DEFAULT 0,
  referrals_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. XP TRANSACTIONS LOG
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  description TEXT,
  reference_id UUID, -- Optional reference to related entity
  reference_type TEXT, -- 'property', 'review', 'inquiry', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BADGES DEFINITION TABLE
CREATE TABLE public.badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Emoji or icon name
  category TEXT NOT NULL, -- 'universal', 'agent', 'homeowner', 'searcher'
  criteria JSONB NOT NULL, -- Earning criteria
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert all badge definitions
INSERT INTO public.badge_definitions (badge_key, name, description, icon, category, criteria, xp_reward, display_order) VALUES
-- Universal Badges
('first_steps', 'First Steps', 'Complete your profile', '🌟', 'universal', '{"type": "profile_complete", "threshold": 100}', 50, 1),
('hot_streak', 'Hot Streak', 'Login 7 days in a row', '🔥', 'universal', '{"type": "login_streak", "threshold": 7}', 100, 2),
('lightning', 'Lightning', 'Login 30 days in a row', '⚡', 'universal', '{"type": "login_streak", "threshold": 30}', 500, 3),
('engaged', 'Engaged', '50 platform interactions', '🎯', 'universal', '{"type": "total_interactions", "threshold": 50}', 75, 4),
('veteran', 'Veteran', '1 year membership', '🏅', 'universal', '{"type": "membership_days", "threshold": 365}', 1000, 5),

-- Agent Badges
('listing_pro', 'Listing Pro', '10 active listings', '🏠', 'agent', '{"type": "properties_listed", "threshold": 10}', 200, 10),
('premium_agent', 'Premium Agent', '5 featured listings', '💎', 'agent', '{"type": "featured_listings", "threshold": 5}', 300, 11),
('closer', 'Closer', '5 successful deals', '🤝', 'agent', '{"type": "deals_closed", "threshold": 5}', 500, 12),
('five_star_agent', '5-Star Agent', '10 five-star reviews', '⭐', 'agent', '{"type": "five_star_reviews", "threshold": 10}', 400, 13),
('fast_responder', 'Fast Responder', 'Under 1hr average response time', '🚀', 'agent', '{"type": "avg_response_time", "threshold": 60}', 200, 14),
('top_ten', 'Top 10', 'Appear on weekly leaderboard', '👑', 'agent', '{"type": "leaderboard_appearance", "threshold": 1}', 250, 15),

-- Homeowner Badges
('photo_pro', 'Photo Pro', 'Upload 10+ quality photos', '📸', 'homeowner', '{"type": "photos_uploaded", "threshold": 10}', 100, 20),
('market_watcher', 'Market Watcher', 'Check analytics 10 times', '📊', 'homeowner', '{"type": "analytics_views", "threshold": 10}', 75, 21),
('responsive_seller', 'Responsive', 'Reply to 10 inquiries', '💬', 'homeowner', '{"type": "inquiries_replied", "threshold": 10}', 150, 22),
('curator', 'Curator', 'Complete a virtual tour', '🎨', 'homeowner', '{"type": "virtual_tour_complete", "threshold": 1}', 200, 23),
('engaged_seller', 'Engaged Seller', 'Share listing 5 times', '🔔', 'homeowner', '{"type": "listings_shared", "threshold": 5}', 75, 24),

-- Searcher Badges
('explorer', 'Explorer', 'View 50 properties', '🔍', 'searcher', '{"type": "properties_viewed", "threshold": 50}', 100, 30),
('collector', 'Collector', 'Save 25 properties', '❤️', 'searcher', '{"type": "properties_saved", "threshold": 25}', 100, 31),
('active_buyer', 'Active Buyer', 'Send 10 inquiries', '📝', 'searcher', '{"type": "inquiries_sent", "threshold": 10}', 150, 32),
('scheduler', 'Scheduler', 'Book 5 viewings', '🗓️', 'searcher', '{"type": "viewings_booked", "threshold": 5}', 200, 33),
('decisive', 'Decisive', 'Complete a transaction', '🏆', 'searcher', '{"type": "transaction_complete", "threshold": 1}', 500, 34);

-- 5. USER BADGES (Earned badges)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badge_definitions(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  is_displayed BOOLEAN DEFAULT true, -- User can choose to display
  is_new BOOLEAN DEFAULT true, -- For notification purposes
  UNIQUE(user_id, badge_id)
);

-- 6. LEADERBOARD SNAPSHOTS (Weekly/Monthly)
CREATE TABLE public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category TEXT NOT NULL, -- 'top_agents', 'rising_stars', 'most_helpful', 'area_champion', 'engagement'
  area TEXT, -- For area-specific leaderboards
  rankings JSONB NOT NULL, -- Array of {user_id, rank, score, user_name, avatar_url}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. USER ACHIEVEMENTS LOG (For social sharing)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL, -- 'badge_earned', 'level_up', 'leaderboard', 'milestone'
  achievement_data JSONB NOT NULL,
  share_text TEXT,
  share_image_url TEXT,
  is_shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. USER PROFILE FRAMES/STATUS SYMBOLS
CREATE TABLE public.user_status_symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_frame TEXT DEFAULT 'default', -- 'default', 'bronze', 'silver', 'gold', 'platinum', 'diamond'
  title_override TEXT, -- Custom title if earned
  flair_badges TEXT[] DEFAULT '{}', -- Array of badge_keys to display
  show_level BOOLEAN DEFAULT true,
  show_xp BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_user_gamification_stats_user_id ON public.user_gamification_stats(user_id);
CREATE INDEX idx_user_gamification_stats_total_xp ON public.user_gamification_stats(total_xp DESC);
CREATE INDEX idx_user_gamification_stats_level ON public.user_gamification_stats(current_level DESC);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_leaderboard_snapshots_period ON public.leaderboard_snapshots(period_type, period_start);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.gamification_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_status_symbols ENABLE ROW LEVEL SECURITY;

-- Gamification config: Anyone can read, only admins can modify
CREATE POLICY "Anyone can read gamification config" ON public.gamification_config FOR SELECT USING (true);

-- User gamification stats: Users can read their own, public stats are visible
CREATE POLICY "Users can read own gamification stats" ON public.user_gamification_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own gamification stats" ON public.user_gamification_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert gamification stats" ON public.user_gamification_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP transactions: Users can read their own
CREATE POLICY "Users can read own XP transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert XP transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badge definitions: Anyone can read
CREATE POLICY "Anyone can read badge definitions" ON public.badge_definitions FOR SELECT USING (true);

-- User badges: Public read, users can update display preference
CREATE POLICY "Anyone can read user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can update own badge display" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert user badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard snapshots: Public read
CREATE POLICY "Anyone can read leaderboards" ON public.leaderboard_snapshots FOR SELECT USING (true);

-- User achievements: Users can read their own, public for shared
CREATE POLICY "Users can read achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id OR is_shared = true);
CREATE POLICY "Users can update own achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User status symbols: Public read, users can update their own
CREATE POLICY "Anyone can read status symbols" ON public.user_status_symbols FOR SELECT USING (true);
CREATE POLICY "Users can update own status symbols" ON public.user_status_symbols FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own status symbols" ON public.user_status_symbols FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(p_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  levels INTEGER[] := ARRAY[0, 100, 300, 600, 1000, 2000, 4000, 7500, 12000, 20000];
  i INTEGER;
BEGIN
  FOR i IN REVERSE 10..1 LOOP
    IF p_xp >= levels[i] THEN
      RETURN i;
    END IF;
  END LOOP;
  RETURN 1;
END;
$$;

-- Function to award XP and update stats
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_action_type TEXT,
  p_xp_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_xp INTEGER;
  v_leveled_up BOOLEAN := false;
BEGIN
  -- Get current stats
  SELECT current_level, total_xp INTO v_old_level, v_new_xp
  FROM user_gamification_stats
  WHERE user_id = p_user_id;

  -- Create stats record if doesn't exist
  IF v_old_level IS NULL THEN
    INSERT INTO user_gamification_stats (user_id, total_xp, current_level)
    VALUES (p_user_id, 0, 1);
    v_old_level := 1;
    v_new_xp := 0;
  END IF;

  -- Calculate new XP and level
  v_new_xp := v_new_xp + p_xp_amount;
  v_new_level := calculate_level_from_xp(v_new_xp);
  v_leveled_up := v_new_level > v_old_level;

  -- Update stats
  UPDATE user_gamification_stats
  SET 
    total_xp = v_new_xp,
    current_level = v_new_level,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO xp_transactions (user_id, action_type, xp_amount, description, reference_id, reference_type)
  VALUES (p_user_id, p_action_type, p_xp_amount, p_description, p_reference_id, p_reference_type);

  -- Record level up achievement if applicable
  IF v_leveled_up THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data, share_text)
    VALUES (
      p_user_id, 
      'level_up', 
      jsonb_build_object('old_level', v_old_level, 'new_level', v_new_level, 'total_xp', v_new_xp),
      'I just reached Level ' || v_new_level || ' on Astra Villa! 🎉'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'new_total_xp', v_new_xp,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up
  );
END;
$$;

-- Function to process daily login
CREATE OR REPLACE FUNCTION public.process_daily_login(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_login DATE;
  v_current_streak INTEGER;
  v_xp_earned INTEGER := 5;
  v_streak_bonus INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Get current stats
  SELECT last_login_date, current_streak INTO v_last_login, v_current_streak
  FROM user_gamification_stats
  WHERE user_id = p_user_id;

  -- Create stats if doesn't exist
  IF v_last_login IS NULL THEN
    INSERT INTO user_gamification_stats (user_id, last_login_date, current_streak, total_logins)
    VALUES (p_user_id, CURRENT_DATE, 1, 1);
    v_current_streak := 1;
  ELSE
    -- Already logged in today
    IF v_last_login = CURRENT_DATE THEN
      RETURN jsonb_build_object('already_claimed', true, 'current_streak', v_current_streak);
    END IF;

    -- Check if streak continues
    IF v_last_login = CURRENT_DATE - 1 THEN
      v_current_streak := COALESCE(v_current_streak, 0) + 1;
      -- Streak bonuses
      IF v_current_streak = 7 THEN v_streak_bonus := 25; END IF;
      IF v_current_streak = 30 THEN v_streak_bonus := 100; END IF;
    ELSE
      v_current_streak := 1;
    END IF;

    UPDATE user_gamification_stats
    SET 
      last_login_date = CURRENT_DATE,
      current_streak = v_current_streak,
      longest_streak = GREATEST(longest_streak, v_current_streak),
      total_logins = total_logins + 1,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Award XP
  v_result := award_xp(p_user_id, 'daily_login', v_xp_earned + v_streak_bonus, 'Daily login bonus');

  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', v_xp_earned + v_streak_bonus,
    'streak_bonus', v_streak_bonus,
    'current_streak', v_current_streak,
    'result', v_result
  );
END;
$$;

-- Function to award badge
CREATE OR REPLACE FUNCTION public.award_badge(p_user_id UUID, p_badge_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_id UUID;
  v_badge_name TEXT;
  v_xp_reward INTEGER;
  v_already_earned BOOLEAN;
BEGIN
  -- Get badge info
  SELECT id, name, xp_reward INTO v_badge_id, v_badge_name, v_xp_reward
  FROM badge_definitions
  WHERE badge_key = p_badge_key AND is_active = true;

  IF v_badge_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Badge not found');
  END IF;

  -- Check if already earned
  SELECT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id)
  INTO v_already_earned;

  IF v_already_earned THEN
    RETURN jsonb_build_object('success', false, 'already_earned', true);
  END IF;

  -- Award badge
  INSERT INTO user_badges (user_id, badge_id)
  VALUES (p_user_id, v_badge_id);

  -- Award XP if any
  IF v_xp_reward > 0 THEN
    PERFORM award_xp(p_user_id, 'badge_earned', v_xp_reward, 'Earned badge: ' || v_badge_name);
  END IF;

  -- Record achievement
  INSERT INTO user_achievements (user_id, achievement_type, achievement_data, share_text)
  VALUES (
    p_user_id,
    'badge_earned',
    jsonb_build_object('badge_key', p_badge_key, 'badge_name', v_badge_name),
    'I just earned the ' || v_badge_name || ' badge on Astra Villa! 🏆'
  );

  RETURN jsonb_build_object(
    'success', true,
    'badge_key', p_badge_key,
    'badge_name', v_badge_name,
    'xp_reward', v_xp_reward
  );
END;
$$;