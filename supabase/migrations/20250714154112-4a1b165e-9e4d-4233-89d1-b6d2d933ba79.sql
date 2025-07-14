-- Create property rental facilities table
CREATE TABLE IF NOT EXISTS public.property_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'basic', 'kitchen', 'entertainment', 'outdoor', 'security'
  name TEXT NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  additional_cost DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property rental items table  
CREATE TABLE IF NOT EXISTS public.property_rental_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_description TEXT,
  quantity INTEGER DEFAULT 1,
  condition_status TEXT DEFAULT 'good', -- 'excellent', 'good', 'fair', 'needs_attention'
  replacement_cost DECIMAL(15,2),
  is_included BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rental booking table
CREATE TABLE IF NOT EXISTS public.rental_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id),
  booking_type TEXT DEFAULT 'online', -- 'online', 'offline', 'whatsapp'
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  base_price DECIMAL(15,2) NOT NULL,
  additional_fees JSONB DEFAULT '{}',
  total_amount DECIMAL(15,2) NOT NULL,
  deposit_amount DECIMAL(15,2) DEFAULT 0,
  deposit_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  booking_status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'refunded'
  contact_method TEXT DEFAULT 'platform', -- 'platform', 'whatsapp', 'phone', 'email'
  contact_details JSONB DEFAULT '{}',
  special_requests TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property rental terms table
CREATE TABLE IF NOT EXISTS public.property_rental_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  term_type TEXT NOT NULL, -- 'deposit', 'check_in', 'check_out', 'cancellation', 'house_rules'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.property_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_rental_terms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view property facilities" ON public.property_facilities
  FOR SELECT USING (true);

CREATE POLICY "Property owners can manage facilities" ON public.property_facilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view rental items" ON public.property_rental_items
  FOR SELECT USING (true);

CREATE POLICY "Property owners can manage rental items" ON public.property_rental_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own bookings" ON public.rental_bookings
  FOR SELECT USING (customer_id = auth.uid() OR agent_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.rental_bookings
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Property owners and customers can update bookings" ON public.rental_bookings
  FOR UPDATE USING (
    customer_id = auth.uid() OR 
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view rental terms" ON public.property_rental_terms
  FOR SELECT USING (true);

CREATE POLICY "Property owners can manage rental terms" ON public.property_rental_terms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );