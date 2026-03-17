
-- Fix: restrict audit trail INSERT to document participants only
DROP POLICY "System can insert audit entries" ON public.document_audit_trail;
CREATE POLICY "Participants can insert audit entries" ON public.document_audit_trail
  FOR INSERT TO authenticated
  WITH CHECK (
    performed_by = auth.uid()
    AND document_id IN (
      SELECT id FROM public.transaction_documents WHERE uploaded_by = auth.uid()
      UNION
      SELECT document_id FROM public.document_signatures WHERE signer_id = auth.uid()
    )
  );
