
-- Create user_departments table
CREATE TABLE public.user_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '👤',
  color TEXT DEFAULT '#6B7280',
  permissions TEXT[] DEFAULT '{}',
  property_category_access TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property_category_access table
CREATE TABLE public.property_category_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES public.user_departments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.property_categories(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL CHECK (access_level IN ('read', 'write', 'manage')),
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(department_id, category_id)
);

-- Enable RLS on both tables
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_category_access ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage user_departments" ON public.user_departments
  FOR ALL USING (check_admin_access());

CREATE POLICY "Admin can manage property_category_access" ON public.property_category_access
  FOR ALL USING (check_admin_access());

-- Add update triggers
CREATE TRIGGER update_user_departments_updated_at
  BEFORE UPDATE ON public.user_departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_category_access_updated_at
  BEFORE UPDATE ON public.property_category_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
