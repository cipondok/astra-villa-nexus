-- Fix the create_application_admin_alert function to properly handle UUID
CREATE OR REPLACE FUNCTION public.create_application_admin_alert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  alert_title TEXT;
  alert_message TEXT;
  alert_type TEXT;
  user_name TEXT;
  ref_type TEXT;
BEGIN
  -- Get user's full name from the request record
  IF TG_TABLE_NAME = 'property_owner_requests' THEN
    user_name := NEW.full_name;
    alert_type := 'property_owner_application';
    alert_title := 'New Property Owner Application';
    alert_message := user_name || ' has submitted a property owner application and is awaiting review.';
    ref_type := 'property_owner_requests';
  ELSIF TG_TABLE_NAME = 'vendor_requests' THEN
    user_name := NEW.business_name;
    alert_type := 'vendor_application';
    alert_title := 'New Vendor Application';
    alert_message := user_name || ' has submitted a vendor application and is awaiting review.';
    ref_type := 'vendor_requests';
  ELSIF TG_TABLE_NAME = 'agent_registration_requests' THEN
    user_name := NEW.full_name;
    alert_type := 'agent_application';
    alert_title := 'New Agent Application';
    alert_message := user_name || COALESCE(' (' || NEW.company_name || ')', '') || ' has submitted an agent registration request and is awaiting review.';
    ref_type := 'agent_registration_requests';
  END IF;

  -- Insert admin alert - reference_id is UUID, pass directly without ::text cast
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
    alert_type,
    alert_title,
    alert_message,
    'medium',
    NEW.id,  -- Direct UUID, no cast to text
    ref_type,
    true,
    jsonb_build_object('user_id', NEW.user_id, 'user_name', user_name),
    'application',
    true,
    2
  );

  RETURN NEW;
END;
$function$;