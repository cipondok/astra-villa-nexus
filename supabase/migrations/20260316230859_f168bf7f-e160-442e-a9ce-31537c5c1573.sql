
-- PART 1: Event Signal Queue Table
CREATE TABLE IF NOT EXISTS ai_event_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text NOT NULL DEFAULT 'property',
  entity_id uuid,
  priority_level text NOT NULL DEFAULT 'normal',
  payload jsonb DEFAULT '{}',
  is_processed boolean DEFAULT false,
  processed_at timestamptz,
  processed_by text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_event_signals_unprocessed ON ai_event_signals(is_processed, priority_level, created_at)
  WHERE is_processed = false;
CREATE INDEX idx_event_signals_entity ON ai_event_signals(entity_type, entity_id);
CREATE INDEX idx_event_signals_type ON ai_event_signals(event_type, created_at DESC);

ALTER TABLE ai_event_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read event_signals"
  ON ai_event_signals FOR SELECT TO authenticated USING (true);

-- Enable realtime on the signals table for UI push
ALTER PUBLICATION supabase_realtime ADD TABLE ai_event_signals;

-- PART 2: Event Source Triggers

-- Helper: emit signal function
CREATE OR REPLACE FUNCTION emit_ai_signal(
  p_event_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_priority text DEFAULT 'normal',
  p_payload jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signal_id uuid;
BEGIN
  -- Deduplicate: skip if identical unprocessed signal exists within 2 minutes
  IF EXISTS (
    SELECT 1 FROM ai_event_signals
    WHERE event_type = p_event_type
      AND entity_id = p_entity_id
      AND is_processed = false
      AND created_at > now() - interval '2 minutes'
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
  VALUES (p_event_type, p_entity_type, p_entity_id, p_priority, p_payload)
  RETURNING id INTO signal_id;

  RETURN signal_id;
END;
$$;

-- Trigger: New property listing
CREATE OR REPLACE FUNCTION trg_property_created_signal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM emit_ai_signal(
    'property_created',
    'property',
    NEW.id,
    'high',
    jsonb_build_object('city', NEW.city, 'price', NEW.price, 'type', NEW.property_type)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_signal_property_created
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION trg_property_created_signal();

-- Trigger: Property price change
CREATE OR REPLACE FUNCTION trg_property_price_changed_signal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pct_change numeric;
  prio text := 'normal';
BEGIN
  IF OLD.price IS NULL OR OLD.price = 0 OR NEW.price = OLD.price THEN
    RETURN NEW;
  END IF;

  pct_change := ((NEW.price - OLD.price)::numeric / OLD.price) * 100;

  -- Price drop > 5% is critical
  IF pct_change < -5 THEN
    prio := 'critical';
  ELSIF ABS(pct_change) > 2 THEN
    prio := 'high';
  END IF;

  PERFORM emit_ai_signal(
    'price_changed',
    'property',
    NEW.id,
    prio,
    jsonb_build_object('old_price', OLD.price, 'new_price', NEW.price, 'pct_change', round(pct_change, 2), 'city', NEW.city)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_signal_price_changed
  AFTER UPDATE OF price ON properties
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price)
  EXECUTE FUNCTION trg_property_price_changed_signal();

-- Trigger: Property status change
CREATE OR REPLACE FUNCTION trg_property_status_changed_signal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM emit_ai_signal(
    'status_changed',
    'property',
    NEW.id,
    CASE WHEN NEW.status IN ('sold', 'reserved') THEN 'high' ELSE 'normal' END,
    jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'city', NEW.city)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_signal_status_changed
  AFTER UPDATE OF status ON properties
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trg_property_status_changed_signal();

-- Trigger: Inquiry velocity spike (demand_score jump > 15 points)
CREATE OR REPLACE FUNCTION trg_demand_spike_signal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.demand_score, 0) - COALESCE(OLD.demand_score, 0) > 15 THEN
    PERFORM emit_ai_signal(
      'demand_spike',
      'property',
      NEW.id,
      'critical',
      jsonb_build_object('old_score', OLD.demand_score, 'new_score', NEW.demand_score, 'city', NEW.city, 'area', NEW.area)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_signal_demand_spike
  AFTER UPDATE OF demand_score ON properties
  FOR EACH ROW
  WHEN (OLD.demand_score IS DISTINCT FROM NEW.demand_score)
  EXECUTE FUNCTION trg_demand_spike_signal();

-- PART 3: Event processor RPC (batch process signals)
CREATE OR REPLACE FUNCTION process_ai_event_batch(p_limit integer DEFAULT 50)
RETURNS TABLE(
  event_type text,
  events_processed integer,
  actions_triggered text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  batch_ids uuid[];
  action_list text[];
  et text;
  cnt integer;
BEGIN
  -- Claim a batch of unprocessed signals ordered by priority
  WITH claimed AS (
    UPDATE ai_event_signals
    SET is_processed = true,
        processed_at = now(),
        processed_by = 'event_processor'
    WHERE id IN (
      SELECT id FROM ai_event_signals
      WHERE is_processed = false
      ORDER BY
        CASE priority_level
          WHEN 'critical' THEN 0
          WHEN 'high' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'low' THEN 3
        END,
        created_at ASC
      LIMIT p_limit
      FOR UPDATE SKIP LOCKED
    )
    RETURNING ai_event_signals.event_type, ai_event_signals.entity_id, ai_event_signals.priority_level, ai_event_signals.payload
  )
  SELECT array_agg(DISTINCT claimed.event_type) INTO action_list FROM claimed;

  -- For each event type in the batch, trigger the appropriate workers
  FOR rec IN
    SELECT s.event_type AS et, count(*) AS cnt, array_agg(DISTINCT s.entity_id) AS ids
    FROM ai_event_signals s
    WHERE s.is_processed = true
      AND s.processed_at > now() - interval '10 seconds'
      AND s.processed_by = 'event_processor'
    GROUP BY s.event_type
  LOOP
    action_list := ARRAY[]::text[];

    -- Smart trigger logic
    IF rec.et IN ('property_created', 'price_changed') THEN
      action_list := action_list || 'opportunity_scoring';
      action_list := action_list || 'deal_scan';
    END IF;

    IF rec.et = 'price_changed' THEN
      action_list := action_list || 'price_prediction';
    END IF;

    IF rec.et = 'demand_spike' THEN
      action_list := action_list || 'heat_cluster_update';
      action_list := action_list || 'demand_heat_sync';
    END IF;

    IF rec.et = 'status_changed' THEN
      action_list := action_list || 'market_cluster_refresh';
    END IF;

    event_type := rec.et;
    events_processed := rec.cnt;
    actions_triggered := action_list;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Utility: Get pending signal counts by priority
CREATE OR REPLACE FUNCTION get_event_signal_stats()
RETURNS TABLE(
  priority text,
  pending_count bigint,
  oldest_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    priority_level,
    count(*),
    min(created_at)
  FROM ai_event_signals
  WHERE is_processed = false
  GROUP BY priority_level
  ORDER BY
    CASE priority_level
      WHEN 'critical' THEN 0
      WHEN 'high' THEN 1
      WHEN 'normal' THEN 2
      WHEN 'low' THEN 3
    END;
$$;
