import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeGFNE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('fundraising-narrative-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useGFNEDashboard(enabled = true) {
  return useQuery({
    queryKey: ['gfne-dashboard'],
    queryFn: () => invokeGFNE('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useVisionNarratives(enabled = true) {
  return useQuery({
    queryKey: ['gfne-vision'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gfne_vision_narrative' as any)
        .select('*')
        .eq('is_active', true)
        .order('narrative_strength', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useMarketOpportunity(enabled = true) {
  return useQuery({
    queryKey: ['gfne-market'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gfne_market_opportunity' as any)
        .select('*')
        .order('tam_usd', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTractionSignals(enabled = true) {
  return useQuery({
    queryKey: ['gfne-traction'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gfne_traction_signals' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useMoatCommunication(enabled = true) {
  return useQuery({
    queryKey: ['gfne-moat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gfne_moat_communication' as any)
        .select('*')
        .order('depth_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useInvestorPsychology(enabled = true) {
  return useQuery({
    queryKey: ['gfne-psychology'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gfne_investor_psychology' as any)
        .select('*')
        .order('effectiveness_score', { ascending: false })
        .limit(10);
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
    mutationFn: (p?: Record<string, unknown>) => invokeGFNE(mode, p),
    onSuccess: () => {
      keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['gfne-dashboard'] });
      toast.success(`${label} completed`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useCraftVision = () => useMut('craft_vision', 'Vision Narrative', ['gfne-vision']);
export const usePositionMarket = () => useMut('position_market', 'Market Positioning', ['gfne-market']);
export const useAmplifyTraction = () => useMut('amplify_traction', 'Traction Amplification', ['gfne-traction']);
export const useCommunicateMoat = () => useMut('communicate_moat', 'Moat Communication', ['gfne-moat']);
export const useAlignPsychology = () => useMut('align_psychology', 'Investor Alignment', ['gfne-psychology']);
