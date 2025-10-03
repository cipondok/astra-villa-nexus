-- Fix the handle_new_user trigger to handle read-only transaction errors
-- The trigger should not fail when database is in read-only mode

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role_value text;
BEGIN
  -- Get the role from metadata, default to 'general_user'
  user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'general_user');
  
  -- Ensure the role is valid
  IF user_role_value NOT IN ('general_user', 'property_owner', 'agent', 'vendor', 'admin', 'customer_service') THEN
    user_role_value := 'general_user';
  END IF;

  -- Try to insert/update profile
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
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();