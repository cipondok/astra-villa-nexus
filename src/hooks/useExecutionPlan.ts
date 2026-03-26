import { useMemo } from 'react';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import { useDecisionSignals } from '@/hooks/useDecisionSignals';
import { useCapitalFlowSignals } from '@/hooks/useCapitalFlowSignals';
import { useGrowthTrajectory } from '@/hooks/useGrowthTrajectory';
import { computeExecutionPlan, type ExecutionPlan } from '@/services/executionIntelligenceEngine';

export function useExecutionPlan(): {
  plan: ExecutionPlan | null;
  isLoading: boolean;
} {
  const { report, isLoading: hLoad } = useSystemHealthReport();
  const { decisions, isLoading: dLoad } = useDecisionSignals();
  const { capital, timing, isLoading: cLoad } = useCapitalFlowSignals();
  const { trajectory, isLoading: gLoad } = useGrowthTrajectory();

  const plan = useMemo(() => {
    if (!report || !decisions || !timing || !trajectory || !capital) return null;
    return computeExecutionPlan(report, decisions, timing, trajectory, capital);
  }, [report, decisions, timing, trajectory, capital]);

  return { plan, isLoading: hLoad || dLoad || cLoad || gLoad };
}
