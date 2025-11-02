-- Fix Vendor AI Matching Results Exposure (WARN)
-- Drop the insecure policy that allows any authenticated user to view all matching results
DROP POLICY IF EXISTS "Users can view their matching results" ON public.vendor_ai_matching;

-- Users can only view matching results for their own requests
CREATE POLICY "users_view_own_matching_results" ON public.vendor_ai_matching
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vendor_requests vr
    WHERE vr.id = vendor_ai_matching.request_id
    AND vr.user_id = auth.uid()
  )
);

-- Admins can view all matching results
CREATE POLICY "admins_view_all_matching" ON public.vendor_ai_matching
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Only system (service role) can insert/update/delete matching results
CREATE POLICY "system_insert_matching" ON public.vendor_ai_matching
FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "system_update_matching" ON public.vendor_ai_matching
FOR UPDATE TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "system_delete_matching" ON public.vendor_ai_matching
FOR DELETE TO authenticated
USING (false);