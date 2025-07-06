-- Create table for customer service user settings
CREATE TABLE public.cs_user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  auto_assign_tickets BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  display_name TEXT NOT NULL DEFAULT 'Customer Service Agent',
  status_message TEXT NOT NULL DEFAULT 'Available for support',
  working_hours TEXT NOT NULL DEFAULT '9-5',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.cs_user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for CS user settings
CREATE POLICY "CS users can view their own settings" 
ON public.cs_user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "CS users can insert their own settings" 
ON public.cs_user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "CS users can update their own settings" 
ON public.cs_user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cs_user_settings_updated_at
BEFORE UPDATE ON public.cs_user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();