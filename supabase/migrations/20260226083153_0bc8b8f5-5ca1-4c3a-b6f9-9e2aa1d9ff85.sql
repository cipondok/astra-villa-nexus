
-- Create lease_contracts table
CREATE TABLE public.lease_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.rental_bookings(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  
  -- Contract details
  contract_number TEXT NOT NULL DEFAULT ('LC-' || substring(gen_random_uuid()::text, 1, 8)),
  contract_title TEXT NOT NULL DEFAULT 'Perjanjian Sewa Menyewa',
  contract_type TEXT NOT NULL DEFAULT 'standard',
  
  -- Terms
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  deposit_amount NUMERIC DEFAULT 0,
  payment_due_day INTEGER DEFAULT 1,
  late_fee_percentage NUMERIC DEFAULT 5,
  
  -- Contract content
  terms_and_conditions TEXT,
  special_clauses TEXT,
  property_condition_notes TEXT,
  
  -- Status & Signatures
  status TEXT NOT NULL DEFAULT 'draft',
  owner_signed_at TIMESTAMPTZ,
  owner_signature_ip TEXT,
  tenant_signed_at TIMESTAMPTZ,
  tenant_signature_ip TEXT,
  
  -- Metadata
  sent_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lease_contracts ENABLE ROW LEVEL SECURITY;

-- Owner can manage their contracts
CREATE POLICY "Owners can manage their contracts"
ON public.lease_contracts
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Tenants can view and sign their contracts
CREATE POLICY "Tenants can view their contracts"
ON public.lease_contracts
FOR SELECT
TO authenticated
USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can sign their contracts"
ON public.lease_contracts
FOR UPDATE
TO authenticated
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

-- Index for quick lookups
CREATE INDEX idx_lease_contracts_booking ON public.lease_contracts(booking_id);
CREATE INDEX idx_lease_contracts_owner ON public.lease_contracts(owner_id);
CREATE INDEX idx_lease_contracts_tenant ON public.lease_contracts(tenant_id);
CREATE INDEX idx_lease_contracts_status ON public.lease_contracts(status);
