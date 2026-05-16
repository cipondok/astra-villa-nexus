import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeGPEWM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('proptech-execution-warmap', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useGPEWMDashboard(enabled = true) {
  return useQuery({
    queryKey: ['gpewm-dashboard'],
    queryFn: () => invokeGPEWM('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useMarketEntrySequencing(enabled = true) {
  return useQuery({
    queryKey: ['gpewm-market-entry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpewm_market_entry' as any)
        .select('*')
        .order('composite_priority', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useCompetitiveLandscape(city?: string) {
  return useQuery({
    queryKey: ['gpewm-competition', city],
    queryFn: async () => {
      let q = (supabase.from('gpewm_competitive_landscape' as any).select('*') as any)
        .order('vulnerability_score', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await q.limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useSupplyFlywheel(enabled = true) {
  return useQuery({
    queryKey: ['gpewm-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpewm_supply_flywheel' as any)
        .select('*')
        .order('flywheel_rpm', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useDemandAcceleration(enabled = true) {
  return useQuery({
    queryKey: ['gpewm-demand'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpewm_demand_acceleration' as any)
        .select('*')
        .order('demand_growth_rate', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useNetworkCompounding(enabled = true) {
  return useQuery({
    queryKey: ['gpewm-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpewm_network_compounding' as any)
        .select('*')
        .order('compounding_velocity', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

function useMut(mode: string, label: string, keys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeGPEWM(mode, p),
    onSuccess: (data) => {
      keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['gpewm-dashboard'] });
      toast.success(`${label}: ${JSON.stringify(data).slice(0, 80)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useSequenceMarketEntry = () => useMut('sequence_entry', 'Market Entry Sequenced', ['gpewm-market-entry']);
export const useMapCompetition = () => useMut('map_competition', 'Competition Mapped', ['gpewm-competition']);
export const useActivateSupplyFlywheel = () => useMut('activate_flywheel', 'Supply Flywheel Activated', ['gpewm-flywheel']);
export const useAccelerateDemand = () => useMut('accelerate_demand', 'Demand Accelerated', ['gpewm-demand']);
export const useCompoundNetwork = () => useMut('compound_network', 'Network Effects Compounded', ['gpewm-network']);
