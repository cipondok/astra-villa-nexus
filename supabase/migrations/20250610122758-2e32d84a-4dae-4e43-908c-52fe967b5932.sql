
-- Create main service categories
CREATE TABLE IF NOT EXISTS public.vendor_main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subcategories
CREATE TABLE IF NOT EXISTS public.vendor_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category_id UUID REFERENCES public.vendor_main_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update vendor_services to use the new category structure
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS main_category_id UUID REFERENCES public.vendor_main_categories(id),
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.vendor_subcategories(id);

-- Customer management table
CREATE TABLE IF NOT EXISTS public.vendor_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_type TEXT DEFAULT 'individual', -- individual, business
  relationship_status TEXT DEFAULT 'active', -- active, inactive, blocked
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vendor_id, customer_id)
);

-- Enhanced billing table
CREATE TABLE IF NOT EXISTS public.vendor_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.vendor_bookings(id),
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS public.vendor_project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.vendor_bookings(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_stage TEXT,
  status TEXT DEFAULT 'in_progress', -- not_started, in_progress, completed, on_hold, cancelled
  milestones JSONB DEFAULT '[]',
  next_action TEXT,
  estimated_completion DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced feedback system
CREATE TABLE IF NOT EXISTS public.vendor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.vendor_bookings(id),
  feedback_type TEXT NOT NULL, -- review, complaint, suggestion, compliment
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  response TEXT,
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Compliance tracking
CREATE TABLE IF NOT EXISTS public.vendor_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL, -- license, insurance, certification, permit
  requirement_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, compliant, non_compliant, expired
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  document_url TEXT,
  notes TEXT,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer service tickets
CREATE TABLE IF NOT EXISTS public.customer_service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  vendor_id UUID REFERENCES public.profiles(id),
  customer_id UUID REFERENCES public.profiles(id),
  booking_id UUID REFERENCES public.vendor_bookings(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- technical, billing, service_quality, complaint, other
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to UUID REFERENCES public.profiles(id),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Insert sample main categories
INSERT INTO public.vendor_main_categories (name, description, icon, display_order) VALUES
('Construction & Maintenance', 'Building, renovation, and maintenance services', '🏗️', 1),
('Professional Services', 'Consulting, design, and professional expertise', '💼', 2),
('Home Services', 'Household maintenance and improvement', '🏠', 3),
('Creative & Design', 'Artistic and design services', '🎨', 4),
('Technology', 'IT and technical services', '💻', 5),
('Cleaning & Sanitation', 'Cleaning and hygiene services', '🧹', 6)
ON CONFLICT DO NOTHING;

-- Insert sample subcategories
INSERT INTO public.vendor_subcategories (main_category_id, name, description, display_order) 
SELECT 
  mc.id,
  subcategory.name,
  subcategory.description,
  subcategory.display_order
FROM public.vendor_main_categories mc
CROSS JOIN (
  VALUES 
    ('Plumbing', 'Water systems installation and repair', 1),
    ('Electrical Work', 'Electrical installations and repairs', 2),
    ('Carpentry', 'Wood work and furniture making', 3),
    ('Painting', 'Interior and exterior painting', 4),
    ('Roofing', 'Roof installation and repair', 5)
) AS subcategory(name, description, display_order)
WHERE mc.name = 'Construction & Maintenance'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendor_subcategories (main_category_id, name, description, display_order) 
SELECT 
  mc.id,
  subcategory.name,
  subcategory.description,
  subcategory.display_order
FROM public.vendor_main_categories mc
CROSS JOIN (
  VALUES 
    ('Architecture', 'Building design and planning', 1),
    ('Interior Design', 'Space planning and decoration', 2),
    ('Engineering', 'Technical engineering services', 3),
    ('Legal Services', 'Legal consultation and services', 4),
    ('Accounting', 'Financial and accounting services', 5)
) AS subcategory(name, description, display_order)
WHERE mc.name = 'Professional Services'
ON CONFLICT DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.vendor_main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_service_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view main categories" ON public.vendor_main_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view subcategories" ON public.vendor_subcategories FOR SELECT USING (is_active = true);

-- RLS Policies for vendor-specific data
CREATE POLICY "Vendors can manage their customers" ON public.vendor_customers 
  FOR ALL USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can manage their invoices" ON public.vendor_invoices 
  FOR ALL USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can manage their project progress" ON public.vendor_project_progress 
  FOR ALL USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can view their feedback" ON public.vendor_feedback 
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Customers can create feedback" ON public.vendor_feedback 
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Vendors can manage their compliance" ON public.vendor_compliance 
  FOR ALL USING (vendor_id = auth.uid());

CREATE POLICY "Users can view relevant tickets" ON public.customer_service_tickets 
  FOR SELECT USING (vendor_id = auth.uid() OR customer_id = auth.uid());

CREATE POLICY "Users can create tickets" ON public.customer_service_tickets 
  FOR INSERT WITH CHECK (customer_id = auth.uid() OR vendor_id = auth.uid());
