-- Fix Supabase security warnings by adding search_path to functions

-- Fix function search path mutable warnings by setting secure search paths
CREATE OR REPLACE FUNCTION public.update_ticket_updated_at()
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

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin_safe(user_email text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN user_email IS NOT NULL THEN user_email = 'mycode103@gmail.com'
    ELSE EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND email = 'mycode103@gmail.com'
    )
  END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_error_signature(error_message text, table_name text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(digest(COALESCE(table_name, '') || '|' || error_message, 'sha256'), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_super_admin_access()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT p.email = 'mycode103@gmail.com'
     FROM public.profiles p 
     WHERE p.id = auth.uid()),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_change_business_nature(vendor_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_record RECORD;
  days_since_finalized INTEGER;
BEGIN
  SELECT 
    business_finalized_at,
    last_nature_change_at,
    can_change_nature
  INTO profile_record
  FROM public.vendor_business_profiles 
  WHERE vendor_id = $1;
  
  -- If no profile exists, allow change
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- If admin disabled changes
  IF profile_record.can_change_nature = false THEN
    RETURN false;
  END IF;
  
  -- If never finalized, allow change
  IF profile_record.business_finalized_at IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if 30 days have passed since finalization or last change
  days_since_finalized := EXTRACT(days FROM (now() - COALESCE(profile_record.last_nature_change_at, profile_record.business_finalized_at)));
  
  RETURN days_since_finalized >= 30;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(p_ip_address inet)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  failed_attempts_count INTEGER;
BEGIN
  -- Count failed attempts from this IP in the last hour
  SELECT COUNT(*) INTO failed_attempts_count
  FROM public.login_attempts
  WHERE ip_address = p_ip_address
    AND success = false
    AND attempt_time > (now() - INTERVAL '1 hour');
  
  -- Return true if rate limit exceeded (5 attempts per hour)
  RETURN failed_attempts_count >= 5;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_locked BOOLEAN := false;
BEGIN
  -- Check if account has active lockout
  SELECT EXISTS(
    SELECT 1 FROM public.account_lockouts
    WHERE email = p_email
      AND is_active = true
      AND unlock_at > now()
  ) INTO is_locked;
  
  RETURN is_locked;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_authorized_support_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin_direct()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  -- Get current user email directly from auth.users without triggering RLS
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user is super admin by email
  RETURN user_email = 'mycode103@gmail.com';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_device_fingerprint text DEFAULT NULL::text, p_location_data jsonb DEFAULT NULL::jsonb, p_risk_score integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_security_logs (
    user_id, event_type, ip_address, user_agent, device_fingerprint, 
    location_data, risk_score, is_flagged
  )
  VALUES (
    p_user_id, p_event_type, p_ip_address, p_user_agent, p_device_fingerprint,
    p_location_data, p_risk_score, p_risk_score > 70
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_account_lockout(p_email text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address inet DEFAULT NULL::inet, p_duration_minutes integer DEFAULT 60)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lockout_id UUID;
  failed_count INTEGER;
BEGIN
  -- Count recent failed attempts
  SELECT COUNT(*) INTO failed_count
  FROM public.login_attempts
  WHERE email = p_email
    AND success = false
    AND attempt_time > (now() - INTERVAL '1 hour');
  
  -- Create lockout record
  INSERT INTO public.account_lockouts (
    user_id, email, unlock_at, failed_attempts, locked_by_ip
  ) VALUES (
    p_user_id, p_email, now() + (p_duration_minutes || ' minutes')::INTERVAL, 
    failed_count, p_ip_address
  ) RETURNING id INTO lockout_id;
  
  RETURN lockout_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_discount_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update discount status based on dates
  IF NEW.discount_start_date IS NOT NULL AND NEW.discount_end_date IS NOT NULL THEN
    NEW.is_discount_active = (NOW() >= NEW.discount_start_date AND NOW() <= NEW.discount_end_date AND NEW.discount_percentage > 0);
  ELSE
    NEW.is_discount_active = (NEW.discount_percentage > 0);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_available_payout_balance(p_user_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  available_balance NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO available_balance
  FROM public.payout_transactions
  WHERE user_id = p_user_id
    AND status = 'earned';
  
  RETURN available_balance;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_database_error(p_error_type text, p_error_message text, p_error_severity text DEFAULT 'ERROR'::text, p_table_name text DEFAULT NULL::text, p_suggested_fix text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  error_sig TEXT;
  existing_error_id UUID;
  result_id UUID;
BEGIN
  -- Generate error signature
  error_sig := generate_error_signature(p_error_message, p_table_name);
  
  -- Check if error already exists
  SELECT id INTO existing_error_id
  FROM public.database_error_tracking
  WHERE error_signature = error_sig
  AND is_resolved = false;
  
  IF existing_error_id IS NOT NULL THEN
    -- Update existing error
    UPDATE public.database_error_tracking
    SET 
      last_seen_at = now(),
      occurrence_count = occurrence_count + 1,
      updated_at = now()
    WHERE id = existing_error_id;
    
    result_id := existing_error_id;
  ELSE
    -- Insert new error
    INSERT INTO public.database_error_tracking (
      error_signature,
      error_type,
      error_message,
      error_severity,
      table_name,
      suggested_fix,
      metadata
    ) VALUES (
      error_sig,
      p_error_type,
      p_error_message,
      p_error_severity,
      p_table_name,
      p_suggested_fix,
      p_metadata
    ) RETURNING id INTO result_id;
  END IF;
  
  RETURN result_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_super_admin_email()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT email = 'mycode103@gmail.com' FROM auth.users WHERE id = auth.uid()),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_location_admin_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_admin_access()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  user_role text;
BEGIN
  -- Get current user info directly without triggering RLS
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if user is super admin by email
  IF user_email = 'mycode103@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Check if user has admin role in profiles (using a direct query)
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;