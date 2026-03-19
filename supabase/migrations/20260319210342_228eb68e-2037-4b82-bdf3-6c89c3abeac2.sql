
-- Liquidity signal queue for incremental processing
CREATE TABLE IF NOT EXISTS public.liquidity_signal_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  district text,
  segment_type text,
  signal_weight numeric DEFAULT 1.0,
  payload jsonb DEFAULT '{}',
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.liquidity_signal_queue ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_lsq_unprocessed ON public.liquidity_signal_queue (processed, created_at) WHERE processed = false;
CREATE INDEX idx_lsq_property ON public.liquidity_signal_queue (property_id) WHERE processed = false;

-- Trigger function: auto-enqueue liquidity signals from property_viewings changes
CREATE OR REPLACE FUNCTION public.enqueue_viewing_liquidity_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_district text;
  v_segment text;
BEGIN
  SELECT city, property_type INTO v_district, v_segment
  FROM properties WHERE id = NEW.property_id;

  INSERT INTO liquidity_signal_queue (signal_type, property_id, district, segment_type, signal_weight, payload)
  VALUES (
    CASE
      WHEN NEW.status = 'completed' THEN 'viewing_completed'
      WHEN NEW.status = 'scheduled' THEN 'viewing_scheduled'
      ELSE 'viewing_updated'
    END,
    NEW.property_id,
    COALESCE(v_district, 'Unknown'),
    COALESCE(v_segment, 'villa'),
    0.10,
    jsonb_build_object('viewing_id', NEW.id, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_viewing_liquidity_signal
AFTER INSERT OR UPDATE ON public.property_viewings
FOR EACH ROW EXECUTE FUNCTION public.enqueue_viewing_liquidity_signal();

-- Trigger function: auto-enqueue from property_offers
CREATE OR REPLACE FUNCTION public.enqueue_offer_liquidity_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_district text;
  v_segment text;
  v_signal text;
  v_weight numeric;
BEGIN
  SELECT city, property_type INTO v_district, v_segment
  FROM properties WHERE id = NEW.property_id;

  IF NEW.deal_stage = 'closed' THEN
    v_signal := 'deal_closed';
    v_weight := 0.30;
  ELSIF NEW.deal_stage = 'payment_initiated' THEN
    v_signal := 'escrow_initiated';
    v_weight := 0.35;
  ELSE
    v_signal := 'offer_created';
    v_weight := 0.25;
  END IF;

  INSERT INTO liquidity_signal_queue (signal_type, property_id, district, segment_type, signal_weight, payload)
  VALUES (
    v_signal,
    NEW.property_id,
    COALESCE(v_district, 'Unknown'),
    COALESCE(v_segment, 'villa'),
    v_weight,
    jsonb_build_object('offer_id', NEW.id, 'deal_stage', NEW.deal_stage, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_offer_liquidity_signal
AFTER INSERT OR UPDATE OF deal_stage, status ON public.property_offers
FOR EACH ROW EXECUTE FUNCTION public.enqueue_offer_liquidity_signal();

-- Trigger from escrow_transactions
CREATE OR REPLACE FUNCTION public.enqueue_escrow_liquidity_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_district text;
  v_segment text;
BEGIN
  SELECT city, property_type INTO v_district, v_segment
  FROM properties WHERE id = NEW.property_id;

  INSERT INTO liquidity_signal_queue (signal_type, property_id, district, segment_type, signal_weight, payload)
  VALUES (
    'escrow_' || COALESCE(NEW.status, 'initiated'),
    NEW.property_id,
    COALESCE(v_district, 'Unknown'),
    COALESCE(v_segment, 'villa'),
    0.35,
    jsonb_build_object('escrow_id', NEW.id, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_escrow_liquidity_signal
AFTER INSERT OR UPDATE ON public.escrow_transactions
FOR EACH ROW EXECUTE FUNCTION public.enqueue_escrow_liquidity_signal();
