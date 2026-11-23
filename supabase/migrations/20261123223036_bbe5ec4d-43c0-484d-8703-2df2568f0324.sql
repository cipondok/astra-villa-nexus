
ALTER TABLE public.property_leads
  ADD COLUMN IF NOT EXISTS inquiry_id uuid REFERENCES public.inquiries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS enquiry_type text,
  ADD COLUMN IF NOT EXISTS enquiry_message text,
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS property_leads_inquiry_id_key
  ON public.property_leads (inquiry_id) WHERE inquiry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS property_leads_agent_created_idx
  ON public.property_leads (agent_id, created_at DESC);

-- Guard: valid statuses, immutable buyer/listing fields for listers, own-live-listing check for manual leads.
CREATE OR REPLACE FUNCTION private.guard_property_lead()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NULL OR NEW.status NOT IN
     ('new','contacted','viewing_scheduled','negotiation','won','lost','qualified','converted') THEN
    RAISE EXCEPTION 'lead_invalid_status' USING ERRCODE = '22023';
  END IF;
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 4000 THEN
    RAISE EXCEPTION 'lead_notes_too_long' USING ERRCODE = '22023';
  END IF;

  -- Client (PostgREST) callers only; server-side triggers/service role skip these checks.
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.inquiry_id := NULL;
      NEW.enquiry_type := NULL;
      IF NEW.property_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = NEW.property_id
          AND (p.owner_id = auth.uid() OR p.agent_id = auth.uid())
          AND p.approval_status = 'approved'
          AND p.status IN ('active','published')
          AND p.is_demo = false
      ) THEN
        RAISE EXCEPTION 'lead_property_not_allowed' USING ERRCODE = '42501';
      END IF;
    ELSE
      NEW.agent_id := OLD.agent_id;
      NEW.property_id := OLD.property_id;
      NEW.inquiry_id := OLD.inquiry_id;
      NEW.enquiry_type := OLD.enquiry_type;
      NEW.enquiry_message := OLD.enquiry_message;
      NEW.lead_source := OLD.lead_source;
      NEW.created_at := OLD.created_at;
      IF OLD.inquiry_id IS NOT NULL THEN
        -- Buyer-submitted contact details stay exactly as the buyer sent them.
        NEW.lead_name := OLD.lead_name;
        NEW.lead_email := OLD.lead_email;
        NEW.lead_phone := OLD.lead_phone;
      END IF;
      IF OLD.status <> 'new' AND NEW.status = 'new' THEN
        RAISE EXCEPTION 'lead_cannot_return_to_new' USING ERRCODE = '22023';
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_changed_at := now();
    IF NEW.status IN ('won','converted') THEN
      NEW.converted_at := COALESCE(NEW.converted_at, now());
    ELSE
      NEW.converted_at := NULL;
    END IF;
    IF NEW.status IN ('contacted','viewing_scheduled','negotiation','won') AND NEW.last_contacted_at IS NULL THEN
      NEW.last_contacted_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_property_lead ON public.property_leads;
CREATE TRIGGER guard_property_lead
  BEFORE INSERT OR UPDATE ON public.property_leads
  FOR EACH ROW EXECUTE FUNCTION private.guard_property_lead();

-- History: status / follow-up changes go to the existing activity log of the person who made them.
CREATE OR REPLACE FUNCTION private.log_property_lead_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL THEN RETURN NEW; END IF;
  BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.activity_logs (user_id, activity_type, activity_description, metadata)
      VALUES (v_actor, 'lead_status_changed', 'Lead status: ' || OLD.status || ' -> ' || NEW.status,
              jsonb_build_object('lead_id', NEW.id, 'property_id', NEW.property_id, 'from', OLD.status, 'to', NEW.status));
    END IF;
    IF NEW.next_action_at IS DISTINCT FROM OLD.next_action_at THEN
      INSERT INTO public.activity_logs (user_id, activity_type, activity_description, metadata)
      VALUES (v_actor, 'lead_follow_up_set', 'Lead follow-up date changed',
              jsonb_build_object('lead_id', NEW.id, 'property_id', NEW.property_id, 'from', OLD.next_action_at, 'to', NEW.next_action_at));
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'lead history log failed: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_property_lead_change ON public.property_leads;
CREATE TRIGGER log_property_lead_change
  AFTER UPDATE ON public.property_leads
  FOR EACH ROW EXECUTE FUNCTION private.log_property_lead_change();

