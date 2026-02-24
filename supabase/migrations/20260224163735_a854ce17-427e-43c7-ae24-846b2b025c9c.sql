
-- Fix: notify_price_drop references wrong table name
-- The actual table is "favorites", not "user_property_favorites"
CREATE OR REPLACE FUNCTION notify_price_drop()
RETURNS trigger AS $$
DECLARE
  fav_user_id uuid;
  prop_title text;
  old_price numeric;
  new_price numeric;
BEGIN
  IF NEW.price IS NOT NULL AND OLD.price IS NOT NULL AND NEW.price < OLD.price THEN
    old_price := OLD.price;
    new_price := NEW.price;
    prop_title := COALESCE(NEW.title, 'Property');

    FOR fav_user_id IN
      SELECT user_id FROM favorites WHERE property_id = NEW.id
    LOOP
      INSERT INTO in_app_notifications (user_id, type, title, message, property_id, metadata)
      VALUES (
        fav_user_id,
        'price_drop',
        '💰 Price Drop: ' || prop_title,
        'Price dropped from Rp ' || to_char(old_price, 'FM999,999,999,999') || ' to Rp ' || to_char(new_price, 'FM999,999,999,999'),
        NEW.id,
        jsonb_build_object('old_price', old_price, 'new_price', new_price, 'drop_percent', round(((old_price - new_price) / old_price * 100)::numeric, 1))
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
