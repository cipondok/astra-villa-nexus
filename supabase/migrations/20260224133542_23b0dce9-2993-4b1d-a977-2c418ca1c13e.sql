
-- Property shares tracking table
CREATE TABLE public.property_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  referral_code TEXT,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.property_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own shares" ON public.property_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own shares" ON public.property_shares
  FOR SELECT USING (auth.uid() = user_id);

-- Index for analytics queries
CREATE INDEX idx_property_shares_user_id ON public.property_shares(user_id);
CREATE INDEX idx_property_shares_property_id ON public.property_shares(property_id);

-- Trigger to auto-increment affiliate total_referrals on new referral
CREATE OR REPLACE FUNCTION public.process_referral_signup()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.affiliates 
  SET total_referrals = COALESCE(total_referrals, 0) + 1,
      updated_at = now()
  WHERE id = NEW.affiliate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_referral_created
  AFTER INSERT ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_signup();
