
-- Create rent_payments table for tracking rental transactions
CREATE TABLE public.rent_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  token_amount NUMERIC(20,8) NOT NULL,
  rental_duration_days INTEGER NOT NULL,
  rental_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  rental_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  contract_address TEXT NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_rent_payments_user_id ON public.rent_payments(user_id);
CREATE INDEX idx_rent_payments_property_id ON public.rent_payments(property_id);
CREATE INDEX idx_rent_payments_wallet_address ON public.rent_payments(wallet_address);
CREATE INDEX idx_rent_payments_transaction_hash ON public.rent_payments(transaction_hash);
CREATE INDEX idx_rent_payments_status ON public.rent_payments(status);

-- Enable Row Level Security
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for rent_payments
CREATE POLICY "Users can view their own rent payments" 
  ON public.rent_payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rent payments" 
  ON public.rent_payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Property owners can view payments for their properties" 
  ON public.rent_payments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = rent_payments.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

-- Update trigger for rent_payments
CREATE TRIGGER update_rent_payments_updated_at
  BEFORE UPDATE ON public.rent_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add premium access tracking columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS required_token_balance NUMERIC(20,8) DEFAULT 0;
