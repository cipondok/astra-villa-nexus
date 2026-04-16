/**
 * Investment Outcome Tracking
 * Tracks actual vs predicted ROI and investment success rates.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InvestmentOutcome {
  id: string;
  property_id: string;
  predicted_roi: number | null;
  actual_roi: number | null;
  investment_amount: number;
  profit_loss: number | null;
  success: boolean | null;
  model_version: string | null;
  outcome_date: string | null;
  created_at: string;
}

export interface OutcomeStats {
  totalInvestments: number;
  avgPredictedRoi: number;
  avgActualRoi: number;
  predictionAccuracy: number;
  successRate: number;
  totalProfitLoss: number;
}

export function useOutcomeTracking() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const outcomes = useQuery({
    queryKey: ['investment-outcomes', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<InvestmentOutcome[]> => {
      const { data, error } = await supabase
        .from('investment_outcomes' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as any[]) || [];
    },
    staleTime: 5 * 60_000,
  });

  const stats = useQuery({
    queryKey: ['outcome-stats', user?.id],
    enabled: !!user?.id && (outcomes.data?.length ?? 0) > 0,
    queryFn: (): OutcomeStats => {
      const items = outcomes.data || [];
      if (items.length === 0) {
        return { totalInvestments: 0, avgPredictedRoi: 0, avgActualRoi: 0, predictionAccuracy: 0, successRate: 0, totalProfitLoss: 0 };
      }

      const withActual = items.filter(i => i.actual_roi != null);
      const withBoth = items.filter(i => i.actual_roi != null && i.predicted_roi != null);

      const avgPredicted = withBoth.length > 0
        ? withBoth.reduce((s, i) => s + (i.predicted_roi ?? 0), 0) / withBoth.length
        : 0;
      const avgActual = withActual.length > 0
        ? withActual.reduce((s, i) => s + (i.actual_roi ?? 0), 0) / withActual.length
        : 0;

      // Prediction accuracy: 1 - mean absolute error (capped at 0)
      const accuracy = withBoth.length > 0
        ? Math.max(0, 1 - withBoth.reduce((s, i) => s + Math.abs((i.predicted_roi ?? 0) - (i.actual_roi ?? 0)), 0) / withBoth.length / 100) * 100
        : 0;

      const successCount = items.filter(i => i.success === true).length;
      const totalPL = items.reduce((s, i) => s + (i.profit_loss ?? 0), 0);

      return {
        totalInvestments: items.length,
        avgPredictedRoi: Math.round(avgPredicted * 100) / 100,
        avgActualRoi: Math.round(avgActual * 100) / 100,
        predictionAccuracy: Math.round(accuracy * 10) / 10,
        successRate: items.length > 0 ? Math.round(successCount / items.length * 1000) / 10 : 0,
        totalProfitLoss: totalPL,
      };
    },
  });

  const recordOutcome = useMutation({
    mutationFn: async (input: {
      property_id: string;
      predicted_roi?: number;
      actual_roi?: number;
      predicted_price?: number;
      actual_price?: number;
      investment_amount: number;
      model_version?: string;
    }) => {
      const profitLoss = input.actual_roi != null && input.investment_amount
        ? input.investment_amount * (input.actual_roi / 100)
        : null;
      const success = input.actual_roi != null ? input.actual_roi > 0 : null;

      const { error } = await supabase.from('investment_outcomes' as any).insert({
        user_id: user!.id,
        property_id: input.property_id,
        predicted_roi: input.predicted_roi ?? null,
        actual_roi: input.actual_roi ?? null,
        predicted_price: input.predicted_price ?? null,
        actual_price: input.actual_price ?? null,
        investment_amount: input.investment_amount,
        profit_loss: profitLoss,
        success,
        model_version: input.model_version ?? null,
        outcome_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment-outcomes'] });
      qc.invalidateQueries({ queryKey: ['outcome-stats'] });
    },
  });

  return { outcomes: outcomes.data ?? [], stats: stats.data, recordOutcome, isLoading: outcomes.isLoading };
}
