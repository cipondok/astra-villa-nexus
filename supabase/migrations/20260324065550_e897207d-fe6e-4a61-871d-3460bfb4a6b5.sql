-- Fix risk_events: drop public policy, add service_role + admin read
DROP POLICY IF EXISTS "Service role full access on risk_events" ON risk_events;
CREATE POLICY "Service role manages risk_events" ON risk_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admins read risk_events" ON risk_events
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- Fix risk_cases
DROP POLICY IF EXISTS "Service role full access on risk_cases" ON risk_cases;
CREATE POLICY "Service role manages risk_cases" ON risk_cases
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admins read risk_cases" ON risk_cases
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- Fix risk_feature_vectors
DROP POLICY IF EXISTS "Service role full access on risk_feature_vectors" ON risk_feature_vectors;
CREATE POLICY "Service role manages risk_feature_vectors" ON risk_feature_vectors
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix risk_model_predictions
DROP POLICY IF EXISTS "Service role full access on risk_model_predictions" ON risk_model_predictions;
CREATE POLICY "Service role manages risk_model_predictions" ON risk_model_predictions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix escrow_ledger_entries
DROP POLICY IF EXISTS "service_escrow_ledger" ON escrow_ledger_entries;
CREATE POLICY "Service role manages escrow_ledger" ON escrow_ledger_entries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix escrow_payout_queue
DROP POLICY IF EXISTS "service_payout_queue" ON escrow_payout_queue;
CREATE POLICY "Service role manages escrow_payout_queue" ON escrow_payout_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix escrow_system_events
DROP POLICY IF EXISTS "service_escrow_events" ON escrow_system_events;
CREATE POLICY "Service role manages escrow_system_events" ON escrow_system_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);