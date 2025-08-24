-- Fix remaining Supabase security warnings - Part 2

-- Fix more functions that need secure search paths
CREATE OR REPLACE FUNCTION public.can_create_development_status(user_id uuid, dev_status text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  user_email text;
BEGIN
  -- Get user role from profiles
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  
  -- Get user email from auth.users for super admin check
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  -- Allow if user is super admin
  IF user_email = 'mycode103@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Allow if user has admin role
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Allow if user has agent role (authorized person)
  IF user_role = 'agent' THEN
    RETURN true;
  END IF;
  
  -- Allow if user has property_owner role (authorized person)
  IF user_role = 'property_owner' THEN
    RETURN true;
  END IF;
  
  -- For restricted development statuses, only allow authorized users
  IF dev_status IN ('new_project', 'pre_launching') THEN
    RETURN false;
  END IF;
  
  -- Allow completed projects for all users
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.search_properties_optimized(p_search_text text DEFAULT NULL::text, p_property_type text DEFAULT NULL::text, p_listing_type text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_min_price numeric DEFAULT NULL::numeric, p_max_price numeric DEFAULT NULL::numeric, p_min_bedrooms integer DEFAULT NULL::integer, p_max_bedrooms integer DEFAULT NULL::integer, p_min_bathrooms integer DEFAULT NULL::integer, p_max_bathrooms integer DEFAULT NULL::integer, p_min_area integer DEFAULT NULL::integer, p_max_area integer DEFAULT NULL::integer, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, title text, description text, price numeric, property_type text, listing_type text, location text, city text, area text, state text, bedrooms integer, bathrooms integer, area_sqm integer, images text[], image_urls text[], status text, created_at timestamp with time zone, total_count bigint)
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_properties AS (
    SELECT 
      p.id, p.title, p.description, p.price, p.property_type, p.listing_type,
      p.location, p.city, p.area, p.state, p.bedrooms, p.bathrooms,
      p.area_sqm, p.images, p.image_urls, p.status, p.created_at,
      COUNT(*) OVER() as total_count
    FROM public.properties p
    WHERE p.status = 'available'
      AND (p_search_text IS NULL OR 
           to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', p_search_text) OR
           to_tsvector('english', p.location || ' ' || COALESCE(p.city, '') || ' ' || COALESCE(p.area, '')) @@ plainto_tsquery('english', p_search_text))
      AND (p_property_type IS NULL OR p.property_type = p_property_type)
      AND (p_listing_type IS NULL OR p.listing_type = p_listing_type)
      AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%')
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
      AND (p_max_bedrooms IS NULL OR p.bedrooms <= p_max_bedrooms)
      AND (p_min_bathrooms IS NULL OR p.bathrooms >= p_min_bathrooms)
      AND (p_max_bathrooms IS NULL OR p.bathrooms <= p_max_bathrooms)
      AND (p_min_area IS NULL OR p.area_sqm >= p_min_area)
      AND (p_max_area IS NULL OR p.area_sqm <= p_max_area)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_properties;
END;
$function$;

CREATE OR REPLACE FUNCTION public.resolve_database_error(p_error_signature text, p_fix_applied text, p_resolved_by uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE public.database_error_tracking
  SET 
    is_resolved = true,
    resolved_at = now(),
    resolved_by = p_resolved_by,
    fix_applied = p_fix_applied,
    updated_at = now()
  WHERE error_signature = p_error_signature
  AND is_resolved = false;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  completion_score INTEGER := 0;
  total_weight INTEGER := 100;
BEGIN
  -- Calculate completion based on field weights
  IF NEW.full_name IS NOT NULL AND LENGTH(NEW.full_name) > 2 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF NEW.phone IS NOT NULL AND NEW.phone ~ '^(\+62|62|0)8[1-9][0-9]{6,9}$' THEN
    completion_score := completion_score + 20;
  END IF;
  
  IF NEW.company_name IS NOT NULL AND LENGTH(NEW.company_name) > 2 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF NEW.license_number IS NOT NULL AND LENGTH(NEW.license_number) > 5 THEN
    completion_score := completion_score + 25;
  END IF;
  
  IF NEW.avatar_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF NEW.business_address IS NOT NULL AND LENGTH(NEW.business_address) > 5 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF NEW.years_experience IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Update the completion percentage
  NEW.profile_completion_percentage := completion_score;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.format_indonesian_phone(input_phone text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  digits TEXT;
  formatted_phone TEXT;
BEGIN
  -- Remove all non-digits
  digits := regexp_replace(input_phone, '\D', '', 'g');
  
  -- Handle different formats
  IF digits ~ '^628' THEN
    formatted_phone := '+' || digits;
  ELSIF digits ~ '^08' THEN
    formatted_phone := '+62' || substring(digits from 2);
  ELSIF digits ~ '^8' THEN
    formatted_phone := '+62' || digits;
  ELSE
    formatted_phone := input_phone; -- Return original if doesn't match pattern
  END IF;
  
  RETURN formatted_phone;
END;
$function$;

CREATE OR REPLACE FUNCTION public.aggregate_daily_analytics(target_date date DEFAULT CURRENT_DATE)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.daily_analytics (
    date,
    total_visitors,
    unique_visitors,
    total_page_views,
    total_searches,
    new_users,
    returning_users
  )
  VALUES (
    target_date,
    (SELECT COUNT(*) FROM public.web_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(DISTINCT visitor_id) FROM public.web_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM public.web_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM public.search_analytics WHERE DATE(created_at) = target_date),
    (SELECT COUNT(DISTINCT user_id) FROM public.web_analytics 
     WHERE DATE(created_at) = target_date AND user_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.web_analytics w2 
       WHERE w2.user_id = web_analytics.user_id 
       AND DATE(w2.created_at) < target_date
     )),
    (SELECT COUNT(DISTINCT user_id) FROM public.web_analytics 
     WHERE DATE(created_at) = target_date AND user_id IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.web_analytics w2 
       WHERE w2.user_id = web_analytics.user_id 
       AND DATE(w2.created_at) < target_date
     ))
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_visitors = EXCLUDED.total_visitors,
    unique_visitors = EXCLUDED.unique_visitors,
    total_page_views = EXCLUDED.total_page_views,
    total_searches = EXCLUDED.total_searches,
    new_users = EXCLUDED.new_users,
    returning_users = EXCLUDED.returning_users,
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_device_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_valid_indonesian_phone(phone_number text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN phone_number ~ '^(\+62|62|0)8[1-9][0-9]{6,9}$';
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin_by_email()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  -- Get current user email directly from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user is super admin by email (hardcoded check)
  RETURN user_email = 'mycode103@gmail.com';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_login_alert(p_user_id uuid, p_alert_type text, p_device_info jsonb DEFAULT '{}'::jsonb, p_ip_address inet DEFAULT NULL::inet, p_location_data jsonb DEFAULT '{}'::jsonb, p_message text DEFAULT ''::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.user_login_alerts (
    user_id, alert_type, device_info, ip_address, location_data, message
  ) VALUES (
    p_user_id, p_alert_type, p_device_info, p_ip_address, p_location_data, p_message
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_payout_transaction_for_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  commission_rate NUMERIC := 0.05; -- 5% default commission
  transaction_amount NUMERIC;
  recipient_id UUID;
BEGIN
  -- Only process when payment status changes to 'paid' or 'completed'
  IF NEW.payment_status IN ('paid', 'completed') AND 
     OLD.payment_status != NEW.payment_status THEN
    
    -- For rental bookings
    IF TG_TABLE_NAME = 'rental_bookings' THEN
      recipient_id := NEW.agent_id;
      transaction_amount := NEW.total_amount * commission_rate;
      
      INSERT INTO public.payout_transactions (
        user_id, booking_id, booking_type, transaction_type,
        amount, commission_rate, base_amount, description
      ) VALUES (
        recipient_id, NEW.id, 'rental', 'commission',
        transaction_amount, commission_rate, NEW.total_amount,
        'Commission from rental booking: ' || NEW.id
      );
    END IF;
    
    -- For vendor bookings  
    IF TG_TABLE_NAME = 'vendor_bookings' THEN
      recipient_id := NEW.vendor_id;
      -- For service providers, they get the full amount minus platform fee
      transaction_amount := NEW.total_amount * 0.95; -- 95% to vendor, 5% platform fee
      
      INSERT INTO public.payout_transactions (
        user_id, booking_id, booking_type, transaction_type,
        amount, commission_rate, base_amount, description
      ) VALUES (
        recipient_id, NEW.id, 'service', 'service_fee',
        transaction_amount, 0.95, NEW.total_amount,
        'Service payment from booking: ' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_property_rating_aggregates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Calculate new aggregates for the property
  INSERT INTO public.property_rating_aggregates (
    property_id,
    average_rating,
    total_ratings,
    rating_distribution,
    last_updated
  )
  SELECT 
    pr.property_id,
    ROUND(AVG(pr.rating::numeric), 2) as average_rating,
    COUNT(pr.rating) as total_ratings,
    jsonb_build_object(
      '1', COUNT(CASE WHEN pr.rating = 1 THEN 1 END),
      '2', COUNT(CASE WHEN pr.rating = 2 THEN 1 END),
      '3', COUNT(CASE WHEN pr.rating = 3 THEN 1 END),
      '4', COUNT(CASE WHEN pr.rating = 4 THEN 1 END),
      '5', COUNT(CASE WHEN pr.rating = 5 THEN 1 END)
    ) as rating_distribution,
    now() as last_updated
  FROM public.property_ratings pr
  WHERE pr.property_id = COALESCE(NEW.property_id, OLD.property_id)
  GROUP BY pr.property_id
  ON CONFLICT (property_id) 
  DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_ratings = EXCLUDED.total_ratings,
    rating_distribution = EXCLUDED.rating_distribution,
    last_updated = EXCLUDED.last_updated;
    
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_page_error(p_error_type text DEFAULT '404'::text, p_error_page text DEFAULT ''::text, p_user_ip inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_referrer_url text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.error_logs (
    error_type,
    error_page,
    user_ip,
    user_agent,
    referrer_url,
    user_id,
    metadata
  ) VALUES (
    p_error_type,
    p_error_page,
    p_user_ip,
    p_user_agent,
    p_referrer_url,
    auth.uid(),
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_survey_booking(p_property_id uuid, p_customer_name text, p_customer_email text, p_customer_phone text, p_preferred_date date, p_preferred_time time without time zone, p_message text DEFAULT NULL::text, p_survey_type text DEFAULT 'property_survey'::text, p_property_title text DEFAULT ''::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  booking_id uuid;
BEGIN
  -- Validate input data
  IF p_customer_name IS NULL OR LENGTH(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  
  IF p_customer_email IS NULL OR LENGTH(trim(p_customer_email)) = 0 THEN
    RAISE EXCEPTION 'Customer email is required';
  END IF;
  
  IF p_customer_phone IS NULL OR LENGTH(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;
  
  -- Insert the booking with controlled data
  INSERT INTO public.property_survey_bookings (
    property_id,
    customer_name,
    customer_email,
    customer_phone,
    preferred_date,
    preferred_time,
    message,
    survey_type,
    property_title,
    status
  ) VALUES (
    p_property_id,
    trim(p_customer_name),
    trim(lower(p_customer_email)),
    trim(p_customer_phone),
    p_preferred_date,
    p_preferred_time,
    p_message,
    p_survey_type,
    p_property_title,
    'pending'
  ) RETURNING id INTO booking_id;
  
  RETURN booking_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_security_status()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_status json;
  has_active_alerts boolean := false;
  is_locked boolean := false;
BEGIN
  -- Check if user has any unread security alerts (without exposing details)
  SELECT EXISTS(
    SELECT 1 FROM public.user_login_alerts 
    WHERE user_id = auth.uid() 
    AND is_read = false
    AND created_at > (now() - INTERVAL '7 days')
  ) INTO has_active_alerts;
  
  -- Check if account is currently locked (without exposing details)
  SELECT EXISTS(
    SELECT 1 FROM public.account_lockouts 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND unlock_at > now()
  ) INTO is_locked;
  
  -- Return sanitized security status
  user_status := json_build_object(
    'has_security_alerts', has_active_alerts,
    'account_locked', is_locked,
    'last_checked', now()
  );
  
  RETURN user_status;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_security_alerts_read()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_login_alerts 
  SET is_read = true 
  WHERE user_id = auth.uid() 
  AND is_read = false;
  
  RETURN true;
END;
$function$;