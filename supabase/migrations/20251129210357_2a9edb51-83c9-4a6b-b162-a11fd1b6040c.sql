-- Create function to grant user role when application is approved
CREATE OR REPLACE FUNCTION public.grant_role_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_role TEXT;
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Determine the role based on the table
    IF TG_TABLE_NAME = 'property_owner_requests' THEN
      new_role := 'property_owner';
    ELSIF TG_TABLE_NAME = 'vendor_requests' THEN
      new_role := 'vendor';
    ELSIF TG_TABLE_NAME = 'agent_registration_requests' THEN
      new_role := 'agent';
    END IF;
    
    -- Insert the new role into user_roles
    INSERT INTO public.user_roles (user_id, role, assigned_by, is_active, notes)
    VALUES (
      NEW.user_id,
      new_role::app_role,
      NEW.reviewed_by,
      true,
      'Role granted via application approval'
    )
    ON CONFLICT (user_id, role) DO UPDATE SET
      is_active = true,
      assigned_by = EXCLUDED.assigned_by,
      assigned_at = now(),
      notes = EXCLUDED.notes;
    
    -- Create notification for the user
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
      auto_generated
    ) VALUES (
      'system',
      'Application Approved!',
      'Congratulations! Your ' || 
        CASE TG_TABLE_NAME 
          WHEN 'property_owner_requests' THEN 'Property Owner'
          WHEN 'vendor_requests' THEN 'Vendor'
          WHEN 'agent_registration_requests' THEN 'Agent'
        END || ' application has been approved. You now have access to your new dashboard.',
      'high',
      NEW.id,
      TG_TABLE_NAME,
      false,
      jsonb_build_object('user_id', NEW.user_id, 'new_role', new_role),
      'approval',
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for each application table
DROP TRIGGER IF EXISTS grant_role_on_property_owner_approval ON public.property_owner_requests;
CREATE TRIGGER grant_role_on_property_owner_approval
AFTER UPDATE ON public.property_owner_requests
FOR EACH ROW
EXECUTE FUNCTION public.grant_role_on_approval();

DROP TRIGGER IF EXISTS grant_role_on_vendor_approval ON public.vendor_requests;
CREATE TRIGGER grant_role_on_vendor_approval
AFTER UPDATE ON public.vendor_requests
FOR EACH ROW
EXECUTE FUNCTION public.grant_role_on_approval();

DROP TRIGGER IF EXISTS grant_role_on_agent_approval ON public.agent_registration_requests;
CREATE TRIGGER grant_role_on_agent_approval
AFTER UPDATE ON public.agent_registration_requests
FOR EACH ROW
EXECUTE FUNCTION public.grant_role_on_approval();