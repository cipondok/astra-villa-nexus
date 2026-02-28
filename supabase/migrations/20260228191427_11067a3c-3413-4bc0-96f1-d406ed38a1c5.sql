
-- 1. Function: track_property_view — upserts daily analytics row
CREATE OR REPLACE FUNCTION public.track_property_view(p_property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid;
BEGIN
  -- Get the agent/owner of the property
  SELECT COALESCE(agent_id, owner_id) INTO v_agent_id
  FROM properties WHERE id = p_property_id;
  
  IF v_agent_id IS NULL THEN RETURN; END IF;
  
  INSERT INTO property_analytics (property_id, agent_id, date, views, saves, contacts, shares, clicks)
  VALUES (p_property_id, v_agent_id, CURRENT_DATE, 1, 0, 0, 0, 0)
  ON CONFLICT (property_id, date)
  DO UPDATE SET views = property_analytics.views + 1, updated_at = now();
END;
$$;

-- Add unique constraint for upsert if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'property_analytics_property_id_date_key'
  ) THEN
    ALTER TABLE property_analytics ADD CONSTRAINT property_analytics_property_id_date_key UNIQUE (property_id, date);
  END IF;
END $$;

-- 2. Trigger: on favorites insert → increment saves in property_analytics
CREATE OR REPLACE FUNCTION public.on_favorite_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid;
BEGIN
  SELECT COALESCE(agent_id, owner_id) INTO v_agent_id
  FROM properties WHERE id = NEW.property_id;
  
  IF v_agent_id IS NULL THEN RETURN NEW; END IF;
  
  INSERT INTO property_analytics (property_id, agent_id, date, views, saves, contacts, shares, clicks)
  VALUES (NEW.property_id, v_agent_id, CURRENT_DATE, 0, 1, 0, 0, 0)
  ON CONFLICT (property_id, date)
  DO UPDATE SET saves = property_analytics.saves + 1, updated_at = now();
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_favorite_created ON favorites;
CREATE TRIGGER trg_favorite_created
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION on_favorite_created();

-- 3. Trigger: on inquiries insert → increment contacts + create property_lead
CREATE OR REPLACE FUNCTION public.on_inquiry_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid;
BEGIN
  IF NEW.property_id IS NULL THEN RETURN NEW; END IF;
  
  SELECT COALESCE(agent_id, owner_id) INTO v_agent_id
  FROM properties WHERE id = NEW.property_id;
  
  IF v_agent_id IS NULL THEN RETURN NEW; END IF;
  
  -- Increment contacts in analytics
  INSERT INTO property_analytics (property_id, agent_id, date, views, saves, contacts, shares, clicks)
  VALUES (NEW.property_id, v_agent_id, CURRENT_DATE, 0, 0, 1, 0, 0)
  ON CONFLICT (property_id, date)
  DO UPDATE SET contacts = property_analytics.contacts + 1, updated_at = now();
  
  -- Create a lead
  INSERT INTO property_leads (agent_id, property_id, lead_name, lead_email, lead_phone, lead_source, status, lead_score)
  VALUES (
    v_agent_id,
    NEW.property_id,
    COALESCE(NEW.contact_name, 'Unknown'),
    NEW.contact_email,
    NEW.contact_phone,
    'website',
    'new',
    CASE
      WHEN NEW.contact_email IS NOT NULL AND NEW.contact_phone IS NOT NULL THEN 60
      WHEN NEW.contact_email IS NOT NULL THEN 40
      ELSE 20
    END
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inquiry_created ON inquiries;
CREATE TRIGGER trg_inquiry_created
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION on_inquiry_created();

-- 4. Seed function: populate property_analytics with historical data for a sample of properties
CREATE OR REPLACE FUNCTION public.seed_agent_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop RECORD;
  d DATE;
  base_views INT;
  base_saves INT;
  base_contacts INT;
BEGIN
  -- Only seed if table is empty
  IF EXISTS (SELECT 1 FROM property_analytics LIMIT 1) THEN RETURN; END IF;
  
  -- Seed for up to 500 properties (to keep it manageable) over last 90 days
  FOR prop IN
    SELECT id, COALESCE(agent_id, owner_id) as eff_agent_id, price, property_type, status
    FROM properties
    WHERE COALESCE(agent_id, owner_id) IS NOT NULL
    ORDER BY created_at DESC NULLS LAST
    LIMIT 500
  LOOP
    -- Base metrics depend on property attributes
    base_views := CASE 
      WHEN prop.price > 5000000000 THEN 15
      WHEN prop.price > 1000000000 THEN 10
      ELSE 6
    END;
    base_saves := GREATEST(1, base_views / 4);
    base_contacts := GREATEST(0, base_views / 8);
    
    FOR d IN SELECT generate_series(CURRENT_DATE - 89, CURRENT_DATE, '1 day'::interval)::date
    LOOP
      INSERT INTO property_analytics (property_id, agent_id, date, views, saves, contacts, shares, clicks)
      VALUES (
        prop.id,
        prop.eff_agent_id,
        d,
        base_views + floor(random() * base_views)::int,
        base_saves + floor(random() * base_saves)::int,
        base_contacts + floor(random() * (base_contacts + 1))::int,
        floor(random() * 3)::int,
        floor(random() * (base_views / 2 + 1))::int
      )
      ON CONFLICT (property_id, date) DO NOTHING;
    END LOOP;
  END LOOP;
  
  -- Also seed some leads from existing inquiries
  INSERT INTO property_leads (agent_id, property_id, lead_name, lead_email, lead_phone, lead_source, status, lead_score, created_at)
  SELECT 
    COALESCE(p.agent_id, p.owner_id),
    i.property_id,
    COALESCE(i.contact_name, 'Unknown'),
    i.contact_email,
    i.contact_phone,
    'website',
    'new',
    CASE WHEN i.contact_email IS NOT NULL AND i.contact_phone IS NOT NULL THEN 60
         WHEN i.contact_email IS NOT NULL THEN 40 ELSE 20 END,
    COALESCE(i.created_at, now())
  FROM inquiries i
  JOIN properties p ON p.id = i.property_id
  WHERE i.property_id IS NOT NULL
    AND COALESCE(p.agent_id, p.owner_id) IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$;

-- Run the seed
SELECT seed_agent_analytics();
