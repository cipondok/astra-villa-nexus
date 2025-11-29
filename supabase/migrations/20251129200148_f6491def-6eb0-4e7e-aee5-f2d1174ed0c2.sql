-- Create property_owner_requests table to store property owner applications
CREATE TABLE IF NOT EXISTS public.property_owner_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('individual', 'business')),
  property_types TEXT[] DEFAULT '{}',
  property_count TEXT,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  street_address TEXT,
  gps_coordinates TEXT,
  business_name TEXT,
  business_registration_number TEXT,
  business_province TEXT,
  business_city TEXT,
  business_area TEXT,
  business_street_address TEXT,
  business_gps_coordinates TEXT,
  social_media JSONB DEFAULT '{}',
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_owner_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own property owner requests"
ON public.property_owner_requests
FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own requests
CREATE POLICY "Users can create their own property owner requests"
ON public.property_owner_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all requests
CREATE POLICY "Admins can manage all property owner requests"
ON public.property_owner_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_owner_requests_user_id ON public.property_owner_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_property_owner_requests_status ON public.property_owner_requests(status);

-- Create trigger for updated_at
CREATE TRIGGER update_property_owner_requests_updated_at
BEFORE UPDATE ON public.property_owner_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();