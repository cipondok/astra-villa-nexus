import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeGALI(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('global-asset-liquidity-internet', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full GALI dashboard */
export function useGALIDashboard() {
  return useQuery({
    queryKey: ['gali-dashboard'],
    queryFn: () => invokeGALI('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Asset Discovery Graph */
export function useAssetDiscoveryGraph(limit = 50) {
  return useQuery({
    queryKey: ['gali-discovery-graph', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gali_asset_discovery_graph')
        .select('*')
        .order('graph_centrality_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Liquidity Routing */
export function useLiquidityRouting(limit = 50) {
  return useQuery({
    queryKey: ['gali-liquidity-routing', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gali_liquidity_routing')
        .select('*')
        .order('exit_probability_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Valuation Intelligence */
export function useValuationIntelligence(limit = 50) {
  return useQuery({
    queryKey: ['gali-valuation-intelligence', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gali_valuation_intelligence')
        .select('*')
        .order('universal_valuation_index', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Friction Compression */
export function useFrictionCompression() {
  return useQuery({
    queryKey: ['gali-friction-compression'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gali_friction_compression')
        .select('*')
        .order('total_friction_score', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Network Expansion */
export function useNetworkExpansion() {
  return useQuery({
    queryKey: ['gali-network-expansion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gali_network_expansion')
        .select('*')
        .order('platform_authority_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Mutation: scan discovery graph */
export function useScanDiscoveryGraph() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGALI('scan_discovery_graph', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gali-discovery-graph'] });
      toast.success(`Discovery: ${data?.assets_scanned ?? 0} assets scanned`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: compute routing */
export function useComputeRouting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGALI('compute_routing', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gali-liquidity-routing'] });
      toast.success(`Routing: ${data?.assets_routed ?? 0} assets routed`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: compute valuation */
export function useComputeValuationIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGALI('compute_valuation', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gali-valuation-intelligence'] });
      toast.success(`Valuation: ${data?.valuations_computed ?? 0} computed`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: measure friction */
export function useMeasureFriction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGALI('measure_friction', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gali-friction-compression'] });
      toast.success(`Friction: ${data?.cities_measured ?? 0} cities measured`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Mutation: compute network effects */
export function useComputeNetworkExpansion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGALI('compute_network_effects', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gali-network-expansion'] });
      qc.invalidateQueries({ queryKey: ['gali-dashboard'] });
      toast.success(`Network: ${data?.cities_computed ?? 0} cities computed`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