-- Policies: authenticated listers only; explicit WITH CHECK on update.
REVOKE ALL ON public.property_leads FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_leads TO authenticated;
GRANT ALL ON public.property_leads TO service_role;

DROP POLICY IF EXISTS "Agents can view own leads" ON public.property_leads;
DROP POLICY IF EXISTS "Agents can insert own leads" ON public.property_leads;
DROP POLICY IF EXISTS "Agents can update own leads" ON public.property_leads;
DROP POLICY IF EXISTS "Agents can delete own leads" ON public.property_leads;

CREATE POLICY "Agents can view own leads" ON public.property_leads
  FOR SELECT TO authenticated USING (auth.uid() = agent_id);
CREATE POLICY "Agents can insert own leads" ON public.property_leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Agents can update own leads" ON public.property_leads
  FOR UPDATE TO authenticated USING (auth.uid() = agent_id) WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Agents can delete own leads" ON public.property_leads
  FOR DELETE TO authenticated USING (auth.uid() = agent_id);

-- Enquiry -> lead: only for approved, live, non-sample listings; in-app notice for the lister.
CREATE OR REPLACE FUNCTION public.on_inquiry_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prop record;
  v_agent_id uuid;
  v_lead_id uuid;
  v_wants boolean;
  v_lang text;
  v_viewing boolean := NEW.inquiry_type = 'property_viewing';
  v_name text := left(COALESCE(NULLIF(btrim(NEW.contact_name), ''), 'Unknown'), 200);
BEGIN
  IF NEW.property_id IS NULL THEN RETURN NEW; END IF;

  SELECT id, title, owner_id, agent_id, approval_status, status, is_demo
    INTO v_prop FROM public.properties WHERE id = NEW.property_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF v_prop.is_demo IS TRUE OR v_prop.approval_status IS DISTINCT FROM 'approved'
     OR v_prop.status NOT IN ('active','published') THEN
    RETURN NEW;
  END IF;

  v_agent_id := COALESCE(v_prop.agent_id, v_prop.owner_id);
  IF v_agent_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.property_analytics (property_id, agent_id, date, views, saves, contacts, shares, clicks)
  VALUES (NEW.property_id, v_agent_id, CURRENT_DATE, 0, 0, 1, 0, 0)
  ON CONFLICT (property_id, date)
  DO UPDATE SET contacts = property_analytics.contacts + 1, updated_at = now();

  INSERT INTO public.property_leads (agent_id, property_id, lead_name, lead_email, lead_phone, lead_source, status, lead_score,
                                     inquiry_id, enquiry_type, enquiry_message)
  VALUES (
    v_agent_id, NEW.property_id, v_name, NEW.contact_email, NEW.contact_phone, 'website', 'new',
    CASE
      WHEN NEW.contact_email IS NOT NULL AND NEW.contact_phone IS NOT NULL THEN 60
      WHEN NEW.contact_email IS NOT NULL THEN 40
      ELSE 20
    END,
    NEW.id, NEW.inquiry_type, left(NEW.message, 5000)
  )
  ON CONFLICT (inquiry_id) WHERE inquiry_id IS NOT NULL DO NOTHING
  RETURNING id INTO v_lead_id;

  IF v_lead_id IS NOT NULL THEN
    BEGIN
      SELECT np.messages INTO v_wants FROM public.notification_preferences np WHERE np.user_id = v_agent_id LIMIT 1;
      IF v_wants IS DISTINCT FROM false THEN
        SELECT language INTO v_lang FROM public.profiles WHERE id = v_agent_id;
        INSERT INTO public.in_app_notifications (user_id, type, title, message, property_id, metadata)
        VALUES (
          v_agent_id,
          'message',
          CASE WHEN v_lang = 'en'
               THEN CASE WHEN v_viewing THEN 'New viewing request' ELSE 'New enquiry' END
               ELSE CASE WHEN v_viewing THEN 'Permintaan kunjungan baru' ELSE 'Pertanyaan baru' END END,
          CASE WHEN v_lang = 'en'
               THEN left(v_name, 80) || ' about "' || left(COALESCE(v_prop.title, ''), 120) || '"'
               ELSE left(v_name, 80) || ' tentang "' || left(COALESCE(v_prop.title, ''), 120) || '"' END,
          NEW.property_id,
          jsonb_build_object('kind', 'property_lead', 'lead_id', v_lead_id, 'link', '/my-properties?lead=' || v_lead_id)
        );
      END IF;
    EXCEPTION WHEN others THEN
      RAISE WARNING 'lead notification failed: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;
