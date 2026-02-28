-- ═══════════════════════════════════════════════════════════════
-- Property Analytics: tracks views, saves, contacts per property
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.property_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  contacts INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, date)
);

ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own property analytics"
  ON public.property_analytics FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own property analytics"
  ON public.property_analytics FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update own property analytics"
  ON public.property_analytics FOR UPDATE
  USING (auth.uid() = agent_id);

CREATE INDEX idx_property_analytics_agent ON public.property_analytics(agent_id);
CREATE INDEX idx_property_analytics_date ON public.property_analytics(date);
CREATE INDEX idx_property_analytics_property ON public.property_analytics(property_id);

-- ═══════════════════════════════════════════════════════════════
-- Property Leads: tracks leads with scoring per property
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.property_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL,
  lead_name TEXT NOT NULL,
  lead_email TEXT,
  lead_phone TEXT,
  lead_source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  lead_score INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.property_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own leads"
  ON public.property_leads FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own leads"
  ON public.property_leads FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update own leads"
  ON public.property_leads FOR UPDATE
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete own leads"
  ON public.property_leads FOR DELETE
  USING (auth.uid() = agent_id);

CREATE INDEX idx_property_leads_agent ON public.property_leads(agent_id);
CREATE INDEX idx_property_leads_status ON public.property_leads(status);
CREATE INDEX idx_property_leads_score ON public.property_leads(lead_score DESC);

-- ═══════════════════════════════════════════════════════════════
-- Listing Improvement Tips: rule-based AI suggestions per property
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.listing_improvement_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  tip_type TEXT NOT NULL,
  tip_title TEXT NOT NULL,
  tip_description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_improvement_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own tips"
  ON public.listing_improvement_tips FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own tips"
  ON public.listing_improvement_tips FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update own tips"
  ON public.listing_improvement_tips FOR UPDATE
  USING (auth.uid() = agent_id);

CREATE INDEX idx_listing_tips_agent ON public.listing_improvement_tips(agent_id);
CREATE INDEX idx_listing_tips_property ON public.listing_improvement_tips(property_id);

-- Triggers for updated_at
CREATE TRIGGER update_property_analytics_updated_at
  BEFORE UPDATE ON public.property_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_leads_updated_at
  BEFORE UPDATE ON public.property_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();