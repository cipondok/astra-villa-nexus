
-- First, let's drop the problematic policies on admin_users table
DROP POLICY IF EXISTS "Super admin can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Read access for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.admin_users;

-- Create a simple security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_super_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get current user email directly from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user is super admin by email (hardcoded check)
  RETURN user_email = 'mycode103@gmail.com';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create simple, non-recursive policies for admin_users table
CREATE POLICY "Super admin email can manage admin users" ON public.admin_users
FOR ALL USING (public.is_super_admin_by_email());

-- Create a simple read policy for authenticated users to avoid recursion
CREATE POLICY "Authenticated users can read admin users" ON public.admin_users
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Also fix the cms_content table to ensure proper RLS
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Create policies for cms_content that don't cause recursion
CREATE POLICY "Authors can manage their own content" ON public.cms_content
FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Super admin can manage all content" ON public.cms_content
FOR ALL USING (public.is_super_admin_by_email());

-- Allow public read access to published content
CREATE POLICY "Public can read published content" ON public.cms_content
FOR SELECT USING (status = 'published');
