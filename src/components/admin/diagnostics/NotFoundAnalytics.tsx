import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, ExternalLink, Link2Off, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { aggregateNotFoundLogs, type RawNotFoundLog, type RouteBucket } from '@/utils/routeAnalytics';

const RANGES = [
  { key: '24h', label: '24h', hours: 24 },
  { key: '7d', label: '7 days', hours: 24 * 7 },
  { key: '30d', label: '30 days', hours: 24 * 30 },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const NotFoundAnalytics = () => {
  const [range, setRange] = useState<RangeKey>('7d');
  const [selected, setSelected] = useState<string | null>(null);

  const hours = RANGES.find((r) => r.key === range)!.hours;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['not-found-analytics', range],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from('error_logs')
        .select('id, error_page, page_url, referrer_url, created_at, metadata')
        .eq('error_type', '404')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data || []) as RawNotFoundLog[];
    },
    staleTime: 60_000,
  });

  const buckets = useMemo(() => aggregateNotFoundLogs(data || []), [data]);
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const active: RouteBucket | undefined =
    buckets.find((b) => b.pattern === selected) || buckets[0];

  const copy = (value: string) => {
    void navigator.clipboard.writeText(value);
    toast.success('Copied');
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-destructive text-destructive-foreground shadow-sm">
            <Link2Off className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">404 Rate by Route</h2>
            <p className="text-[10px] text-muted-foreground">
              {total} not-found hits across {buckets.length} route patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant={range === r.key ? 'default' : 'outline'}
              className="h-7 text-[10px] px-2"
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px]"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs">Routes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {isLoading ? (
              <div className="text-[11px] text-muted-foreground py-6 text-center">Loading…</div>
            ) : buckets.length === 0 ? (
              <div className="text-[11px] text-muted-foreground py-6 text-center">
                No 404s recorded in this period.
              </div>
            ) : (
              <ScrollArea className="h-[360px] pr-2">
                <div className="space-y-1">
                  {buckets.map((b) => {
                    const share = total ? Math.round((b.count / total) * 100) : 0;
                    const isActive = active?.pattern === b.pattern;
                    return (
                      <button
                        key={b.pattern}
                        onClick={() => setSelected(b.pattern)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`w-full text-left rounded-md border px-2 py-1.5 transition-colors ${
                          isActive
                            ? 'border-primary/60 bg-primary/10'
                            : 'border-border/40 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-[11px] font-medium truncate">{b.pattern}</code>
                          <Badge variant="secondary" className="text-[9px] h-4 px-1">
                            {b.count} · {share}%
                          </Badge>
                        </div>
                        <div className="mt-1 h-1 rounded bg-muted overflow-hidden">
                          <div className="h-full bg-destructive" style={{ width: `${share}%` }} />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
                          <span>{b.uniqueIds.length} affected ID(s)</span>
                          <span>last {fmt(b.lastSeen)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs">
              {active ? `Occurrences · ${active.pattern}` : 'Occurrences'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {!active ? (
              <div className="text-[11px] text-muted-foreground py-6 text-center">
                Select a route to inspect timestamps and affected IDs.
              </div>
            ) : (
              <ScrollArea className="h-[360px] pr-2">
                <div className="space-y-1">
                  {active.samples.map((s, i) => (
                    <div
                      key={`${s.path}-${s.at}-${i}`}
                      className="rounded-md border border-border/40 px-2 py-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-[10px] truncate">{s.path}</code>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {fmt(s.at)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[9px] text-muted-foreground">
                        {s.id && <span className="truncate">ID: {s.id}</span>}
                        {s.referrer && <span className="truncate">from {s.referrer}</span>}
                        <span className="ml-auto flex items-center gap-1">
                          {s.id && (
                            <button
                              className="hover:text-foreground"
                              onClick={() => copy(s.id!)}
                              aria-label="Copy affected ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                          <a
                            className="hover:text-foreground"
                            href={s.path}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Open route"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </span>
                      </div>
                    </div>
                  ))}
                  {active.samples.length === 0 && (
                    <div className="text-[11px] text-muted-foreground py-6 text-center">
                      No samples stored.
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundAnalytics;
