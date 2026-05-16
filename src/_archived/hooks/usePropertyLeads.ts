import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PropertyLead {
  id: string;
  property_id: string | null;
  agent_id: string;
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  lead_source: string;
  status: string;
  lead_score: number;
  notes: string | null;
  last_contacted_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Compute lead score 0-100 based on completeness + engagement signals */
export function computeLeadScore(lead: Partial<PropertyLead>): number {
  let score = 0;
  if (lead.lead_name) score += 10;
  if (lead.lead_email) score += 15;
  if (lead.lead_phone) score += 20;
  if (lead.lead_source === 'referral') score += 15;
  else if (lead.lead_source === 'whatsapp') score += 12;
  else if (lead.lead_source === 'website') score += 8;
  else score += 5;
  if (lead.property_id) score += 10; // interested in specific property
  if (lead.last_contacted_at) score += 15;
  if (lead.notes && lead.notes.length > 20) score += 5;
  if (lead.status === 'qualified') score += 10;
  else if (lead.status === 'contacted') score += 5;
  return Math.min(score, 100);
}

export const usePropertyLeads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['property-leads', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      // Query leads where agent_id matches (covers both agents and owners, since
      // the on_inquiry_created trigger sets agent_id = COALESCE(agent_id, owner_id))
      const { data, error } = await supabase
        .from('property_leads')
        .select('*')
        .eq('agent_id', user.id)
        .order('lead_score', { ascending: false });
      if (error) throw error;
      return (data || []) as PropertyLead[];
    },
    enabled: !!user,
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PropertyLead> & { id: string }) => {
      const { error } = await supabase
        .from('property_leads')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['property-leads'] }),
  });

  const addLead = useMutation({
    mutationFn: async (lead: Omit<PropertyLead, 'id' | 'created_at' | 'updated_at'>) => {
      const score = computeLeadScore(lead);
      const { error } = await supabase
        .from('property_leads')
        .insert({ ...lead, lead_score: score });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['property-leads'] }),
  });

  // Summary stats
  const leads = leadsQuery.data || [];
  const summary = {
    total: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    hotLeads: leads.filter(l => l.lead_score >= 70).length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.lead_score, 0) / leads.length) : 0,
  };

  return {
    leads,
    summary,
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    updateLead,
    addLead,
  };
};
