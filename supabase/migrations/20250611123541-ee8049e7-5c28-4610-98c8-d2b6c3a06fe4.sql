
-- Create function to claim signup bonus
CREATE OR REPLACE FUNCTION public.claim_signup_bonus(vendor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bonus_amount DECIMAL(15,2);
  bonus_enabled BOOLEAN;
BEGIN
  -- Get signup bonus settings
  SELECT 
    (setting_value->>'amount')::DECIMAL(15,2),
    (setting_value->>'enabled')::BOOLEAN
  INTO bonus_amount, bonus_enabled
  FROM public.astra_token_settings 
  WHERE setting_key = 'signup_bonus';
  
  -- Check if bonus is enabled and vendor hasn't claimed it
  IF bonus_enabled AND NOT EXISTS (
    SELECT 1 FROM public.vendor_business_profiles 
    WHERE vendor_business_profiles.vendor_id = claim_signup_bonus.vendor_id 
    AND astra_signup_bonus_claimed = true
  ) THEN
    -- Create transaction
    INSERT INTO public.astra_token_transactions (
      vendor_id, 
      transaction_type, 
      amount, 
      description
    ) VALUES (
      claim_signup_bonus.vendor_id,
      'signup_bonus',
      bonus_amount,
      'Welcome signup bonus'
    );
    
    -- Update or create balance
    INSERT INTO public.vendor_astra_balances (vendor_id, balance, lifetime_earned)
    VALUES (claim_signup_bonus.vendor_id, bonus_amount, bonus_amount)
    ON CONFLICT (vendor_id) 
    DO UPDATE SET 
      balance = vendor_astra_balances.balance + bonus_amount,
      lifetime_earned = vendor_astra_balances.lifetime_earned + bonus_amount;
    
    -- Mark bonus as claimed
    UPDATE public.vendor_business_profiles 
    SET astra_signup_bonus_claimed = true 
    WHERE vendor_business_profiles.vendor_id = claim_signup_bonus.vendor_id;
  END IF;
END;
$$;

-- Create function to claim profile completion bonus
CREATE OR REPLACE FUNCTION public.claim_profile_completion_bonus(vendor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bonus_amount DECIMAL(15,2);
  bonus_enabled BOOLEAN;
BEGIN
  -- Get profile completion bonus settings
  SELECT 
    (setting_value->>'amount')::DECIMAL(15,2),
    (setting_value->>'enabled')::BOOLEAN
  INTO bonus_amount, bonus_enabled
  FROM public.astra_token_settings 
  WHERE setting_key = 'profile_completion';
  
  -- Check if bonus is enabled and vendor hasn't claimed it
  IF bonus_enabled AND NOT EXISTS (
    SELECT 1 FROM public.vendor_business_profiles 
    WHERE vendor_business_profiles.vendor_id = claim_profile_completion_bonus.vendor_id 
    AND astra_profile_bonus_claimed = true
  ) THEN
    -- Create transaction
    INSERT INTO public.astra_token_transactions (
      vendor_id, 
      transaction_type, 
      amount, 
      description
    ) VALUES (
      claim_profile_completion_bonus.vendor_id,
      'profile_completion',
      bonus_amount,
      '100% profile completion bonus'
    );
    
    -- Update or create balance
    INSERT INTO public.vendor_astra_balances (vendor_id, balance, lifetime_earned)
    VALUES (claim_profile_completion_bonus.vendor_id, bonus_amount, bonus_amount)
    ON CONFLICT (vendor_id) 
    DO UPDATE SET 
      balance = vendor_astra_balances.balance + bonus_amount,
      lifetime_earned = vendor_astra_balances.lifetime_earned + bonus_amount;
    
    -- Mark bonus as claimed
    UPDATE public.vendor_business_profiles 
    SET astra_profile_bonus_claimed = true 
    WHERE vendor_business_profiles.vendor_id = claim_profile_completion_bonus.vendor_id;
  END IF;
END;
$$;
