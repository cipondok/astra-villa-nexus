-- Fix the can_edit_profile function with correct timestamp comparison
DROP FUNCTION IF EXISTS public.can_edit_profile(uuid);

CREATE OR REPLACE FUNCTION public.can_edit_profile(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record record;
  current_ts timestamp with time zone := now();
  cooldown_days integer;
  days_remaining integer;
  result jsonb;
BEGIN
  SELECT 
    profile_change_count,
    last_profile_change_at,
    profile_locked_until
  INTO profile_record
  FROM profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_edit', true,
      'change_count', 0,
      'days_remaining', 0,
      'message', null,
      'next_cooldown_days', 30,
      'changes_remaining', 3
    );
  END IF;
  
  -- Check if currently locked
  IF profile_record.profile_locked_until IS NOT NULL AND profile_record.profile_locked_until > current_ts THEN
    days_remaining := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (profile_record.profile_locked_until - current_ts)) / 86400)::integer);
    RETURN jsonb_build_object(
      'can_edit', false,
      'change_count', COALESCE(profile_record.profile_change_count, 0),
      'days_remaining', days_remaining,
      'locked_until', profile_record.profile_locked_until,
      'message', 'Profile editing is locked. Please wait ' || days_remaining || ' days or contact support.',
      'next_cooldown_days', CASE 
        WHEN COALESCE(profile_record.profile_change_count, 0) >= 3 THEN 0
        WHEN COALESCE(profile_record.profile_change_count, 0) >= 2 THEN 60
        ELSE 30
      END,
      'changes_remaining', GREATEST(0, 3 - COALESCE(profile_record.profile_change_count, 0))
    );
  END IF;
  
  -- Calculate next cooldown based on change count
  cooldown_days := CASE 
    WHEN COALESCE(profile_record.profile_change_count, 0) >= 3 THEN 0
    WHEN COALESCE(profile_record.profile_change_count, 0) >= 2 THEN 60
    WHEN COALESCE(profile_record.profile_change_count, 0) >= 1 THEN 30
    ELSE 0
  END;
  
  RETURN jsonb_build_object(
    'can_edit', COALESCE(profile_record.profile_change_count, 0) < 3,
    'change_count', COALESCE(profile_record.profile_change_count, 0),
    'days_remaining', 0,
    'message', CASE 
      WHEN COALESCE(profile_record.profile_change_count, 0) >= 3 THEN 'You have reached the maximum profile changes. Please contact support.'
      ELSE null
    END,
    'next_cooldown_days', cooldown_days,
    'changes_remaining', GREATEST(0, 3 - COALESCE(profile_record.profile_change_count, 0))
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_edit_profile(uuid) TO authenticated;