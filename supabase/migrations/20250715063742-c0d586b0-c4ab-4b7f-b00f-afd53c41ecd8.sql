-- Create only the missing tables for complete project diagnostic system

-- Booking Payments table for payment processing
CREATE TABLE public.booking_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_gateway text,
  gateway_transaction_id text,
  gateway_response jsonb DEFAULT '{}'::jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Vendor ASTRA Balances for token management
CREATE TABLE public.vendor_astra_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_balance numeric(15,2) NOT NULL DEFAULT 0,
  pending_balance numeric(15,2) NOT NULL DEFAULT 0,
  total_earned numeric(15,2) NOT NULL DEFAULT 0,
  total_withdrawn numeric(15,2) NOT NULL DEFAULT 0,
  last_transaction_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(vendor_id)
);

-- Create indexes for performance
CREATE INDEX idx_booking_payments_booking_id ON public.booking_payments(booking_id);
CREATE INDEX idx_booking_payments_status ON public.booking_payments(payment_status);
CREATE INDEX idx_vendor_astra_balances_vendor_id ON public.vendor_astra_balances(vendor_id);

-- Enable RLS
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_astra_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_payments
CREATE POLICY "Admins can manage all payments" ON public.booking_payments
FOR ALL USING (check_admin_access());

-- RLS Policies for vendor_astra_balances
CREATE POLICY "Admins can view all balances" ON public.vendor_astra_balances
FOR SELECT USING (check_admin_access());

CREATE POLICY "Vendors can view their own balance" ON public.vendor_astra_balances
FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "System can manage balances" ON public.vendor_astra_balances
FOR ALL USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_astra_balances_updated_at
  BEFORE UPDATE ON public.vendor_astra_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for important tables
ALTER TABLE public.booking_payments REPLICA IDENTITY FULL;
ALTER TABLE public.vendor_astra_balances REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_astra_balances;