
-- Fix search_path on process_referral_signup function
CREATE OR REPLACE FUNCTION public.process_referral_signup()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.affiliates 
  SET total_referrals = COALESCE(total_referrals, 0) + 1,
      updated_at = now()
  WHERE id = NEW.affiliate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
