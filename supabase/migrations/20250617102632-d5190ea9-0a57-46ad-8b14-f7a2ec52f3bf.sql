
-- Create admin_alerts table for storing admin notifications
CREATE TABLE public.admin_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('user_registration', 'property_listing', 'agent_request', 'vendor_request', 'kyc_verification', 'system_issue')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  reference_id UUID,
  reference_type TEXT,
  action_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin users can manage admin alerts" 
  ON public.admin_alerts 
  FOR ALL 
  USING (is_current_user_admin());

-- Create index for performance
CREATE INDEX idx_admin_alerts_created_at ON public.admin_alerts(created_at DESC);
CREATE INDEX idx_admin_alerts_is_read ON public.admin_alerts(is_read);
CREATE INDEX idx_admin_alerts_type ON public.admin_alerts(type);

-- Add updated_at trigger
CREATE TRIGGER update_admin_alerts_updated_at
  BEFORE UPDATE ON public.admin_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for admin alerts
ALTER TABLE public.admin_alerts REPLICA IDENTITY FULL;
