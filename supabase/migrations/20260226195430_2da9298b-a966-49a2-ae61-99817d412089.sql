
-- Booking cancellation requests table
CREATE TABLE public.booking_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.rental_bookings(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID NOT NULL,
  requester_role TEXT NOT NULL DEFAULT 'tenant', -- 'tenant' or 'owner'
  reason TEXT NOT NULL,
  reason_category TEXT DEFAULT 'other', -- 'schedule_change', 'found_alternative', 'price_issue', 'emergency', 'property_issue', 'other'
  cancellation_policy TEXT DEFAULT 'standard', -- 'flexible', 'standard', 'strict'
  refund_percentage NUMERIC DEFAULT 0,
  refund_amount NUMERIC DEFAULT 0,
  penalty_amount NUMERIC DEFAULT 0,
  original_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'auto_approved'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  refund_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  refund_processed_at TIMESTAMPTZ,
  days_before_checkin INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add cancellation-related columns to rental_bookings
ALTER TABLE public.rental_bookings
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_id UUID REFERENCES public.booking_cancellations(id);

-- Enable RLS
ALTER TABLE public.booking_cancellations ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own cancellation requests
CREATE POLICY "Users can view own cancellation requests"
  ON public.booking_cancellations
  FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid());

-- Owners can view cancellations for their properties
CREATE POLICY "Owners can view cancellations for their properties"
  ON public.booking_cancellations
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT rb.id FROM public.rental_bookings rb
      JOIN public.properties p ON rb.property_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );

-- Authenticated users can create cancellation requests
CREATE POLICY "Users can create cancellation requests"
  ON public.booking_cancellations
  FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = auth.uid());

-- Owners can update (approve/reject) cancellations for their properties
CREATE POLICY "Owners can update cancellations for their properties"
  ON public.booking_cancellations
  FOR UPDATE
  TO authenticated
  USING (
    booking_id IN (
      SELECT rb.id FROM public.rental_bookings rb
      JOIN public.properties p ON rb.property_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );
