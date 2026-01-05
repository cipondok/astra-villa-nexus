-- Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  booking_id UUID,
  customer_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'IDR',
  payment_gateway TEXT DEFAULT 'midtrans',
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  gateway_response JSONB,
  customer_email TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment refunds table
CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  refund_amount NUMERIC NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  gateway_response JSONB,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment webhook logs table
CREATE TABLE IF NOT EXISTS public.payment_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT,
  event_type TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Service role can manage all transactions"
ON public.payment_transactions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for payment_refunds
CREATE POLICY "Users can view their refunds"
ON public.payment_refunds FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.payment_transactions pt 
    WHERE pt.order_id = payment_refunds.order_id 
    AND pt.customer_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all refunds"
ON public.payment_refunds FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for webhook logs (service role only)
CREATE POLICY "Service role can manage webhook logs"
ON public.payment_webhook_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_id ON public.payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_order_id ON public.payment_refunds(order_id);