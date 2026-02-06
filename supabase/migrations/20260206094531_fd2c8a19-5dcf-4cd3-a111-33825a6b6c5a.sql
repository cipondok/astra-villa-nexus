-- Add profile change tracking columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_change_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_change_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS profile_locked_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS profile_change_history jsonb DEFAULT '[]'::jsonb;

-- Create function to check if profile can be edited
CREATE OR REPLACE FUNCTION public.can_edit_profile(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record record;
  current_time timestamp with time zone := now();
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
      'next_cooldown_days', 30
    );
  END IF;
  
  -- Check if currently locked
  IF profile_record.profile_locked_until IS NOT NULL AND profile_record.profile_locked_until > current_time THEN
    days_remaining := CEIL(EXTRACT(EPOCH FROM (profile_record.profile_locked_until - current_time)) / 86400);
    RETURN jsonb_build_object(
      'can_edit', false,
      'change_count', profile_record.profile_change_count,
      'days_remaining', days_remaining,
      'locked_until', profile_record.profile_locked_until,
      'message', 'Profile editing is locked. Please wait ' || days_remaining || ' days or contact support.',
      'next_cooldown_days', CASE 
        WHEN profile_record.profile_change_count >= 3 THEN 0  -- Must contact support
        WHEN profile_record.profile_change_count >= 2 THEN 60
        ELSE 30
      END
    );
  END IF;
  
  -- Calculate next cooldown based on change count
  cooldown_days := CASE 
    WHEN profile_record.profile_change_count >= 3 THEN 0  -- Must contact support
    WHEN profile_record.profile_change_count >= 2 THEN 60
    WHEN profile_record.profile_change_count >= 1 THEN 30
    ELSE 0
  END;
  
  RETURN jsonb_build_object(
    'can_edit', profile_record.profile_change_count < 3,
    'change_count', COALESCE(profile_record.profile_change_count, 0),
    'days_remaining', 0,
    'message', CASE 
      WHEN profile_record.profile_change_count >= 3 THEN 'You have reached the maximum profile changes. Please contact support.'
      ELSE null
    END,
    'next_cooldown_days', cooldown_days,
    'changes_remaining', GREATEST(0, 3 - COALESCE(profile_record.profile_change_count, 0))
  );
END;
$$;

-- Create function to record profile change
CREATE OR REPLACE FUNCTION public.record_profile_change(
  user_id uuid,
  changed_fields text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record record;
  new_count integer;
  cooldown_days integer;
  lock_until timestamp with time zone;
  change_entry jsonb;
BEGIN
  SELECT 
    profile_change_count,
    profile_change_history
  INTO profile_record
  FROM profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  new_count := COALESCE(profile_record.profile_change_count, 0) + 1;
  
  -- Calculate cooldown period
  cooldown_days := CASE 
    WHEN new_count >= 3 THEN 90  -- After 3rd change, lock for 90 days (effectively contact support)
    WHEN new_count >= 2 THEN 60  -- After 2nd change, wait 60 days
    ELSE 30  -- After 1st change, wait 30 days
  END;
  
  lock_until := now() + (cooldown_days || ' days')::interval;
  
  -- Create change history entry
  change_entry := jsonb_build_object(
    'changed_at', now(),
    'fields', to_jsonb(changed_fields),
    'change_number', new_count
  );
  
  -- Update profile with new change tracking data
  UPDATE profiles
  SET 
    profile_change_count = new_count,
    last_profile_change_at = now(),
    profile_locked_until = lock_until,
    profile_change_history = COALESCE(profile_change_history, '[]'::jsonb) || change_entry
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'change_count', new_count,
    'locked_until', lock_until,
    'cooldown_days', cooldown_days,
    'must_contact_support', new_count >= 3
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.can_edit_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_profile_change(uuid, text[]) TO authenticated;