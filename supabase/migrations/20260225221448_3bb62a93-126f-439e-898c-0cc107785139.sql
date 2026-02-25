
-- Create maintenance_requests table
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  images TEXT[] DEFAULT '{}',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Tenants can view and create their own requests
CREATE POLICY "Tenants can view own maintenance requests"
  ON public.maintenance_requests FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can create maintenance requests"
  ON public.maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = auth.uid());

-- Property owners can view requests for their properties
CREATE POLICY "Owners can view maintenance requests for their properties"
  ON public.maintenance_requests FOR SELECT
  TO authenticated
  USING (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Property owners can update requests for their properties
CREATE POLICY "Owners can update maintenance requests for their properties"
  ON public.maintenance_requests FOR UPDATE
  TO authenticated
  USING (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Agents can view requests for bookings they manage
CREATE POLICY "Agents can view maintenance requests for their bookings"
  ON public.maintenance_requests FOR SELECT
  TO authenticated
  USING (booking_id IN (SELECT id FROM public.rental_bookings WHERE agent_id = auth.uid()));

-- Agents can update requests for bookings they manage
CREATE POLICY "Agents can update maintenance requests for their bookings"
  ON public.maintenance_requests FOR UPDATE
  TO authenticated
  USING (booking_id IN (SELECT id FROM public.rental_bookings WHERE agent_id = auth.uid()));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_maintenance_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_requests_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_requests_updated_at();
