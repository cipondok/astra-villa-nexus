-- Create table for generated functions
CREATE TABLE public.generated_functions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  function_description TEXT,
  function_type TEXT NOT NULL, -- 'template' or 'custom'
  template_id TEXT, -- for template-based functions
  generated_code TEXT NOT NULL,
  function_category TEXT,
  complexity TEXT, -- 'simple', 'medium', 'complex'
  requirements JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  is_deployed BOOLEAN DEFAULT false,
  deployment_url TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_functions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all generated functions" 
ON public.generated_functions 
FOR ALL 
USING (check_admin_access());

CREATE POLICY "Users can view active functions" 
ON public.generated_functions 
FOR SELECT 
USING (is_active = true);

-- Create function execution logs table
CREATE TABLE public.function_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_id UUID REFERENCES generated_functions(id) ON DELETE CASCADE,
  executed_by UUID REFERENCES profiles(id),
  execution_result TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for logs
ALTER TABLE public.function_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for logs
CREATE POLICY "Admins can view all execution logs" 
ON public.function_execution_logs 
FOR SELECT 
USING (check_admin_access());

-- Create trigger for updated_at
CREATE TRIGGER update_generated_functions_updated_at
BEFORE UPDATE ON public.generated_functions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();