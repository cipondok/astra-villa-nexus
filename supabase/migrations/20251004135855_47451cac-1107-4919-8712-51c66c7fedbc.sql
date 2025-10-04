-- Create investment orders table
CREATE TABLE public.foreign_investment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL,
  investment_amount NUMERIC(15,2) NOT NULL,
  location_preference TEXT,
  investment_timeline TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user ideas/suggestions table
CREATE TABLE public.user_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create foreign investment inquiries table (separate from general inquiries)
CREATE TABLE public.foreign_investment_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.foreign_investment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreign_investment_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investment orders
CREATE POLICY "Users can view their own investment orders"
  ON public.foreign_investment_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investment orders"
  ON public.foreign_investment_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment orders"
  ON public.foreign_investment_orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all investment orders"
  ON public.foreign_investment_orders FOR ALL
  USING (check_admin_access());

-- RLS Policies for user ideas
CREATE POLICY "Users can view their own ideas"
  ON public.user_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ideas"
  ON public.user_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ideas"
  ON public.user_ideas FOR ALL
  USING (check_admin_access());

-- RLS Policies for foreign investment inquiries
CREATE POLICY "Users can view their own inquiries"
  ON public.foreign_investment_inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create inquiries"
  ON public.foreign_investment_inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all inquiries"
  ON public.foreign_investment_inquiries FOR ALL
  USING (check_admin_access());

-- Create indexes for performance
CREATE INDEX idx_investment_orders_user_id ON public.foreign_investment_orders(user_id);
CREATE INDEX idx_investment_orders_status ON public.foreign_investment_orders(status);
CREATE INDEX idx_user_ideas_user_id ON public.user_ideas(user_id);
CREATE INDEX idx_user_ideas_status ON public.user_ideas(status);
CREATE INDEX idx_fi_inquiries_user_id ON public.foreign_investment_inquiries(user_id);
CREATE INDEX idx_fi_inquiries_status ON public.foreign_investment_inquiries(status);