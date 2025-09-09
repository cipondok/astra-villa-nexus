-- Create an admin alert for the existing /listings 404 errors using a valid type
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
  'system_error',
  'Agent Listings Route Missing - RESOLVED',
  'Agents were getting 404 errors trying to access /listings. This route has now been added and redirects to agent dashboard.',
  'high',
  'route_missing',
  'technical',
  'error_logs',
  jsonb_build_object(
    'error_page', '/listings',
    'error_count', COUNT(*),
    'solution_status', 'route_added_redirects_to_agent_dashboard',
    'last_error', MAX(created_at),
    'resolution', 'Added /listings route that redirects to AgentDashboard component'
  ),
  false
FROM error_logs 
WHERE error_page = '/listings' 
AND error_type = '404'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_page
HAVING COUNT(*) > 0;