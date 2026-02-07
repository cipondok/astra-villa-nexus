-- Update the trigger function to use valid type 'kyc_verification'
CREATE OR REPLACE FUNCTION public.notify_admin_pending_verification()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Get the user's name from profiles
  SELECT full_name INTO user_name 
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Only create alert if verification is pending (identity not verified)
  IF NEW.identity_verified = false THEN
    INSERT INTO public.admin_alerts (
      type,
      title,
      message,
      priority,
      reference_id,
      reference_type,
      action_required,
      metadata,
      alert_category,
      auto_generated,
      urgency_level
    ) VALUES (
      'kyc_verification',
      'Pending User Verification',
      COALESCE(user_name, 'A user') || ' has a pending identity verification awaiting review.',
      'medium',
      NEW.id,
      'user_verification',
      true,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', user_name,
        'identity_verified', NEW.identity_verified,
        'email_verified', NEW.email_verified,
        'phone_verified', NEW.phone_verified
      ),
      'verification',
      true,
      2
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert admin alert for the existing pending verification
INSERT INTO public.admin_alerts (
  type,
  title,
  message,
  priority,
  reference_id,
  reference_type,
  action_required,
  metadata,
  alert_category,
  auto_generated,
  urgency_level
)
SELECT 
  'kyc_verification',
  'Pending User Verification',
  COALESCE(p.full_name, 'A user') || ' has a pending identity verification awaiting review.',
  'medium',
  uv.id,
  'user_verification',
  true,
  jsonb_build_object(
    'user_id', uv.user_id,
    'user_name', p.full_name,
    'identity_verified', uv.identity_verified,
    'email_verified', uv.email_verified,
    'phone_verified', uv.phone_verified
  ),
  'verification',
  true,
  2
FROM public.user_verification uv
LEFT JOIN public.profiles p ON p.id = uv.user_id
WHERE uv.identity_verified = false
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_alerts 
    WHERE reference_id = uv.id
    AND reference_type = 'user_verification'
  );