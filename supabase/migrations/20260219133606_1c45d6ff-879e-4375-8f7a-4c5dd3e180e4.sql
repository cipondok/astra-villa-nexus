
-- Fix overly permissive RLS on innovation_feature_flags
-- Drop the insecure FOR ALL policy
DROP POLICY IF EXISTS "Feature flags managed by authenticated" ON public.innovation_feature_flags;

-- Keep public SELECT (feature flags need to be readable by all for feature gating)
-- Already exists: "Feature flags viewable by all" FOR SELECT USING (true)

-- Only admins can manage feature flags
CREATE POLICY "Admins can manage feature flags" ON public.innovation_feature_flags
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true));

CREATE POLICY "Admins can update feature flags" ON public.innovation_feature_flags
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true));

CREATE POLICY "Admins can delete feature flags" ON public.innovation_feature_flags
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true));

-- Fix overly permissive RLS on mobile_live_auctions
-- Drop the insecure FOR ALL policy
DROP POLICY IF EXISTS "Auctions managed by authenticated" ON public.mobile_live_auctions;

-- Keep public SELECT (auctions need to be viewable by all)
-- Already exists: "Auctions viewable by all" FOR SELECT USING (true)

-- Only admins and auction creators can manage auctions
CREATE POLICY "Admins can manage auctions" ON public.mobile_live_auctions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'agent') AND is_active = true));

CREATE POLICY "Admins and creators can update auctions" ON public.mobile_live_auctions
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true)
  )
  WITH CHECK (
    created_by = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true)
  );

CREATE POLICY "Admins can delete auctions" ON public.mobile_live_auctions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true));

-- Also clean up the redundant vendor_membership_progress old policy that was already dropped but the original "System can manage progress" might still exist
DROP POLICY IF EXISTS "System can manage progress" ON public.vendor_membership_progress;
