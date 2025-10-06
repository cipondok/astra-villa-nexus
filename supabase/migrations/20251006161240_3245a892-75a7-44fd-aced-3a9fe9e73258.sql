-- Create function to auto-create admin alerts for feedback submissions
CREATE OR REPLACE FUNCTION public.create_alert_for_feedback()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  is_partner_app boolean;
  alert_title text;
  alert_message text;
BEGIN
  -- Check if this is a partner application
  is_partner_app := NEW.content LIKE '%Partner Network Application%';
  
  -- Set title based on type
  IF is_partner_app THEN
    alert_title := '🤝 New Partner Application';
  ELSE
    alert_title := '💬 New Contact Submission';
  END IF;
  
  -- Truncate message if too long
  IF LENGTH(NEW.content) > 300 THEN
    alert_message := SUBSTRING(NEW.content, 1, 300) || '...';
  ELSE
    alert_message := NEW.content;
  END IF;
  
  -- Create the alert
  INSERT INTO public.admin_alerts (
    title,
    message,
    type,
    priority,
    alert_category,
    urgency_level,
    action_required,
    reference_type,
    reference_id,
    source_table,
    source_id,
    metadata
  ) VALUES (
    alert_title,
    alert_message,
    'contact',
    CASE WHEN is_partner_app THEN 'medium' ELSE 'low' END,
    'support',
    CASE WHEN is_partner_app THEN 3 ELSE 2 END,
    true,
    'feedback',
    NEW.id,
    'feedback_monitoring',
    NEW.id,
    jsonb_build_object(
      'feedback_type', NEW.feedback_type,
      'status', NEW.status,
      'is_partner_app', is_partner_app
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create alerts for new feedback
DROP TRIGGER IF EXISTS trigger_create_alert_for_feedback ON public.feedback_monitoring;
CREATE TRIGGER trigger_create_alert_for_feedback
  AFTER INSERT ON public.feedback_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION public.create_alert_for_feedback();