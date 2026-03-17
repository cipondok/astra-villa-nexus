
-- Quotation requests table for the marketplace
CREATE TABLE public.service_quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.vendor_services(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_date DATE,
  preferred_time TEXT,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired', 'completed')),
  vendor_quote_amount NUMERIC,
  vendor_quote_notes TEXT,
  vendor_quoted_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]',
  service_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.service_quotation_requests ENABLE ROW LEVEL SECURITY;

-- Customers can see their own quotation requests
CREATE POLICY "Customers can view own quotation requests"
  ON public.service_quotation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Vendors can see quotation requests sent to them
CREATE POLICY "Vendors can view received quotation requests"
  ON public.service_quotation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = vendor_id);

-- Customers can insert their own quotation requests
CREATE POLICY "Customers can create quotation requests"
  ON public.service_quotation_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own requests (accept/reject quote)
CREATE POLICY "Customers can update own quotation requests"
  ON public.service_quotation_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Vendors can update requests sent to them (add quotes)
CREATE POLICY "Vendors can update received quotation requests"
  ON public.service_quotation_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = vendor_id);

-- Index for performance
CREATE INDEX idx_quotation_requests_customer ON public.service_quotation_requests(customer_id);
CREATE INDEX idx_quotation_requests_vendor ON public.service_quotation_requests(vendor_id);
CREATE INDEX idx_quotation_requests_status ON public.service_quotation_requests(status);
