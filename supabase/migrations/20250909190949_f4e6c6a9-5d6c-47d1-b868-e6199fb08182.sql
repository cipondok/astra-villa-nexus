-- Create trigger for 404 error admin alerts
DROP TRIGGER IF EXISTS create_404_alert_trigger ON error_logs;
CREATE TRIGGER create_404_alert_trigger 
    AFTER INSERT ON error_logs
    FOR EACH ROW 
    EXECUTE FUNCTION create_admin_alert_for_404();

-- Create an admin alert for the existing /listings 404 errors
INSERT INTO admin_alerts (
  type,
  title,
  message,
  priority,
  reference_type,
  alert_category,
  source_table,
  metadata,
  action_required
)
SELECT 
  '404_error',
  'Agent Listings Route Missing',
  'Agents are getting 404 errors trying to access /listings - route has been added',
  'high',
  'route_missing',
  'technical',
  'error_logs',
  jsonb_build_object(
    'error_page', '/listings',
    'error_count', COUNT(*),
    'solution_status', 'route_added',
    'last_error', MAX(created_at)
  ),
  false
FROM error_logs 
WHERE error_page = '/listings' 
AND error_type = '404'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_page
HAVING COUNT(*) > 0;