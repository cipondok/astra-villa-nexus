
-- Property alerts table for matching new listings to saved searches
CREATE TABLE public.property_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  search_name TEXT,
  property_title TEXT,
  property_image TEXT,
  property_price NUMERIC,
  match_reason TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.property_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.property_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.property_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts" ON public.property_alerts
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_property_alerts_user_id ON public.property_alerts(user_id);
CREATE INDEX idx_property_alerts_created_at ON public.property_alerts(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_alerts;

-- Trigger function: when a new property is inserted, match against saved searches
CREATE OR REPLACE FUNCTION public.match_property_to_searches()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  search_rec RECORD;
  filters JSONB;
  prop_city TEXT;
  prop_type TEXT;
  prop_price NUMERIC;
  match_found BOOLEAN;
  match_reason TEXT;
  prop_image TEXT;
BEGIN
  -- Get property details
  prop_city := NEW.city;
  prop_type := NEW.property_type;
  prop_price := NEW.price;
  
  -- Get first image
  IF NEW.images IS NOT NULL AND jsonb_array_length(to_jsonb(NEW.images)) > 0 THEN
    prop_image := NEW.images[1];
  END IF;

  -- Loop through active saved searches with notifications enabled
  FOR search_rec IN
    SELECT id, user_id, name, filters
    FROM public.user_searches
    WHERE is_active = true
    AND email_notifications = true
  LOOP
    match_found := false;
    match_reason := '';
    filters := search_rec.filters;
    
    -- Skip if no filters
    IF filters IS NULL THEN
      CONTINUE;
    END IF;

    -- Match by city
    IF filters->>'city' IS NOT NULL AND prop_city IS NOT NULL THEN
      IF lower(prop_city) = lower(filters->>'city') THEN
        match_found := true;
        match_reason := 'City: ' || prop_city;
      END IF;
    END IF;

    -- Match by property type
    IF filters->>'propertyType' IS NOT NULL AND prop_type IS NOT NULL THEN
      IF lower(prop_type) = lower(filters->>'propertyType') THEN
        IF match_found THEN
          match_reason := match_reason || ', Type: ' || prop_type;
        ELSE
          match_found := true;
          match_reason := 'Type: ' || prop_type;
        END IF;
      END IF;
    END IF;

    -- Match by price range
    IF filters->>'minPrice' IS NOT NULL AND prop_price IS NOT NULL THEN
      IF prop_price >= (filters->>'minPrice')::numeric THEN
        IF filters->>'maxPrice' IS NOT NULL THEN
          IF prop_price <= (filters->>'maxPrice')::numeric THEN
            IF match_found THEN
              match_reason := match_reason || ', Price match';
            ELSE
              match_found := true;
              match_reason := 'Price match';
            END IF;
          END IF;
        ELSE
          IF match_found THEN
            match_reason := match_reason || ', Price match';
          ELSE
            match_found := true;
            match_reason := 'Price match';
          END IF;
        END IF;
      END IF;
    END IF;

    -- Don't alert user about their own property
    IF match_found AND search_rec.user_id != NEW.user_id THEN
      INSERT INTO public.property_alerts (
        user_id, search_id, property_id,
        search_name, property_title, property_image, property_price,
        match_reason
      ) VALUES (
        search_rec.user_id, search_rec.id, NEW.id,
        search_rec.name, NEW.title, prop_image, prop_price,
        match_reason
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Attach trigger to properties table
CREATE TRIGGER trigger_match_property_to_searches
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.match_property_to_searches();
