-- Secure financial transaction tables with proper RLS policies (Fixed function signature)

-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS public.log_financial_access(text, text, uuid);
DROP FUNCTION IF EXISTS public.log_financial_access(text, text);

-- First, let's check if payout_transactions table exists and create it if needed
CREATE TABLE IF NOT EXISTS public.payout_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  booking_id UUID,
  booking_type TEXT CHECK (booking_type IN ('rental', 'service', 'commission')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('commission', 'service_fee', 'bonus', 'penalty', 'refund')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  commission_rate NUMERIC(5,4) DEFAULT 0.00,
  base_amount NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'IDR',
  status TEXT NOT NULL DEFAULT 'earned' CHECK (status IN ('earned', 'pending', 'paid', 'cancelled', 'refunded')),
  description TEXT,
  reference_id TEXT,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payout_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'IDR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  payout_method TEXT NOT NULL CHECK (payout_method IN ('bank_transfer', 'digital_wallet', 'check')),
  bank_details JSONB,
  admin_notes TEXT,
  rejection_reason TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all financial tables
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Create function to log financial access for audit trails
CREATE OR REPLACE FUNCTION public.log_financial_access(
  table_name TEXT,
  operation TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_security_logs (
    user_id, 
    event_type, 
    ip_address,
    metadata
  ) VALUES (
    user_id,
    'financial_access',
    inet_client_addr(),
    jsonb_build_object(
      'table', table_name,
      'operation', operation,
      'timestamp', now()
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Users can view their own payout transactions" ON public.payout_transactions;
DROP POLICY IF EXISTS "Users can create payout requests" ON public.payout_requests;

-- RLS Policies for payout_transactions
CREATE POLICY "Users view own transactions with logging"
ON public.payout_transactions
FOR SELECT
USING (
  user_id = auth.uid() 
  AND log_financial_access('payout_transactions', 'SELECT', auth.uid()) IS NOT NULL
);

CREATE POLICY "Financial admins view all transactions with logging"
ON public.payout_transactions  
FOR SELECT
USING (
  check_financial_admin_access() 
  AND log_financial_access('payout_transactions', 'SELECT_ALL', auth.uid()) IS NOT NULL
);

CREATE POLICY "System can create transactions"
ON public.payout_transactions
FOR INSERT
WITH CHECK (
  current_setting('role') = 'service_role' 
  OR check_financial_admin_access()
);

CREATE POLICY "Financial admins can update transactions"
ON public.payout_transactions
FOR UPDATE
USING (check_financial_admin_access())
WITH CHECK (check_financial_admin_access());

CREATE POLICY "No deletion of financial transactions"
ON public.payout_transactions
FOR DELETE
USING (false);

-- RLS Policies for payout_requests
CREATE POLICY "Users view own payout requests with logging"
ON public.payout_requests
FOR SELECT
USING (
  user_id = auth.uid() 
  AND log_financial_access('payout_requests', 'SELECT', auth.uid()) IS NOT NULL
);

CREATE POLICY "Users create own payout requests"
ON public.payout_requests
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND log_financial_access('payout_requests', 'INSERT', auth.uid()) IS NOT NULL
);

CREATE POLICY "Financial admins view all payout requests with logging"
ON public.payout_requests
FOR SELECT
USING (
  check_financial_admin_access() 
  AND log_financial_access('payout_requests', 'SELECT_ALL', auth.uid()) IS NOT NULL
);

CREATE POLICY "Financial admins manage payout requests"
ON public.payout_requests
FOR UPDATE
USING (check_financial_admin_access())
WITH CHECK (check_financial_admin_access());

CREATE POLICY "No deletion of payout requests"
ON public.payout_requests
FOR DELETE
USING (false);