-- Create invoices table for invoice management
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_data JSONB NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated',
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment logs table for tracking payment attempts
CREATE TABLE public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  stripe_session_id TEXT,
  status TEXT NOT NULL,
  response_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.rental_bookings 
    WHERE rental_bookings.id = invoices.booking_id 
    AND rental_bookings.customer_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all invoices" 
ON public.invoices 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "System can manage invoices" 
ON public.invoices 
FOR ALL 
USING (true);

-- Create policies for payment logs
CREATE POLICY "Users can view their own payment logs" 
ON public.payment_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.rental_bookings 
    WHERE rental_bookings.id = payment_logs.booking_id 
    AND rental_bookings.customer_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all payment logs" 
ON public.payment_logs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "System can manage payment logs" 
ON public.payment_logs 
FOR ALL 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.invoices 
ADD CONSTRAINT invoices_booking_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.rental_bookings(id) ON DELETE CASCADE;

ALTER TABLE public.payment_logs 
ADD CONSTRAINT payment_logs_booking_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.rental_bookings(id) ON DELETE CASCADE;