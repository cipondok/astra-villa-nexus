
-- AI Investment Recommendations table
CREATE TABLE IF NOT EXISTS ai_investment_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL,
  action_signal text NOT NULL,
  confidence_score numeric DEFAULT 0,
  reasoning text,
  supporting_signals jsonb DEFAULT '{}',
  market_cycle_phase text DEFAULT 'Expansion',
  timing_window text,
  priority_rank integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz DEFAULT now() + interval '7 days',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_recommendations_type ON ai_investment_recommendations(recommendation_type, is_active);
CREATE INDEX idx_recommendations_property ON ai_investment_recommendations(property_id);
CREATE INDEX idx_recommendations_confidence ON ai_investment_recommendations(confidence_score DESC) WHERE is_active = true;
CREATE INDEX idx_recommendations_priority ON ai_investment_recommendations(priority_rank ASC, confidence_score DESC) WHERE is_active = true;

ALTER TABLE ai_investment_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read recommendations"
  ON ai_investment_recommendations FOR SELECT TO authenticated USING (true);

-- Enable realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE ai_investment_recommendations;

-- Portfolio exit advisory signals table
CREATE TABLE IF NOT EXISTS ai_exit_advisories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  investor_id uuid,
  advisory_type text NOT NULL,
  severity text DEFAULT 'moderate',
  reasoning text,
  supporting_signals jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_exit_advisories_investor ON ai_exit_advisories(investor_id, is_active) WHERE is_active = true;
CREATE INDEX idx_exit_advisories_property ON ai_exit_advisories(property_id);

ALTER TABLE ai_exit_advisories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own exit advisories"
  ON ai_exit_advisories FOR SELECT TO authenticated
  USING (investor_id = auth.uid());
CREATE POLICY "Users acknowledge own advisories"
  ON ai_exit_advisories FOR UPDATE TO authenticated
  USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid());

-- Main recommendation generation engine RPC
CREATE OR REPLACE FUNCTION generate_investment_recommendations(p_limit integer DEFAULT 200)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer := 0;
  rec RECORD;
  rec_type text;
  action text;
  conf numeric;
  reason text;
  signals jsonb;
  timing text;
  cycle_phase text;
  priority int;
