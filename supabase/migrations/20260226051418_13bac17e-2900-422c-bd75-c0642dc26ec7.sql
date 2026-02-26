
-- Tenant Screening & Scoring System
CREATE TABLE public.tenant_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0, -- 0-100
  profile_score INTEGER NOT NULL DEFAULT 0,
  verification_score INTEGER NOT NULL DEFAULT 0,
  rental_history_score INTEGER NOT NULL DEFAULT 0,
  payment_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'unknown' CHECK (risk_level IN ('low', 'medium', 'high', 'unknown')),
  score_breakdown JSONB DEFAULT '{}',
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE public.tenant_scores ENABLE ROW LEVEL SECURITY;

-- Owners can view scores for tenants who have bookings on their properties
CREATE POLICY "Owners can view tenant scores for their properties"
ON public.tenant_scores FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT rb.customer_id FROM rental_bookings rb
    JOIN properties p ON p.id = rb.property_id
    WHERE p.owner_id = auth.uid()
  )
);

-- Tenants can view their own score
CREATE POLICY "Tenants can view own score"
ON public.tenant_scores FOR SELECT TO authenticated
USING (tenant_id = auth.uid());

-- Function to calculate tenant score
CREATE OR REPLACE FUNCTION public.calculate_tenant_score(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_score INTEGER := 0;
  v_verification_score INTEGER := 0;
  v_rental_score INTEGER := 0;
  v_payment_score INTEGER := 0;
  v_overall INTEGER := 0;
  v_risk TEXT := 'unknown';
  v_breakdown JSONB;
  v_profile RECORD;
  v_booking_count INTEGER;
  v_completed_bookings INTEGER;
  v_paid_invoices INTEGER;
  v_total_invoices INTEGER;
  v_has_kyc BOOLEAN;
BEGIN
  -- 1. Profile completeness (max 25)
  SELECT * INTO v_profile FROM profiles WHERE id = p_tenant_id;
  IF v_profile IS NOT NULL THEN
    IF v_profile.full_name IS NOT NULL THEN v_profile_score := v_profile_score + 5; END IF;
    IF v_profile.email IS NOT NULL THEN v_profile_score := v_profile_score + 5; END IF;
    IF v_profile.phone IS NOT NULL THEN v_profile_score := v_profile_score + 5; END IF;
    IF v_profile.avatar_url IS NOT NULL THEN v_profile_score := v_profile_score + 5; END IF;
    IF v_profile.bio IS NOT NULL THEN v_profile_score := v_profile_score + 5; END IF;
  END IF;

  -- 2. Verification (max 25)
  IF v_profile IS NOT NULL AND v_profile.verification_status = 'verified' THEN
    v_verification_score := v_verification_score + 15;
  END IF;
  IF v_profile IS NOT NULL AND v_profile.company_verified = true THEN
    v_verification_score := v_verification_score + 10;
  END IF;
  -- Check KYC
  SELECT EXISTS(
    SELECT 1 FROM tenant_verifications WHERE tenant_id = p_tenant_id AND status = 'approved'
  ) INTO v_has_kyc;
  IF v_has_kyc THEN v_verification_score := v_verification_score + 10; END IF;
  IF v_verification_score > 25 THEN v_verification_score := 25; END IF;

  -- 3. Rental history (max 25)
  SELECT COUNT(*) INTO v_booking_count FROM rental_bookings WHERE customer_id = p_tenant_id;
  SELECT COUNT(*) INTO v_completed_bookings FROM rental_bookings WHERE customer_id = p_tenant_id AND booking_status = 'completed';
  IF v_booking_count >= 3 THEN v_rental_score := 15;
  ELSIF v_booking_count >= 1 THEN v_rental_score := 8;
  END IF;
  IF v_completed_bookings >= 2 THEN v_rental_score := v_rental_score + 10;
  ELSIF v_completed_bookings >= 1 THEN v_rental_score := v_rental_score + 5;
  END IF;
  IF v_rental_score > 25 THEN v_rental_score := 25; END IF;

  -- 4. Payment history (max 25)
  SELECT COUNT(*) INTO v_total_invoices FROM rental_invoices WHERE tenant_id = p_tenant_id;
  SELECT COUNT(*) INTO v_paid_invoices FROM rental_invoices WHERE tenant_id = p_tenant_id AND status = 'paid';
  IF v_total_invoices > 0 THEN
    v_payment_score := LEAST(25, (v_paid_invoices * 25 / v_total_invoices));
  ELSE
    v_payment_score := 15; -- neutral if no invoices
  END IF;

  -- Overall
  v_overall := v_profile_score + v_verification_score + v_rental_score + v_payment_score;
  
  -- Risk level
  IF v_overall >= 70 THEN v_risk := 'low';
  ELSIF v_overall >= 40 THEN v_risk := 'medium';
  ELSE v_risk := 'high';
  END IF;

  v_breakdown := jsonb_build_object(
    'profile', v_profile_score,
    'verification', v_verification_score,
    'rental_history', v_rental_score,
    'payment', v_payment_score,
    'booking_count', v_booking_count,
    'completed_bookings', v_completed_bookings,
    'paid_invoices', v_paid_invoices,
    'total_invoices', v_total_invoices,
    'has_kyc', v_has_kyc
  );

  -- Upsert score
  INSERT INTO tenant_scores (tenant_id, overall_score, profile_score, verification_score, rental_history_score, payment_score, risk_level, score_breakdown, last_calculated_at, updated_at)
  VALUES (p_tenant_id, v_overall, v_profile_score, v_verification_score, v_rental_score, v_payment_score, v_risk, v_breakdown, now(), now())
  ON CONFLICT (tenant_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    profile_score = EXCLUDED.profile_score,
    verification_score = EXCLUDED.verification_score,
    rental_history_score = EXCLUDED.rental_history_score,
    payment_score = EXCLUDED.payment_score,
    risk_level = EXCLUDED.risk_level,
    score_breakdown = EXCLUDED.score_breakdown,
    last_calculated_at = now(),
    updated_at = now();

  RETURN v_breakdown;
END;
$$;
