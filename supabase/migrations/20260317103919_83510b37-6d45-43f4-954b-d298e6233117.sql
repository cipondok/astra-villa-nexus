
-- handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Agent CRM Leads table
CREATE TABLE IF NOT EXISTS public.agent_crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_name text NOT NULL,
  lead_email text,
  lead_phone text,
  lead_source text NOT NULL DEFAULT 'manual',
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  property_title text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','negotiation','closed','lost')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  deal_probability int DEFAULT 0 CHECK (deal_probability >= 0 AND deal_probability <= 100),
  notes text,
  follow_up_date timestamptz,
  last_contacted_at timestamptz,
  closed_at timestamptz,
  lost_reason text,
  deal_value numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents manage own leads" ON public.agent_crm_leads
  FOR ALL TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_crm_leads_agent ON public.agent_crm_leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_crm_leads_status ON public.agent_crm_leads(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_crm_leads_follow_up ON public.agent_crm_leads(agent_id, follow_up_date) WHERE follow_up_date IS NOT NULL;

CREATE TRIGGER set_agent_crm_leads_updated_at
  BEFORE UPDATE ON public.agent_crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- CRM Analytics RPC
CREATE OR REPLACE FUNCTION public.get_agent_crm_stats(p_agent_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'new', COUNT(*) FILTER (WHERE status = 'new'),
    'contacted', COUNT(*) FILTER (WHERE status = 'contacted'),
    'negotiation', COUNT(*) FILTER (WHERE status = 'negotiation'),
    'closed', COUNT(*) FILTER (WHERE status = 'closed'),
    'lost', COUNT(*) FILTER (WHERE status = 'lost'),
    'conversion_rate', CASE WHEN COUNT(*) FILTER (WHERE status IN ('closed','lost')) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE status = 'closed')::numeric / COUNT(*) FILTER (WHERE status IN ('closed','lost')) * 100, 1)
      ELSE 0 END,
    'total_deal_value', COALESCE(SUM(deal_value) FILTER (WHERE status = 'closed'), 0),
    'avg_deal_probability', COALESCE(ROUND(AVG(deal_probability) FILTER (WHERE status IN ('new','contacted','negotiation')), 0), 0),
    'overdue_follow_ups', COUNT(*) FILTER (WHERE follow_up_date < now() AND status NOT IN ('closed','lost')),
    'today_follow_ups', COUNT(*) FILTER (WHERE follow_up_date::date = CURRENT_DATE AND status NOT IN ('closed','lost'))
  )
  FROM public.agent_crm_leads
  WHERE agent_id = p_agent_id;
$$;
