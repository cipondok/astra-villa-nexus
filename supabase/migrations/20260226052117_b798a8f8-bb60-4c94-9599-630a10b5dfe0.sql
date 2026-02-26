
-- Deposit & Escrow Management System
CREATE TABLE public.deposit_escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deposit_amount NUMERIC NOT NULL,
  escrow_status TEXT NOT NULL DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'partially_released', 'released', 'disputed', 'refunded')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  held_at TIMESTAMPTZ,
  release_requested_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  released_amount NUMERIC DEFAULT 0,
  deduction_amount NUMERIC DEFAULT 0,
  deduction_reason TEXT,
  deduction_items JSONB DEFAULT '[]',
  refund_amount NUMERIC DEFAULT 0,
  refund_processed_at TIMESTAMPTZ,
  refund_method TEXT,
  refund_reference TEXT,
  dispute_reason TEXT,
  dispute_resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

ALTER TABLE public.deposit_escrows ENABLE ROW LEVEL SECURITY;

-- Tenant can view their own deposits
CREATE POLICY "Tenants can view own deposits"
ON public.deposit_escrows FOR SELECT TO authenticated
USING (tenant_id = auth.uid());

-- Owner can view deposits for their properties
CREATE POLICY "Owners can view their property deposits"
ON public.deposit_escrows FOR SELECT TO authenticated
USING (owner_id = auth.uid());

-- Owner can update deposits (manage escrow)
CREATE POLICY "Owners can update deposits"
ON public.deposit_escrows FOR UPDATE TO authenticated
USING (owner_id = auth.uid());

-- Tenant can insert (pay deposit)
CREATE POLICY "Tenants can create deposits"
ON public.deposit_escrows FOR INSERT TO authenticated
WITH CHECK (tenant_id = auth.uid());

-- Tenant can update own deposit (for payment info & disputes)
CREATE POLICY "Tenants can update own deposits"
ON public.deposit_escrows FOR UPDATE TO authenticated
USING (tenant_id = auth.uid());
