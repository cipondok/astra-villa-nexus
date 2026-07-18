import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, Timer, TrendingUp, Zap } from 'lucide-react';
import { format, subHours } from 'date-fns';
import { AdminPageSkeleton } from '@/components/admin/AdminStates';

/**
 * Marketplace Performance Dashboard
 * Visualizes the client-side infinite-scroll telemetry emitted by /properties:
 *   - marketplace_fetch_start / marketplace_batch_loaded / marketplace_fetch_error
 *   - marketplace_next_page_trigger / marketplace_next_page_blocked
 *   - marketplace_duplicate_request_detected
 *   - marketplace_end_of_list
 */

const EVENT_TYPES = [
  'marketplace_fetch_start',
  'marketplace_batch_loaded',
  'marketplace_fetch_error',
  'marketplace_next_page_trigger',
  'marketplace_next_page_blocked',
  'marketplace_duplicate_request_detected',
  'marketplace_end_of_list',
] as const;

type EventRow = {
  id: string;
  event_type: string;
  created_at: string;
  duration_ms: number | null;
  session_id: string | null;
  metadata: Record<string, any> | null;
};

const RANGE_OPTIONS = [
  { id: '1h', label: 'Last hour', hours: 1, bucketMinutes: 5 },
  { id: '6h', label: 'Last 6 hours', hours: 6, bucketMinutes: 15 },
  { id: '24h', label: 'Last 24 hours', hours: 24, bucketMinutes: 60 },
  { id: '7d', label: 'Last 7 days', hours: 24 * 7, bucketMinutes: 60 * 6 },
];

function bucketTimestamp(iso: string, bucketMinutes: number) {
  const t = new Date(iso).getTime();
  const bucketMs = bucketMinutes * 60_000;
  return new Date(Math.floor(t / bucketMs) * bucketMs);
}

