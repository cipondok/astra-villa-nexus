CREATE OR REPLACE FUNCTION private.is_listing_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_admin()
      OR public.has_role(auth.uid(), 'admin'::public.user_role)
      OR public.has_role(auth.uid(), 'super_admin'::public.user_role);
$$;
REVOKE ALL ON FUNCTION private.is_listing_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_listing_admin() TO authenticated, service_role;

-- Moderation trigger: treat user_roles admins the same as admin_users admins.
CREATE OR REPLACE FUNCTION private.enforce_property_moderation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_privileged boolean := current_user IN ('postgres', 'service_role', 'supabase_admin') OR private.is_listing_admin();
  v_content_changed boolean;
BEGIN
  IF v_privileged THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.approval_status := 'pending';
    NEW.status := CASE WHEN NEW.status = 'draft' THEN 'draft' ELSE 'pending' END;
    NEW.is_demo := false;
    NEW.featured := false;
    NEW.is_featured := false;
    NEW.meta := coalesce(NEW.meta, '{}'::jsonb) - 'review';
    RETURN NEW;
  END IF;

  NEW.is_demo := OLD.is_demo;
  NEW.featured := OLD.featured;
  NEW.is_featured := OLD.is_featured;
  IF OLD.meta ? 'review' THEN
    NEW.meta := jsonb_set(coalesce(NEW.meta, '{}'::jsonb), '{review}', OLD.meta -> 'review');
  ELSE
    NEW.meta := coalesce(NEW.meta, '{}'::jsonb) - 'review';
  END IF;

  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status AND NEW.approval_status IS DISTINCT FROM 'pending' THEN
    NEW.approval_status := OLD.approval_status;
  END IF;

  v_content_changed :=
       NEW.title IS DISTINCT FROM OLD.title
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.price IS DISTINCT FROM OLD.price
    OR NEW.price_idr IS DISTINCT FROM OLD.price_idr
    OR NEW.images IS DISTINCT FROM OLD.images
    OR NEW.image_urls IS DISTINCT FROM OLD.image_urls
    OR NEW.cover_image IS DISTINCT FROM OLD.cover_image
    OR NEW.thumbnail_url IS DISTINCT FROM OLD.thumbnail_url
    OR NEW.city IS DISTINCT FROM OLD.city
    OR NEW.address IS DISTINCT FROM OLD.address
    OR NEW.location IS DISTINCT FROM OLD.location
    OR NEW.state IS DISTINCT FROM OLD.state
    OR NEW.area IS DISTINCT FROM OLD.area
    OR NEW.property_type IS DISTINCT FROM OLD.property_type
    OR NEW.listing_type IS DISTINCT FROM OLD.listing_type
    OR NEW.bedrooms IS DISTINCT FROM OLD.bedrooms
    OR NEW.bathrooms IS DISTINCT FROM OLD.bathrooms
    OR NEW.area_sqm IS DISTINCT FROM OLD.area_sqm
    OR NEW.land_area_sqm IS DISTINCT FROM OLD.land_area_sqm
    OR NEW.building_area_sqm IS DISTINCT FROM OLD.building_area_sqm;

  IF v_content_changed AND OLD.approval_status = 'approved' THEN
    NEW.approval_status := 'pending';
  END IF;

  IF NEW.approval_status IS DISTINCT FROM 'approved' THEN
    IF NEW.status IN ('active', 'published') OR (NEW.approval_status = 'pending' AND NEW.status <> 'draft') THEN
      NEW.status := 'pending';
    END IF;
  ELSIF NEW.status = 'pending' THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$function$;

-- Admin access to listings: honour admins in user_roles as well as admin_users.
DROP POLICY IF EXISTS "Admins manage properties" ON public.properties;
CREATE POLICY "Admins manage properties" ON public.properties
  FOR ALL TO authenticated
  USING (private.is_listing_admin())
  WITH CHECK (private.is_listing_admin());

DROP POLICY IF EXISTS "Public properties are visible" ON public.properties;
CREATE POLICY "Public properties are visible" ON public.properties
  FOR SELECT
  USING (
    (status = ANY (ARRAY['published'::text, 'active'::text]))
    AND approval_status = 'approved'::text
    AND (
      is_demo = false
      OR EXISTS (
        SELECT 1 FROM public.system_settings s
        WHERE s.key = 'show_demo_listings' AND s.is_public = true AND s.value = 'true'::jsonb
      )
    )
  );

CREATE POLICY "Admins view all properties" ON public.properties
  FOR SELECT TO authenticated
  USING (private.is_listing_admin());

-- Admin KPI counts without loading every row in the browser.
CREATE OR REPLACE FUNCTION public.get_listing_moderation_counts()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT private.is_listing_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  RETURN (
    SELECT jsonb_build_object(
      'pending',   count(*) FILTER (WHERE NOT is_demo AND coalesce(approval_status,'pending') = 'pending' AND status <> 'draft'),
      'revision',  count(*) FILTER (WHERE NOT is_demo AND approval_status = 'revision_requested'),
      'published', count(*) FILTER (WHERE NOT is_demo AND approval_status = 'approved' AND status IN ('active','published')),
      'approved_offline', count(*) FILTER (WHERE NOT is_demo AND approval_status = 'approved' AND status NOT IN ('active','published')),
      'rejected',  count(*) FILTER (WHERE NOT is_demo AND approval_status = 'rejected'),
      'drafts',    count(*) FILTER (WHERE NOT is_demo AND status = 'draft'),
      'demo',      count(*) FILTER (WHERE is_demo)
    )
    FROM public.properties
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_listing_moderation_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_listing_moderation_counts() TO authenticated;