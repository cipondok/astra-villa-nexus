-- Insert test alerts with valid constraint types
INSERT INTO admin_alerts (title, message, type, priority, alert_category, is_read, action_required) VALUES 
('Test Unread System Alert', 'This is a test unread alert to check notification system', 'system_issue', 'medium', 'system', false, false),
('Test Read User Alert', 'This is a test read alert about user registration', 'user_registration', 'low', 'users', true, false),
('High Priority Security Alert', 'This requires immediate attention - security breach detected', 'security', 'high', 'security', false, true),
('Property Listing Alert', 'New property listing requires approval', 'property_listing', 'medium', 'properties', false, true),
('Vendor Request Alert', 'New vendor application received', 'vendor_request', 'medium', 'vendors', false, false);