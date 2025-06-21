
-- Add missing columns to wallet_connections table for wallet verification
ALTER TABLE public.wallet_connections 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS wallet_provider TEXT,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for faster verification lookups
CREATE INDEX IF NOT EXISTS idx_wallet_connections_is_verified ON public.wallet_connections(is_verified);
