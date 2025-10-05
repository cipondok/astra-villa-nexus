-- Add null safety to has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE exists (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
        AND is_active = true
    )
  END;
$$;

-- Add null safety to is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE public.has_role(auth.uid(), 'admin'::user_role)
  END;
$$;