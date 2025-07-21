-- Create CS user settings table
CREATE TABLE IF NOT EXISTS public.cs_user_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_assign_tickets BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    display_name TEXT NOT NULL DEFAULT 'Customer Service Agent',
    status_message TEXT NOT NULL DEFAULT 'Available for support',
    working_hours TEXT NOT NULL DEFAULT '9-5',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create customer complaints table for ticket management
CREATE TABLE IF NOT EXISTS public.customer_complaints (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    complaint_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cs_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_complaints ENABLE ROW LEVEL SECURITY;

-- Create policies for cs_user_settings
CREATE POLICY "Users can manage their own CS settings" 
ON public.cs_user_settings FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "CS agents can view other CS settings" 
ON public.cs_user_settings FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

-- Create policies for customer_complaints
CREATE POLICY "CS agents can view all complaints" 
ON public.customer_complaints FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

CREATE POLICY "CS agents can update complaints" 
ON public.customer_complaints FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

CREATE POLICY "CS agents can create complaints" 
ON public.customer_complaints FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('customer_service', 'admin')
    )
);

CREATE POLICY "Users can view their own complaints" 
ON public.customer_complaints FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own complaints" 
ON public.customer_complaints FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cs_user_settings_updated_at
    BEFORE UPDATE ON public.cs_user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_complaints_updated_at
    BEFORE UPDATE ON public.customer_complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for CS user
INSERT INTO public.cs_user_settings (user_id, display_name, status_message)
SELECT id, 'Customer Service Agent', 'Available for support'
FROM auth.users 
WHERE email = 'cs@astravilla.com'
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample tickets for testing
INSERT INTO public.customer_complaints (user_id, complaint_type, subject, description, priority, status) VALUES
(
    (SELECT id FROM auth.users WHERE email = 'cs@astravilla.com'),
    'Technical Issue',
    'Login Problem',
    'Cannot login to my account',
    'high',
    'open'
),
(
    (SELECT id FROM auth.users WHERE email = 'cs@astravilla.com'),
    'Billing Issue',
    'Payment Processing',
    'Payment failed but money was deducted',
    'urgent',
    'open'
),
(
    (SELECT id FROM auth.users WHERE email = 'cs@astravilla.com'),
    'General Inquiry',
    'Property Information',
    'Need more details about property listing',
    'medium',
    'in_progress'
);

-- Add realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.cs_user_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_complaints;