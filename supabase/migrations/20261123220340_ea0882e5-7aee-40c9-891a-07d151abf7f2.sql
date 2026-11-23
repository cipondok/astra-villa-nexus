-- 1) Signup never grants listing roles; fix broken role cast so profiles are created again
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  requested text;
  granted text;
  intent public.profile_type;
BEGIN
  requested := lower(COALESCE(NEW.raw_user_meta_data->>'role', 'general_user'));

  -- Listing roles (property_owner, agent, developer, vendor) are NEVER granted from
  -- signup metadata: they come only from an admin-approved application
  -- (public.grant_role_on_approval). Privileged roles are never self-selectable.
  granted := CASE WHEN requested = 'investor' THEN 'investor' ELSE 'general_user' END;

  -- The requested purpose is kept only as a profile hint for onboarding.
  intent := (CASE requested
    WHEN 'property_owner' THEN 'owner'
    WHEN 'agent' THEN 'agent'
    WHEN 'developer' THEN 'developer'
    WHEN 'vendor' THEN 'vendor'
    WHEN 'investor' THEN 'investor'
    ELSE 'buyer' END)::public.profile_type;

  INSERT INTO public.profiles (id, email, full_name, verification_status, profile_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'approved',
    intent
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    verification_status = COALESCE(EXCLUDED.verification_status, public.profiles.verification_status),
    profile_type = COALESCE(public.profiles.profile_type, EXCLUDED.profile_type),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (NEW.id, granted::public.user_role, true)
  ON CONFLICT (user_id, role) DO NOTHING;

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

-- 2) Approval grants (and revocation removes) the listing role — fixed cast/columns
CREATE OR REPLACE FUNCTION public.grant_role_on_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_role public.user_role;
BEGIN
  IF TG_TABLE_NAME = 'property_owner_requests' THEN
    new_role := 'property_owner';
  ELSIF TG_TABLE_NAME = 'vendor_requests' THEN
    new_role := 'vendor';
  ELSIF TG_TABLE_NAME = 'agent_registration_requests' THEN
    new_role := CASE WHEN NEW.business_type = 'developer' THEN 'developer'::public.user_role ELSE 'agent'::public.user_role END;
  ELSE
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    INSERT INTO public.user_roles (user_id, role, assigned_by, is_active, assigned_at)
    VALUES (NEW.user_id, new_role, COALESCE(NEW.reviewed_by, auth.uid()), true, now())
    ON CONFLICT (user_id, role) DO UPDATE SET
      is_active = true,
      assigned_by = EXCLUDED.assigned_by,
      assigned_at = now();
  ELSIF OLD.status = 'approved' AND NEW.status IS DISTINCT FROM 'approved' THEN
    UPDATE public.user_roles SET is_active = false
    WHERE user_id = NEW.user_id AND role = new_role;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Applicants can never approve themselves or edit review fields
CREATE OR REPLACE FUNCTION private.guard_role_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  open_count integer;
  locked jsonb;
BEGIN
  IF private.is_listing_admin() OR private.is_trusted_backend() THEN
    IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
      NEW := jsonb_populate_record(NEW, jsonb_build_object(
        'reviewed_by', COALESCE(auth.uid(), NEW.reviewed_by),
        'reviewed_at', now()));
    END IF;
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'You can only submit your own application' USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'INSERT' THEN
    EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id = $1 AND status IN (''pending'', ''under_review'')', TG_TABLE_NAME)
      INTO open_count USING NEW.user_id;
    IF open_count > 0 THEN
      RAISE EXCEPTION 'application_already_pending' USING ERRCODE = 'P0001';
    END IF;
    NEW := jsonb_populate_record(NEW, jsonb_build_object(
      'status', 'pending', 'review_notes', NULL, 'reviewed_by', NULL, 'reviewed_at', NULL));
    RETURN NEW;
  END IF;

  -- UPDATE by the applicant: review fields and ownership stay as they were
  IF OLD.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'You can only edit your own application' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb) INTO locked
  FROM jsonb_each(to_jsonb(OLD))
  WHERE key IN ('user_id', 'status', 'review_notes', 'reviewed_by', 'reviewed_at', 'submitted_at', 'created_at');
  NEW := jsonb_populate_record(NEW, locked);
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION private.guard_role_request() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_role_request ON public.property_owner_requests;
CREATE TRIGGER trg_guard_role_request BEFORE INSERT OR UPDATE ON public.property_owner_requests
  FOR EACH ROW EXECUTE FUNCTION private.guard_role_request();
DROP TRIGGER IF EXISTS trg_guard_role_request ON public.agent_registration_requests;
CREATE TRIGGER trg_guard_role_request BEFORE INSERT OR UPDATE ON public.agent_registration_requests
  FOR EACH ROW EXECUTE FUNCTION private.guard_role_request();
DROP TRIGGER IF EXISTS trg_guard_role_request ON public.vendor_requests;
CREATE TRIGGER trg_guard_role_request BEFORE INSERT OR UPDATE ON public.vendor_requests
  FOR EACH ROW EXECUTE FUNCTION private.guard_role_request();

-- 4) Service area for agent/developer applications
ALTER TABLE public.agent_registration_requests ADD COLUMN IF NOT EXISTS service_area text;

-- 5) Admins (admin, super_admin, admin list) can review every application
DROP POLICY IF EXISTS "Listing admins manage agent requests" ON public.agent_registration_requests;
CREATE POLICY "Listing admins manage agent requests" ON public.agent_registration_requests
  FOR ALL TO authenticated USING (private.is_listing_admin()) WITH CHECK (private.is_listing_admin());
DROP POLICY IF EXISTS "Listing admins manage property owner requests" ON public.property_owner_requests;
CREATE POLICY "Listing admins manage property owner requests" ON public.property_owner_requests
  FOR ALL TO authenticated USING (private.is_listing_admin()) WITH CHECK (private.is_listing_admin());
DROP POLICY IF EXISTS "Listing admins manage vendor requests" ON public.vendor_requests;
CREATE POLICY "Listing admins manage vendor requests" ON public.vendor_requests
  FOR ALL TO authenticated USING (private.is_listing_admin()) WITH CHECK (private.is_listing_admin());

-- 6) Enquiries: only on public, approved, non-sample listings; no forged review fields
DROP POLICY IF EXISTS "Public can create inquiries with contact info" ON public.inquiries;
CREATE POLICY "Public can create inquiries with contact info" ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (contact_email IS NOT NULL OR contact_phone IS NOT NULL)
    AND (user_id IS NULL OR user_id = auth.uid())
    AND COALESCE(status, 'new') = 'new'
    AND admin_response IS NULL AND responded_by IS NULL AND responded_at IS NULL
    AND (message IS NULL OR length(message) <= 5000)
    AND (contact_name IS NULL OR length(contact_name) <= 200)
    AND (
      property_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = inquiries.property_id
          AND p.approval_status = 'approved'
          AND p.status IN ('active', 'published')
          AND p.is_demo = false
      )
    )
  );

-- 7) Admin oversight of listing leads (owners/agents keep seeing only their own)
DROP POLICY IF EXISTS "Listing admins read all property leads" ON public.property_leads;
CREATE POLICY "Listing admins read all property leads" ON public.property_leads
  FOR SELECT TO authenticated USING (private.is_listing_admin());