-- ==========================================
-- COMPREHENSIVE TRANSACTION MANAGEMENT SYSTEM
-- ==========================================

-- Enum for transaction types
DO $$ BEGIN
  CREATE TYPE public.transaction_type AS ENUM ('property_sale', 'property_rental', 'vendor_service');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum for transaction status
DO $$ BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded', 'disputed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum for feedback type
DO $$ BEGIN
  CREATE TYPE public.feedback_type AS ENUM ('bug_report', 'feature_request', 'general_feedback', 'complaint');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum for system update status
DO $$ BEGIN
  CREATE TYPE public.update_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- 1. INDONESIAN TAX CONFIGURATION TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tax_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_code TEXT NOT NULL UNIQUE,
  tax_name TEXT NOT NULL,
  tax_name_id TEXT NOT NULL, -- Indonesian name
  rate DECIMAL(5,2) NOT NULL,
  description TEXT,
  description_id TEXT, -- Indonesian description
  applicable_to TEXT[] DEFAULT ARRAY['all'], -- property_sale, property_rental, vendor_service
  min_amount DECIMAL(15,2) DEFAULT 0,
  max_amount DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Indonesian tax rates
INSERT INTO public.tax_configurations (tax_code, tax_name, tax_name_id, rate, description, description_id, applicable_to) 
VALUES 
  ('PPN', 'Value Added Tax', 'Pajak Pertambahan Nilai', 11.00, 'Standard VAT 11%', 'PPN standar 11%', ARRAY['all']),
  ('PPH_SALE', 'Income Tax - Property Sale', 'Pajak Penghasilan Penjualan', 2.50, 'Property transfer tax 2.5%', 'Pajak pengalihan properti 2.5%', ARRAY['property_sale']),
  ('BPHTB', 'Land/Building Acquisition Tax', 'Bea Perolehan Hak atas Tanah dan Bangunan', 5.00, 'BPHTB 5% for property acquisition', 'BPHTB 5% untuk perolehan properti', ARRAY['property_sale']),
  ('PPH_RENTAL', 'Income Tax - Rental', 'Pajak Penghasilan Sewa', 10.00, 'Rental income tax 10%', 'Pajak penghasilan sewa 10%', ARRAY['property_rental']),
  ('SERVICE_FEE', 'Platform Service Fee', 'Biaya Layanan Platform', 3.00, 'Platform service fee 3%', 'Biaya layanan platform 3%', ARRAY['vendor_service'])
ON CONFLICT (tax_code) DO NOTHING;

-- ==========================================
-- 2. UNIFIED TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.unified_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_type public.transaction_type NOT NULL,
  status public.transaction_status DEFAULT 'pending',
  
  -- Parties
  buyer_id UUID REFERENCES public.profiles(id),
  seller_id UUID REFERENCES public.profiles(id),
  
  -- Reference IDs
  property_id UUID,
  booking_id UUID,
  vendor_service_id UUID,
  
  -- Financial
  base_amount DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_breakdown JSONB DEFAULT '{}', -- Stores individual tax amounts
  total_tax DECIMAL(15,2) DEFAULT 0,
  service_charges DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'IDR',
  
  -- Payment
  payment_method TEXT,
  payment_gateway TEXT,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  
  -- Dates
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique transaction number generator
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  sequence_num INT;
  result TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 11) AS INT)), 0) + 1
  INTO sequence_num
  FROM unified_transactions
  WHERE transaction_number LIKE 'TRX' || TO_CHAR(NOW(), 'YYMMDD') || '%';
  
  result := 'TRX' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(sequence_num::TEXT, 4, '0');
  RETURN result;
END;
$$;

-- Trigger to auto-generate transaction number
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
    NEW.transaction_number := generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_transaction_number ON unified_transactions;
CREATE TRIGGER trigger_set_transaction_number
  BEFORE INSERT ON unified_transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_number();

