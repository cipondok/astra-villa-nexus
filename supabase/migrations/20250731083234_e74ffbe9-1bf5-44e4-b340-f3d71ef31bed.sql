-- Insert test alerts with valid types
INSERT INTO admin_alerts (title, message, type, priority, alert_category, is_read, action_required) VALUES 
('Test Unread Alert', 'This is a test unread alert to check notification system', 'system', 'medium', 'system', false, false),
('Test Read Alert', 'This is a test read alert', 'user', 'low', 'system', true, false),
('High Priority Alert', 'This requires immediate attention', 'security', 'high', 'security', false, true);