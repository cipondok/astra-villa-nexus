-- Fix search path for notify_inquiry_email function
CREATE OR REPLACE FUNCTION public.notify_inquiry_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  -- Call the edge function to send inquiry email
  PERFORM extensions.http_post(
    'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/send-inquiry-email',
    jsonb_build_object(
      'inquiry_id', NEW.id,
      'customer_email', COALESCE(NEW.contact_email, 
        (SELECT email FROM public.profiles WHERE id = NEW.user_id)),
      'customer_name', COALESCE(
        (SELECT full_name FROM public.profiles WHERE id = NEW.user_id),
        'Valued Customer'
      ),
      'inquiry_type', NEW.inquiry_type,
      'message', NEW.message
    )::text,
    jsonb_build_object('Content-Type', 'application/json')
  );
  
  RETURN NEW;
END;
$$;