BEGIN
  -- Expire old recommendations
  UPDATE ai_investment_recommendations SET is_active = false WHERE expires_at < now() AND is_active = true;

  -- Process top properties by opportunity score
  FOR rec IN
    SELECT
      p.id,
      p.title,
      p.city,
      p.area,
      COALESCE(p.opportunity_score, 0) AS opp,
      COALESCE(p.deal_score, 0) AS deal,
      COALESCE(p.demand_score, 0) AS demand,
      COALESCE(p.demand_heat_score, 0) AS heat,
      COALESCE(p.valuation_gap_pct, 0) AS vgap,
      COALESCE(p.forecast_score_3m, 0) AS forecast,
      COALESCE(p.ai_price_confidence, 0) AS confidence,
      COALESCE(p.investment_risk_level, 'low') AS risk,
      COALESCE(p.luxury_index_score, 0) AS luxury,
      COALESCE(p.rental_yield, 0) AS yield,
      p.price
    FROM properties p
    WHERE p.status = 'active'
    ORDER BY COALESCE(p.opportunity_score, 0) DESC
    LIMIT p_limit
  LOOP
    rec_type := NULL;
    action := NULL;
    conf := 0;
    reason := '';
    signals := '{}';
    timing := NULL;
    cycle_phase := 'Expansion';
    priority := 100;

    -- Determine market cycle phase from cluster signals
    IF rec.heat >= 70 AND rec.forecast >= 60 THEN
      cycle_phase := 'Expansion';
    ELSIF rec.heat >= 60 AND rec.forecast < 40 THEN
      cycle_phase := 'Peak';
    ELSIF rec.heat < 40 AND rec.forecast < 30 THEN
      cycle_phase := 'Correction';
    ELSIF rec.heat < 50 AND rec.forecast >= 50 THEN
      cycle_phase := 'Recovery';
    END IF;

    -- STRONG BUY: High opportunity + undervalued + strong demand
    IF rec.opp >= 75 AND rec.vgap < -10 AND rec.demand >= 60 THEN
      rec_type := 'buy';
      action := 'Strong Buy Opportunity';
      conf := LEAST(95, rec.opp * 0.4 + (100 + rec.vgap) * 0.3 + rec.demand * 0.3);
      reason := format(
        'Strong buy signal: opportunity score %s, undervalued by %s%% vs comparables, demand heat at %s in %s.',
        round(rec.opp), round(ABS(rec.vgap)), round(rec.heat), COALESCE(rec.city, 'area')
      );
      timing := 'Immediate — within 2 weeks';
      priority := 1;

    -- EARLY GROWTH: Rising forecast + moderate opportunity
    ELSIF rec.forecast >= 65 AND rec.opp >= 55 AND rec.heat >= 50 THEN
      rec_type := 'buy';
      action := 'Early Growth Entry';
      conf := LEAST(90, rec.forecast * 0.4 + rec.opp * 0.3 + rec.heat * 0.3);
      reason := format(
        'Emerging growth zone: 3-month forecast score %s, cluster heat rising at %s, opportunity score %s.',
        round(rec.forecast), round(rec.heat), round(rec.opp)
      );
      timing := 'Short-term — within 1 month';
      priority := 2;

    -- TACTICAL FLIP: High deal score + undervalued + decent demand
    ELSIF rec.deal >= 70 AND rec.vgap < -8 AND rec.demand >= 40 THEN
      rec_type := 'flip';
      action := 'Tactical Flip Candidate';
      conf := LEAST(88, rec.deal * 0.4 + (100 + rec.vgap) * 0.35 + rec.demand * 0.25);
      reason := format(
        'Flip opportunity: deal score %s, priced %s%% below market, demand velocity supports quick resale in %s.',
        round(rec.deal), round(ABS(rec.vgap)), COALESCE(rec.city, 'area')
      );
      timing := 'Buy now, target resale 3-6 months';
      priority := 3;

    -- LONG-TERM HOLD: Good yield + stable demand + low risk
    ELSIF rec.yield >= 5 AND rec.risk = 'low' AND rec.opp >= 45 THEN
      rec_type := 'hold';
      action := 'Long-Term Hold Asset';
      conf := LEAST(85, rec.yield * 5 + rec.opp * 0.3 + rec.forecast * 0.2);
      reason := format(
        'Stable income asset: rental yield %s%%, low risk classification, opportunity score %s with steady demand.',
        round(rec.yield, 1), round(rec.opp)
      );
      timing := 'Hold 12-36 months';
      priority := 4;

    -- MODERATE BUY: Decent signals but not elite
    ELSIF rec.opp >= 60 THEN
      rec_type := 'buy';
      action := 'Moderate Buy Signal';
      conf := LEAST(75, rec.opp * 0.5 + rec.demand * 0.3 + rec.forecast * 0.2);
      reason := format(
        'Solid fundamentals: opportunity score %s, demand at %s, forecast score %s in %s.',
        round(rec.opp), round(rec.demand), round(rec.forecast), COALESCE(rec.city, 'area')
      );
      timing := 'Consider within 1-2 months';
      priority := 5;
    END IF;

    -- Skip if no recommendation generated
    IF rec_type IS NULL THEN
      CONTINUE;
    END IF;

    -- Build supporting signals
    signals := jsonb_build_object(
      'opportunity_score', round(rec.opp),
      'deal_score', round(rec.deal),
      'demand_heat', round(rec.heat),
      'valuation_gap_pct', round(rec.vgap, 1),
      'forecast_3m', round(rec.forecast),
      'confidence', round(rec.confidence),
      'risk_level', rec.risk,
      'rental_yield', round(rec.yield, 1),
      'luxury_index', round(rec.luxury)
    );

    -- Deduplicate: skip if active recommendation exists for this property
    IF NOT EXISTS (
      SELECT 1 FROM ai_investment_recommendations
      WHERE property_id = rec.id AND is_active = true AND action_signal = action
    ) THEN
      INSERT INTO ai_investment_recommendations (
        property_id, recommendation_type, action_signal, confidence_score,
        reasoning, supporting_signals, market_cycle_phase, timing_window, priority_rank
      ) VALUES (
        rec.id, rec_type, action, conf,
        reason, signals, cycle_phase, timing, priority
      );
      affected := affected + 1;
    END IF;
  END LOOP;

  RETURN affected;
