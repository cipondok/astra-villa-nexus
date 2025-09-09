-- Fix the trigger function to use valid alert types
CREATE OR REPLACE FUNCTION create_admin_alert_for_404()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create alerts for frequent 404 errors (when there are multiple from same page)
  IF NEW.error_type = '404' THEN
    -- Check if this is a recurring issue (more than 2 errors on same page in last hour)
    IF (SELECT COUNT(*) FROM error_logs 
        WHERE error_page = NEW.error_page 
        AND error_type = '404' 
        AND created_at > NOW() - INTERVAL '1 hour') >= 2 THEN
      
      -- Create admin alert if one doesn't exist for this page today
      INSERT INTO admin_alerts (
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
        'system_issue',
        'Recurring 404 Error',
        'Page "' || NEW.error_page || '" is generating multiple 404 errors',
        'medium',
        'error_log',
        NEW.id,
        'technical',
        'error_logs',
        jsonb_build_object(
          'error_page', NEW.error_page,
          'error_count', (SELECT COUNT(*) FROM error_logs 
                         WHERE error_page = NEW.error_page 
                         AND error_type = '404' 
                         AND created_at > NOW() - INTERVAL '24 hours')
        ),
        true
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_alerts 
        WHERE type = 'system_issue' 
        AND metadata->>'error_page' = NEW.error_page
        AND created_at > NOW() - INTERVAL '24 hours'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create an admin alert for the existing /listings 404 errors
INSERT INTO admin_alerts (
  type,
  title,
  message,
  priority,
  alert_category,
  source_table,
  metadata,
  action_required
)
SELECT 
  'system_issue',
  'Agent Listings Route Missing - RESOLVED',
  'Agents were getting 404 errors trying to access /listings. Route has been added.',
  'high',
  'technical',
  'error_logs',
  jsonb_build_object(
    'error_page', '/listings',
    'error_count', COUNT(*),
    'resolution', 'Added /listings route redirecting to AgentDashboard'
  ),
  false
FROM error_logs 
WHERE error_page = '/listings' 
AND error_type = '404'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_page
HAVING COUNT(*) > 0;