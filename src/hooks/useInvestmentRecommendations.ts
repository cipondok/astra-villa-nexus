import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvestmentRecommendation {
  id: string;
  property_id: string;
  recommendation_type: string;
  action_signal: string;
  confidence_score: number;
  reasoning: string;
  supporting_signals: Record<string, number | string>;
  market_cycle_phase: string;
  timing_window: string | null;
  priority_rank: number;
  is_active: boolean;
  created_at: string;
}

export interface ExitAdvisory {
  id: string;
  property_id: string;
  investor_id: string;
  advisory_type: string;
  severity: string;
  reasoning: string;
  supporting_signals: Record<string, number | string>;
  is_active: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export interface RecommendationStats {
  total_active: number;
  by_type: Record<string, number> | null;
  by_action: Record<string, number> | null;
  avg_confidence: number;
  exit_advisories_active: number;
}

/** Fetch active investment recommendations with optional filters */
export function useInvestmentRecommendations(options?: {
  type?: string;
  limit?: number;
  minConfidence?: number;
}) {
  const { type, limit = 50, minConfidence } = options ?? {};

  return useQuery({
    queryKey: ['investment-recommendations', type, limit, minConfidence],
    queryFn: async () => {
      let query = supabase
        .from('ai_investment_recommendations')
        .select('*')
        .eq('is_active', true)
        .order('priority_rank', { ascending: true })
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (type) query = query.eq('recommendation_type', type);
      if (minConfidence) query = query.gte('confidence_score', minConfidence);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as InvestmentRecommendation[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Fetch exit advisories for the current user */
export function useExitAdvisories() {
  return useQuery({
    queryKey: ['exit-advisories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_exit_advisories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ExitAdvisory[];
    },
    staleTime: 30_000,
  });
}

/** Fetch recommendation statistics */
export function useRecommendationStats() {
  return useQuery({
    queryKey: ['recommendation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recommendation_stats' as any);
      if (error) throw error;
      return data as unknown as RecommendationStats;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Trigger recommendation engine */
export function useGenerateRecommendations() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { limit?: number; include_exit_advisories?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: params ?? {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['investment-recommendations'] });
      qc.invalidateQueries({ queryKey: ['exit-advisories'] });
      qc.invalidateQueries({ queryKey: ['recommendation-stats'] });
      toast.success(
        `Generated ${data.recommendations_generated} recommendations, ${data.exit_advisories_generated} exit advisories`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Recommendation engine failed');
    },
  });
}

/** Acknowledge an exit advisory */
export function useAcknowledgeAdvisory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (advisoryId: string) => {
      const { error } = await supabase
        .from('ai_exit_advisories')
        .update({ acknowledged_at: new Date().toISOString() })
        .eq('id', advisoryId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exit-advisories'] });
    },
  });
}

/** Action signal styling helpers */
export const ACTION_SIGNAL_CONFIG: Record<string, { color: string; icon: string; badgeClass: string }> = {
  'Strong Buy Opportunity': { color: 'emerald', icon: '🟢', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'Early Growth Entry': { color: 'cyan', icon: '📈', badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  'Tactical Flip Candidate': { color: 'amber', icon: '⚡', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  'Long-Term Hold Asset': { color: 'blue', icon: '🏦', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'Moderate Buy Signal': { color: 'slate', icon: '📊', badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  'Consider Profit Taking': { color: 'yellow', icon: '💰', badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'Monitor Market Cooling': { color: 'orange', icon: '🌡️', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'Exit Risk Increasing': { color: 'red', icon: '🔴', badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30' },
};
