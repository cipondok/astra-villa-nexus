
-- Flash Deals table
CREATE TABLE IF NOT EXISTS public.flash_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  original_price numeric NOT NULL,
  flash_price numeric NOT NULL,
  discount_pct numeric GENERATED ALWAYS AS (
    CASE WHEN original_price > 0 THEN ROUND(((original_price - flash_price) / original_price) * 100, 1) ELSE 0 END
  ) STORED,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  reason text,
  views_count integer DEFAULT 0,
  saves_count integer DEFAULT 0,
  inquiries_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.flash_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flash deals are publicly readable"
  ON public.flash_deals FOR SELECT USING (true);

CREATE POLICY "Sellers can create own flash deals"
  ON public.flash_deals FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own flash deals"
  ON public.flash_deals FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own flash deals"
  ON public.flash_deals FOR DELETE
  USING (auth.uid() = seller_id);

CREATE INDEX IF NOT EXISTS idx_flash_deals_status ON public.flash_deals(status);
CREATE INDEX IF NOT EXISTS idx_flash_deals_end_time ON public.flash_deals(end_time);
CREATE INDEX IF NOT EXISTS idx_flash_deals_property ON public.flash_deals(property_id);

-- Add RLS to existing auction tables if missing
ALTER TABLE public.mobile_live_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_auction_watchers ENABLE ROW LEVEL SECURITY;

-- Auction policies
DO $$ BEGIN
  CREATE POLICY "Auctions are publicly readable" ON public.mobile_live_auctions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Creators can manage auctions" ON public.mobile_live_auctions FOR ALL USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Bids are publicly readable" ON public.mobile_auction_bids FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can place bids" ON public.mobile_auction_bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Watchers can manage own" ON public.mobile_auction_watchers FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Watchers are readable" ON public.mobile_auction_watchers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
