
-- Create rental_invoices table
CREATE TABLE public.rental_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issued_by UUID NOT NULL REFERENCES auth.users(id),
  invoice_type TEXT NOT NULL DEFAULT 'rent',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rental_invoices ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own invoices
CREATE POLICY "Tenants can view own invoices"
  ON public.rental_invoices FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

-- Tenants can update payment info on their invoices
CREATE POLICY "Tenants can update own invoices"
  ON public.rental_invoices FOR UPDATE TO authenticated
  USING (tenant_id = auth.uid());

-- Owners can view invoices for their properties
CREATE POLICY "Owners can view property invoices"
  ON public.rental_invoices FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Owners can create invoices for their properties
CREATE POLICY "Owners can create invoices"
  ON public.rental_invoices FOR INSERT TO authenticated
  WITH CHECK (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Owners can update invoices
CREATE POLICY "Owners can update property invoices"
  ON public.rental_invoices FOR UPDATE TO authenticated
  USING (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER rental_invoices_updated_at
  BEFORE UPDATE ON public.rental_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_requests_updated_at();

-- Sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1001;
