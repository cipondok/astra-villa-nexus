
CREATE TABLE public.tenant_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  comment TEXT,
  owner_reply TEXT,
  owner_replied_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id, tenant_id)
);

ALTER TABLE public.tenant_reviews ENABLE ROW LEVEL SECURITY;

-- Tenants can read all published reviews
CREATE POLICY "Anyone can read published reviews"
  ON public.tenant_reviews FOR SELECT
  USING (is_published = true);

-- Tenants can insert their own reviews
CREATE POLICY "Tenants can create own reviews"
  ON public.tenant_reviews FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- Tenants can update their own reviews
CREATE POLICY "Tenants can update own reviews"
  ON public.tenant_reviews FOR UPDATE
  USING (auth.uid() = tenant_id)
  WITH CHECK (auth.uid() = tenant_id);

-- Property owners can read all reviews for their properties
CREATE POLICY "Owners can read reviews for their properties"
  ON public.tenant_reviews FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE owner_id = auth.uid()
    )
  );

-- Property owners can reply to reviews (update owner_reply only)
CREATE POLICY "Owners can reply to reviews"
  ON public.tenant_reviews FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE owner_id = auth.uid()
    )
  );
