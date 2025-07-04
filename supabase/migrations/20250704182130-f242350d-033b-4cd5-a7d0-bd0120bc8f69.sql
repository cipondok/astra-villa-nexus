-- Create vendor_bookings table for service bookings
CREATE TABLE IF NOT EXISTS public.vendor_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  service_id UUID,
  customer_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME,
  customer_notes TEXT,
  vendor_notes TEXT,
  contact_phone TEXT,
  location_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC DEFAULT 0,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendor_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor bookings
CREATE POLICY "Vendors can view their own bookings" 
ON public.vendor_bookings 
FOR SELECT 
USING (auth.uid() = vendor_id);

CREATE POLICY "Customers can view their own bookings" 
ON public.vendor_bookings 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create bookings" 
ON public.vendor_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Vendors can update their bookings" 
ON public.vendor_bookings 
FOR UPDATE 
USING (auth.uid() = vendor_id);

CREATE POLICY "Customers can update their own bookings" 
ON public.vendor_bookings 
FOR UPDATE 
USING (auth.uid() = customer_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendor_bookings_updated_at
BEFORE UPDATE ON public.vendor_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();