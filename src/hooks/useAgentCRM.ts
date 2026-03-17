import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type LeadStatus = 'new' | 'contacted' | 'negotiation' | 'closed' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CRMLead {
  id: string;
  agent_id: string;
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  lead_source: string;
  property_id: string | null;
  property_title: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  deal_probability: number;
  notes: string | null;
  follow_up_date: string | null;
  last_contacted_at: string | null;
  closed_at: string | null;
  lost_reason: string | null;
  deal_value: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CRMStats {
  total: number;
  new: number;
  contacted: number;
  negotiation: number;
  closed: number;
  lost: number;
  conversion_rate: number;
  total_deal_value: number;
  avg_deal_probability: number;
  overdue_follow_ups: number;
  today_follow_ups: number;
}

export const LEAD_STATUS_CONFIG = {
  new: { label: 'New', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', icon: '🆕' },
  contacted: { label: 'Contacted', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', icon: '📞' },
  negotiation: { label: 'Negotiation', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30', icon: '🤝' },
  closed: { label: 'Closed', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: '✅' },
  lost: { label: 'Lost', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: '❌' },
} as const;

export const LEAD_PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-primary' },
  high: { label: 'High', color: 'text-amber-500' },
  urgent: { label: 'Urgent', color: 'text-destructive' },
} as const;

const PIPELINE_ORDER: LeadStatus[] = ['new', 'contacted', 'negotiation', 'closed', 'lost'];

/** Fetch all leads for the current agent */
export function useAgentLeads(statusFilter?: LeadStatus | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['agent-crm-leads', user?.id, statusFilter],
    queryFn: async (): Promise<CRMLead[]> => {
      if (!user?.id) return [];
      let query = (supabase as any)
        .from('agent_crm_leads')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CRMLead[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

/** Fetch CRM stats */
export function useAgentCRMStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['agent-crm-stats', user?.id],
    queryFn: async (): Promise<CRMStats> => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('get_agent_crm_stats' as any, {
        p_agent_id: user.id,
      });
      if (error) throw error;
      return data as unknown as CRMStats;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

/** Create a new lead */
export function useCreateLead() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<CRMLead>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await (supabase as any)
        .from('agent_crm_leads')
        .insert({ ...input, agent_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as CRMLead;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-crm-leads'] });
      qc.invalidateQueries({ queryKey: ['agent-crm-stats'] });
      toast.success('Lead created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Update a lead */
export function useUpdateLead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CRMLead> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('agent_crm_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CRMLead;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-crm-leads'] });
      qc.invalidateQueries({ queryKey: ['agent-crm-stats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Delete a lead */
export function useDeleteLead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('agent_crm_leads')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-crm-leads'] });
      qc.invalidateQueries({ queryKey: ['agent-crm-stats'] });
      toast.success('Lead deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Move lead to next/prev pipeline stage */
export function useMoveLead() {
  const update = useUpdateLead();

  return {
    moveToStatus: (id: string, status: LeadStatus) => {
      const extras: Partial<CRMLead> = {};
      if (status === 'closed') extras.closed_at = new Date().toISOString();
      if (status === 'contacted') extras.last_contacted_at = new Date().toISOString();
      update.mutate({ id, status, ...extras });
      toast.success(`Lead moved to ${LEAD_STATUS_CONFIG[status].label}`);
    },
    isPending: update.isPending,
  };
}
