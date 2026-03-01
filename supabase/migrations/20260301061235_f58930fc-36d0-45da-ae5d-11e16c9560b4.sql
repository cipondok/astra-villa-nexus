-- Property verification badges table
CREATE TABLE public.property_verification_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  badge_type text NOT NULL CHECK (badge_type IN (
    'ownership_verified',
    'developer_certified', 
    'government_approved',
    'bank_partner',
    'premium_listing',
    'eco_certified'
  )),
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.property_verification_badges ENABLE ROW LEVEL SECURITY;

-- Public read access for active badges
CREATE POLICY "Anyone can view active badges"
  ON public.property_verification_badges
  FOR SELECT
  USING (is_active = true);

-- Admin can manage badges
CREATE POLICY "Admins can manage badges"
  ON public.property_verification_badges
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_property_verification_badges_property 
  ON public.property_verification_badges(property_id) 
  WHERE is_active = true;