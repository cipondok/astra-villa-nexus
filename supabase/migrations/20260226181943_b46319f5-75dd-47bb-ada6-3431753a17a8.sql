
-- Add new score columns
ALTER TABLE public.tenant_scores 
  ADD COLUMN IF NOT EXISTS review_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS maintenance_score INTEGER NOT NULL DEFAULT 0;

-- Enhanced scoring function: 6 categories, max 100 total
-- Profile (15), Verification (15), Rental History (20), Payment (20), Reviews (15), Maintenance (15)
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
  v_review_score INTEGER := 0;
  v_maintenance_score INTEGER := 0;
  v_overall INTEGER := 0;
  v_risk TEXT := 'unknown';
  v_breakdown JSONB;
  v_profile RECORD;
  v_booking_count INTEGER;
  v_completed_bookings INTEGER;
  v_cancelled_bookings INTEGER;
  v_paid_invoices INTEGER;
  v_total_invoices INTEGER;
  v_ontime_invoices INTEGER;
  v_has_kyc BOOLEAN;
  v_avg_review NUMERIC;
  v_review_count INTEGER;
  v_maint_total INTEGER;
  v_maint_resolved INTEGER;
BEGIN
  -- 1. Profile completeness (max 15)
  SELECT * INTO v_profile FROM profiles WHERE id = p_tenant_id;
  IF v_profile IS NOT NULL THEN
    IF v_profile.full_name IS NOT NULL THEN v_profile_score := v_profile_score + 3; END IF;
    IF v_profile.email IS NOT NULL THEN v_profile_score := v_profile_score + 3; END IF;
    IF v_profile.phone IS NOT NULL THEN v_profile_score := v_profile_score + 3; END IF;
    IF v_profile.avatar_url IS NOT NULL THEN v_profile_score := v_profile_score + 3; END IF;
    IF v_profile.bio IS NOT NULL THEN v_profile_score := v_profile_score + 3; END IF;
  END IF;

  -- 2. Verification (max 15)
  IF v_profile IS NOT NULL AND v_profile.verification_status = 'verified' THEN
    v_verification_score := v_verification_score + 8;
  END IF;
  IF v_profile IS NOT NULL AND v_profile.company_verified = true THEN
    v_verification_score := v_verification_score + 4;
  END IF;
  SELECT EXISTS(
    SELECT 1 FROM tenant_verifications WHERE tenant_id = p_tenant_id AND status = 'approved'
  ) INTO v_has_kyc;
  IF v_has_kyc THEN v_verification_score := v_verification_score + 7; END IF;
  IF v_verification_score > 15 THEN v_verification_score := 15; END IF;

  -- 3. Rental history (max 20)
  SELECT COUNT(*) INTO v_booking_count FROM rental_bookings WHERE customer_id = p_tenant_id;
  SELECT COUNT(*) INTO v_completed_bookings FROM rental_bookings WHERE customer_id = p_tenant_id AND booking_status = 'completed';
  SELECT COUNT(*) INTO v_cancelled_bookings FROM rental_bookings WHERE customer_id = p_tenant_id AND booking_status = 'cancelled';
  
  IF v_booking_count >= 5 THEN v_rental_score := 10;
  ELSIF v_booking_count >= 3 THEN v_rental_score := 7;
  ELSIF v_booking_count >= 1 THEN v_rental_score := 4;
  END IF;
  
  IF v_completed_bookings >= 3 THEN v_rental_score := v_rental_score + 10;
  ELSIF v_completed_bookings >= 1 THEN v_rental_score := v_rental_score + 5;
  END IF;
  
  -- Deduct for cancellations
  IF v_cancelled_bookings >= 3 THEN v_rental_score := GREATEST(0, v_rental_score - 5);
  ELSIF v_cancelled_bookings >= 1 THEN v_rental_score := GREATEST(0, v_rental_score - 2);
  END IF;
  
  IF v_rental_score > 20 THEN v_rental_score := 20; END IF;

  -- 4. Payment history (max 20) — now includes timeliness
  SELECT COUNT(*) INTO v_total_invoices FROM rental_invoices WHERE tenant_id = p_tenant_id;
  SELECT COUNT(*) INTO v_paid_invoices FROM rental_invoices WHERE tenant_id = p_tenant_id AND status = 'paid';
  SELECT COUNT(*) INTO v_ontime_invoices FROM rental_invoices WHERE tenant_id = p_tenant_id AND status = 'paid' AND paid_at IS NOT NULL AND paid_at <= due_date;
  
  IF v_total_invoices > 0 THEN
    -- Base: paid ratio (max 12)
    v_payment_score := LEAST(12, (v_paid_invoices * 12 / v_total_invoices));
    -- Bonus: on-time ratio (max 8)
    IF v_paid_invoices > 0 THEN
      v_payment_score := v_payment_score + LEAST(8, (v_ontime_invoices * 8 / v_paid_invoices));
    END IF;
  ELSE
    v_payment_score := 10; -- neutral
  END IF;

  -- 5. Review score (max 15) — average rating from owner/property reviews about this tenant's stays
  SELECT AVG(overall_rating), COUNT(*) INTO v_avg_review, v_review_count
  FROM tenant_reviews WHERE tenant_id = p_tenant_id AND is_published = true;
  
  IF v_review_count > 0 THEN
    -- Scale: 5.0 → 15, 4.0 → 12, 3.0 → 9, etc.
    v_review_score := LEAST(15, ROUND(v_avg_review * 3));
    -- Bonus for having multiple reviews
    IF v_review_count >= 3 THEN v_review_score := LEAST(15, v_review_score + 2); END IF;
  ELSE
    v_review_score := 8; -- neutral
  END IF;

  -- 6. Maintenance behavior (max 15) — cooperative/responsive tenant
  SELECT COUNT(*) INTO v_maint_total FROM maintenance_requests WHERE tenant_id = p_tenant_id;
  SELECT COUNT(*) INTO v_maint_resolved FROM maintenance_requests WHERE tenant_id = p_tenant_id AND status = 'resolved';
  
  IF v_maint_total > 0 THEN
    -- Having proper maintenance requests is positive (shows responsible behavior)
    v_maintenance_score := LEAST(8, v_maint_total * 2);
    -- Resolution ratio bonus
    IF v_maint_total > 0 THEN
      v_maintenance_score := v_maintenance_score + LEAST(7, (v_maint_resolved * 7 / v_maint_total));
    END IF;
  ELSE
    v_maintenance_score := 10; -- neutral
  END IF;
  IF v_maintenance_score > 15 THEN v_maintenance_score := 15; END IF;

  -- Overall
  v_overall := v_profile_score + v_verification_score + v_rental_score + v_payment_score + v_review_score + v_maintenance_score;
  
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
    'review', v_review_score,
    'maintenance', v_maintenance_score,
    'booking_count', v_booking_count,
    'completed_bookings', v_completed_bookings,
    'cancelled_bookings', v_cancelled_bookings,
    'paid_invoices', v_paid_invoices,
    'total_invoices', v_total_invoices,
    'ontime_invoices', v_ontime_invoices,
    'has_kyc', v_has_kyc,
    'avg_review', COALESCE(v_avg_review, 0),
    'review_count', v_review_count,
    'maintenance_total', v_maint_total,
    'maintenance_resolved', v_maint_resolved
  );

  -- Upsert score
  INSERT INTO tenant_scores (tenant_id, overall_score, profile_score, verification_score, rental_history_score, payment_score, review_score, maintenance_score, risk_level, score_breakdown, last_calculated_at, updated_at)
  VALUES (p_tenant_id, v_overall, v_profile_score, v_verification_score, v_rental_score, v_payment_score, v_review_score, v_maintenance_score, v_risk, v_breakdown, now(), now())
  ON CONFLICT (tenant_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    profile_score = EXCLUDED.profile_score,
    verification_score = EXCLUDED.verification_score,
    rental_history_score = EXCLUDED.rental_history_score,
    payment_score = EXCLUDED.payment_score,
    review_score = EXCLUDED.review_score,
    maintenance_score = EXCLUDED.maintenance_score,
    risk_level = EXCLUDED.risk_level,
    score_breakdown = EXCLUDED.score_breakdown,
    last_calculated_at = now(),
    updated_at = now();

  RETURN v_breakdown;
END;
$$;
