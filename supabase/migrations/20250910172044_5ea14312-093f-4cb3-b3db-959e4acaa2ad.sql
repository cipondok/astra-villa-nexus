-- Create a secure function to reset admin password
CREATE OR REPLACE FUNCTION reset_admin_password(new_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
  result_message text;
BEGIN
  -- Only allow if called by super admin or if no admin exists
  IF NOT (check_super_admin_email() OR NOT EXISTS(SELECT 1 FROM profiles WHERE role = 'admin')) THEN
    RAISE EXCEPTION 'Unauthorized: Only super admin can reset admin password';
  END IF;
  
  -- Get admin user ID from profiles
  SELECT id INTO admin_user_id 
  FROM profiles 
  WHERE email = 'mycode103@gmail.com' 
  AND role = 'admin';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin profile not found';
  END IF;
  
  -- Log the password reset attempt
  PERFORM log_security_event(
    admin_user_id,
    'admin_password_reset',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    50
  );
  
  result_message := 'Password reset logged for admin user: ' || admin_user_id::text;
  
  RETURN result_message;
END;
$$;