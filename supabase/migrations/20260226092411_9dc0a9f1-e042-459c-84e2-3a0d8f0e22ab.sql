-- Payment automation settings per owner
CREATE TABLE public.payment_automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  auto_generate_invoices BOOLEAN DEFAULT false,
  invoice_day_of_month INTEGER DEFAULT 1 CHECK (invoice_day_of_month BETWEEN 1 AND 28),
  invoice_description_template TEXT DEFAULT 'Sewa bulan {month} {year}',
  late_fee_enabled BOOLEAN DEFAULT false,
  late_fee_type TEXT DEFAULT 'fixed' CHECK (late_fee_type IN ('fixed', 'percentage')),
  late_fee_amount NUMERIC DEFAULT 0,
  late_fee_percentage NUMERIC DEFAULT 0 CHECK (late_fee_percentage BETWEEN 0 AND 100),
  grace_period_days INTEGER DEFAULT 3 CHECK (grace_period_days BETWEEN 0 AND 30),
  max_late_fee_amount NUMERIC DEFAULT 0,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER[] DEFAULT '{7,3,1}',
  overdue_reminder_frequency TEXT DEFAULT 'daily' CHECK (overdue_reminder_frequency IN ('daily', 'every_3_days', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_id)
);

ALTER TABLE public.payment_automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own payment automation settings"
  ON public.payment_automation_settings
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);