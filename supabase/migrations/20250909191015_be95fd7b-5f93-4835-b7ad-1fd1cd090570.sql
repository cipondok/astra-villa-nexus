-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION create_admin_alert_for_404()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create alerts for frequent 404 errors (when there are multiple from same page)
  IF NEW.error_type = '404' THEN
    -- Check if this is a recurring issue (more than 2 errors on same page in last hour)
    IF (SELECT COUNT(*) FROM public.error_logs 
        WHERE error_page = NEW.error_page 
        AND error_type = '404' 
        AND created_at > NOW() - INTERVAL '1 hour') >= 2 THEN
      
      -- Create admin alert if one doesn't exist for this page today
      INSERT INTO public.admin_alerts (
        type,
        title,
        message,
        priority,
        reference_type,
        reference_id,
        alert_category,
        source_table,
        metadata,
        action_required
      )
      SELECT 
        '404_error',
        'Recurring 404 Error',
        'Page "' || NEW.error_page || '" is generating multiple 404 errors',
        'medium',
        'error_log',
        NEW.id,
        'technical',
        'error_logs',
        jsonb_build_object(
          'error_page', NEW.error_page,
          'error_count', (SELECT COUNT(*) FROM public.error_logs 
                         WHERE error_page = NEW.error_page 
                         AND error_type = '404' 
                         AND created_at > NOW() - INTERVAL '24 hours')
        ),
        true
      WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_alerts 
        WHERE type = '404_error' 
        AND metadata->>'error_page' = NEW.error_page
        AND created_at > NOW() - INTERVAL '24 hours'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger to automatically generate admin alerts for 404 errors
DROP TRIGGER IF EXISTS trigger_404_admin_alert ON public.error_logs;
CREATE TRIGGER trigger_404_admin_alert
  AFTER INSERT ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_alert_for_404();