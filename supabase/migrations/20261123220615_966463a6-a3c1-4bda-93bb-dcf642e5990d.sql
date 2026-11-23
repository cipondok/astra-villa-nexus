-- Profile notification triggers referenced columns that don't exist on profiles
-- (username, role, address), which made every new profile and every profile edit fail.
CREATE OR REPLACE FUNCTION public.notify_admin_new_user_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.admin_alerts (
      type, title, message, priority, reference_id, reference_type,
      action_required, auto_generated, urgency_level, alert_category, metadata
    ) VALUES (
      'user_registration',
      'New User Registration',
      'New user "' || COALESCE(NEW.full_name, 'Unknown') || '" (' || COALESCE(NEW.email, 'no email') || ') has registered on the platform.',
      'low',
      NEW.id,
      'profiles',
      true,
      true,
      1,
      'user_activity',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.full_name,
        'email', NEW.email,
        'profile_type', NEW.profile_type,
        'registered_at', NEW.created_at
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'new user alert skipped for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_admin_profile_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  changed_fields TEXT[] := '{}';
  change_details JSONB := '{}'::jsonb;
  needs_approval BOOLEAN := false;
BEGIN
  IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
    changed_fields := array_append(changed_fields, 'Full Name');
    change_details := change_details || jsonb_build_object('full_name', jsonb_build_object('old', OLD.full_name, 'new', NEW.full_name));
  END IF;
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    changed_fields := array_append(changed_fields, 'Phone');
    change_details := change_details || jsonb_build_object('phone', jsonb_build_object('old', OLD.phone, 'new', NEW.phone));
  END IF;
  IF OLD.company_name IS DISTINCT FROM NEW.company_name THEN
    changed_fields := array_append(changed_fields, 'Company Name');
    change_details := change_details || jsonb_build_object('company_name', jsonb_build_object('old', OLD.company_name, 'new', NEW.company_name));
  END IF;
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    changed_fields := array_append(changed_fields, 'Email');
    change_details := change_details || jsonb_build_object('email', jsonb_build_object('old', OLD.email, 'new', NEW.email));
  END IF;
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    changed_fields := array_append(changed_fields, 'Avatar');
  END IF;
  IF OLD.bio IS DISTINCT FROM NEW.bio THEN
    changed_fields := array_append(changed_fields, 'Bio');
  END IF;
  IF OLD.business_address IS DISTINCT FROM NEW.business_address THEN
    changed_fields := array_append(changed_fields, 'Business Address');
  END IF;

  IF array_length(changed_fields, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  needs_approval := OLD.full_name IS DISTINCT FROM NEW.full_name
    OR OLD.phone IS DISTINCT FROM NEW.phone
    OR OLD.company_name IS DISTINCT FROM NEW.company_name
    OR OLD.email IS DISTINCT FROM NEW.email;

  BEGIN
    INSERT INTO public.admin_alerts (
      type, title, message, priority, reference_id, reference_type,
      action_required, auto_generated, urgency_level, alert_category, metadata
    ) VALUES (
      'verification_request',
      'User Profile Updated',
      COALESCE(NEW.full_name, 'Unknown') || ' (' || COALESCE(NEW.email, 'no email') || ') updated their profile: ' || array_to_string(changed_fields, ', '),
      CASE WHEN needs_approval THEN 'medium' ELSE 'low' END,
      NEW.id,
      'profiles',
      needs_approval,
      true,
      CASE WHEN needs_approval THEN 2 ELSE 1 END,
      'user_activity',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', NEW.full_name,
        'email', NEW.email,
        'changed_fields', to_jsonb(changed_fields),
        'changes', change_details,
        'needs_approval', needs_approval,
        'updated_at', now()
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'profile update alert skipped for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;