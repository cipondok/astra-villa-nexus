import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AcquisitionStage = 'identified' | 'contacted' | 'interested' | 'onboarding' | 'activated' | 'churned';
export type SourceChannel = 'whatsapp' | 'instagram' | 'community_group' | 'referral' | 'direct' | 'event' | 'linkedin';

export interface AgentPipelineEntry {
  id: string;
  agent_name: string;
  phone: string | null;
  email: string | null;
  city: string;
  source_channel: SourceChannel;
  listing_portfolio_size: number;
  specialization: string | null;
  stage: AcquisitionStage;
  priority: string;
  notes: string | null;
  first_contacted_at: string | null;
  activated_at: string | null;
  first_listing_at: string | null;
  first_lead_response_at: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineFunnelStats {
  identified: number;
  contacted: number;
  interested: number;
  onboarding: number;
  activated: number;
  churned: number;
  total: number;
  conversionRate: number;
  byChannel: Record<string, number>;
  byCity: Record<string, number>;
}

export function useAgentAcquisitionPipeline(enabled = true) {
  return useQuery({
    queryKey: ['agent-acquisition-pipeline'],
    queryFn: async (): Promise<{ entries: AgentPipelineEntry[]; stats: PipelineFunnelStats }> => {
      const { data, error } = await supabase
        .from('agent_acquisition_pipeline')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const entries = (data || []) as unknown as AgentPipelineEntry[];
      const stages: AcquisitionStage[] = ['identified', 'contacted', 'interested', 'onboarding', 'activated', 'churned'];
      const stageCounts = Object.fromEntries(stages.map((s) => [s, entries.filter((e) => e.stage === s).length])) as Record<AcquisitionStage, number>;

      const byChannel: Record<string, number> = {};
      const byCity: Record<string, number> = {};
      for (const e of entries) {
        byChannel[e.source_channel] = (byChannel[e.source_channel] || 0) + 1;
        byCity[e.city] = (byCity[e.city] || 0) + 1;
      }

      const activated = stageCounts.activated;
      const total = entries.length;

      return {
        entries,
        stats: {
          ...stageCounts,
          total,
          conversionRate: total > 0 ? Math.round((activated / total) * 100) : 0,
          byChannel,
          byCity,
        },
      };
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateAgentStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: AcquisitionStage }) => {
      const update: Record<string, unknown> = { stage, updated_at: new Date().toISOString() };
      if (stage === 'contacted') update.first_contacted_at = new Date().toISOString();
      if (stage === 'activated') update.activated_at = new Date().toISOString();
      const { error } = await supabase.from('agent_acquisition_pipeline').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agent-acquisition-pipeline'] }),
  });
}

export function useAddAgentToAcquisition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Partial<AgentPipelineEntry>) => {
      const { error } = await supabase.from('agent_acquisition_pipeline').insert(entry as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agent-acquisition-pipeline'] }),
  });
}
