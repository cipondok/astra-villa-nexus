
-- Risk action logs for all financial operations
CREATE TABLE public.risk_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  fraud_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'safe',
  decision TEXT NOT NULL DEFAULT 'allow',
  ip_address INET,
  device_fingerprint TEXT,
  request_metadata JSONB DEFAULT '{}'::jsonb,
  blocked_reason TEXT,
  related_entity_id UUID,
  related_entity_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_action_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own risk logs
CREATE POLICY "Users can view own risk logs"
  ON public.risk_action_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (edge functions)
CREATE POLICY "Service role can insert risk logs"
  ON public.risk_action_logs FOR INSERT
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_risk_action_logs_user ON public.risk_action_logs(user_id, created_at DESC);
CREATE INDEX idx_risk_action_logs_action ON public.risk_action_logs(action_type, created_at DESC);
CREATE INDEX idx_risk_action_logs_decision ON public.risk_action_logs(decision, created_at DESC);

-- Function to compute server-side fraud score from transaction history
CREATE OR REPLACE FUNCTION public.compute_server_fraud_score(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
  v_signals JSONB := '[]'::jsonb;
  v_failed_payments INTEGER;
  v_recent_blocks INTEGER;
  v_rapid_transactions INTEGER;
  v_level TEXT;
BEGIN
  -- 1. Count recent failed payments (last 24h)
  SELECT COUNT(*) INTO v_failed_payments
  FROM risk_action_logs
  WHERE user_id = p_user_id
    AND action_type IN ('escrow_initiation', 'wallet_topup', 'checkout')
    AND decision = 'block'
    AND created_at > now() - interval '24 hours';

  IF v_failed_payments >= 3 THEN
    v_score := v_score + 30;
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'type', 'repeated_blocks', 'value', v_failed_payments, 'severity', 'high'
    ));
  ELSIF v_failed_payments >= 1 THEN
    v_score := v_score + 10;
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'type', 'recent_blocks', 'value', v_failed_payments, 'severity', 'medium'
    ));
  END IF;

  -- 2. Rapid transaction attempts (more than 10 in last hour)
  SELECT COUNT(*) INTO v_rapid_transactions
  FROM risk_action_logs
  WHERE user_id = p_user_id
    AND created_at > now() - interval '1 hour';

  IF v_rapid_transactions > 10 THEN
    v_score := v_score + 25;
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'type', 'rapid_transactions', 'value', v_rapid_transactions, 'severity', 'high'
    ));
  END IF;

  -- 3. Check for recent blocks in last 7 days
  SELECT COUNT(*) INTO v_recent_blocks
  FROM risk_action_logs
  WHERE user_id = p_user_id
    AND decision = 'block'
    AND created_at > now() - interval '7 days';

  IF v_recent_blocks >= 5 THEN
    v_score := v_score + 35;
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'type', 'persistent_risk', 'value', v_recent_blocks, 'severity', 'critical'
    ));
  END IF;

  v_score := LEAST(v_score, 100);

  IF v_score >= 70 THEN v_level := 'blocked';
  ELSIF v_score >= 45 THEN v_level := 'suspicious';
  ELSIF v_score >= 20 THEN v_level := 'watch';
  ELSE v_level := 'safe';
  END IF;

  RETURN jsonb_build_object(
    'score', v_score,
    'level', v_level,
    'signals', v_signals,
    'requires_kyc', v_score >= 45,
    'action_restricted', v_score >= 70
  );
END;
$$;
