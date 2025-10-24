-- Enable RLS on critical admin tables and add admin-only policies

-- Table: financial_data_audit_log (CRITICAL - Financial data)
ALTER TABLE public.financial_data_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_financial_audit"
ON public.financial_data_audit_log
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: vendor_fraud_detection (CRITICAL - Fraud detection)
ALTER TABLE public.vendor_fraud_detection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_fraud_detection"
ON public.vendor_fraud_detection
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: admin_vendor_service_controls
ALTER TABLE public.admin_vendor_service_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_service_controls"
ON public.admin_vendor_service_controls
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: analytics_settings
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_analytics_settings"
ON public.analytics_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: content_categories
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_content_categories"
ON public.content_categories
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "public_view_active_content_categories"
ON public.content_categories
FOR SELECT
TO authenticated
USING (is_active = true);

-- Table: cs_automation_rules
ALTER TABLE public.cs_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_automation_rules"
ON public.cs_automation_rules
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: cs_email_templates
ALTER TABLE public.cs_email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_email_templates"
ON public.cs_email_templates
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: property_watermark_settings (already has system_settings policies, but add explicit)
-- This table should be managed through system_settings, but add explicit policies for safety
CREATE POLICY "admin_only_watermark_settings"
ON public.property_watermark_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: search_filters
ALTER TABLE public.search_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_search_filters"
ON public.search_filters
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "public_view_active_search_filters"
ON public.search_filters
FOR SELECT
TO authenticated
USING (is_active = true);

-- Table: system_error_logs
ALTER TABLE public.system_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_error_logs"
ON public.system_error_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Table: ticket_activities
ALTER TABLE public.ticket_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_view_all_ticket_activities"
ON public.ticket_activities
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "users_view_own_ticket_activities"
ON public.ticket_activities
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customer_service_tickets
    WHERE customer_service_tickets.id = ticket_activities.ticket_id
    AND customer_service_tickets.customer_id = auth.uid()
  )
);

CREATE POLICY "system_insert_ticket_activities"
ON public.ticket_activities
FOR INSERT
TO authenticated
WITH CHECK (true);