const MarketplacePerformanceDashboard: React.FC = () => {
  const [rangeId, setRangeId] = useState('24h');
  const range = RANGE_OPTIONS.find((r) => r.id === rangeId) ?? RANGE_OPTIONS[2];

  const since = useMemo(
    () => subHours(new Date(), range.hours).toISOString(),
    [range.hours],
  );

  const { data: events = [], isLoading, refetch, isFetching } = useQuery<EventRow[]>({
    queryKey: ['marketplace-perf-events', rangeId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('behavior_events')
        .select('id, event_type, created_at, duration_ms, session_id, metadata')
        .in('event_type', EVENT_TYPES as unknown as string[])
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(10_000);
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
    refetchInterval: 30_000,
  });

  // ── KPIs ──
  const kpis = useMemo(() => {
    const counts: Record<string, number> = {};
    let durationSum = 0;
    let durationN = 0;
    let rowsSum = 0;
    let dupsDropped = 0;
    const sessions = new Set<string>();

    for (const e of events) {
      counts[e.event_type] = (counts[e.event_type] ?? 0) + 1;
      if (e.session_id) sessions.add(e.session_id);
      if (e.event_type === 'marketplace_batch_loaded') {
        const d = e.metadata?.duration_ms ?? e.duration_ms;
        if (typeof d === 'number' && d >= 0) {
          durationSum += d;
          durationN += 1;
        }
        rowsSum += Number(e.metadata?.rows_returned ?? 0);
        dupsDropped += Number(e.metadata?.duplicates_dropped ?? 0);
      }
    }
    const avgDuration = durationN > 0 ? Math.round(durationSum / durationN) : 0;
    const batches = counts.marketplace_batch_loaded ?? 0;
    const errors = counts.marketplace_fetch_error ?? 0;
    const errorRate = batches + errors > 0 ? (errors / (batches + errors)) * 100 : 0;

    return {
      counts,
      avgDuration,
      rowsSum,
      dupsDropped,
      errorRate,
      sessions: sessions.size,
    };
  }, [events]);

  // ── Time series (batch counts + avg duration per bucket) ──
  const series = useMemo(() => {
    const buckets = new Map<
      number,
      {
        ts: number;
        batches: number;
        triggers: number;
        blocked: number;
        duplicates: number;
        errors: number;
        endOfList: number;
        durSum: number;
        durN: number;
      }
    >();
    for (const e of events) {
      const b = bucketTimestamp(e.created_at, range.bucketMinutes).getTime();
      const row =
        buckets.get(b) ??
        {
          ts: b,
          batches: 0,
          triggers: 0,
          blocked: 0,
          duplicates: 0,
          errors: 0,
          endOfList: 0,
          durSum: 0,
          durN: 0,
        };
      switch (e.event_type) {
        case 'marketplace_batch_loaded': {
          row.batches += 1;
          const d = e.metadata?.duration_ms ?? e.duration_ms;
          if (typeof d === 'number' && d >= 0) {
            row.durSum += d;
            row.durN += 1;
          }
          break;
        }
        case 'marketplace_next_page_trigger':
          row.triggers += 1;
          break;
        case 'marketplace_next_page_blocked':
          row.blocked += 1;
          break;
        case 'marketplace_duplicate_request_detected':
          row.duplicates += 1;
          break;
        case 'marketplace_fetch_error':
          row.errors += 1;
          break;
        case 'marketplace_end_of_list':
          row.endOfList += 1;
          break;
      }
      buckets.set(b, row);
    }
    return Array.from(buckets.values())
      .sort((a, b) => a.ts - b.ts)
      .map((r) => ({
        ...r,
        label:
          range.hours <= 24
            ? format(new Date(r.ts), 'HH:mm')
            : format(new Date(r.ts), 'MMM d HH:mm'),
        avgDuration: r.durN > 0 ? Math.round(r.durSum / r.durN) : 0,
      }));
  }, [events, range]);

  // ── Duration distribution histogram ──
  const durationHistogram = useMemo(() => {
    const buckets = [0, 100, 250, 500, 1000, 2000, 4000, 8000];
    const bins = buckets.map((lo, i) => ({
      range: i === buckets.length - 1 ? `${lo}ms+` : `${lo}-${buckets[i + 1]}ms`,
      count: 0,
    }));
    for (const e of events) {
      if (e.event_type !== 'marketplace_batch_loaded') continue;
      const d = e.metadata?.duration_ms ?? e.duration_ms;
      if (typeof d !== 'number' || d < 0) continue;
      let idx = buckets.findIndex((lo, i) =>
        i === buckets.length - 1 ? d >= lo : d >= lo && d < buckets[i + 1],
      );
      if (idx < 0) idx = buckets.length - 1;
      bins[idx].count += 1;
    }
    return bins;
  }, [events]);

  // ── End-of-list integrity table ──
  const endOfListRows = useMemo(() => {
    return events
      .filter((e) => e.event_type === 'marketplace_end_of_list')
      .slice(-25)
      .reverse()
      .map((e) => ({
        id: e.id,
        when: format(new Date(e.created_at), 'MMM d, HH:mm:ss'),
        session: (e.session_id ?? '—').slice(0, 8),
        totalRows: Number(e.metadata?.total_rows ?? 0),
        totalFetches: Number(e.metadata?.total_fetches ?? 0),
        pagesLoaded: Number(e.metadata?.pages_loaded ?? 0),
        sentinelTriggers: Number(e.metadata?.sentinel_triggers ?? 0),
        clean:
          Number(e.metadata?.total_fetches ?? 0) === Number(e.metadata?.pages_loaded ?? 0),
      }));
  }, [events]);

  if (isLoading) return <AdminPageSkeleton />;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Marketplace Performance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Infinite-scroll telemetry from <code>/properties</code>: batch timing, sentinel behavior,
            dedupe integrity, and end-of-list closure.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={rangeId} onValueChange={setRangeId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          icon={<Timer className="h-4 w-4" />}
          label="Avg batch load"
          value={`${kpis.avgDuration}ms`}
          tone={kpis.avgDuration > 1500 ? 'warn' : 'ok'}
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Batches loaded"
          value={(kpis.counts.marketplace_batch_loaded ?? 0).toLocaleString()}
        />
        <KpiCard
          icon={<Zap className="h-4 w-4" />}
          label="Sentinel triggers"
          value={(kpis.counts.marketplace_next_page_trigger ?? 0).toLocaleString()}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Duplicate requests"
          value={(kpis.counts.marketplace_duplicate_request_detected ?? 0).toLocaleString()}
          tone={
            (kpis.counts.marketplace_duplicate_request_detected ?? 0) > 0 ? 'error' : 'ok'
          }
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Blocked re-triggers"
          value={(kpis.counts.marketplace_next_page_blocked ?? 0).toLocaleString()}
          tone={
            (kpis.counts.marketplace_next_page_blocked ?? 0) > 0 ? 'warn' : 'ok'
          }
        />
        <KpiCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="End-of-list events"
          value={(kpis.counts.marketplace_end_of_list ?? 0).toLocaleString()}
        />
      </div>

      {/* Row: throughput over time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Throughput over time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gBatch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gTrig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="batches"
                name="Batches loaded"
                stroke="hsl(var(--primary))"
                fill="url(#gBatch)"
              />
              <Area
                type="monotone"
                dataKey="triggers"
                name="Sentinel triggers"
                stroke="hsl(var(--accent-foreground))"
                fill="url(#gTrig)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row: duration + integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="h-4 w-4" /> Average batch duration
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  unit="ms"
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgDuration"
                  name="Avg (ms)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Integrity signals
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="duplicates" name="Duplicates" fill="hsl(var(--destructive))" />
                <Bar dataKey="blocked" name="Blocked" fill="#F59E0B" />
                <Bar dataKey="errors" name="Errors" fill="#EF4444" />
                <Bar dataKey="endOfList" name="End of list" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Duration histogram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Batch duration distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={durationHistogram} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* End-of-list integrity table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent end-of-list sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {endOfListRows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No end-of-list events in this window yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2">When</th>
                    <th className="text-left px-4 py-2">Session</th>
                    <th className="text-right px-4 py-2">Rows</th>
                    <th className="text-right px-4 py-2">Fetches</th>
                    <th className="text-right px-4 py-2">Pages loaded</th>
                    <th className="text-right px-4 py-2">Triggers</th>
                    <th className="text-left px-4 py-2">Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {endOfListRows.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="px-4 py-2 whitespace-nowrap">{r.when}</td>
                      <td className="px-4 py-2 font-mono text-xs">{r.session}</td>
                      <td className="px-4 py-2 text-right">{r.totalRows.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{r.totalFetches}</td>
                      <td className="px-4 py-2 text-right">{r.pagesLoaded}</td>
                      <td className="px-4 py-2 text-right">{r.sentinelTriggers}</td>
                      <td className="px-4 py-2">
                        {r.clean ? (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Clean
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" /> Drift
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Data source: <code>public.behavior_events</code> · Refreshes every 30s · Sessions in window:{' '}
        {kpis.sessions.toLocaleString()}
      </p>
    </div>
  );
};

function KpiCard({
  icon,
  label,
  value,
  tone = 'ok',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'ok' | 'warn' | 'error';
}) {
  const toneClass =
    tone === 'error'
      ? 'text-destructive'
      : tone === 'warn'
        ? 'text-amber-500'
        : 'text-foreground';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className={`mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export default MarketplacePerformanceDashboard;
