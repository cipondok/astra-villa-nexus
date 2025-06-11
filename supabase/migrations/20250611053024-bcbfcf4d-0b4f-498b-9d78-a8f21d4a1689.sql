
-- Add business nature categories table
CREATE TABLE public.vendor_business_nature_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  allowed_duration_units TEXT[] DEFAULT ARRAY['hours', 'days', 'months'],
  change_restriction_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add vendor change requests table
CREATE TABLE public.vendor_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id),
  request_type TEXT NOT NULL, -- 'business_nature', 'profile_update', 'service_change'
  current_data JSONB,
  requested_data JSONB,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add vendor holidays table
CREATE TABLE public.vendor_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id),
  holiday_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'yearly', 'monthly', 'weekly'
  affects_all_services BOOLEAN DEFAULT true,
  affected_service_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update vendor_business_profiles table
ALTER TABLE public.vendor_business_profiles 
ADD COLUMN IF NOT EXISTS business_nature_id UUID REFERENCES public.vendor_business_nature_categories(id),
ADD COLUMN IF NOT EXISTS business_finalized_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_nature_change_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS can_change_nature BOOLEAN DEFAULT true;

-- Update vendor_services table for enhanced duration and location options
ALTER TABLE public.vendor_services
ADD COLUMN IF NOT EXISTS duration_unit TEXT DEFAULT 'hours', -- 'hours', 'days', 'months'
ADD COLUMN IF NOT EXISTS duration_value INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS service_location_types TEXT[] DEFAULT ARRAY['on_site'],
ADD COLUMN IF NOT EXISTS delivery_options JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS holiday_schedule_id UUID REFERENCES public.vendor_holidays(id);

-- Insert default business nature categories
INSERT INTO public.vendor_business_nature_categories (name, description, allowed_duration_units, display_order) VALUES
('Home Services', 'Cleaning, maintenance, repairs, etc.', ARRAY['hours', 'days'], 1),
('Professional Services', 'Consulting, legal, accounting, etc.', ARRAY['hours', 'days', 'months'], 2),
('Healthcare & Wellness', 'Medical, therapy, fitness, etc.', ARRAY['hours', 'days'], 3),
('Education & Training', 'Tutoring, courses, workshops, etc.', ARRAY['hours', 'days', 'months'], 4),
('Technology Services', 'IT support, software, web development, etc.', ARRAY['hours', 'days', 'months'], 5),
('Delivery & Logistics', 'Food delivery, courier, moving, etc.', ARRAY['hours', 'days'], 6),
('Entertainment & Events', 'Photography, DJ, catering, etc.', ARRAY['hours', 'days'], 7),
('Retail & E-commerce', 'Online stores, product sales, etc.', ARRAY['days', 'months'], 8);

-- Add RLS policies
ALTER TABLE public.vendor_business_nature_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_holidays ENABLE ROW LEVEL SECURITY;

-- RLS for business nature categories (public read)
CREATE POLICY "Anyone can view business nature categories" 
  ON public.vendor_business_nature_categories 
  FOR SELECT 
  USING (is_active = true);

-- RLS for vendor change requests
CREATE POLICY "Vendors can view their own change requests" 
  ON public.vendor_change_requests 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can create their own change requests" 
  ON public.vendor_change_requests 
  FOR INSERT 
  WITH CHECK (vendor_id = auth.uid());

-- RLS for vendor holidays
CREATE POLICY "Vendors can manage their own holidays" 
  ON public.vendor_holidays 
  FOR ALL 
  USING (vendor_id = auth.uid());

-- Create function to check if vendor can change business nature
CREATE OR REPLACE FUNCTION public.can_change_business_nature(vendor_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  days_since_finalized INTEGER;
BEGIN
  SELECT 
    business_finalized_at,
    last_nature_change_at,
    can_change_nature
  INTO profile_record
  FROM public.vendor_business_profiles 
  WHERE vendor_id = $1;
  
  -- If no profile exists, allow change
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- If admin disabled changes
  IF profile_record.can_change_nature = false THEN
    RETURN false;
  END IF;
  
  -- If never finalized, allow change
  IF profile_record.business_finalized_at IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if 30 days have passed since finalization or last change
  days_since_finalized := EXTRACT(days FROM (now() - COALESCE(profile_record.last_nature_change_at, profile_record.business_finalized_at)));
  
  RETURN days_since_finalized >= 30;
END;
$$;
