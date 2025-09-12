-- Create property services booking system
CREATE TABLE IF NOT EXISTS public.property_service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id),
  vendor_id UUID NOT NULL,
  service_id UUID REFERENCES vendor_services(id),
  property_id UUID REFERENCES properties(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  total_amount DECIMAL(12,2) NOT NULL,
  service_address TEXT NOT NULL,
  special_instructions TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  vendor_response TEXT,
  completion_notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property service categories for better organization
CREATE TABLE IF NOT EXISTS public.property_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requires_property_access BOOLEAN DEFAULT true,
  estimated_duration_hours INTEGER DEFAULT 2,
  pricing_model TEXT DEFAULT 'fixed' CHECK (pricing_model IN ('fixed', 'hourly', 'square_meter')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create service provider permissions
CREATE TABLE IF NOT EXISTS public.vendor_service_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  service_type_id UUID REFERENCES property_service_types(id),
  can_access_property BOOLEAN DEFAULT false,
  requires_supervision BOOLEAN DEFAULT true,
  insurance_verified BOOLEAN DEFAULT false,
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default property service types
INSERT INTO property_service_types (name, description, icon, requires_property_access, estimated_duration_hours, pricing_model) VALUES
('Property Management', 'Complete property oversight and maintenance coordination', '📊', true, 4, 'hourly'),
('Property Inspection', 'Detailed property condition assessment', '🔍', true, 2, 'fixed'),
('Maintenance Coordination', 'Scheduling and overseeing repair work', '🔧', true, 3, 'hourly'),
('Tenant Relations', 'Managing tenant communications and issues', '👥', false, 1, 'hourly'),
('Legal Documentation', 'Property legal paperwork and compliance', '📄', false, 2, 'fixed'),
('Financial Management', 'Rent collection and financial reporting', '💰', false, 2, 'hourly'),
('Emergency Response', '24/7 emergency property services', '🚨', true, 1, 'hourly'),
('Property Marketing', 'Listing and promotional services', '📢', true, 3, 'fixed'),
('Cleaning Coordination', 'Professional cleaning service management', '🧹', true, 2, 'square_meter'),
('Security Management', 'Property security and access control', '🔒', true, 2, 'hourly')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.property_service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_service_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_service_bookings
CREATE POLICY "Customers can view their own bookings" ON property_service_bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Vendors can view their bookings" ON property_service_bookings
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Customers can create bookings" ON property_service_bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Vendors can update their bookings" ON property_service_bookings
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage all bookings" ON property_service_bookings
  FOR ALL USING (check_admin_access());

-- RLS Policies for property_service_types
CREATE POLICY "Anyone can view active service types" ON property_service_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage service types" ON property_service_types
  FOR ALL USING (check_admin_access());

-- RLS Policies for vendor_service_permissions
CREATE POLICY "Vendors can view their permissions" ON vendor_service_permissions
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage all permissions" ON vendor_service_permissions
  FOR ALL USING (check_admin_access());

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER update_property_service_bookings_updated_at
  BEFORE UPDATE ON property_service_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_vendor_service_permissions_updated_at
  BEFORE UPDATE ON vendor_service_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();