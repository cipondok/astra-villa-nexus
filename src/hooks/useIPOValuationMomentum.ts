import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeIVMS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('ipo-valuation-momentum', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useIVMSDashboard() {
  return useQuery({
    queryKey: ['ivms-dashboard'],
    queryFn: () => invokeIVMS('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useValuationSignals() {
  return useQuery({
    queryKey: ['ivms-valuation-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ivms_valuation_signals' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useNarrativeMomentum() {
  return useQuery({
    queryKey: ['ivms-narrative-momentum'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ivms_narrative_momentum' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useMarketTimingSensitivity() {
  return useQuery({
    queryKey: ['ivms-market-timing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ivms_market_timing' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useStrategicMilestones() {
  return useQuery({
    queryKey: ['ivms-strategic-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ivms_strategic_milestones' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useConfidenceLoop() {
  return useQuery({
    queryKey: ['ivms-confidence-loop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ivms_confidence_loop' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

function useMut(mode: string, label: string, invalidateKeys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIVMS(mode, p),
    onSuccess: (data) => {
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['ivms-dashboard'] });
      toast.success(`${label}: ${JSON.stringify(data).slice(0, 80)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useAnalyzeSignals = () => useMut('analyze_signals', 'Signal Analysis', ['ivms-valuation-signals']);
export const useModelNarrative = () => useMut('model_narrative', 'Narrative Model', ['ivms-narrative-momentum']);
export const useAssessMarketTiming = () => useMut('assess_timing', 'Market Timing', ['ivms-market-timing']);
export const useMapMilestones = () => useMut('map_milestones', 'Milestone Map', ['ivms-strategic-milestones']);
export const useReinforceConfidence = () => useMut('reinforce_confidence', 'Confidence Loop', ['ivms-confidence-loop']);
