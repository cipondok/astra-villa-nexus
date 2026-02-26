-- Property expense tracking
CREATE TABLE public.property_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'tax', 'insurance', 'utility', 'cleaning', 'renovation', 'legal', 'management_fee', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  vendor_name TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'quarterly', 'yearly')),
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.property_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own expenses" ON public.property_expenses
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE INDEX idx_property_expenses_owner ON public.property_expenses(owner_id);
CREATE INDEX idx_property_expenses_property ON public.property_expenses(property_id);
CREATE INDEX idx_property_expenses_date ON public.property_expenses(expense_date);