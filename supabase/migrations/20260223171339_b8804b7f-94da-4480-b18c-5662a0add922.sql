
CREATE OR REPLACE FUNCTION public.notify_admins_critical_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails text[];
  supabase_url text;
  service_key text;
BEGIN
  IF NEW.priority NOT IN ('critical', 'high') THEN
    RETURN NEW;
  END IF;

  SELECT array_agg(au.email)
  INTO admin_emails
  FROM auth.users au
  JOIN public.user_roles ur ON ur.user_id = au.id
  WHERE ur.role = 'admin' AND au.email IS NOT NULL;

  IF admin_emails IS NULL OR array_length(admin_emails, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  IF supabase_url IS NULL THEN
    supabase_url := current_setting('app.settings.supabase_url', true);
  END IF;
  IF service_key IS NULL THEN
    service_key := current_setting('app.settings.service_role_key', true);
  END IF;

  IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'to', to_jsonb(admin_emails),
        'template', 'general',
        'variables', jsonb_build_object('message',
          'CRITICAL ALERT: ' || NEW.title || E'\n\n' || NEW.message || E'\n\nPriority: ' || NEW.priority || E'\nCategory: ' || COALESCE(NEW.alert_category, 'unknown')
        ),
        'subject', '[URGENT] ' || NEW.title,
        'skipAuth', true
      )
    );
  END IF;

  RETURN NEW;
END;
$$;
