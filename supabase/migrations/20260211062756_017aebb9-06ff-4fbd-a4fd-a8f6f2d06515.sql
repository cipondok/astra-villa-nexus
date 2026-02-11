
-- Remove the duplicate DB trigger since useRealTimeAlerts already handles this client-side
DROP TRIGGER IF EXISTS trigger_notify_admin_new_user_registration ON public.profiles;
DROP FUNCTION IF EXISTS public.notify_admin_new_user_registration();

-- Insert the missing alert for the recent registration manually
INSERT INTO public.admin_alerts (
  type, title, message, priority, reference_id, reference_type, 
  action_required, auto_generated, urgency_level, alert_category, metadata
) VALUES (
  'user_registration',
  '👤 New User Registration',
  'New user "Muhammad Waqas Butt" (waqas.dia143@gmail.com) has registered on the platform.',
  'low',
  'befcfa64-6284-4430-9d05-81db3a82ceb6',
  'profiles',
  true,
  true,
  1,
  'user_activity',
  '{"user_id": "befcfa64-6284-4430-9d05-81db3a82ceb6", "user_name": "Muhammad Waqas Butt", "email": "waqas.dia143@gmail.com"}'::jsonb
);
