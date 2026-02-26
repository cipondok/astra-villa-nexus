
-- Lease extension requests table (tenant-initiated)
CREATE TABLE public.lease_extension_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_end_date DATE NOT NULL,
  requested_end_date DATE NOT NULL,
  current_price NUMERIC NOT NULL DEFAULT 0,
  proposed_price NUMERIC NOT NULL DEFAULT 0,
  tenant_notes TEXT,
  owner_response_notes TEXT,
  counter_price NUMERIC,
  counter_end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lease_extension_requests ENABLE ROW LEVEL SECURITY;

-- Tenant can see and create their own requests
CREATE POLICY "Tenants can view own extension requests"
  ON public.lease_extension_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create extension requests"
  ON public.lease_extension_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update own pending requests"
  ON public.lease_extension_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = tenant_id AND status = 'pending');

-- Owner can see and respond to requests for their properties
CREATE POLICY "Owners can view extension requests"
  ON public.lease_extension_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can respond to extension requests"
  ON public.lease_extension_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);
