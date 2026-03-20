
-- ═══════════════════════════════════════════════════════════
-- CAPITAL MARKET PERCEPTION CONTROL (CMPC) SCHEMA
-- ═══════════════════════════════════════════════════════════

-- 1. Strategic Communication Architecture
CREATE TABLE public.cmpc_strategic_communication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL DEFAULT 'mission_clarity',
  message_theme TEXT NOT NULL,
  target_audience TEXT DEFAULT 'general_investors',
  clarity_score NUMERIC NOT NULL DEFAULT 50,
  consistency_index NUMERIC DEFAULT 50,
  resonance_score NUMERIC DEFAULT 0,
  delivery_channel TEXT DEFAULT 'investor_relations',
  frequency TEXT DEFAULT 'quarterly',
  key_messages TEXT[] DEFAULT '{}',
  supporting_evidence JSONB DEFAULT '[]',
  effectiveness_rating NUMERIC DEFAULT 0,
  last_delivered_at TIMESTAMPTZ,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Reputation Signal Management
CREATE TABLE public.cmpc_reputation_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL DEFAULT 'milestone',
  signal_name TEXT NOT NULL,
  visibility_score NUMERIC NOT NULL DEFAULT 50,
  credibility_weight NUMERIC DEFAULT 1.0,
  sentiment_impact TEXT DEFAULT 'neutral',
  volatility_context TEXT,
  media_amplification NUMERIC DEFAULT 0,
  analyst_pickup_count INT DEFAULT 0,
  narrative_alignment NUMERIC DEFAULT 50,
  risk_of_misinterpretation NUMERIC DEFAULT 0,
  recommended_framing TEXT,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Category Leadership Positioning
CREATE TABLE public.cmpc_category_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_dimension TEXT NOT NULL DEFAULT 'innovation',
  position_label TEXT NOT NULL,
  leadership_score NUMERIC NOT NULL DEFAULT 50,
  competitor_gap_pct NUMERIC DEFAULT 0,
  scalability_credibility NUMERIC DEFAULT 50,
  market_relevance_index NUMERIC DEFAULT 50,
  innovation_velocity NUMERIC DEFAULT 0,
  ecosystem_depth_score NUMERIC DEFAULT 0,
  thought_leadership_index NUMERIC DEFAULT 0,
  evidence_artifacts JSONB DEFAULT '[]',
  positioning_status TEXT DEFAULT 'emerging',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Institutional Trust Development
CREATE TABLE public.cmpc_institutional_trust (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_dimension TEXT NOT NULL DEFAULT 'governance_transparency',
  trust_score NUMERIC NOT NULL DEFAULT 50,
  previous_score NUMERIC DEFAULT 50,
  governance_rating TEXT DEFAULT 'developing',
  capital_discipline_index NUMERIC DEFAULT 50,
  roadmap_visibility_score NUMERIC DEFAULT 50,
  audit_compliance_pct NUMERIC DEFAULT 0,
  board_credibility NUMERIC DEFAULT 50,
  stakeholder_feedback_score NUMERIC DEFAULT 0,
  trust_building_actions JSONB DEFAULT '[]',
  risk_factors TEXT[] DEFAULT '{}',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Sentiment Monitoring & Adaptive Messaging
CREATE TABLE public.cmpc_sentiment_adaptive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentiment_source TEXT NOT NULL DEFAULT 'investor_survey',
  current_sentiment NUMERIC NOT NULL DEFAULT 50,
  previous_sentiment NUMERIC DEFAULT 50,
  sentiment_trend TEXT DEFAULT 'stable',
  volatility_level TEXT DEFAULT 'low',
  recommended_tone TEXT DEFAULT 'balanced',
  messaging_adjustment TEXT,
  confidence_reinforcement_needed BOOLEAN DEFAULT false,
  key_concerns TEXT[] DEFAULT '{}',
  adaptive_actions JSONB DEFAULT '[]',
  response_urgency TEXT DEFAULT 'standard',
  effectiveness_feedback NUMERIC DEFAULT 0,
  monitored_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cmpc_comm_pillar ON public.cmpc_strategic_communication(pillar);
CREATE INDEX idx_cmpc_comm_assessed ON public.cmpc_strategic_communication(assessed_at DESC);
CREATE INDEX idx_cmpc_rep_type ON public.cmpc_reputation_signals(signal_type);
CREATE INDEX idx_cmpc_rep_measured ON public.cmpc_reputation_signals(measured_at DESC);
CREATE INDEX idx_cmpc_cat_dimension ON public.cmpc_category_leadership(category_dimension);
CREATE INDEX idx_cmpc_trust_dimension ON public.cmpc_institutional_trust(trust_dimension);
CREATE INDEX idx_cmpc_trust_assessed ON public.cmpc_institutional_trust(assessed_at DESC);
CREATE INDEX idx_cmpc_sentiment_monitored ON public.cmpc_sentiment_adaptive(monitored_at DESC);

-- RLS
ALTER TABLE public.cmpc_strategic_communication ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmpc_reputation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmpc_category_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmpc_institutional_trust ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmpc_sentiment_adaptive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read cmpc_strategic_communication" ON public.cmpc_strategic_communication FOR SELECT USING (true);
CREATE POLICY "Allow read cmpc_reputation_signals" ON public.cmpc_reputation_signals FOR SELECT USING (true);
CREATE POLICY "Allow read cmpc_category_leadership" ON public.cmpc_category_leadership FOR SELECT USING (true);
CREATE POLICY "Allow read cmpc_institutional_trust" ON public.cmpc_institutional_trust FOR SELECT USING (true);
CREATE POLICY "Allow read cmpc_sentiment_adaptive" ON public.cmpc_sentiment_adaptive FOR SELECT USING (true);

-- Trigger: emit signal when sentiment drops critically
CREATE OR REPLACE FUNCTION public.fn_cmpc_sentiment_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_sentiment <= 30 AND NEW.confidence_reinforcement_needed = true THEN
    INSERT INTO public.ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'cmpc_sentiment_critical',
      'cmpc_sentiment',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'source', NEW.sentiment_source,
        'sentiment', NEW.current_sentiment,
        'trend', NEW.sentiment_trend,
        'urgency', NEW.response_urgency
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_cmpc_sentiment_alert
  AFTER INSERT ON public.cmpc_sentiment_adaptive
  FOR EACH ROW EXECUTE FUNCTION public.fn_cmpc_sentiment_alert();
