-- Create approved service names table
CREATE TABLE public.approved_service_names (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES vendor_service_categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service name requests table for vendor requests
CREATE TABLE public.service_name_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES vendor_service_categories(id),
  requested_by UUID REFERENCES profiles(id) NOT NULL,
  reviewed_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.approved_service_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_name_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approved_service_names
CREATE POLICY "Everyone can view active service names" 
ON public.approved_service_names 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage service names" 
ON public.approved_service_names 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- RLS Policies for service_name_requests
CREATE POLICY "Vendors can create service name requests" 
ON public.service_name_requests 
FOR INSERT 
WITH CHECK (
  requested_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
);

CREATE POLICY "Vendors can view their own requests" 
ON public.service_name_requests 
FOR SELECT 
USING (requested_by = auth.uid());

CREATE POLICY "Admins can manage all service name requests" 
ON public.service_name_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Add trigger for updated_at
CREATE TRIGGER update_approved_service_names_updated_at
BEFORE UPDATE ON public.approved_service_names
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some default service names
INSERT INTO public.approved_service_names (service_name, description, created_by) VALUES
('AC Repair & Maintenance', 'Air conditioning repair and maintenance services', NULL),
('Plumbing Services', 'General plumbing installation and repair', NULL),
('Electrical Installation', 'Electrical wiring and installation services', NULL),
('House Cleaning', 'Residential cleaning services', NULL),
('Pest Control', 'Pest elimination and prevention services', NULL),
('Landscaping & Gardening', 'Garden design and maintenance', NULL),
('Home Security Installation', 'Security system installation and setup', NULL),
('Appliance Repair', 'Home appliance repair services', NULL),
('Painting Services', 'Interior and exterior painting', NULL),
('Carpentry Services', 'Custom carpentry and woodwork', NULL);

-- Update vendor_services table to require admin approval
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS approved_service_name_id UUID REFERENCES approved_service_names(id),
ADD COLUMN IF NOT EXISTS admin_approval_status TEXT DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS admin_approval_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;