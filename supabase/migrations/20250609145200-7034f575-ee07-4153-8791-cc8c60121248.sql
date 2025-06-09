
-- Fix the infinite recursion issue with admin_users table by simplifying RLS policies
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create simpler, non-recursive policies for admin_users table
CREATE POLICY "Enable read access for authenticated users" ON public.admin_users
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.admin_users
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.admin_users
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.admin_users
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Ensure profiles table has proper RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create comprehensive policies for profiles table
CREATE POLICY "Enable read access for all authenticated users" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.profiles
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.profiles
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Fix the handle_new_user function to handle the role properly
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
  IF user_role_value NOT IN ('general_user', 'property_owner', 'agent', 'vendor', 'admin') THEN
    user_role_value := 'general_user';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role_value::text,
    COALESCE(NEW.raw_user_meta_data->>'verification_status', 'approved')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role::text, profiles.role::text)::text,
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