-- ==========================================
-- 3. TRANSACTION AUDIT TRAIL
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transaction_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.unified_transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for audit trail
CREATE OR REPLACE FUNCTION log_transaction_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO transaction_audit_log (transaction_id, action, previous_status, new_status, changed_by)
      VALUES (NEW.id, 'status_change', OLD.status::TEXT, NEW.status::TEXT, auth.uid());
    END IF;
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
      INSERT INTO transaction_audit_log (transaction_id, action, previous_status, new_status, changed_by)
      VALUES (NEW.id, 'payment_status_change', OLD.payment_status, NEW.payment_status, auth.uid());
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO transaction_audit_log (transaction_id, action, new_status, changed_by)
    VALUES (NEW.id, 'created', NEW.status::TEXT, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_transaction_audit ON unified_transactions;
CREATE TRIGGER trigger_transaction_audit
  AFTER INSERT OR UPDATE ON unified_transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_transaction_changes();

-- ==========================================
-- 4. REAL-TIME ALERTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transaction_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- info, warning, error, critical
  title TEXT NOT NULL,
  title_id TEXT, -- Indonesian
  message TEXT NOT NULL,
  message_id TEXT, -- Indonesian
  transaction_id UUID REFERENCES public.unified_transactions(id),
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. FEEDBACK & BUG REPORTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_type public.feedback_type NOT NULL,
  severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  screenshot_urls TEXT[],
  browser_info JSONB,
  page_url TEXT,
  user_id UUID REFERENCES public.profiles(id),
  user_email TEXT,
  status TEXT DEFAULT 'new', -- new, reviewing, in_progress, resolved, closed, wont_fix
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  assigned_to UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 6. SYSTEM UPDATES INDICATOR
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  title_id TEXT,
  description TEXT,
  description_id TEXT,
  update_type TEXT NOT NULL, -- feature, bugfix, security, maintenance, improvement
  status public.update_status DEFAULT 'planned',
  priority TEXT DEFAULT 'normal',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  affects_systems TEXT[], -- auth, payments, bookings, vendors, etc.
  downtime_expected BOOLEAN DEFAULT false,
  downtime_minutes INT DEFAULT 0,
  release_notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 7. SYSTEM HEALTH METRICS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit TEXT,
  component TEXT NOT NULL, -- database, api, auth, payments, etc.
  status TEXT DEFAULT 'healthy', -- healthy, degraded, down
  threshold_warning DECIMAL(15,4),
  threshold_critical DECIMAL(15,4),
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 8. TRANSACTION SUMMARY VIEW
-- ==========================================
CREATE OR REPLACE VIEW public.transaction_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  transaction_type,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  SUM(base_amount) as total_base_amount,
  SUM(total_tax) as total_tax_collected,
  SUM(service_charges) as total_service_charges,
  SUM(total_amount) as total_revenue
FROM public.unified_transactions
GROUP BY DATE_TRUNC('day', created_at), transaction_type;

-- ==========================================
-- RLS POLICIES
-- ==========================================
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Tax configurations - public read, admin write
CREATE POLICY "Anyone can view active tax configs" ON public.tax_configurations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tax configs" ON public.tax_configurations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Unified transactions - users see own, admins see all
CREATE POLICY "Users can view own transactions" ON public.unified_transactions
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create transactions" ON public.unified_transactions
  FOR INSERT WITH CHECK (buyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions" ON public.unified_transactions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Audit log - admins only
CREATE POLICY "Admins can view audit logs" ON public.transaction_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Alerts - admins and assigned users
CREATE POLICY "View own or admin alerts" ON public.transaction_alerts
  FOR SELECT USING (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage alerts" ON public.transaction_alerts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Feedback - users see own, admins see all
CREATE POLICY "Users can view own feedback" ON public.user_feedback
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update feedback" ON public.user_feedback
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- System updates - public read
CREATE POLICY "Anyone can view system updates" ON public.system_updates
  FOR SELECT USING (true);

CREATE POLICY "Admins manage updates" ON public.system_updates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Health metrics - admins only
CREATE POLICY "Admins view health metrics" ON public.system_health_metrics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.unified_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_feedback;

-- Set REPLICA IDENTITY for realtime
ALTER TABLE public.unified_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.transaction_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.user_feedback REPLICA IDENTITY FULL;