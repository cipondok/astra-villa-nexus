
-- Fix search_path on the trigger function
CREATE OR REPLACE FUNCTION public.auto_generate_vendor_growth_campaign()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.category_gap_index >= 70 AND NEW.expansion_status = 'identified' THEN
    INSERT INTO public.vendor_growth_campaigns (
      campaign_name, campaign_type, district, segment_type,
      target_vendor_category, target_vendor_count,
      urgency_score, trigger_reason, trigger_metrics, status
    ) VALUES (
      'Acquire ' || NEW.target_vendor_count || ' ' || NEW.service_category || ' vendors in ' || NEW.district,
      'acquisition',
      NEW.district,
      NEW.segment_type,
      NEW.service_category,
      GREATEST(NEW.target_vendor_count - NEW.current_vendor_count, 3),
      NEW.category_gap_index,
      'Auto: category_gap_index >= 70',
      jsonb_build_object('gap_index', NEW.category_gap_index, 'demand_signal', NEW.demand_signal_strength),
      'planned'
    )
    ON CONFLICT DO NOTHING;

    UPDATE public.vendor_category_expansion_targets
    SET expansion_status = 'targeting'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
