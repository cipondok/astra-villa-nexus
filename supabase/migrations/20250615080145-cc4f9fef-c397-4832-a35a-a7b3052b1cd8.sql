
-- Create a function to check if a user is an admin or customer service staff
CREATE OR REPLACE FUNCTION public.is_authorized_support_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  );
$$;

-- Add RLS policies to allow support staff to manage vendor tickets
CREATE POLICY "Support team can view all tickets"
  ON public.vendor_support_tickets
  FOR SELECT
  USING (public.is_authorized_support_user());

CREATE POLICY "Support team can update tickets"
  ON public.vendor_support_tickets
  FOR UPDATE
  USING (public.is_authorized_support_user())
  WITH CHECK (public.is_authorized_support_user());

-- Update the handle_new_user function to include 'customer_service' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_role_value text;
BEGIN
  -- Get the role from metadata, default to 'general_user'
  user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'general_user');
  
  -- Ensure the role is valid
  IF user_role_value NOT IN ('general_user', 'property_owner', 'agent', 'vendor', 'admin', 'customer_service') THEN
    user_role_value := 'general_user';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role_value::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'verification_status', 'approved')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    verification_status = COALESCE(EXCLUDED.verification_status, profiles.verification_status),
    updated_at = now();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;
