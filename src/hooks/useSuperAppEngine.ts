import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Discovery OS ────────────────────────────────────
export function useDiscoveryIndex(city?: string) {
  return useQuery({
    queryKey: ['superapp-discovery', city],
    queryFn: async () => {
      let query = supabase
        .from('superapp_discovery_index' as any)
        .select('*')
        .order('discovery_rank', { ascending: false })
        .limit(100);
      if (city) query = query.eq('city', city);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

// ─── Transaction Pipeline ────────────────────────────
export function useTransactionPipeline() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['superapp-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('superapp_transaction_pipeline' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
    staleTime: 15_000,
  });
}

// ─── Asset Lifecycle ─────────────────────────────────
export function useAssetLifecycle() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['asset-lifecycle', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_lifecycle_tracker' as any)
        .select('*')
        .eq('owner_id', user!.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

// ─── Wealth Intelligence ─────────────────────────────
export function useWealthIntelligence() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['wealth-intelligence', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_wealth_intelligence' as any)
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

// ─── Super-App Identity ─────────────────────────────
export function useSuperAppIdentity() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['superapp-identity', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('superapp_identity' as any)
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

// ─── Service Hub ─────────────────────────────────────
export function useServiceHub() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['superapp-services', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('superapp_service_hub' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

// ─── Orchestration State ─────────────────────────────
export function useOrchestrationState() {
  return useQuery({
    queryKey: ['superapp-orchestration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('superapp_orchestration_state' as any)
        .select('*')
        .order('health_score', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ─── Orchestrator Mutations ──────────────────────────
export function useTriggerSuperAppEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke('superapp-orchestrator', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      const mode = variables.mode;
      if (mode === 'discovery_reindex') qc.invalidateQueries({ queryKey: ['superapp-discovery'] });
      if (mode === 'wealth_compute') qc.invalidateQueries({ queryKey: ['wealth-intelligence'] });
      if (mode === 'identity_sync') qc.invalidateQueries({ queryKey: ['superapp-identity'] });
      if (mode === 'orchestration_health') qc.invalidateQueries({ queryKey: ['superapp-orchestration'] });
      if (mode === 'lifecycle_advance') qc.invalidateQueries({ queryKey: ['asset-lifecycle'] });
      toast.success(`Super-App Engine: ${mode} completed`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
