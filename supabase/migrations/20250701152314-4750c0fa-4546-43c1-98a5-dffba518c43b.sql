
-- Create vendor bookings table
CREATE TABLE public.vendor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES vendor_services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME,
  duration_minutes INTEGER,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'IDR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_intent_id TEXT,
  customer_notes TEXT,
  vendor_notes TEXT,
  location_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create booking payments table
CREATE TABLE public.booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_bookings
CREATE POLICY "Vendors can view their bookings" ON public.vendor_bookings
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Customers can view their bookings" ON public.vendor_bookings
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings" ON public.vendor_bookings
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Vendors can update their bookings" ON public.vendor_bookings
  FOR UPDATE USING (vendor_id = auth.uid());

CREATE POLICY "Customers can update their bookings" ON public.vendor_bookings
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage all bookings" ON public.vendor_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for booking_payments
CREATE POLICY "Users can view payments for their bookings" ON public.booking_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vendor_bookings 
      WHERE id = booking_payments.booking_id 
      AND (vendor_id = auth.uid() OR customer_id = auth.uid())
    )
  );

CREATE POLICY "System can manage payments" ON public.booking_payments
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_vendor_bookings_vendor_id ON public.vendor_bookings(vendor_id);
CREATE INDEX idx_vendor_bookings_customer_id ON public.vendor_bookings(customer_id);
CREATE INDEX idx_vendor_bookings_service_id ON public.vendor_bookings(service_id);
CREATE INDEX idx_vendor_bookings_date ON public.vendor_bookings(booking_date);
CREATE INDEX idx_booking_payments_booking_id ON public.booking_payments(booking_id);
CREATE INDEX idx_booking_payments_stripe_id ON public.booking_payments(stripe_payment_intent_id);

-- Add triggers for updated_at
CREATE TRIGGER update_vendor_bookings_updated_at 
  BEFORE UPDATE ON public.vendor_bookings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_payments_updated_at 
  BEFORE UPDATE ON public.booking_payments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
