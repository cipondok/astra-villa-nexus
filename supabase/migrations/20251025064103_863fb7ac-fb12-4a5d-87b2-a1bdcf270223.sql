-- Fix can_create_development_status to use user_roles instead of profiles.role and remove hardcoded email
CREATE OR REPLACE FUNCTION public.can_create_development_status(user_id uuid, dev_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if user is super admin or admin
  IF public.has_role(user_id, 'super_admin') OR public.has_role(user_id, 'admin') THEN
    RETURN true;
  END IF;
  
  -- Allow if user is agent or property_owner
  IF public.has_role(user_id, 'agent') OR public.has_role(user_id, 'property_owner') THEN
    RETURN true;
  END IF;
  
  -- For restricted development statuses, only allow authorized users above
  IF dev_status IN ('new_project', 'pre_launching') THEN
    RETURN false;
  END IF;
  
  -- Allow other statuses for everyone else
  RETURN true;
END;
$$;