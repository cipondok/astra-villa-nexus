
-- First, let's update the admin_alerts table to support more alert types and better categorization
ALTER TABLE public.admin_alerts DROP CONSTRAINT IF EXISTS admin_alerts_type_check;

-- Add new alert types for comprehensive monitoring
ALTER TABLE public.admin_alerts ADD CONSTRAINT admin_alerts_type_check 
CHECK (type IN (
  'user_registration', 'property_listing', 'agent_request', 'vendor_request', 
  'kyc_verification', 'system_issue', 'customer_complaint', 'inquiry', 
  'report', 'payment', 'security', 'maintenance', 'performance', 'abuse'
));

-- Add additional metadata fields for better alert management
ALTER TABLE public.admin_alerts ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE public.admin_alerts ADD COLUMN IF NOT EXISTS alert_category text DEFAULT 'general';
ALTER TABLE public.admin_alerts ADD COLUMN IF NOT EXISTS urgency_level integer DEFAULT 1; -- 1-5 scale
ALTER TABLE public.admin_alerts ADD COLUMN IF NOT EXISTS auto_generated boolean DEFAULT true;
ALTER TABLE public.admin_alerts ADD COLUMN IF NOT EXISTS source_table text;
ALTER TABLE public.admin_alerts ADD COLUMN IF NOT EXISTS source_id uuid;

-- Create a table for alert rules/configurations
CREATE TABLE IF NOT EXISTS public.admin_alert_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name text NOT NULL,
  event_type text NOT NULL,
  conditions jsonb DEFAULT '{}',
  alert_template jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for alert rules
ALTER TABLE public.admin_alert_rules ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to alert rules
CREATE POLICY "Admin users can manage alert rules" 
  ON public.admin_alert_rules 
  FOR ALL 
  USING (is_current_user_admin());

-- Create a table for customer complaints
CREATE TABLE IF NOT EXISTS public.customer_complaints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  complaint_type text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES auth.users(id),
  resolution_notes text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for customer complaints
ALTER TABLE public.customer_complaints ENABLE ROW LEVEL SECURITY;

-- Create policies for customer complaints
CREATE POLICY "Users can create complaints" 
  ON public.customer_complaints 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their complaints" 
  ON public.customer_complaints 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Admin can manage all complaints" 
  ON public.customer_complaints 
  FOR ALL 
  USING (is_current_user_admin());

-- Create a table for general inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  inquiry_type text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  contact_email text,
  contact_phone text,
  property_id uuid REFERENCES properties(id),
  status text DEFAULT 'new' CHECK (status IN ('new', 'responded', 'closed')),
  admin_response text,
  responded_by uuid REFERENCES auth.users(id),
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for inquiries
CREATE POLICY "Anyone can create inquiries" 
  ON public.inquiries 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view their inquiries" 
  ON public.inquiries 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Admin can manage all inquiries" 
  ON public.inquiries 
  FOR ALL 
  USING (is_current_user_admin());

-- Create a table for system reports
CREATE TABLE IF NOT EXISTS public.system_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_by uuid REFERENCES auth.users(id),
  report_type text NOT NULL,
  target_type text NOT NULL, -- 'user', 'property', 'vendor', 'content'
  target_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  evidence_urls jsonb DEFAULT '[]',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id),
  admin_notes text,
  action_taken text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for system reports
ALTER TABLE public.system_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for system reports
CREATE POLICY "Users can create reports" 
  ON public.system_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admin can manage all reports" 
  ON public.system_reports 
  FOR ALL 
  USING (is_current_user_admin());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_alerts_category ON public.admin_alerts(alert_category);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_urgency ON public.admin_alerts(urgency_level DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_auto_generated ON public.admin_alerts(auto_generated);
CREATE INDEX IF NOT EXISTS idx_customer_complaints_status ON public.customer_complaints(status);
CREATE INDEX IF NOT EXISTS idx_customer_complaints_priority ON public.customer_complaints(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_system_reports_status ON public.system_reports(status);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_customer_complaints_updated_at
  BEFORE UPDATE ON public.customer_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_reports_updated_at
  BEFORE UPDATE ON public.system_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_alert_rules_updated_at
  BEFORE UPDATE ON public.admin_alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all alert-related tables
ALTER TABLE public.admin_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.customer_complaints REPLICA IDENTITY FULL;
ALTER TABLE public.inquiries REPLICA IDENTITY FULL;
ALTER TABLE public.system_reports REPLICA IDENTITY FULL;
ALTER TABLE public.admin_alert_rules REPLICA IDENTITY FULL;

-- Insert some default alert rules
INSERT INTO public.admin_alert_rules (rule_name, event_type, alert_template) VALUES
('New User Registration', 'user_registration', '{"title": "New User Registered", "type": "user_registration", "priority": "low", "alert_category": "users"}'),
('Property Listing', 'property_listing', '{"title": "New Property Listed", "type": "property_listing", "priority": "medium", "alert_category": "properties"}'),
('Customer Complaint', 'customer_complaint', '{"title": "New Customer Complaint", "type": "customer_complaint", "priority": "high", "alert_category": "support"}'),
('System Report', 'system_report', '{"title": "New System Report", "type": "report", "priority": "high", "alert_category": "moderation"}'),
('General Inquiry', 'inquiry', '{"title": "New Inquiry Received", "type": "inquiry", "priority": "medium", "alert_category": "support"}'),
('Security Alert', 'security_alert', '{"title": "Security Alert", "type": "security", "priority": "urgent", "alert_category": "security"}')
ON CONFLICT DO NOTHING;
