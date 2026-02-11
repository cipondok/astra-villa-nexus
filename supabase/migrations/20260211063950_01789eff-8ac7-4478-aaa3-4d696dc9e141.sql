
-- 1. Trigger: Profile updates (sensitive fields) → admin alert
CREATE OR REPLACE FUNCTION public.notify_admin_profile_update()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[] := '{}';
  change_details JSONB := '{}'::jsonb;
BEGIN
  -- Track sensitive field changes
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
    change_details := change_details || jsonb_build_object('avatar', jsonb_build_object('old', OLD.avatar_url, 'new', NEW.avatar_url));
  END IF;
  IF OLD.bio IS DISTINCT FROM NEW.bio THEN
    changed_fields := array_append(changed_fields, 'Bio');
  END IF;
  IF OLD.address IS DISTINCT FROM NEW.address THEN
    changed_fields := array_append(changed_fields, 'Address');
  END IF;

  -- Only create alert if sensitive fields changed (not bio/address)
  IF array_length(changed_fields, 1) IS NULL OR array_length(changed_fields, 1) = 0 THEN
    RETURN NEW;
  END IF;

  -- Determine if this needs approval (sensitive identity fields)
  DECLARE
    needs_approval BOOLEAN := false;
    alert_priority TEXT := 'low';
  BEGIN
    IF OLD.full_name IS DISTINCT FROM NEW.full_name 
       OR OLD.phone IS DISTINCT FROM NEW.phone 
       OR OLD.company_name IS DISTINCT FROM NEW.company_name
       OR OLD.email IS DISTINCT FROM NEW.email THEN
      needs_approval := true;
      alert_priority := 'medium';
    END IF;

    INSERT INTO public.admin_alerts (
      type, title, message, priority, reference_id, reference_type,
      action_required, auto_generated, urgency_level, alert_category, metadata
    ) VALUES (
      'profile_update',
      '✏️ User Profile Updated',
      COALESCE(NEW.full_name, NEW.username, 'Unknown') || ' (' || COALESCE(NEW.email, 'no email') || ') updated their profile: ' || array_to_string(changed_fields, ', '),
      alert_priority,
      NEW.id,
      'profiles',
      needs_approval,
      true,
      CASE WHEN needs_approval THEN 2 ELSE 1 END,
      'user_activity',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_name', COALESCE(NEW.full_name, NEW.username),
        'email', NEW.email,
        'changed_fields', to_jsonb(changed_fields),
        'changes', change_details,
        'needs_approval', needs_approval,
        'updated_at', now()
      )
    );
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_admin_profile_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_profile_update();


-- 2. Trigger: New property posted → admin alert
CREATE OR REPLACE FUNCTION public.notify_admin_new_property()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_alerts (
    type, title, message, priority, reference_id, reference_type,
    action_required, auto_generated, urgency_level, alert_category, metadata
  ) VALUES (
    'property_listing',
    '🏠 New Property Listed',
    'A new property "' || COALESCE(NEW.title, 'Untitled') || '" has been posted in ' || COALESCE(NEW.location, NEW.city, 'Unknown') || '. Type: ' || COALESCE(NEW.property_type, 'N/A') || ', Listing: ' || COALESCE(NEW.listing_type, 'N/A'),
    CASE WHEN NEW.status = 'pending_approval' THEN 'medium' ELSE 'low' END,
    NEW.id,
    'properties',
    CASE WHEN NEW.status = 'pending_approval' THEN true ELSE false END,
    true,
    CASE WHEN NEW.status = 'pending_approval' THEN 3 ELSE 1 END,
    'properties',
    jsonb_build_object(
      'property_id', NEW.id,
      'title', NEW.title,
      'property_type', NEW.property_type,
      'listing_type', NEW.listing_type,
      'location', COALESCE(NEW.location, NEW.city),
      'price', NEW.price,
      'status', NEW.status,
      'owner_id', NEW.owner_id,
      'posted_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_admin_new_property
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_property();
