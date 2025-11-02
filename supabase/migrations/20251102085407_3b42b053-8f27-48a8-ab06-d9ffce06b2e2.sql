-- Fix Invoice Data Exposure (CRITICAL)
-- Drop the insecure policy that allows any authenticated user to manage all invoices
DROP POLICY IF EXISTS "System can manage invoices" ON public.invoices;

-- Only service role (edge functions) can insert invoices
CREATE POLICY "service_insert_invoices" ON public.invoices
FOR INSERT TO authenticated
WITH CHECK (false);

-- Only admins can update invoices
CREATE POLICY "admins_update_invoices" ON public.invoices
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can delete invoices
CREATE POLICY "admins_delete_invoices" ON public.invoices
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix Vendor Document Verifications Exposure (CRITICAL)
-- Drop the insecure policy
DROP POLICY IF EXISTS "System can manage document verifications" ON public.vendor_document_verifications;

-- Vendors can view their own documents
CREATE POLICY "vendors_view_own_documents" ON public.vendor_document_verifications
FOR SELECT TO authenticated
USING (vendor_id = auth.uid());

-- Admins can view all documents
CREATE POLICY "admins_view_all_documents" ON public.vendor_document_verifications
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Only admins can manage verifications
CREATE POLICY "admins_manage_verifications" ON public.vendor_document_verifications
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Fix Vendor Membership Progress Exposure (HIGH)
-- Drop the insecure policy
DROP POLICY IF EXISTS "System can manage progress" ON public.vendor_membership_progress;

-- Vendors can view their own progress (policy already exists, keep it)
-- CREATE POLICY "vendors_view_own_progress" already exists

-- Only system (service role) can update progress - block authenticated users
CREATE POLICY "block_user_progress_modifications" ON public.vendor_membership_progress
FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "block_user_progress_updates" ON public.vendor_membership_progress
FOR UPDATE TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "block_user_progress_deletes" ON public.vendor_membership_progress
FOR DELETE TO authenticated
USING (false);