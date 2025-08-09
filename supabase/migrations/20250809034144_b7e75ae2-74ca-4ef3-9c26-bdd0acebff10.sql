-- Create ASTRA token transfers table
CREATE TABLE public.astra_token_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  transfer_fee NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'pending')),
  transfer_type TEXT NOT NULL DEFAULT 'user_transfer',
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.astra_token_transfers ENABLE ROW LEVEL SECURITY;

-- Create policies for transfers
CREATE POLICY "Users can view their transfers" 
ON public.astra_token_transfers 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Admins can view all transfers" 
ON public.astra_token_transfers 
FOR SELECT 
USING (check_admin_access());

-- Create index for better performance
CREATE INDEX idx_astra_transfers_sender ON public.astra_token_transfers(sender_id);
CREATE INDEX idx_astra_transfers_recipient ON public.astra_token_transfers(recipient_id);
CREATE INDEX idx_astra_transfers_created_at ON public.astra_token_transfers(created_at);