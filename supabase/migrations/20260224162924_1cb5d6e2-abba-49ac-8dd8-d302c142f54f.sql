
-- Fix search_path on notification trigger functions
ALTER FUNCTION notify_price_drop() SET search_path = public;
ALTER FUNCTION notify_visit_status_change() SET search_path = public;
ALTER FUNCTION notify_referral_activity() SET search_path = public;
