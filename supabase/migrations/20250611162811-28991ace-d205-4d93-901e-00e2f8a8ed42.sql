
-- Create vendor support tickets table
CREATE TABLE public.vendor_support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  response TEXT,
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.vendor_support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor support tickets
CREATE POLICY "Vendors can view their own tickets" 
  ON public.vendor_support_tickets 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can create their own tickets" 
  ON public.vendor_support_tickets 
  FOR INSERT 
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own tickets" 
  ON public.vendor_support_tickets 
  FOR UPDATE 
  USING (vendor_id = auth.uid());
