import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Market Intelligence Kernel ──────────────────────
export function useMarketIntelligenceKernel(countryCode?: string) {
  return useQuery({
    queryKey: ['reos-kernel', countryCode],
    queryFn: async () => {
      let query = supabase
        .from('reos_market_intelligence_kernel' as any)
        .select('*')
        .order('market_attractiveness_score', { ascending: false });
      if (countryCode) query = query.eq('country_code', countryCode);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 60_000,
  });
}

// ─── Property Graph Nodes ────────────────────────────
export function usePropertyGraphNodes(nodeType?: string, marketCode?: string) {
  return useQuery({
    queryKey: ['reos-graph-nodes', nodeType, marketCode],
    queryFn: async () => {
      let query = supabase
        .from('reos_property_graph_nodes' as any)
        .select('*')
        .order('pagerank', { ascending: false })
        .limit(200);
      if (nodeType) query = query.eq('node_type', nodeType);
      if (marketCode) query = query.eq('market_code', marketCode);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

// ─── Property Graph Edges ────────────────────────────
export function usePropertyGraphEdges(sourceNodeId?: string) {
  return useQuery({
    queryKey: ['reos-graph-edges', sourceNodeId],
    queryFn: async () => {
      let query = supabase
        .from('reos_property_graph_edges' as any)
        .select('*')
        .limit(200);
      if (sourceNodeId) query = query.eq('source_node_id', sourceNodeId);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!sourceNodeId,
    staleTime: 30_000,
  });
}

// ─── Capital Flow Routes ─────────────────────────────
export function useCapitalFlowRoutes() {
  return useQuery({
    queryKey: ['reos-capital-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reos_capital_flow_routes' as any)
        .select('*')
        .order('arbitrage_opportunity_score', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    staleTime: 60_000,
  });
}

// ─── API Registry ────────────────────────────────────
export function useAPIRegistry() {
  return useQuery({
    queryKey: ['reos-api-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reos_api_registry' as any)
        .select('*')
        .order('total_calls', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    staleTime: 120_000,
  });
}

// ─── Infrastructure Topology ─────────────────────────
export function useInfrastructureTopology() {
  return useQuery({
    queryKey: ['reos-infrastructure'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reos_infrastructure_topology' as any)
        .select('*')
        .order('health_status');
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ─── OS Event Stream ─────────────────────────────────
export function useOSEventStream(domain?: string, limit = 50) {
  return useQuery({
    queryKey: ['reos-events', domain, limit],
    queryFn: async () => {
      let query = supabase
        .from('reos_event_stream' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (domain) query = query.eq('event_domain', domain);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

// ─── RE-OS Kernel Trigger ────────────────────────────
export function useTriggerREOSKernel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { mode: string; params?: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke('re-os-kernel', {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      const m = variables.mode;
      if (m === 'ingest_market_intelligence') qc.invalidateQueries({ queryKey: ['reos-kernel'] });
      if (m === 'build_property_graph') {
        qc.invalidateQueries({ queryKey: ['reos-graph-nodes'] });
        qc.invalidateQueries({ queryKey: ['reos-graph-edges'] });
      }
      if (m === 'compute_capital_routes') qc.invalidateQueries({ queryKey: ['reos-capital-routes'] });
      if (m === 'infrastructure_health') qc.invalidateQueries({ queryKey: ['reos-infrastructure'] });
      if (m === 'emit_os_event') qc.invalidateQueries({ queryKey: ['reos-events'] });
      toast.success(`RE-OS Kernel: ${m} completed`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Compound Dashboard Hook ─────────────────────────
export function useREOSDashboard() {
  const kernel = useMarketIntelligenceKernel();
  const routes = useCapitalFlowRoutes();
  const infra = useInfrastructureTopology();
  const events = useOSEventStream(undefined, 20);

  return {
    markets: kernel.data || [],
    capitalRoutes: routes.data || [],
    infrastructure: infra.data || [],
    recentEvents: events.data || [],
    isLoading: kernel.isLoading || routes.isLoading,
  };
}
