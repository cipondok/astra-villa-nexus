import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { usePlatformIntelligence } from '@/hooks/usePlatformIntelligence';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import { useGrowthTrajectory } from '@/hooks/useGrowthTrajectory';
import { generateDecisionSignals, type DecisionSignals } from '@/services/decisionIntelligenceService';

export function useDecisionSignals(): {
  decisions: DecisionSignals | null;
  isLoading: boolean;
} {
  const { report, isLoading: hLoad } = useSystemHealthReport();
  const { intelligence, isLoading: iLoad } = usePlatformIntelligence();
  const { trajectory, isLoading: gLoad } = useGrowthTrajectory();

  const decisions = useMemo(() => {
    if (!report && !intelligence && !trajectory) return null;
    return generateDecisionSignals(report, intelligence, trajectory);
  }, [report, intelligence, trajectory]);

  return { decisions, isLoading: hLoad || iLoad || gLoad };
}
