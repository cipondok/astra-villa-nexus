
-- RLS policy for liquidity_signal_queue (service-role only writes via triggers, read for authenticated)
CREATE POLICY "Service role manages signal queue"
ON public.liquidity_signal_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can read signal queue"
ON public.liquidity_signal_queue
FOR SELECT
TO authenticated
USING (true);
