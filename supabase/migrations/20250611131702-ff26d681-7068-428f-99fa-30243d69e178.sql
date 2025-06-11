
-- Create user_notifications table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user_notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.user_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.user_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow admins to insert notifications for any user
CREATE POLICY "Admins can insert notifications" 
  ON public.user_notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
  ON public.user_notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create daily_check_ins table for tracking user check-ins
CREATE TABLE public.daily_check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_awarded NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);

-- Add RLS for daily_check_ins
ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;

-- Policy for daily check-ins
CREATE POLICY "Users can view their own check-ins" 
  ON public.daily_check_ins 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins" 
  ON public.daily_check_ins 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle daily check-in
CREATE OR REPLACE FUNCTION public.process_daily_check_in()
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  tokens_awarded NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  daily_tokens NUMERIC(15,2);
  tokens_enabled BOOLEAN;
  existing_checkin_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User not authenticated'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check if user already checked in today
  SELECT id INTO existing_checkin_id
  FROM public.daily_check_ins 
  WHERE user_id = current_user_id 
  AND check_in_date = CURRENT_DATE;
  
  IF existing_checkin_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Already checked in today'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Get daily check-in reward settings
  SELECT 
    (setting_value->>'amount')::NUMERIC(15,2),
    COALESCE((setting_value->>'enabled')::BOOLEAN, false)
  INTO daily_tokens, tokens_enabled
  FROM public.astra_token_settings 
  WHERE setting_key = 'daily_checkin';
  
  -- Set default if not found
  IF daily_tokens IS NULL THEN
    daily_tokens := 5.00;
    tokens_enabled := true;
  END IF;
  
  -- Record the check-in
  INSERT INTO public.daily_check_ins (user_id, tokens_awarded)
  VALUES (current_user_id, CASE WHEN tokens_enabled THEN daily_tokens ELSE 0 END);
  
  -- Award tokens if enabled (for vendors only)
  IF tokens_enabled AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = current_user_id AND role = 'vendor'
  ) THEN
    -- Update vendor balance
    INSERT INTO public.vendor_astra_balances (vendor_id, balance, lifetime_earned)
    VALUES (current_user_id, daily_tokens, daily_tokens)
    ON CONFLICT (vendor_id) 
    DO UPDATE SET 
      balance = vendor_astra_balances.balance + daily_tokens,
      lifetime_earned = vendor_astra_balances.lifetime_earned + daily_tokens;
    
    -- Create transaction record
    INSERT INTO public.astra_token_transactions (
      vendor_id, 
      transaction_type, 
      amount, 
      description
    ) VALUES (
      current_user_id,
      'daily_checkin',
      daily_tokens,
      'Daily check-in reward'
    );
  END IF;
  
  -- Create notification
  INSERT INTO public.user_notifications (user_id, title, message, type)
  VALUES (
    current_user_id,
    'Daily Check-in Complete!',
    CASE 
      WHEN tokens_enabled THEN 'You earned ' || daily_tokens || ' ASTRA tokens for checking in today!'
      ELSE 'Thanks for checking in today!'
    END,
    'success'
  );
  
  RETURN QUERY SELECT true, 'Check-in successful'::TEXT, CASE WHEN tokens_enabled THEN daily_tokens ELSE 0 END;
END;
$$;
