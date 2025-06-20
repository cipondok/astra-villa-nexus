
-- Create wallet_connections table for linking user profiles to blockchain wallets
CREATE TABLE public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 56,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate wallet addresses
ALTER TABLE public.wallet_connections ADD CONSTRAINT unique_wallet_address UNIQUE (wallet_address);

-- Add index for faster lookups
CREATE INDEX idx_wallet_connections_user_id ON public.wallet_connections(user_id);
CREATE INDEX idx_wallet_connections_wallet_address ON public.wallet_connections(wallet_address);

-- Enable Row Level Security
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wallet connections" 
  ON public.wallet_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet connections" 
  ON public.wallet_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet connections" 
  ON public.wallet_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallet connections" 
  ON public.wallet_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_wallet_connections_updated_at
  BEFORE UPDATE ON public.wallet_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
