import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import {
  computeRegionalCapitalSignals,
  computeMarketTiming,
  type CapitalNetworkSnapshot,
  type MarketTimingAssessment,
} from '@/services/capitalNetworkService';

export function useCapitalFlowSignals(): {
  capital: CapitalNetworkSnapshot | null;
  timing: MarketTimingAssessment | null;
  isLoading: boolean;
} {
  const { data: health, isLoading: hLoad } = usePlatformHealth();
  const { report, isLoading: rLoad } = useSystemHealthReport();

  const result = useMemo(() => {
    if (!health) return { capital: null, timing: null };
    const capital = computeRegionalCapitalSignals(health.totalProperties, health.totalValuations);
    const timing = computeMarketTiming(
      health.totalProperties,
      health.totalValuations,
      report?.overallScore ?? 50,
      health.jobFailureRate
    );
    return { capital, timing };
  }, [health, report]);

  return { ...result, isLoading: hLoad || rLoad };
}
