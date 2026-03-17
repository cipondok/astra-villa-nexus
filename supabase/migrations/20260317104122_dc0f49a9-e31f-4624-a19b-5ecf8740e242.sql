
-- Property Offers table
CREATE TABLE public.property_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  offer_price numeric NOT NULL CHECK (offer_price > 0),
  counter_price numeric CHECK (counter_price > 0 OR counter_price IS NULL),
  financing_method text NOT NULL DEFAULT 'cash' CHECK (financing_method IN ('cash','mortgage','mixed')),
  completion_timeline text,
  buyer_message text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','seller_reviewing','counter_offer','accepted','in_progress','completed','rejected','withdrawn','expired')),
  property_title text,
  property_image text,
  property_original_price numeric,
  rejection_reason text,
  accepted_at timestamptz,
  completed_at timestamptz,
  expired_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_offers ENABLE ROW LEVEL SECURITY;

-- Buyers see own offers, sellers/agents see offers on their properties
CREATE POLICY "Buyers view own offers" ON public.property_offers
  FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers view offers on their properties" ON public.property_offers
  FOR SELECT TO authenticated
  USING (auth.uid() = seller_id OR auth.uid() = agent_id);

CREATE POLICY "Buyers create offers" ON public.property_offers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants update offers" ON public.property_offers
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (buyer_id, seller_id, agent_id));

CREATE INDEX idx_property_offers_buyer ON public.property_offers(buyer_id);
CREATE INDEX idx_property_offers_seller ON public.property_offers(seller_id);
CREATE INDEX idx_property_offers_property ON public.property_offers(property_id);
CREATE INDEX idx_property_offers_status ON public.property_offers(status);

CREATE TRIGGER set_property_offers_updated_at
  BEFORE UPDATE ON public.property_offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Offer Messages / Negotiation Thread
CREATE TABLE public.offer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.property_offers(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL DEFAULT 'buyer' CHECK (sender_role IN ('buyer','seller','agent','system')),
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','counter_offer','status_change','document','milestone')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offer_messages ENABLE ROW LEVEL SECURITY;

-- Participants in the offer can read/write messages
CREATE POLICY "Offer participants read messages" ON public.offer_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.property_offers o
      WHERE o.id = offer_id
      AND auth.uid() IN (o.buyer_id, o.seller_id, o.agent_id)
    )
  );

CREATE POLICY "Offer participants send messages" ON public.offer_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.property_offers o
      WHERE o.id = offer_id
      AND auth.uid() IN (o.buyer_id, o.seller_id, o.agent_id)
    )
  );

CREATE INDEX idx_offer_messages_offer ON public.offer_messages(offer_id, created_at);
