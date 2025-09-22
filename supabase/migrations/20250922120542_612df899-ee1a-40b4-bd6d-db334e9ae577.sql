-- Secure financial transaction tables with proper RLS policies (Fixed version)

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

-- Create security definer function to check financial admin access
CREATE OR REPLACE FUNCTION public.check_financial_admin_access()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin')
  ) OR check_super_admin_email();
$$;

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
DROP POLICY IF EXISTS "Financial admins view all balances" ON public.vendor_astra_balances;

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

-- Add updated_at triggers for all financial tables
CREATE OR REPLACE FUNCTION public.update_financial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_payout_transactions_updated_at ON public.payout_transactions;
CREATE TRIGGER update_payout_transactions_updated_at
  BEFORE UPDATE ON public.payout_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_financial_updated_at();

DROP TRIGGER IF EXISTS update_payout_requests_updated_at ON public.payout_requests;
CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_financial_updated_at();

-- Create audit trigger for financial access (only for INSERT, UPDATE, DELETE)
CREATE OR REPLACE FUNCTION public.audit_financial_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log financial table operations (excluding SELECT which isn't supported in triggers)
  PERFORM log_security_event(
    auth.uid(),
    'financial_operation',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'amount', COALESCE(NEW.amount, OLD.amount),
      'sensitive_data_accessed', true
    ),
    CASE 
      WHEN auth.uid() = COALESCE(NEW.user_id, OLD.user_id) THEN 20  -- Low risk for own data
      WHEN check_financial_admin_access() THEN 40  -- Medium risk for admin access
      ELSE 80  -- High risk for unauthorized access
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add audit triggers to all financial tables (only for INSERT, UPDATE, DELETE)
DROP TRIGGER IF EXISTS audit_payout_transactions ON public.payout_transactions;
CREATE TRIGGER audit_payout_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.payout_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_financial_access();

DROP TRIGGER IF EXISTS audit_payout_requests ON public.payout_requests;
CREATE TRIGGER audit_payout_requests
  AFTER INSERT OR UPDATE OR DELETE ON public.payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_financial_access();

DROP TRIGGER IF EXISTS audit_vendor_astra_balances ON public.vendor_astra_balances;
CREATE TRIGGER audit_vendor_astra_balances
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_astra_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_financial_access();