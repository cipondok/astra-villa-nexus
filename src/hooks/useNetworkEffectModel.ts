import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const invoke = async (mode: string, extra?: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('network-effect-model', { body: { mode, ...extra } });
  if (error) throw error;
  return data;
};

export const usePSNEMDashboard = () => useQuery({ queryKey: ['psnem-dashboard'], queryFn: () => invoke('dashboard'), staleTime: 30_000, refetchInterval: 60_000 });

export const useMarketplaceGrowth = (city?: string) => useQuery({
  queryKey: ['psnem-growth', city],
  queryFn: async () => {
    let q = supabase.from('psnem_marketplace_growth' as any).select('*').order('computed_at', { ascending: false }).limit(30);
    if (city) q = q.eq('city', city);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  staleTime: 20_000,
});

export const useLiquidityDensity = () => useQuery({
  queryKey: ['psnem-density'],
  queryFn: async () => { const { data, error } = await supabase.from('psnem_liquidity_density' as any).select('*').order('computed_at', { ascending: false }).limit(30); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useDataCompounding = () => useQuery({
  queryKey: ['psnem-compounding'],
  queryFn: async () => { const { data, error } = await supabase.from('psnem_data_compounding' as any).select('*').order('computed_at', { ascending: false }).limit(20); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useTippingPoints = () => useQuery({
  queryKey: ['psnem-tipping'],
  queryFn: async () => { const { data, error } = await supabase.from('psnem_tipping_points' as any).select('*').order('assessed_at', { ascending: false }).limit(30); if (error) throw error; return data; },
  staleTime: 20_000,
});

export const useOptimizationLevers = () => useQuery({
  queryKey: ['psnem-levers'],
  queryFn: async () => { const { data, error } = await supabase.from('psnem_optimization_levers' as any).select('*').order('computed_at', { ascending: false }).limit(20); if (error) throw error; return data; },
  staleTime: 20_000,
});

function useMut(mode: string, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invoke(mode, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['psnem-dashboard'] }); toast.success(`${label} computed`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useModelMarketplaceGrowth = () => useMut('marketplace_growth', 'Marketplace Growth');
export const useModelLiquidityDensity = () => useMut('liquidity_density', 'Liquidity Density');
export const useModelDataCompounding = () => useMut('data_compounding', 'Data Compounding');
export const useAssessTippingPoints = () => useMut('tipping_points', 'Tipping Points');
export const useOptimizeLevers = () => useMut('optimization', 'Optimization Levers');
