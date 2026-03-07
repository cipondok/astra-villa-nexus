CREATE OR REPLACE FUNCTION match_property_to_searches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_rec RECORD;
  search_filters JSONB;
  prop_city TEXT;
  prop_type TEXT;
  prop_price NUMERIC;
  match_found BOOLEAN;
  match_reason TEXT;
  prop_image TEXT;
BEGIN
  prop_city := NEW.city;
  prop_type := NEW.property_type;
  prop_price := NEW.price;
  
  IF NEW.images IS NOT NULL AND jsonb_array_length(to_jsonb(NEW.images)) > 0 THEN
    prop_image := NEW.images[1];
  END IF;

  FOR search_rec IN
    SELECT id, user_id, name, filters AS search_filters
    FROM public.user_searches
    WHERE is_active = true
    AND email_notifications = true
  LOOP
    match_found := false;
    match_reason := '';
    search_filters := search_rec.search_filters;
    
    IF search_filters IS NULL THEN
      CONTINUE;
    END IF;

    IF search_filters->>'city' IS NOT NULL AND prop_city IS NOT NULL THEN
      IF lower(prop_city) = lower(search_filters->>'city') THEN
        match_found := true;
        match_reason := 'City: ' || prop_city;
      END IF;
    END IF;

    IF search_filters->>'propertyType' IS NOT NULL AND prop_type IS NOT NULL THEN
      IF lower(prop_type) = lower(search_filters->>'propertyType') THEN
        IF match_found THEN
          match_reason := match_reason || ', Type: ' || prop_type;
        ELSE
          match_found := true;
          match_reason := 'Type: ' || prop_type;
        END IF;
      END IF;
    END IF;

    IF search_filters->>'minPrice' IS NOT NULL AND prop_price IS NOT NULL THEN
      IF prop_price >= (search_filters->>'minPrice')::numeric THEN
        IF search_filters->>'maxPrice' IS NOT NULL THEN
          IF prop_price <= (search_filters->>'maxPrice')::numeric THEN
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