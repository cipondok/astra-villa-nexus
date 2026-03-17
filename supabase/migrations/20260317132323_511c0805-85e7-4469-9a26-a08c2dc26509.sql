
-- Revenue Alert Config table (single-row config)
CREATE TABLE public.revenue_alert_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  daily_revenue_min numeric NOT NULL DEFAULT 0,
  daily_commission_max numeric NOT NULL DEFAULT 0,
  rental_revenue_min numeric NOT NULL DEFAULT 0,
  alert_cooldown_hours int NOT NULL DEFAULT 24,
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Seed default row
INSERT INTO public.revenue_alert_config (id) VALUES (1);

-- RLS
ALTER TABLE public.revenue_alert_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read revenue_alert_config"
  ON public.revenue_alert_config FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update revenue_alert_config"
  ON public.revenue_alert_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Check revenue alerts function
CREATE OR REPLACE FUNCTION public.check_revenue_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg record;
  daily_rev numeric;
  daily_comm numeric;
  daily_rental numeric;
  cooldown_cutoff timestamptz;
BEGIN
  SELECT * INTO cfg FROM revenue_alert_config WHERE id = 1;
  IF NOT FOUND OR NOT cfg.is_enabled THEN RETURN; END IF;

  cooldown_cutoff := now() - (cfg.alert_cooldown_hours || ' hours')::interval;

  -- Calculate today's totals
  SELECT COALESCE(SUM(amount), 0) INTO daily_rev
  FROM payment_logs WHERE created_at >= date_trunc('day', now()) AND status = 'completed';

  SELECT COALESCE(SUM(commission_amount), 0) INTO daily_comm
  FROM transaction_commissions WHERE created_at >= date_trunc('day', now());

  SELECT COALESCE(SUM(total_price), 0) INTO daily_rental
  FROM rental_bookings WHERE created_at >= date_trunc('day', now()) AND status IN ('confirmed', 'completed');

  -- Check daily revenue drop
  IF cfg.daily_revenue_min > 0 AND daily_rev < cfg.daily_revenue_min THEN
    IF NOT EXISTS (
      SELECT 1 FROM admin_alerts WHERE type = 'revenue_drop' AND created_at > cooldown_cutoff
    ) THEN
      INSERT INTO admin_alerts (type, title, message, priority, action_required, auto_generated, urgency_level, alert_category, metadata)
      VALUES (
        'revenue_drop',
        'Daily Revenue Below Threshold',
        format('Today''s revenue (%s) is below the minimum threshold (%s).', 
          to_char(daily_rev, 'FM999,999,999'), to_char(cfg.daily_revenue_min, 'FM999,999,999')),
        'high', true, true, 3, 'revenue',
        jsonb_build_object('daily_revenue', daily_rev, 'threshold', cfg.daily_revenue_min)
      );
    END IF;
  END IF;

  -- Check commission overbudget
  IF cfg.daily_commission_max > 0 AND daily_comm > cfg.daily_commission_max THEN
    IF NOT EXISTS (
      SELECT 1 FROM admin_alerts WHERE type = 'commission_overbudget' AND created_at > cooldown_cutoff
    ) THEN
      INSERT INTO admin_alerts (type, title, message, priority, action_required, auto_generated, urgency_level, alert_category, metadata)
      VALUES (
        'commission_overbudget',
        'Commission Payouts Exceed Budget',
        format('Today''s commission payouts (%s) exceed the daily budget (%s).', 
          to_char(daily_comm, 'FM999,999,999'), to_char(cfg.daily_commission_max, 'FM999,999,999')),
        'high', true, true, 3, 'revenue',
        jsonb_build_object('daily_commission', daily_comm, 'threshold', cfg.daily_commission_max)
      );
    END IF;
  END IF;

  -- Check rental revenue low
  IF cfg.rental_revenue_min > 0 AND daily_rental < cfg.rental_revenue_min THEN
    IF NOT EXISTS (
      SELECT 1 FROM admin_alerts WHERE type = 'rental_revenue_low' AND created_at > cooldown_cutoff
    ) THEN
      INSERT INTO admin_alerts (type, title, message, priority, action_required, auto_generated, urgency_level, alert_category, metadata)
      VALUES (
        'rental_revenue_low',
        'Rental Revenue Below Threshold',
        format('Today''s rental revenue (%s) is below the minimum threshold (%s).', 
          to_char(daily_rental, 'FM999,999,999'), to_char(cfg.rental_revenue_min, 'FM999,999,999')),
        'medium', true, true, 2, 'revenue',
        jsonb_build_object('daily_rental', daily_rental, 'threshold', cfg.rental_revenue_min)
      );
    END IF;
  END IF;
END;
$$;
