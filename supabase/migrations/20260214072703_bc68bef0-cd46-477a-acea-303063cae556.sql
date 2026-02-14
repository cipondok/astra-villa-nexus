
-- Update handle_new_user to also insert into user_roles table and grant signup rewards
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

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'approved'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    verification_status = COALESCE(EXCLUDED.verification_status, public.profiles.verification_status),
    updated_at = now();

  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (NEW.id, user_role_value::public.app_role, true)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Grant signup bonus: 500 ASTRA tokens for new users
  BEGIN
    INSERT INTO public.token_transactions (user_id, amount, transaction_type, description, status)
    VALUES (NEW.id, 500, 'reward', 'Welcome Bonus: 500 ASTRA Tokens for signing up!', 'completed');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to grant signup bonus for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;
