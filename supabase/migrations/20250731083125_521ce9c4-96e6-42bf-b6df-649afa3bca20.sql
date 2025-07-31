-- Insert test alerts to debug the notification system
INSERT INTO admin_alerts (title, message, type, priority, alert_category, is_read, action_required) VALUES 
('Test Unread Alert', 'This is a test unread alert to check notification system', 'info', 'medium', 'system', false, false),
('Test Read Alert', 'This is a test read alert', 'info', 'low', 'system', true, false),
('High Priority Alert', 'This requires immediate attention', 'warning', 'high', 'security', false, true);