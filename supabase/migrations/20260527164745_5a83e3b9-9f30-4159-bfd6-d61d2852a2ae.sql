
DROP POLICY IF EXISTS "Published properties are public" ON public.properties;

CREATE POLICY "Public properties are visible"
ON public.properties
FOR SELECT
USING (status IN ('published', 'active') OR is_admin());
