
-- 1. PRICE DROP NOTIFICATION TRIGGER
-- When a property's price is updated to a lower value, notify all users who favorited it
CREATE OR REPLACE FUNCTION notify_price_drop()
RETURNS trigger AS $$
DECLARE
  fav_user_id uuid;
  prop_title text;
  old_price numeric;
  new_price numeric;
BEGIN
  -- Only fire when price decreases
  IF NEW.price IS NOT NULL AND OLD.price IS NOT NULL AND NEW.price < OLD.price THEN
    old_price := OLD.price;
    new_price := NEW.price;
    prop_title := COALESCE(NEW.title, 'Property');

    -- Notify users who have this property in their user_property_favorites
    FOR fav_user_id IN
      SELECT user_id FROM user_property_favorites WHERE property_id = NEW.id
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_price_drop ON properties;
CREATE TRIGGER trg_notify_price_drop
  AFTER UPDATE OF price ON properties
  FOR EACH ROW
  EXECUTE FUNCTION notify_price_drop();

-- 2. VISIT STATUS CHANGE NOTIFICATION TRIGGER
-- When a property visit status changes, notify the visitor (and agent for new bookings)
CREATE OR REPLACE FUNCTION notify_visit_status_change()
RETURNS trigger AS $$
DECLARE
  prop_title text;
  notif_title text;
  notif_message text;
  notif_type text := 'appointment';
BEGIN
  -- Get property title
  SELECT title INTO prop_title FROM properties WHERE id = NEW.property_id;
  prop_title := COALESCE(prop_title, 'Property');

  IF TG_OP = 'INSERT' THEN
    -- New visit booked → notify agent
    INSERT INTO in_app_notifications (user_id, type, title, message, property_id, metadata)
    VALUES (
      NEW.agent_id,
      'appointment',
      '📅 New Visit Request',
      COALESCE(NEW.visitor_name, 'A visitor') || ' requested a visit for ' || prop_title || ' on ' || to_char(NEW.visit_date::date, 'Mon DD, YYYY'),
      NEW.property_id,
      jsonb_build_object('visit_id', NEW.id, 'status', NEW.status, 'visit_date', NEW.visit_date)
    );
    RETURN NEW;
  END IF;

  -- Status change → notify visitor
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        notif_title := '✅ Visit Confirmed';
        notif_message := 'Your visit to ' || prop_title || ' on ' || to_char(NEW.visit_date::date, 'Mon DD, YYYY') || ' has been confirmed!';
      WHEN 'declined' THEN
        notif_title := '❌ Visit Declined';
        notif_message := 'Your visit request for ' || prop_title || ' was declined.' || CASE WHEN NEW.cancellation_reason IS NOT NULL THEN ' Reason: ' || NEW.cancellation_reason ELSE '' END;
      WHEN 'completed' THEN
        notif_title := '🏠 Visit Completed';
        notif_message := 'Your visit to ' || prop_title || ' has been marked as completed.';
      WHEN 'cancelled' THEN
        notif_title := '🚫 Visit Cancelled';
        notif_message := 'The visit to ' || prop_title || ' was cancelled.' || CASE WHEN NEW.cancellation_reason IS NOT NULL THEN ' Reason: ' || NEW.cancellation_reason ELSE '' END;
        -- Also notify agent if visitor cancelled
        INSERT INTO in_app_notifications (user_id, type, title, message, property_id, metadata)
        VALUES (
          NEW.agent_id,
          'appointment',
          '🚫 Visit Cancelled by Visitor',
          COALESCE(NEW.visitor_name, 'A visitor') || ' cancelled the visit to ' || prop_title,
          NEW.property_id,
          jsonb_build_object('visit_id', NEW.id, 'status', NEW.status)
        );
      WHEN 'no_show' THEN
        notif_title := '⚠️ Marked as No Show';
        notif_message := 'You were marked as a no-show for the visit to ' || prop_title || '.';
      ELSE
        RETURN NEW;
    END CASE;

    INSERT INTO in_app_notifications (user_id, type, title, message, property_id, metadata)
    VALUES (
      NEW.visitor_id,
      'appointment',
      notif_title,
      notif_message,
      NEW.property_id,
      jsonb_build_object('visit_id', NEW.id, 'status', NEW.status, 'visit_date', NEW.visit_date)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_visit_status ON property_visits;
CREATE TRIGGER trg_notify_visit_status
  AFTER INSERT OR UPDATE OF status ON property_visits
  FOR EACH ROW
  EXECUTE FUNCTION notify_visit_status_change();

-- 3. REFERRAL ACTIVITY NOTIFICATION TRIGGER
-- When a referral status changes, notify the referrer
CREATE OR REPLACE FUNCTION notify_referral_activity()
RETURNS trigger AS $$
DECLARE
  notif_title text;
  notif_message text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New referral signup
    INSERT INTO in_app_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.referrer_id,
      'system',
      '🎉 New Referral Signup!',
      'Someone signed up using your referral code "' || NEW.referral_code || '"!',
      jsonb_build_object('referral_id', NEW.id, 'status', NEW.status)
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'qualified' THEN
        notif_title := '⭐ Referral Qualified!';
        notif_message := 'Your referral has been qualified! Rewards may be on the way.';
      WHEN 'converted' THEN
        notif_title := '🏆 Referral Converted!';
        notif_message := 'Your referral made a purchase! You earned a reward.' || CASE WHEN NEW.referrer_reward_amount IS NOT NULL THEN ' Amount: Rp ' || to_char(NEW.referrer_reward_amount, 'FM999,999,999') ELSE '' END;
      WHEN 'rewarded' THEN
        notif_title := '💰 Referral Reward Paid!';
        notif_message := 'Your referral reward of Rp ' || COALESCE(to_char(NEW.referrer_reward_amount, 'FM999,999,999'), '0') || ' has been processed!';
      ELSE
        RETURN NEW;
    END CASE;

    INSERT INTO in_app_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.referrer_id,
      'system',
      notif_title,
      notif_message,
      jsonb_build_object('referral_id', NEW.id, 'status', NEW.status, 'reward_amount', NEW.referrer_reward_amount)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_referral ON acquisition_referrals;
CREATE TRIGGER trg_notify_referral
  AFTER INSERT OR UPDATE OF status ON acquisition_referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_activity();
