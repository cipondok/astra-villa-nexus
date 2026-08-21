CREATE OR REPLACE FUNCTION public.has_listing_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND is_active = true
      AND role IN ('agent','property_owner','vendor','developer','admin','super_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.has_listing_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_listing_role(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Listing roles can create own properties" ON public.properties;
CREATE POLICY "Listing roles can create own properties"
ON public.properties FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() AND public.has_listing_role(auth.uid()));

DROP POLICY IF EXISTS "Listing roles can update own properties" ON public.properties;
CREATE POLICY "Listing roles can update own properties"
ON public.properties FOR UPDATE TO authenticated
USING (owner_id = auth.uid() AND public.has_listing_role(auth.uid()))
WITH CHECK (owner_id = auth.uid() AND public.has_listing_role(auth.uid()));

DROP POLICY IF EXISTS "Listing roles can delete own properties" ON public.properties;
CREATE POLICY "Listing roles can delete own properties"
ON public.properties FOR DELETE TO authenticated
USING (owner_id = auth.uid() AND public.has_listing_role(auth.uid()));

DROP POLICY IF EXISTS "Owners can view own properties" ON public.properties;
CREATE POLICY "Owners can view own properties"
ON public.properties FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR agent_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;