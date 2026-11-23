CREATE OR REPLACE FUNCTION private.enforce_property_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_privileged boolean := current_user IN ('postgres', 'service_role', 'supabase_admin') OR public.is_admin();
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
$$;