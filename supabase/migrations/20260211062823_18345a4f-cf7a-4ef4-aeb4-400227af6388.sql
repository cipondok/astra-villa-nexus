
-- Create a reliable DB trigger for new user registration notifications
-- This works server-side, regardless of whether admin panel is open
CREATE OR REPLACE FUNCTION public.notify_admin_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_alerts (
    type, title, message, priority, reference_id, reference_type,
    action_required, auto_generated, urgency_level, alert_category, metadata
  ) VALUES (
    'user_registration',
    '👤 New User Registration',
    'New user "' || COALESCE(NEW.full_name, NEW.username, 'Unknown') || '" (' || COALESCE(NEW.email, 'no email') || ') has registered on the platform.',
    'low',
    NEW.id,
    'profiles',
    true,
    true,
    1,
    'user_activity',
    jsonb_build_object(
      'user_id', NEW.id,
      'user_name', COALESCE(NEW.full_name, NEW.username),
      'email', NEW.email,
      'role', NEW.role,
      'registered_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_admin_new_user_registration
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user_registration();
