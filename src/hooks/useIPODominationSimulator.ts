import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const invoke = async (mode: string, extra?: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('ipo-domination-simulator', {
    body: { mode, ...extra },
  });
  if (error) throw error;
  return data;
};

export function useGPIDSDashboard() {
  return useQuery({
    queryKey: ['gpids-dashboard'],
    queryFn: () => invoke('dashboard'),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePreIPOPositioning() {
  return useQuery({
    queryKey: ['gpids-preipo'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gpids_preipo_positioning' as any).select('*').order('assessed_at', { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useNarrativeLeadership() {
  return useQuery({
    queryKey: ['gpids-narrative'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gpids_narrative_leadership' as any).select('*').order('assessed_at', { ascending: false }).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useValuationExpansion() {
  return useQuery({
    queryKey: ['gpids-valuation'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gpids_valuation_expansion' as any).select('*').order('computed_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useTimingIntelligence() {
  return useQuery({
    queryKey: ['gpids-timing'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gpids_timing_intelligence' as any).select('*').order('assessed_at', { ascending: false }).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function usePostIPODominance() {
  return useQuery({
    queryKey: ['gpids-postipo'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gpids_postipo_dominance' as any).select('*').order('computed_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

function useMut(mode: string, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invoke(mode, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gpids-dashboard'] });
      toast.success(`${label} computed`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useRunPreIPO = () => useMut('preipo', 'Pre-IPO Positioning');
export const useRunNarrative = () => useMut('narrative', 'Narrative Leadership');
export const useRunValuation = () => useMut('valuation', 'Valuation Expansion');
export const useRunTiming = () => useMut('timing', 'Timing Intelligence');
export const useRunPostIPO = () => useMut('postipo', 'Post-IPO Dominance');
