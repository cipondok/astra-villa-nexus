CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.property_bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refund requests"
  ON public.refund_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create refund requests"
  ON public.refund_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION validate_refund_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'rejected', 'processed') THEN
    RAISE EXCEPTION 'Invalid refund status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_refund_status_trigger
  BEFORE INSERT OR UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION validate_refund_status();