-- Create trigger to auto-send email when inquiry is created
CREATE OR REPLACE FUNCTION notify_inquiry_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the edge function to send inquiry email
  PERFORM net.http_post(
    url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/send-inquiry-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'inquiry_id', NEW.id,
      'customer_email', COALESCE(NEW.contact_email, 
        (SELECT email FROM profiles WHERE id = NEW.user_id)),
      'customer_name', COALESCE(
        (SELECT full_name FROM profiles WHERE id = NEW.user_id),
        'Valued Customer'
      ),
      'inquiry_type', NEW.inquiry_type,
      'message', NEW.message
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on inquiries table
DROP TRIGGER IF EXISTS trigger_inquiry_email ON inquiries;
CREATE TRIGGER trigger_inquiry_email
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_inquiry_email();

-- Add email template defaults to system_settings if they don't exist
INSERT INTO system_settings (category, key, value, is_public, description)
VALUES 
  ('email_templates', 'inquiry_received', 
   '{"subject": "Thank you for your inquiry", "body": "Dear {{customer_name}},\n\nThank you for contacting us. We have received your inquiry regarding {{inquiry_type}}.\n\nYour message: {{message}}\n\nWe will get back to you as soon as possible.\n\nBest regards,\nYour Team"}'::jsonb,
   false, 'Email template sent when inquiry is received'),
  ('email_templates', 'welcome', 
   '{"subject": "Welcome to our platform!", "body": "Hello {{user_name}},\n\nWelcome to our platform! We are excited to have you on board.\n\nYour email: {{email}}\n\nBest regards,\nThe Team"}'::jsonb,
   false, 'Welcome email for new users'),
  ('email_templates', 'verification', 
   '{"subject": "Verify your email address", "body": "Hello {{user_name}},\n\nPlease verify your email address by clicking this link:\n{{verification_link}}\n\nBest regards,\nThe Team"}'::jsonb,
   false, 'Email verification template')
ON CONFLICT (category, key) DO NOTHING;