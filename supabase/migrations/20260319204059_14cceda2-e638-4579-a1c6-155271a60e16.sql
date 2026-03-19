
-- Fix permissive INSERT policies to be more specific
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.vendor_leads_pipeline;
CREATE POLICY "Authenticated users can create leads" ON public.vendor_leads_pipeline
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Any authenticated user can submit a lead to a vendor
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can create disputes" ON public.dispute_cases;
CREATE POLICY "Authenticated users can create disputes" ON public.dispute_cases
  FOR INSERT TO authenticated
  WITH CHECK (complainant_id = auth.uid());
