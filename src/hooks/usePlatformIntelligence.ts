import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { useBundleMetrics, usePerformanceMetrics, useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import {
  generatePlatformIntelligence,
  type PlatformIntelligenceReport,
} from '@/services/SystemIntelligenceService';

export function usePlatformIntelligence(): {
  intelligence: PlatformIntelligenceReport | null;
  isLoading: boolean;
} {
  const { data: health, isLoading } = usePlatformHealth();
  const { report } = useSystemHealthReport();
  const bundle = useBundleMetrics();
  const perf = usePerformanceMetrics();

  const intelligence = useMemo(() => {
    if (!health) return null;

    return generatePlatformIntelligence({
      healthReport: report,
      bundleTransferKB: bundle.totalTransferKB,
      jsChunkCount: bundle.jsCount,
      domReadyMs: perf.domReady,
      totalProperties: health.totalProperties,
      totalValuations: health.totalValuations,
      avgSeoScore: health.avgSeoScore,
      jobFailureRate: health.jobFailureRate,
      dbResponseMs: health.dbResponseMs,
    });
  }, [health, report, bundle, perf]);

  return { intelligence, isLoading };
}
