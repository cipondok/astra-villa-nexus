-- Create missing tables for complete project diagnostic system

-- KYC Status table for vendor verification
CREATE TABLE public.vendor_kyc_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kyc_status text NOT NULL DEFAULT 'pending',
  verification_level text NOT NULL DEFAULT 'basic',
  compliance_score integer DEFAULT 0,
  access_level text NOT NULL DEFAULT 'restricted',
  documents_required jsonb DEFAULT '[]'::jsonb,
  documents_submitted jsonb DEFAULT '[]'::jsonb,
  documents_verified jsonb DEFAULT '[]'::jsonb,
  verification_notes text,
  verified_by uuid REFERENCES public.profiles(id),
  verified_at timestamp with time zone,
  next_review_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Booking Payments table for payment processing
CREATE TABLE public.booking_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_gateway text,
  gateway_transaction_id text,
  gateway_response jsonb DEFAULT '{}'::jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Vendor ASTRA Balances for token management
CREATE TABLE public.vendor_astra_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_balance numeric(15,2) NOT NULL DEFAULT 0,
  pending_balance numeric(15,2) NOT NULL DEFAULT 0,
  total_earned numeric(15,2) NOT NULL DEFAULT 0,
  total_withdrawn numeric(15,2) NOT NULL DEFAULT 0,
  last_transaction_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(vendor_id)
);

-- Web Analytics table for tracking
CREATE TABLE public.web_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text,
  user_id uuid REFERENCES public.profiles(id),
  page_path text NOT NULL,
  referrer text,
  user_agent text,
  ip_address inet,
  session_id text,
  page_title text,
  visit_duration integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Search Analytics table
CREATE TABLE public.search_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  search_query text NOT NULL,
  results_count integer DEFAULT 0,
  filters_applied jsonb DEFAULT '{}'::jsonb,
  clicked_result_id uuid,
  clicked_position integer,
  search_type text DEFAULT 'property',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Vendor Main Categories table
CREATE TABLE public.vendor_main_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Customer Service Reports table
CREATE TABLE public.system_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  reported_by uuid REFERENCES public.profiles(id),
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_vendor_kyc_status_vendor_id ON public.vendor_kyc_status(vendor_id);
CREATE INDEX idx_vendor_kyc_status_status ON public.vendor_kyc_status(kyc_status);
CREATE INDEX idx_booking_payments_booking_id ON public.booking_payments(booking_id);
CREATE INDEX idx_booking_payments_status ON public.booking_payments(payment_status);
CREATE INDEX idx_vendor_astra_balances_vendor_id ON public.vendor_astra_balances(vendor_id);
CREATE INDEX idx_web_analytics_user_id ON public.web_analytics(user_id);
CREATE INDEX idx_web_analytics_created_at ON public.web_analytics(created_at);
CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);
CREATE INDEX idx_system_reports_target_type ON public.system_reports(target_type);
CREATE INDEX idx_system_reports_status ON public.system_reports(status);

-- Enable RLS
ALTER TABLE public.vendor_kyc_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_astra_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_kyc_status
CREATE POLICY "Admins can manage all KYC status" ON public.vendor_kyc_status
FOR ALL USING (check_admin_access());

CREATE POLICY "Vendors can view their own KYC status" ON public.vendor_kyc_status
FOR SELECT USING (vendor_id = auth.uid());

-- RLS Policies for booking_payments
CREATE POLICY "Admins can manage all payments" ON public.booking_payments
FOR ALL USING (check_admin_access());

-- RLS Policies for vendor_astra_balances
CREATE POLICY "Admins can view all balances" ON public.vendor_astra_balances
FOR SELECT USING (check_admin_access());

CREATE POLICY "Vendors can view their own balance" ON public.vendor_astra_balances
FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "System can manage balances" ON public.vendor_astra_balances
FOR ALL USING (true);

-- RLS Policies for web_analytics
CREATE POLICY "Admins can manage analytics" ON public.web_analytics
FOR ALL USING (check_admin_access());

-- RLS Policies for search_analytics
CREATE POLICY "Admins can manage search analytics" ON public.search_analytics
FOR ALL USING (check_admin_access());

-- RLS Policies for vendor_main_categories
CREATE POLICY "Anyone can view active categories" ON public.vendor_main_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.vendor_main_categories
FOR ALL USING (check_admin_access());

-- RLS Policies for system_reports
CREATE POLICY "Admins can manage all reports" ON public.system_reports
FOR ALL USING (check_admin_access());

CREATE POLICY "Users can create reports" ON public.system_reports
FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can view their own reports" ON public.system_reports
FOR SELECT USING (reported_by = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_vendor_kyc_status_updated_at
  BEFORE UPDATE ON public.vendor_kyc_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_astra_balances_updated_at
  BEFORE UPDATE ON public.vendor_astra_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_main_categories_updated_at
  BEFORE UPDATE ON public.vendor_main_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_reports_updated_at
  BEFORE UPDATE ON public.system_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial data for vendor categories
INSERT INTO public.vendor_main_categories (name, description, icon, display_order) VALUES
('Property Management', 'Property maintenance and management services', 'Building', 1),
('Cleaning Services', 'Professional cleaning and maintenance', 'Sparkles', 2),
('Repairs & Maintenance', 'Home and property repair services', 'Wrench', 3),
('Security Services', 'Property security and monitoring', 'Shield', 4),
('Landscaping', 'Garden and outdoor maintenance', 'TreePine', 5);

-- Enable realtime for important tables
ALTER TABLE public.vendor_kyc_status REPLICA IDENTITY FULL;
ALTER TABLE public.booking_payments REPLICA IDENTITY FULL;
ALTER TABLE public.vendor_astra_balances REPLICA IDENTITY FULL;
ALTER TABLE public.system_reports REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_kyc_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_astra_balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_reports;