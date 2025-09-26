-- Remove problematic logging from properties RLS policy
DROP POLICY IF EXISTS "authenticated_view_available_properties" ON public.properties;

-- Create a cleaner policy without INSERT operations in SELECT
CREATE POLICY "authenticated_view_available_properties" 
ON public.properties 
FOR SELECT 
TO authenticated 
USING (
  ((status = 'available' OR status = 'active') AND approval_status = 'approved')
  OR check_admin_access()
);

-- Also ensure admins can view all properties without issues
DROP POLICY IF EXISTS "admins_manage_all_properties" ON public.properties;
CREATE POLICY "admins_manage_all_properties"
ON public.properties
FOR ALL
TO authenticated
USING (check_admin_access())
WITH CHECK (check_admin_access());