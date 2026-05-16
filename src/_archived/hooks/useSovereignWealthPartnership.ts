import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const invoke = async (mode: string, extra?: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('sovereign-wealth-partnership', { body: { mode, ...extra } });
  if (error) throw error;
  return data;
};

export const useSWFPSDashboard = () => useQuery({ queryKey: ['swfps-dashboard'], queryFn: () => invoke('dashboard'), staleTime: 30_000, refetchInterval: 60_000 });

export const useStrategicAlignment = () => useQuery({
  queryKey: ['swfps-alignment'],
  queryFn: async () => { const { data, error } = await supabase.from('swfps_strategic_alignment' as any).select('*').order('assessed_at', { ascending: false }).limit(40); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const usePartnershipStructures = () => useQuery({
  queryKey: ['swfps-structures'],
  queryFn: async () => { const { data, error } = await supabase.from('swfps_partnership_structures' as any).select('*').order('designed_at', { ascending: false }).limit(20); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useCapitalStability = () => useQuery({
  queryKey: ['swfps-stability'],
  queryFn: async () => { const { data, error } = await supabase.from('swfps_capital_stability' as any).select('*').order('simulated_at', { ascending: false }).limit(15); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useMutualValue = () => useQuery({
  queryKey: ['swfps-value'],
  queryFn: async () => { const { data, error } = await supabase.from('swfps_mutual_value' as any).select('*').order('assessed_at', { ascending: false }).limit(30); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useGovernanceTrust = () => useQuery({
  queryKey: ['swfps-governance'],
  queryFn: async () => { const { data, error } = await supabase.from('swfps_governance_trust' as any).select('*').order('assessed_at', { ascending: false }).limit(25); if (error) throw error; return data; },
  staleTime: 20_000,
});

function useMut(mode: string, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invoke(mode, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swfps-dashboard'] }); toast.success(`${label} computed`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useMapAlignment = () => useMut('alignment', 'Strategic Alignment');
export const useDesignStructures = () => useMut('structures', 'Partnership Structures');
export const useSimulateStability = () => useMut('stability', 'Capital Stability');
export const useMapMutualValue = () => useMut('mutual_value', 'Mutual Value');
export const useAssessGovernance = () => useMut('governance', 'Governance Trust');
