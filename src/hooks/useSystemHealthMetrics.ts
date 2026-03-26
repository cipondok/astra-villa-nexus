import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { computeHealthReport, type HealthReport } from '@/services/systemHealthEngine';

/** Bundle metrics — client-side estimation */
export function useBundleMetrics() {
  return useMemo(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsEntries = entries.filter(e => e.name.endsWith('.js'));
    const cssEntries = entries.filter(e => e.name.endsWith('.css'));
    return {
      jsCount: jsEntries.length,
      cssCount: cssEntries.length,
      totalTransferKB: Math.round(
        entries.reduce((sum, e) => sum + (e.transferSize || 0), 0) / 1024
      ),
    };
  }, []);
}

/** Performance metrics from Navigation Timing API */
export function usePerformanceMetrics() {
  return useMemo(() => {
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!nav) return { lcp: 0, fcp: 0, domReady: 0 };
      return {
        lcp: Math.round(nav.loadEventEnd - nav.startTime),
        fcp: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        domReady: Math.round(nav.domInteractive - nav.startTime),
      };
    } catch {
      return { lcp: 0, fcp: 0, domReady: 0 };
    }
  }, []);
}

/** Database health from platform health hook */
export function useDatabaseHealth() {
  const { data } = usePlatformHealth();
  return useMemo(() => ({
    responseMs: data?.dbResponseMs ?? 0,
    status: data?.overall ?? 'unknown',
    subsystems: data?.subsystems ?? [],
  }), [data]);
}

/** Feature activation stats */
export function useFeatureActivationStats() {
  const { data } = usePlatformHealth();
  return useMemo(() => ({
    totalProperties: data?.totalProperties ?? 0,
    totalJobs: data?.totalJobs ?? 0,
    avgSeoScore: data?.avgSeoScore ?? 0,
    totalValuations: data?.totalValuations ?? 0,
    activeSystems: [
      data?.totalProperties ? 'Properties' : null,
      data?.totalJobs ? 'AI Jobs' : null,
      data?.avgSeoScore ? 'SEO' : null,
      data?.totalValuations ? 'Valuations' : null,
    ].filter(Boolean) as string[],
  }), [data]);
}

/** Combined health report hook */
export function useSystemHealthReport(): {
  report: HealthReport | null;
  isLoading: boolean;
  lastChecked: string | null;
} {
  const { data, isLoading } = usePlatformHealth();

  const report = useMemo(() => {
    if (!data) return null;
    return computeHealthReport(data);
  }, [data]);

  return {
    report,
    isLoading,
    lastChecked: data?.lastChecked ?? null,
  };
}
