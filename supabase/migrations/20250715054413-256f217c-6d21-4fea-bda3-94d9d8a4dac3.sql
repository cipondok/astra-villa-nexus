-- Create payout management tables

-- Create payout_settings table for agent/owner payout preferences
CREATE TABLE public.payout_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_code TEXT,
  digital_wallet_type TEXT, -- 'ovo', 'gopay', 'dana', 'shopeepay'
  digital_wallet_account TEXT,
  preferred_payout_method TEXT NOT NULL DEFAULT 'bank_transfer', -- 'bank_transfer', 'digital_wallet'
  minimum_payout_amount NUMERIC DEFAULT 100000, -- Minimum amount before payout
  payout_schedule TEXT DEFAULT 'weekly', -- 'weekly', 'monthly', 'on_demand'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payout_requests table for tracking payout requests
CREATE TABLE public.payout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'IDR',
  payout_method TEXT NOT NULL,
  payout_details JSONB DEFAULT '{}', -- Bank/wallet details snapshot
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  reference_number TEXT,
  admin_notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payout_transactions table for tracking individual earning transactions
CREATE TABLE public.payout_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID, -- Can reference rental_bookings or vendor_bookings
  booking_type TEXT NOT NULL, -- 'rental', 'service'
  transaction_type TEXT NOT NULL, -- 'commission', 'service_fee', 'bonus'
  amount NUMERIC NOT NULL,
  commission_rate NUMERIC,
  base_amount NUMERIC,
  currency TEXT DEFAULT 'IDR',
  status TEXT DEFAULT 'earned', -- 'earned', 'pending_payout', 'paid_out'
  payout_request_id UUID REFERENCES public.payout_requests(id),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payout_settings
CREATE POLICY "Users can manage their own payout settings" ON public.payout_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payout settings" ON public.payout_settings
  FOR SELECT USING (check_admin_access());

-- RLS Policies for payout_requests
CREATE POLICY "Users can view their own payout requests" ON public.payout_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payout requests" ON public.payout_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payout requests" ON public.payout_requests
  FOR ALL USING (check_admin_access());

-- RLS Policies for payout_transactions
CREATE POLICY "Users can view their own payout transactions" ON public.payout_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create payout transactions" ON public.payout_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all payout transactions" ON public.payout_transactions
  FOR ALL USING (check_admin_access());

-- Create triggers for updated_at
CREATE TRIGGER update_payout_settings_updated_at
  BEFORE UPDATE ON public.payout_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payout_transactions_updated_at
  BEFORE UPDATE ON public.payout_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate available payout balance
CREATE OR REPLACE FUNCTION public.get_available_payout_balance(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available_balance NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO available_balance
  FROM public.payout_transactions
  WHERE user_id = p_user_id
    AND status = 'earned';
  
  RETURN available_balance;
END;
$$;

-- Create function to automatically create payout transactions for completed bookings
CREATE OR REPLACE FUNCTION public.create_payout_transaction_for_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  commission_rate NUMERIC := 0.05; -- 5% default commission
  transaction_amount NUMERIC;
  recipient_id UUID;
BEGIN
  -- Only process when payment status changes to 'paid' or 'completed'
  IF NEW.payment_status IN ('paid', 'completed') AND 
     OLD.payment_status != NEW.payment_status THEN
    
    -- For rental bookings
    IF TG_TABLE_NAME = 'rental_bookings' THEN
      recipient_id := NEW.agent_id;
      transaction_amount := NEW.total_amount * commission_rate;
      
      INSERT INTO public.payout_transactions (
        user_id, booking_id, booking_type, transaction_type,
        amount, commission_rate, base_amount, description
      ) VALUES (
        recipient_id, NEW.id, 'rental', 'commission',
        transaction_amount, commission_rate, NEW.total_amount,
        'Commission from rental booking: ' || NEW.id
      );
    END IF;
    
    -- For vendor bookings  
    IF TG_TABLE_NAME = 'vendor_bookings' THEN
      recipient_id := NEW.vendor_id;
      -- For service providers, they get the full amount minus platform fee
      transaction_amount := NEW.total_amount * 0.95; -- 95% to vendor, 5% platform fee
      
      INSERT INTO public.payout_transactions (
        user_id, booking_id, booking_type, transaction_type,
        amount, commission_rate, base_amount, description
      ) VALUES (
        recipient_id, NEW.id, 'service', 'service_fee',
        transaction_amount, 0.95, NEW.total_amount,
        'Service payment from booking: ' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for automatic payout transaction creation
CREATE TRIGGER create_rental_payout_transaction
  AFTER UPDATE ON public.rental_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payout_transaction_for_booking();

CREATE TRIGGER create_vendor_payout_transaction
  AFTER UPDATE ON public.vendor_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payout_transaction_for_booking();