-- Saved search alerts table
CREATE TABLE public.saved_search_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  search_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  frequency text NOT NULL DEFAULT 'instant',
  last_triggered_at timestamptz,
  match_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved searches"
  ON public.saved_search_alerts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_unread 
  ON public.in_app_notifications(user_id, is_read) 
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_saved_search_alerts_user_active
  ON public.saved_search_alerts(user_id, is_active)
  WHERE is_active = true;

-- Price history tracking for price drop detection
CREATE TABLE public.property_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  old_price numeric NOT NULL,
  new_price numeric NOT NULL,
  change_percentage numeric GENERATED ALWAYS AS (
    CASE WHEN old_price > 0 THEN ROUND(((new_price - old_price) / old_price) * 100, 2) ELSE 0 END
  ) STORED,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read price history"
  ON public.property_price_history FOR SELECT USING (true);

CREATE INDEX idx_price_history_property ON public.property_price_history(property_id, changed_at DESC);

-- Trigger to track price changes
CREATE OR REPLACE FUNCTION public.track_property_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price AND OLD.price IS NOT NULL THEN
    INSERT INTO property_price_history (property_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER property_price_change_trigger
  AFTER UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.track_property_price_change();