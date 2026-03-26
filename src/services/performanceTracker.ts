import { supabase } from '@/integrations/supabase/client';

type RiskLevel = 'green' | 'warning' | 'critical';

function classifyPageLoad(ms: number): RiskLevel {
  if (ms < 2000) return 'green';
  if (ms < 4000) return 'warning';
  return 'critical';
}

function classifyErrors(count: number): RiskLevel {
  if (count === 0) return 'green';
  if (count <= 3) return 'warning';
  return 'critical';
}

export async function logPerformanceMetric(
  metricType: string,
  metricValue: number,
  page: string,
  riskLevel: RiskLevel,
  metadata: Record<string, any> = {}
) {
  try {
    await (supabase as any)
      .from('astra_performance_logs')
      .insert({ metric_type: metricType, metric_value: metricValue, page, risk_level: riskLevel, metadata });
  } catch {
    // silent — perf logging must never break the app
  }
}

/** Capture and log current page performance snapshot */
export function capturePagePerformance(page: string) {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return;

    const loadTime = Math.round(nav.loadEventEnd - nav.startTime);
    if (loadTime > 0) {
      logPerformanceMetric('page_load', loadTime, page, classifyPageLoad(loadTime));
    }

    const transferKB = Math.round(
      (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
        .reduce((s, r) => s + (r.transferSize || 0), 0) / 1024
    );
    logPerformanceMetric('bundle_transfer_kb', transferKB, page, transferKB > 500 ? 'warning' : 'green');
  } catch {
    // silent
  }
}

/** Log runtime errors count */
export function logRuntimeErrors(page: string, errorCount: number) {
  logPerformanceMetric('runtime_errors', errorCount, page, classifyErrors(errorCount));
}
