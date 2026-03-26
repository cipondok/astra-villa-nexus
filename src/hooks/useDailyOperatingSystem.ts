import { useMemo } from 'react';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import { useExecutionPlan } from '@/hooks/useExecutionPlan';
import { useGrowthTrajectory } from '@/hooks/useGrowthTrajectory';
import {
  generateDailyRoutine,
  getDecisionRules,
  computeWeeklyTargets,
  type RoutineBlock,
  type DecisionRule,
  type WeeklyGrowthReport,
} from '@/services/dailyOperatingSystem';

export function useDailyOperatingSystem() {
  const { report, isLoading: hLoad } = useSystemHealthReport();
  const { plan, isLoading: pLoad } = useExecutionPlan();
  const { trajectory, isLoading: gLoad } = useGrowthTrajectory();

  const result = useMemo(() => {
    if (!report || !plan || !trajectory) return { routine: null, decisions: null, weekly: null };
    return {
      routine: generateDailyRoutine(report, plan, trajectory),
      decisions: getDecisionRules(report, trajectory),
      weekly: computeWeeklyTargets(report, trajectory),
    };
  }, [report, plan, trajectory]);

  return {
    routine: result.routine as RoutineBlock[] | null,
    decisions: result.decisions as DecisionRule[] | null,
    weekly: result.weekly as WeeklyGrowthReport | null,
    plan,
    isLoading: hLoad || pLoad || gLoad,
  };
}