END;
$$;

-- Exit advisory generation RPC
CREATE OR REPLACE FUNCTION generate_exit_advisories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer := 0;
  rec RECORD;
  adv_type text;
  sev text;
  reason text;
  signals jsonb;
BEGIN
  FOR rec IN
    SELECT
      f.user_id AS investor_id,
      f.property_id,
      p.title,
      p.city,
      COALESCE(p.opportunity_score, 0) AS opp,
      COALESCE(p.demand_score, 0) AS demand,
      COALESCE(p.demand_heat_score, 0) AS heat,
      COALESCE(p.valuation_gap_pct, 0) AS vgap,
      COALESCE(p.investment_risk_level, 'low') AS risk,
      COALESCE(p.forecast_score_3m, 0) AS forecast
    FROM favorites f
    JOIN properties p ON p.id = f.property_id
    WHERE p.status = 'active'
  LOOP
    adv_type := NULL;
    sev := 'moderate';
    reason := '';
    signals := '{}';

    -- EXIT RISK: High risk + declining demand + negative valuation
    IF rec.risk = 'high' AND rec.demand < 30 AND rec.vgap > 10 THEN
      adv_type := 'Exit Risk Increasing';
      sev := 'critical';
      reason := format(
        'High risk classification with weakening demand (%s) and overvaluation of %s%% in %s. Consider strategic exit.',
        round(rec.demand), round(rec.vgap), COALESCE(rec.city, 'area')
      );

    -- PROFIT TAKING: Good current position but forecast declining
    ELSIF rec.opp >= 50 AND rec.forecast < 30 AND rec.vgap > 5 THEN
      adv_type := 'Consider Profit Taking';
      sev := 'high';
      reason := format(
        'Currently valued above market by %s%% but 3-month forecast score dropping to %s. Lock in gains.',
        round(rec.vgap), round(rec.forecast)
      );

    -- MARKET COOLING: Demand and heat both declining
    ELSIF rec.heat < 30 AND rec.demand < 35 THEN
      adv_type := 'Monitor Market Cooling';
      sev := 'moderate';
      reason := format(
        'Cluster heat at %s and demand at %s in %s indicate cooling market conditions. Monitor closely.',
        round(rec.heat), round(rec.demand), COALESCE(rec.city, 'area')
      );
    END IF;

    IF adv_type IS NULL THEN
      CONTINUE;
    END IF;

    signals := jsonb_build_object(
      'opportunity_score', round(rec.opp),
      'demand', round(rec.demand),
      'heat', round(rec.heat),
      'valuation_gap', round(rec.vgap, 1),
      'risk_level', rec.risk,
      'forecast_3m', round(rec.forecast)
    );

    IF NOT EXISTS (
      SELECT 1 FROM ai_exit_advisories
      WHERE property_id = rec.property_id AND investor_id = rec.investor_id
        AND advisory_type = adv_type AND is_active = true
        AND created_at > now() - interval '24 hours'
    ) THEN
      INSERT INTO ai_exit_advisories (property_id, investor_id, advisory_type, severity, reasoning, supporting_signals)
      VALUES (rec.property_id, rec.investor_id, adv_type, sev, reason, signals);
      affected := affected + 1;
    END IF;
  END LOOP;

  RETURN affected;
END;
$$;

-- Stats helper
CREATE OR REPLACE FUNCTION get_recommendation_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_active', (SELECT count(*) FROM ai_investment_recommendations WHERE is_active = true),
    'by_type', (
      SELECT jsonb_object_agg(recommendation_type, cnt)
      FROM (SELECT recommendation_type, count(*) AS cnt FROM ai_investment_recommendations WHERE is_active = true GROUP BY recommendation_type) t
    ),
    'by_action', (
      SELECT jsonb_object_agg(action_signal, cnt)
      FROM (SELECT action_signal, count(*) AS cnt FROM ai_investment_recommendations WHERE is_active = true GROUP BY action_signal) t
    ),
    'avg_confidence', (SELECT round(avg(confidence_score), 1) FROM ai_investment_recommendations WHERE is_active = true),
    'exit_advisories_active', (SELECT count(*) FROM ai_exit_advisories WHERE is_active = true)
  );
$$;
