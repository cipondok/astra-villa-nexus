
-- Create a function to check if a user can create development status properties
CREATE OR REPLACE FUNCTION public.can_create_development_status(user_id uuid, dev_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  user_email text;
BEGIN
  -- Get user role from profiles
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  
  -- Get user email from auth.users for super admin check
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  -- Allow if user is super admin
  IF user_email = 'mycode103@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Allow if user has admin role
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Allow if user has agent role (authorized person)
  IF user_role = 'agent' THEN
    RETURN true;
  END IF;
  
  -- Allow if user has property_owner role (authorized person)
  IF user_role = 'property_owner' THEN
    RETURN true;
  END IF;
  
  -- For restricted development statuses, only allow authorized users
  IF dev_status IN ('new_project', 'pre_launching') THEN
    RETURN false;
  END IF;
  
  -- Allow completed projects for all users
  RETURN true;
END;
$$;

-- Add a constraint to enforce development status restrictions
ALTER TABLE public.properties 
ADD CONSTRAINT check_development_status_authorization 
CHECK (can_create_development_status(owner_id, development_status));
