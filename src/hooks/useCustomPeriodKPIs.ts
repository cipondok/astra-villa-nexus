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

function makePeriodComparison(current: number, previous: number): PeriodComparison {
  const delta = previous > 0
    ? Math.round(((current - previous) / previous) * 1000) / 10
    : current > 0 ? 100 : 0;
  return { current, previous, delta, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral' };
}

async function countRows(
  table: string, col: string, gte: string, lt?: string, filters?: Record<string, string>,
): Promise<number> {
  let q = supabase.from(table).select('id', { count: 'exact', head: true }).gte(col, gte);
  if (lt) q = q.lt(col, lt);
  if (filters) for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count } = await q;
  return count || 0;
}

async function avgPrice(gte: string, lt?: string): Promise<number> {
  let q = supabase.from('properties').select('price').not('price', 'is', null).gte('created_at', gte);
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

      const [
        propsCurr, propsPrev,
        jobsCompCurr, jobsCompPrev,
        jobsFailCurr, jobsFailPrev,
        searchCurr, searchPrev,
        priceCurr, pricePrev,
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
      ]);

      return {
        newProperties: makePeriodComparison(propsCurr, propsPrev),
        jobsCompleted: makePeriodComparison(jobsCompCurr, jobsCompPrev),
        jobsFailed: makePeriodComparison(jobsFailCurr, jobsFailPrev),
        searches: makePeriodComparison(searchCurr, searchPrev),
        avgPrice: makePeriodComparison(Math.round(priceCurr), Math.round(pricePrev)),
      };
    },
    enabled: enabled && !!currentStart && !!currentEnd && !!previousStart && !!previousEnd,
    staleTime: 30000,
  });
}
