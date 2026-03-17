
-- Admin Revenue & Commission Stats RPC
CREATE OR REPLACE FUNCTION public.get_admin_revenue_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_revenue', COALESCE((SELECT SUM(amount) FROM payment_logs WHERE status = 'completed'), 0),
    'monthly_revenue', COALESCE((SELECT SUM(amount) FROM payment_logs WHERE status = 'completed' AND created_at >= date_trunc('month', now())), 0),
    'prev_monthly_revenue', COALESCE((SELECT SUM(amount) FROM payment_logs WHERE status = 'completed' AND created_at >= date_trunc('month', now() - interval '1 month') AND created_at < date_trunc('month', now())), 0),
    'total_commissions', COALESCE((SELECT SUM(commission_amount) FROM affiliate_commissions), 0),
    'pending_commissions', COALESCE((SELECT SUM(commission_amount) FROM affiliate_commissions WHERE status = 'pending'), 0),
    'paid_commissions', COALESCE((SELECT SUM(commission_amount) FROM affiliate_commissions WHERE status = 'paid'), 0),
    'total_transactions', (SELECT COUNT(*) FROM payment_logs),
    'completed_transactions', (SELECT COUNT(*) FROM payment_logs WHERE status = 'completed'),
    'pending_transactions', (SELECT COUNT(*) FROM payment_logs WHERE status = 'pending'),
    'mortgage_applications', (SELECT COUNT(*) FROM mortgage_applications),
    'mortgage_approved', (SELECT COUNT(*) FROM mortgage_applications WHERE status = 'approved'),
    'mortgage_pending', (SELECT COUNT(*) FROM mortgage_applications WHERE status IN ('pending', 'submitted', 'under_review')),
    'active_affiliates', (SELECT COUNT(*) FROM affiliates WHERE status = 'active'),
    'total_affiliate_earnings', COALESCE((SELECT SUM(total_earnings) FROM affiliates), 0)
  ) INTO result;

  RETURN result;
END;
$$;

-- Investment report data RPC
CREATE OR REPLACE FUNCTION public.get_property_investment_report(p_property_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop record;
  result jsonb;
  avg_area_price numeric;
  rental_yield numeric;
  cap_rate numeric;
BEGIN
  SELECT * INTO prop FROM properties WHERE id = p_property_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found'; END IF;

  -- Average price in same city
  SELECT COALESCE(AVG(price), 0) INTO avg_area_price
  FROM properties WHERE city = prop.city AND status = 'available' AND id != p_property_id;

  -- Estimate rental yield (annual rent / price * 100)
  rental_yield := CASE WHEN prop.price > 0 THEN ROUND(((prop.price * 0.05) / prop.price * 100)::numeric, 2) ELSE 0 END;
  cap_rate := CASE WHEN prop.price > 0 THEN ROUND(((prop.price * 0.04) / prop.price * 100)::numeric, 2) ELSE 0 END;

  SELECT jsonb_build_object(
    'property_id', prop.id,
    'title', prop.title,
    'price', prop.price,
    'city', prop.city,
    'property_type', prop.property_type,
    'bedrooms', prop.bedrooms,
    'bathrooms', prop.bathrooms,
    'land_size', prop.land_size,
    'building_size', prop.building_size,
    'avg_area_price', avg_area_price,
    'price_vs_market', CASE WHEN avg_area_price > 0 THEN ROUND(((prop.price - avg_area_price) / avg_area_price * 100)::numeric, 1) ELSE 0 END,
    'estimated_rental_yield', rental_yield,
    'estimated_cap_rate', cap_rate,
    'investment_score', prop.investment_score,
    'ai_opportunity_score', prop.ai_opportunity_score,
    'similar_properties_count', (SELECT COUNT(*) FROM properties WHERE city = prop.city AND property_type = prop.property_type AND id != p_property_id),
    'market_trend', CASE
      WHEN avg_area_price > 0 AND prop.price < avg_area_price * 0.9 THEN 'undervalued'
      WHEN avg_area_price > 0 AND prop.price > avg_area_price * 1.1 THEN 'premium'
      ELSE 'fair_value'
    END
  ) INTO result;

  RETURN result;
END;
$$;
