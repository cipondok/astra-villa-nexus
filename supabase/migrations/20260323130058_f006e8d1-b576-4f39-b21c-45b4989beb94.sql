
-- ══════════════════════════════════════════════════════════════════════════════
-- FRACTIONAL PROPERTY INVESTMENT & SYNDICATION INFRASTRUCTURE
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Fractional Offers
CREATE TABLE public.fractional_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  total_property_value_idr BIGINT NOT NULL,
  minimum_investment_ticket_idr BIGINT NOT NULL DEFAULT 5000000,
  total_shares_available INT NOT NULL DEFAULT 100,
  shares_allocated INT NOT NULL DEFAULT 0,
  price_per_share_idr BIGINT GENERATED ALWAYS AS (total_property_value_idr / NULLIF(total_shares_available, 0)) STORED,
  expected_annual_yield_pct NUMERIC(5,2) DEFAULT 0,
  funding_deadline TIMESTAMPTZ,
  offer_status TEXT NOT NULL DEFAULT 'draft' CHECK (offer_status IN ('draft','active','fully_funded','closed','cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fractional_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active fractional offers"
  ON public.fractional_offers FOR SELECT
  USING (offer_status IN ('active','fully_funded'));

CREATE POLICY "Authenticated users can view all offers"
  ON public.fractional_offers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages offers"
  ON public.fractional_offers FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 2. Investor Fractional Positions
CREATE TABLE public.investor_fractional_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.fractional_offers(id) ON DELETE CASCADE NOT NULL,
  investor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invested_amount_idr BIGINT NOT NULL,
  ownership_percentage NUMERIC(6,3) NOT NULL DEFAULT 0,
  share_units INT NOT NULL DEFAULT 1,
  position_status TEXT NOT NULL DEFAULT 'reserved' CHECK (position_status IN ('reserved','funded','confirmed','exited','cancelled')),
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  funded_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_fractional_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own positions"
  ON public.investor_fractional_positions FOR SELECT
  TO authenticated
  USING (investor_user_id = auth.uid());

CREATE POLICY "Users can reserve positions"
  ON public.investor_fractional_positions FOR INSERT
  TO authenticated
  WITH CHECK (investor_user_id = auth.uid());

CREATE POLICY "Service role manages positions"
  ON public.investor_fractional_positions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 3. Pooled Escrow Records
CREATE TABLE public.pooled_escrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.fractional_offers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_amount_committed_idr BIGINT NOT NULL DEFAULT 0,
  funding_completion_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  escrow_status TEXT NOT NULL DEFAULT 'collecting' CHECK (escrow_status IN ('collecting','threshold_met','executing','completed','refunded','failed')),
  threshold_met_at TIMESTAMPTZ,
  execution_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pooled_escrow_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view pooled escrow"
  ON public.pooled_escrow_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages pooled escrow"
  ON public.pooled_escrow_records FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 4. Syndication Roles
CREATE TABLE public.syndication_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.fractional_offers(id) ON DELETE CASCADE NOT NULL,
  lead_investor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_type TEXT NOT NULL DEFAULT 'lead' CHECK (role_type IN ('lead','sponsor','co_lead','advisor')),
  sponsor_fee_pct NUMERIC(5,2) DEFAULT 0,
  governance_permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(offer_id, lead_investor_user_id, role_type)
);

ALTER TABLE public.syndication_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view syndication roles"
  ON public.syndication_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages syndication roles"
  ON public.syndication_roles FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 5. Indexes for performance
CREATE INDEX idx_fractional_offers_status ON public.fractional_offers(offer_status);
CREATE INDEX idx_fractional_offers_property ON public.fractional_offers(property_id);
CREATE INDEX idx_fractional_positions_offer ON public.investor_fractional_positions(offer_id);
CREATE INDEX idx_fractional_positions_investor ON public.investor_fractional_positions(investor_user_id);
CREATE INDEX idx_pooled_escrow_offer ON public.pooled_escrow_records(offer_id);
CREATE INDEX idx_syndication_roles_offer ON public.syndication_roles(offer_id);

-- 6. Trigger to auto-update shares_allocated and escrow on position changes
CREATE OR REPLACE FUNCTION public.sync_fractional_allocation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer_id UUID;
  v_total_shares INT;
  v_allocated INT;
  v_total_value BIGINT;
  v_committed BIGINT;
  v_pct NUMERIC(5,2);
BEGIN
  v_offer_id := COALESCE(NEW.offer_id, OLD.offer_id);

  -- Recalculate allocated shares
  SELECT COALESCE(SUM(share_units), 0) INTO v_allocated
  FROM public.investor_fractional_positions
  WHERE offer_id = v_offer_id AND position_status IN ('reserved','funded','confirmed');

  -- Update offer
  UPDATE public.fractional_offers
  SET shares_allocated = v_allocated,
      offer_status = CASE
        WHEN v_allocated >= total_shares_available THEN 'fully_funded'
        WHEN offer_status = 'fully_funded' AND v_allocated < total_shares_available THEN 'active'
        ELSE offer_status
      END,
      updated_at = now()
  WHERE id = v_offer_id
  RETURNING total_property_value_idr, total_shares_available INTO v_total_value, v_total_shares;

  -- Recalculate committed amount
  SELECT COALESCE(SUM(invested_amount_idr), 0) INTO v_committed
  FROM public.investor_fractional_positions
  WHERE offer_id = v_offer_id AND position_status IN ('funded','confirmed');

  v_pct := CASE WHEN v_total_value > 0 THEN ROUND((v_committed::NUMERIC / v_total_value) * 100, 2) ELSE 0 END;

  -- Upsert pooled escrow
  INSERT INTO public.pooled_escrow_records (offer_id, total_amount_committed_idr, funding_completion_pct, escrow_status)
  VALUES (v_offer_id, v_committed, v_pct,
    CASE WHEN v_pct >= 100 THEN 'threshold_met' ELSE 'collecting' END)
  ON CONFLICT (offer_id) DO UPDATE SET
    total_amount_committed_idr = EXCLUDED.total_amount_committed_idr,
    funding_completion_pct = EXCLUDED.funding_completion_pct,
    escrow_status = CASE
      WHEN EXCLUDED.funding_completion_pct >= 100 AND pooled_escrow_records.escrow_status = 'collecting' THEN 'threshold_met'
      ELSE pooled_escrow_records.escrow_status
    END,
    threshold_met_at = CASE
      WHEN EXCLUDED.funding_completion_pct >= 100 AND pooled_escrow_records.threshold_met_at IS NULL THEN now()
      ELSE pooled_escrow_records.threshold_met_at
    END,
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_fractional_allocation
AFTER INSERT OR UPDATE OR DELETE ON public.investor_fractional_positions
FOR EACH ROW EXECUTE FUNCTION public.sync_fractional_allocation();
