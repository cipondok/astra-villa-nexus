import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PeriodComparison } from './useAICommandCenter';

export interface CustomPeriodKPIs {
  newProperties: PeriodComparison;
  jobsCompleted: PeriodComparison;
  jobsFailed: PeriodComparison;
  searches: PeriodComparison;
  avgPrice: PeriodComparison;
}

function makePeriodComparison(current: number, previous: number, sparkline?: number[]): PeriodComparison {
  const delta = previous > 0
    ? Math.round(((current - previous) / previous) * 1000) / 10
    : current > 0 ? 100 : 0;
  return { current, previous, delta, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral', sparkline };
}

function groupByDay(rows: any[], dateCol: string, startIso: string, days: number): number[] {
  const start = new Date(startIso).getTime();
  const buckets = new Array(days).fill(0);
  for (const r of rows) {
    const d = new Date(r[dateCol]).getTime();
    const idx = Math.floor((d - start) / 86400000);
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets;
}

async function countRows(
  table: string, col: string, gte: string, lt?: string, filters?: Record<string, string>,
): Promise<number> {
  let q = (supabase as any).from(table).select('id', { count: 'exact', head: true }).gte(col, gte);
  if (lt) q = q.lt(col, lt);
  if (filters) for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count } = await q;
  return count || 0;
}

async function avgPrice(gte: string, lt?: string): Promise<number> {
  let q = (supabase as any).from('properties').select('price').not('price', 'is', null).gte('created_at', gte);
  if (lt) q = q.lt('created_at', lt);
  const { data } = await q;
  if (!data || data.length === 0) return 0;
  return data.reduce((s: number, p: any) => s + (p.price || 0), 0) / data.length;
}

export function useCustomPeriodKPIs(
  currentStart: Date | null,
  currentEnd: Date | null,
  previousStart: Date | null,
  previousEnd: Date | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [
      'custom-period-kpis',
      currentStart?.toISOString(),
      currentEnd?.toISOString(),
      previousStart?.toISOString(),
      previousEnd?.toISOString(),
    ],
    queryFn: async (): Promise<CustomPeriodKPIs> => {
      const cs = currentStart!.toISOString();
      const ce = currentEnd!.toISOString();
      const ps = previousStart!.toISOString();
      const pe = previousEnd!.toISOString();

      const days = Math.max(1, Math.round((currentEnd!.getTime() - currentStart!.getTime()) / 86400000));

      const [
        propsCurr, propsPrev,
        jobsCompCurr, jobsCompPrev,
        jobsFailCurr, jobsFailPrev,
        searchCurr, searchPrev,
        priceCurr, pricePrev,
        // Sparkline raw data
        sparkPropsRaw, sparkJobsCompRaw, sparkJobsFailRaw, sparkSearchRaw,
      ] = await Promise.all([
        countRows('properties', 'created_at', cs, ce),
        countRows('properties', 'created_at', ps, pe),
        countRows('ai_jobs', 'completed_at', cs, ce, { status: 'completed' }),
        countRows('ai_jobs', 'completed_at', ps, pe, { status: 'completed' }),
        countRows('ai_jobs', 'created_at', cs, ce, { status: 'failed' }),
        countRows('ai_jobs', 'created_at', ps, pe, { status: 'failed' }),
        countRows('ai_property_queries', 'created_at', cs, ce),
        countRows('ai_property_queries', 'created_at', ps, pe),
        avgPrice(cs, ce),
        avgPrice(ps, pe),
        (supabase as any).from('properties').select('created_at').gte('created_at', cs).lt('created_at', ce),
        (supabase as any).from('ai_jobs').select('created_at').eq('status', 'completed').gte('created_at', cs).lt('created_at', ce),
        (supabase as any).from('ai_jobs').select('created_at').eq('status', 'failed').gte('created_at', cs).lt('created_at', ce),
        (supabase as any).from('ai_property_queries').select('created_at').gte('created_at', cs).lt('created_at', ce),
      ]);

      const sparkProps = groupByDay(sparkPropsRaw.data || [], 'created_at', cs, days);
      const sparkJobsComp = groupByDay(sparkJobsCompRaw.data || [], 'created_at', cs, days);
      const sparkJobsFail = groupByDay(sparkJobsFailRaw.data || [], 'created_at', cs, days);
      const sparkSearch = groupByDay(sparkSearchRaw.data || [], 'created_at', cs, days);

      return {
        newProperties: makePeriodComparison(propsCurr, propsPrev, sparkProps),
        jobsCompleted: makePeriodComparison(jobsCompCurr, jobsCompPrev, sparkJobsComp),
        jobsFailed: makePeriodComparison(jobsFailCurr, jobsFailPrev, sparkJobsFail),
        searches: makePeriodComparison(searchCurr, searchPrev, sparkSearch),
        avgPrice: makePeriodComparison(Math.round(priceCurr), Math.round(pricePrev)),
      };
    },
    enabled: enabled && !!currentStart && !!currentEnd && !!previousStart && !!previousEnd,
    staleTime: 30000,
  });
}
