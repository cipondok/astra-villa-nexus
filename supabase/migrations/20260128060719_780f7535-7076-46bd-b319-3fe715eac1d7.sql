-- Fix the process_daily_login function to handle users who have stats but null last_login_date
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
  v_stats_exist BOOLEAN;
BEGIN
  -- Check if stats exist for user
  SELECT EXISTS(
    SELECT 1 FROM user_gamification_stats WHERE user_id = p_user_id
  ) INTO v_stats_exist;

  -- Get current stats if they exist
  IF v_stats_exist THEN
    SELECT last_login_date, current_streak INTO v_last_login, v_current_streak
    FROM user_gamification_stats
    WHERE user_id = p_user_id;
  END IF;

  -- Create stats if doesn't exist
  IF NOT v_stats_exist THEN
    INSERT INTO user_gamification_stats (user_id, last_login_date, current_streak, total_logins)
    VALUES (p_user_id, CURRENT_DATE, 1, 1);
    v_current_streak := 1;
  ELSE
    -- Already logged in today
    IF v_last_login = CURRENT_DATE THEN
      RETURN jsonb_build_object('already_claimed', true, 'current_streak', v_current_streak);
    END IF;

    -- Check if streak continues (yesterday login)
    IF v_last_login = CURRENT_DATE - 1 THEN
      v_current_streak := COALESCE(v_current_streak, 0) + 1;
      -- Streak bonuses
      IF v_current_streak = 7 THEN v_streak_bonus := 25; END IF;
      IF v_current_streak = 30 THEN v_streak_bonus := 100; END IF;
    ELSE
      -- New streak or first login
      v_current_streak := 1;
    END IF;

    UPDATE user_gamification_stats
    SET 
      last_login_date = CURRENT_DATE,
      current_streak = v_current_streak,
      longest_streak = GREATEST(COALESCE(longest_streak, 0), v_current_streak),
      total_logins = COALESCE(total_logins, 0) + 1,
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