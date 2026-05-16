import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeCMPC(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('capital-market-perception', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useCMPCDashboard() {
  return useQuery({
    queryKey: ['cmpc-dashboard'],
    queryFn: () => invokeCMPC('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useStrategicCommunication() {
  return useQuery({
    queryKey: ['cmpc-communication'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmpc_strategic_communication' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useReputationSignals() {
  return useQuery({
    queryKey: ['cmpc-reputation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmpc_reputation_signals' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useCategoryLeadership() {
  return useQuery({
    queryKey: ['cmpc-leadership'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmpc_category_leadership' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useInstitutionalTrust() {
  return useQuery({
    queryKey: ['cmpc-trust'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmpc_institutional_trust' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useSentimentAdaptive() {
  return useQuery({
    queryKey: ['cmpc-sentiment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmpc_sentiment_adaptive' as any)
        .select('*')
        .order('monitored_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

// ── Mutations ──

function useMut(mode: string, label: string, invalidateKeys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCMPC(mode, p),
    onSuccess: (data) => {
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['cmpc-dashboard'] });
      toast.success(`${label}: ${JSON.stringify(data).slice(0, 80)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useArchitectCommunication = () => useMut('architect_communication', 'Communication', ['cmpc-communication']);
export const useManageReputation = () => useMut('manage_reputation', 'Reputation', ['cmpc-reputation']);
export const usePositionLeadership = () => useMut('position_leadership', 'Leadership', ['cmpc-leadership']);
export const useDevelopTrust = () => useMut('develop_trust', 'Trust', ['cmpc-trust']);
export const useMonitorSentiment = () => useMut('monitor_sentiment', 'Sentiment', ['cmpc-sentiment']);
