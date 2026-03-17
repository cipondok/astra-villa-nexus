
-- Investor Watchlist Categories
CREATE TABLE public.investor_watchlist_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'bookmark',
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_watchlist_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own categories" ON public.investor_watchlist_categories
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Investor Watchlist Items
CREATE TABLE public.investor_watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.investor_watchlist_categories(id) ON DELETE SET NULL,
  notes text,
  ai_recommendation text CHECK (ai_recommendation IN ('strong_buy', 'monitor', 'risk_increasing')),
  score_at_add int,
  price_at_add numeric,
  last_score int,
  last_price numeric,
  score_change int DEFAULT 0,
  price_change_pct numeric DEFAULT 0,
  has_new_alert boolean DEFAULT false,
  alert_count int DEFAULT 0,
  last_alert_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE public.investor_watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watchlist" ON public.investor_watchlist_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX idx_watchlist_items_user ON public.investor_watchlist_items(user_id);
CREATE INDEX idx_watchlist_items_property ON public.investor_watchlist_items(property_id);
CREATE INDEX idx_watchlist_categories_user ON public.investor_watchlist_categories(user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_watchlist_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_watchlist_items_updated
  BEFORE UPDATE ON public.investor_watchlist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_watchlist_updated_at();

CREATE TRIGGER trg_watchlist_categories_updated
  BEFORE UPDATE ON public.investor_watchlist_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_watchlist_updated_at();
