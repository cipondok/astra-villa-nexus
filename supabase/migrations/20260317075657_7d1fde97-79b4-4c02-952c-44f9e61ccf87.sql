
-- Fix overly permissive lead insert policies
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.project_leads;
DROP POLICY IF EXISTS "Anon can create leads" ON public.project_leads;

-- Authenticated users can create leads for published projects only
CREATE POLICY "Auth users create leads for published projects" ON public.project_leads
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.developer_projects dp WHERE dp.id = project_id AND dp.is_published = true)
  );

-- Anon can register interest for published projects only
CREATE POLICY "Anon create leads for published projects" ON public.project_leads
  FOR INSERT TO anon WITH CHECK (
    EXISTS (SELECT 1 FROM public.developer_projects dp WHERE dp.id = project_id AND dp.is_published = true)
  );
