-- Fix SECURITY DEFINER functions by adding SET search_path = 'public'
-- This prevents search_path manipulation attacks

-- Fix lock_vendor_main_category trigger function
CREATE OR REPLACE FUNCTION public.lock_vendor_main_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- If main_service_category_id is being set for the first time and it's not null
  IF OLD.main_service_category_id IS NULL AND NEW.main_service_category_id IS NOT NULL THEN
    NEW.main_category_locked = true;
    NEW.main_category_locked_at = now();
    NEW.main_category_locked_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix log_cloudflare_settings_changes trigger function
CREATE OR REPLACE FUNCTION public.log_cloudflare_settings_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.cloudflare_audit_log (setting_id, action, changed_by, old_values, new_values)
    VALUES (
      NEW.id,
      'UPDATE',
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.cloudflare_audit_log (setting_id, action, changed_by, new_values)
    VALUES (
      NEW.id,
      'INSERT',
      auth.uid(),
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix unlock_vendor_main_category function
CREATE OR REPLACE FUNCTION public.unlock_vendor_main_category(p_vendor_id uuid, p_reason text DEFAULT 'Category change approved by support'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow CS or Admin to unlock
  IF NOT (check_admin_access() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer_service')) THEN
    RAISE EXCEPTION 'Only customer service or admin can unlock main category';
  END IF;
  
  UPDATE public.vendor_business_profiles
  SET 
    main_category_locked = false,
    can_change_main_category = true,
    category_change_reason = p_reason,
    updated_at = now()
  WHERE vendor_id = p_vendor_id;
  
  RETURN true;
END;
$function$;