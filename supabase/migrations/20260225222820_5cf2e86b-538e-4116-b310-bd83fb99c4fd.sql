
-- Create renewal_requests table
CREATE TABLE public.renewal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initiated_by TEXT NOT NULL DEFAULT 'owner',
  status TEXT NOT NULL DEFAULT 'pending',
  proposed_start_date DATE NOT NULL,
  proposed_end_date DATE NOT NULL,
  proposed_price NUMERIC NOT NULL,
  original_price NUMERIC,
  tenant_response TEXT,
  owner_notes TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.renewal_requests ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own renewal requests
CREATE POLICY "Tenants can view own renewal requests"
  ON public.renewal_requests FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

-- Tenants can update (respond to) their renewal requests
CREATE POLICY "Tenants can respond to renewal requests"
  ON public.renewal_requests FOR UPDATE TO authenticated
  USING (tenant_id = auth.uid());

-- Owners can view renewal requests for their properties
CREATE POLICY "Owners can view renewal requests"
  ON public.renewal_requests FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Owners can create renewal requests for their properties
CREATE POLICY "Owners can create renewal requests"
  ON public.renewal_requests FOR INSERT TO authenticated
  WITH CHECK (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Owners can update renewal requests
CREATE POLICY "Owners can update renewal requests"
  ON public.renewal_requests FOR UPDATE TO authenticated
  USING (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER renewal_requests_updated_at
  BEFORE UPDATE ON public.renewal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_requests_updated_at();
