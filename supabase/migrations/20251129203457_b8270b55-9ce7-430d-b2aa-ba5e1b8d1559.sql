-- Create triggers for application admin alerts
-- Drop existing triggers first if they exist (to avoid duplicates)
DROP TRIGGER IF EXISTS trigger_property_owner_application_alert ON property_owner_requests;
DROP TRIGGER IF EXISTS trigger_vendor_application_alert ON vendor_requests;
DROP TRIGGER IF EXISTS trigger_agent_application_alert ON agent_registration_requests;

-- Create trigger for property owner applications
CREATE TRIGGER trigger_property_owner_application_alert
AFTER INSERT ON property_owner_requests
FOR EACH ROW
EXECUTE FUNCTION create_application_admin_alert();

-- Create trigger for vendor applications
CREATE TRIGGER trigger_vendor_application_alert
AFTER INSERT ON vendor_requests
FOR EACH ROW
EXECUTE FUNCTION create_application_admin_alert();

-- Create trigger for agent applications
CREATE TRIGGER trigger_agent_application_alert
AFTER INSERT ON agent_registration_requests
FOR EACH ROW
EXECUTE FUNCTION create_application_admin_alert();