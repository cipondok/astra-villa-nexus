-- Create email templates table for CS tools
CREATE TABLE public.cs_email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge base articles table
CREATE TABLE public.cs_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation rules table
CREATE TABLE public.cs_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cs_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cs_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cs_automation_rules ENABLE ROW LEVEL SECURITY;

-- Policies for CS staff and admins
CREATE POLICY "CS staff can manage email templates" 
ON public.cs_email_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "CS staff can manage knowledge base" 
ON public.cs_knowledge_base 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

CREATE POLICY "Anyone can read published knowledge base articles" 
ON public.cs_knowledge_base 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "CS staff can manage automation rules" 
ON public.cs_automation_rules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'customer_service')
  )
);

-- Create indexes
CREATE INDEX idx_cs_email_templates_type ON public.cs_email_templates(template_type);
CREATE INDEX idx_cs_knowledge_base_category ON public.cs_knowledge_base(category);
CREATE INDEX idx_cs_knowledge_base_published ON public.cs_knowledge_base(is_published);
CREATE INDEX idx_cs_automation_rules_active ON public.cs_automation_rules(is_active);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cs_email_templates_updated_at
BEFORE UPDATE ON public.cs_email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cs_knowledge_base_updated_at
BEFORE UPDATE ON public.cs_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cs_automation_rules_updated_at
BEFORE UPDATE ON public.cs_automation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();