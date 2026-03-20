import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeGPES(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('proptech-endgame-simulation', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useGPESDashboard(enabled = true) {
  return useQuery({
    queryKey: ['gpes-dashboard'],
    queryFn: () => invokeGPES('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useMarketSaturation(enabled = true) {
  return useQuery({
    queryKey: ['gpes-saturation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpes_market_saturation' as any)
        .select('*')
        .order('platform_liquidity_share_pct', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function usePlatformDependency(enabled = true) {
  return useQuery({
    queryKey: ['gpes-dependency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpes_platform_dependency' as any)
        .select('*')
        .order('dependency_intensity', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useTerminalVelocity(enabled = true) {
  return useQuery({
    queryKey: ['gpes-terminal-velocity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpes_terminal_velocity' as any)
        .select('*')
        .order('current_velocity', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useStrategicOptionality(enabled = true) {
  return useQuery({
    queryKey: ['gpes-optionality'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpes_strategic_optionality' as any)
        .select('*')
        .order('option_value_usd', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useEndgameState(enabled = true) {
  return useQuery({
    queryKey: ['gpes-endgame'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpes_endgame_state' as any)
        .select('*')
        .order('structural_power_index', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function useSimulateSaturation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGPES('simulate_saturation'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpes-saturation'] });
      qc.invalidateQueries({ queryKey: ['gpes-dashboard'] });
      toast.success(`${data?.monopolistic} monopolistic, ${data?.dominant} dominant — $${(data?.total_captured_usd / 1e9)?.toFixed(1)}B captured`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGPES('simulate_dependency'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpes-dependency'] });
      toast.success(`${data?.structural_dependencies} structural dependencies, avg intensity: ${data?.avg_intensity}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateTerminalVelocity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGPES('simulate_terminal_velocity'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpes-terminal-velocity'] });
      toast.success(`${data?.tipping_points_reached} tipping points reached, avg velocity: ${data?.avg_velocity}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateOptionality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGPES('simulate_optionality'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpes-optionality'] });
      toast.success(`${data?.paths_simulated} paths, $${(data?.total_option_value_usd / 1e6)?.toFixed(0)}M total option value`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDefineEndgame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGPES('define_endgame'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpes-endgame'] });
      qc.invalidateQueries({ queryKey: ['gpes-dashboard'] });
      toast.success(`Endgame: ${data?.highest_probability} — $${(data?.total_throughput_usd / 1e9)?.toFixed(0)}B throughput`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
