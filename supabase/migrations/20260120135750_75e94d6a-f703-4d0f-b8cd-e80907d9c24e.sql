-- Fix the overly permissive referrals INSERT policy
DROP POLICY IF EXISTS "System can create referrals" ON public.referrals;

-- Create a proper policy for referrals - only allow when user is being referred
-- The referral is created when a new user signs up with a referral code
CREATE POLICY "Create referral on signup"
ON public.referrals FOR INSERT
WITH CHECK (
  auth.uid() = referred_user_id AND
  EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE referral_code = referrals.referral_code
    AND status = 'active'
  )
);

-- Add policies for order_activity_logs
CREATE POLICY "Users can view activity on their orders"
ON public.order_activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_orders
    WHERE id = order_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Staff can view all activity logs"
ON public.order_activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

CREATE POLICY "Staff can create activity logs"
ON public.order_activity_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

-- Admin policies for commissions and payouts management
CREATE POLICY "Admin can manage commissions"
ON public.affiliate_commissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

CREATE POLICY "Admin can manage payouts"
ON public.affiliate_payouts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  )
);

-- Staff can create order documents
CREATE POLICY "Staff can view all order documents"
ON public.order_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);

CREATE POLICY "Staff can upload order documents"
ON public.order_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'customer_service')
    AND is_active = true
  )
);