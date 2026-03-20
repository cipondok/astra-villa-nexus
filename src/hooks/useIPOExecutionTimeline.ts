import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeIPOEX(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('ipo-execution-timeline', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useIPOEXDashboard() {
  return useQuery({
    queryKey: ['ipoex-dashboard'],
    queryFn: () => invokeIPOEX('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useIPOEXMilestones() {
  return useQuery({
    queryKey: ['ipoex-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipoex_milestones' as any)
        .select('*')
        .order('month_offset', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useIPOEXPhaseReadiness() {
  return useQuery({
    queryKey: ['ipoex-readiness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipoex_phase_readiness' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useIPOEXStakeholders() {
  return useQuery({
    queryKey: ['ipoex-stakeholders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipoex_stakeholders' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useIPOEXRiskRegister() {
  return useQuery({
    queryKey: ['ipoex-risks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipoex_risk_register' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

function useMut(mode: string, label: string, keys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIPOEX(mode, p),
    onSuccess: (data) => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['ipoex-dashboard'] });
      toast.success(`${label}: ${JSON.stringify(data).slice(0, 100)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useInitializeTimeline = () => useMut('initialize_timeline', 'Timeline Init', ['ipoex-milestones']);
export const useAssessPhaseReadiness = () => useMut('assess_phase_readiness', 'Phase Readiness', ['ipoex-readiness']);
export const useOnboardStakeholders = () => useMut('onboard_stakeholders', 'Stakeholders', ['ipoex-stakeholders']);
export const useRegisterRisks = () => useMut('register_risks', 'Risk Register', ['ipoex-risks']);
export const useSimulateProgress = () => useMut('simulate_progress', 'Progress Simulation', ['ipoex-milestones', 'ipoex-readiness']);
