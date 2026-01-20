-- =============================================
-- 1. USER ORDERS/APPLICATIONS SYSTEM
-- =============================================

-- Order types enum
CREATE TYPE public.order_type AS ENUM (
  'property_investment',
  'consultation_request', 
  'service_booking'
);

-- Order status enum
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'in_progress',
  'completed',
  'cancelled'
);

-- Main orders table
CREATE TABLE public.user_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL UNIQUE DEFAULT 'ORD-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  order_type order_type NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  total_amount DECIMAL(15,2),
  currency TEXT DEFAULT 'IDR',
  assigned_to UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Order documents/attachments
CREATE TABLE public.order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.user_orders(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order activity log
CREATE TABLE public.order_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.user_orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 2. SUPPORT TICKET SYSTEM  
-- =============================================

-- Ticket category enum
CREATE TYPE public.ticket_category AS ENUM (
  'general_inquiry',
  'order_issue',
  'payment_issue',
  'technical_support',
  'account_issue',
  'complaint',
  'suggestion',
  'other'
);

-- Ticket status enum
CREATE TYPE public.ticket_status AS ENUM (
  'open',
  'in_progress',
  'awaiting_response',
  'resolved',
  'closed'
);

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE DEFAULT 'TKT-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  category ticket_category NOT NULL DEFAULT 'general_inquiry',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  related_order_id UUID REFERENCES public.user_orders(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Ticket messages/replies
CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support', 'system')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 3. AFFILIATE/REFERRAL SYSTEM
-- =============================================

-- Affiliate status enum
CREATE TYPE public.affiliate_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'inactive'
);

-- Affiliates table
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  status affiliate_status NOT NULL DEFAULT 'pending',
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(15,2) DEFAULT 0,
  pending_earnings DECIMAL(15,2) DEFAULT 0,
  paid_earnings DECIMAL(15,2) DEFAULT 0,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Referrals tracking
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'converted', 'expired')),
  qualified_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate commissions
CREATE TABLE public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referral_id UUID REFERENCES public.referrals(id),
  order_id UUID REFERENCES public.user_orders(id),
  commission_amount DECIMAL(15,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  order_amount DECIMAL(15,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate payouts
CREATE TABLE public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_user_orders_user_id ON public.user_orders(user_id);
CREATE INDEX idx_user_orders_status ON public.user_orders(status);
CREATE INDEX idx_user_orders_type ON public.user_orders(order_type);
CREATE INDEX idx_user_orders_assigned_to ON public.user_orders(assigned_to);

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX idx_referrals_affiliate_id ON public.referrals(affiliate_id);

-- =============================================
-- 5. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- User Orders Policies
CREATE POLICY "Users can view their own orders"
ON public.user_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.user_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
ON public.user_orders FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Staff can view all orders"
ON public.user_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

CREATE POLICY "Staff can update orders"
ON public.user_orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

-- Order Documents Policies
CREATE POLICY "Users can view their order documents"
ON public.order_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_orders
    WHERE id = order_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload to their orders"
ON public.order_documents FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Support Tickets Policies
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own open tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id AND status IN ('open', 'awaiting_response'));

CREATE POLICY "Staff can view all tickets"
ON public.support_tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

CREATE POLICY "Staff can update tickets"
ON public.support_tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

-- Ticket Messages Policies
CREATE POLICY "Users can view messages on their tickets"
ON public.ticket_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = ticket_id AND user_id = auth.uid()
  ) AND is_internal = false
);

CREATE POLICY "Users can send messages on their tickets"
ON public.ticket_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = ticket_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Staff can view all ticket messages"
ON public.ticket_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

CREATE POLICY "Staff can send messages"
ON public.ticket_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

-- Affiliates Policies
CREATE POLICY "Users can view their own affiliate profile"
ON public.affiliates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create affiliate profile"
ON public.affiliates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate profile"
ON public.affiliates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all affiliates"
ON public.affiliates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

CREATE POLICY "Admin can update affiliates"
ON public.affiliates FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Referrals Policies
CREATE POLICY "Affiliates can view their referrals"
ON public.referrals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE id = affiliate_id AND user_id = auth.uid()
  )
);

CREATE POLICY "System can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

-- Commissions Policies
CREATE POLICY "Affiliates can view their commissions"
ON public.affiliate_commissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE id = affiliate_id AND user_id = auth.uid()
  )
);

-- Payouts Policies
CREATE POLICY "Affiliates can view their payouts"
ON public.affiliate_payouts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE id = affiliate_id AND user_id = auth.uid()
  )
);

-- =============================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_orders_updated_at
BEFORE UPDATE ON public.user_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();