-- Phase 1: Critical Security Fix - Eliminate Dual Role Storage

-- Step 1: Create helper function to get user role from user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Get the first role for the user (users should only have one primary role)
  SELECT role INTO user_role_value
  FROM public.user_roles
  WHERE user_id = p_user_id
  AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Default to general_user if no role found
  RETURN COALESCE(user_role_value, 'general_user'::user_role);
END;
$$;

-- Step 2: Update handle_new_user trigger to insert into user_roles instead of profiles.role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles WITHOUT role column
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert default role into user_roles table (the secure way)
  INSERT INTO public.user_roles (
    user_id,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    'general_user'::user_role,
    true
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Step 3: Create secure function to get public property listings WITHOUT owner/agent IDs
CREATE OR REPLACE FUNCTION public.get_public_properties_secure(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  price numeric,
  property_type text,
  listing_type text,
  location text,
  city text,
  area text,
  state text,
  bedrooms integer,
  bathrooms integer,
  area_sqm integer,
  images text[],
  image_urls text[],
  status text,
  created_at timestamp with time zone,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access for security monitoring
  PERFORM log_security_event(
    auth.uid(),
    'public_property_list_access',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object('limit', p_limit, 'offset', p_offset),
    10
  );

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.property_type,
    p.listing_type,
    p.location,
    p.city,
    p.area,
    p.state,
    p.bedrooms,
    p.bathrooms,
    p.area_sqm,
    p.images,
    p.image_urls,
    p.status,
    p.created_at,
    COUNT(*) OVER() as total_count
  FROM public.properties p
  WHERE 
    -- Only show approved and available properties
    p.status = 'available'
    AND (p.approval_status = 'approved' OR p.approval_status IS NULL)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Step 4: Update properties RLS policies to restrict direct access to owner/agent IDs
DROP POLICY IF EXISTS "authenticated_view_available_properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;

-- Only owners, agents, and admins can see full property details
CREATE POLICY "owners_agents_admins_view_own_properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id 
  OR auth.uid() = agent_id 
  OR has_role(auth.uid(), 'admin'::user_role)
);

-- Step 5: Secure document_requirements table
DROP POLICY IF EXISTS "Anyone can view document requirements" ON public.document_requirements;

-- Only authenticated vendors can view during application process
CREATE POLICY "authenticated_vendors_view_document_requirements"
ON public.document_requirements
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Step 6: Update admin check RLS policies to use has_role instead of profiles.role
-- Update profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "users_view_own_profile_v2"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "users_update_own_profile_v2"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "admins_view_all_profiles_v2"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));