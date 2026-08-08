import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, ExternalLink, RefreshCw, Link2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ShareEventRow {
  id: string;
  event_type: 'share_click' | 'share_visit';
  channel: string | null;
  path: string;
  route_pattern: string;
  property_id: string | null;
  canonical_url: string | null;
  og_url: string | null;
  referrer: string | null;
  referrer_host: string | null;
  referrer_source: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
}

const RANGES = [
  { label: '24h', hours: 24 },
  { label: '7d', hours: 24 * 7 },
  { label: '30d', hours: 24 * 30 },
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });

type SortKey = 'created_at' | 'referrer' | 'channel' | 'event_type';

export const ShareTrafficAnalytics = () => {
  const [rangeHours, setRangeHours] = useState(24 * 7);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['share-traffic-analytics', rangeHours],
    queryFn: async (): Promise<ShareEventRow[]> => {
      const since = new Date(Date.now() - rangeHours * 3600_000).toISOString();
      const { data, error } = await supabase
        .from('social_share_events')
        .select(
          'id,event_type,channel,path,route_pattern,property_id,canonical_url,og_url,referrer,referrer_host,referrer_source,utm_source,utm_campaign,created_at',
        )
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data || []) as ShareEventRow[];
    },
    staleTime: 60_000,
  });

  const rows = data || [];

  const stats = useMemo(() => {
    const clicks = rows.filter((r) => r.event_type === 'share_click');
    const visits = rows.filter((r) => r.event_type === 'share_visit');

    const tally = (items: ShareEventRow[], key: (r: ShareEventRow) => string | null) => {
      const map = new Map<string, { count: number; last: string }>();
      for (const r of items) {
        const k = key(r) || 'unknown';
        const cur = map.get(k);
        if (!cur) map.set(k, { count: 1, last: r.created_at });
        else cur.count += 1;
      }
      return Array.from(map.entries())
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      clicks: clicks.length,
      visits: visits.length,
      channels: tally(clicks, (r) => r.channel),
      referrers: tally(visits, (r) => r.referrer_source || r.referrer_host),
      routes: tally(rows, (r) => r.route_pattern),
      canonicalMismatch: rows.filter(
        (r) => r.canonical_url && r.og_url && r.canonical_url !== r.og_url,
      ).length,
      uniqueProperties: new Set(rows.map((r) => r.property_id).filter(Boolean)).size,
    };
  }, [rows]);

  const propertyTally = useMemo(() => {
    const map = new Map<string, { clicks: number; visits: number; last: string }>();
    for (const r of rows) {
      if (!r.property_id) continue;
      const cur = map.get(r.property_id) || { clicks: 0, visits: 0, last: r.created_at };
      if (r.event_type === 'share_click') cur.clicks += 1;
      else cur.visits += 1;
      if (r.created_at > cur.last) cur.last = r.created_at;
      map.set(r.property_id, cur);
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, total: v.clicks + v.visits }))
      .sort((a, b) => b.total - a.total);
  }, [rows]);

  const drilldownRows = useMemo(() => {
    if (!selectedProperty) return [];
    const filtered = rows.filter((r) => r.property_id === selectedProperty);
    const val = (r: ShareEventRow) => {
      switch (sortKey) {
        case 'referrer':
          return (r.referrer_source || r.referrer_host || '').toLowerCase();
        case 'channel':
          return (r.channel || r.referrer_source || '').toLowerCase();
        case 'event_type':
          return r.event_type;
        default:
          return r.created_at;
      }
    };
    return [...filtered].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (av === bv) return b.created_at.localeCompare(a.created_at);
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : av > bv ? -1 : 1;
    });
  }, [rows, selectedProperty, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'created_at' ? 'desc' : 'asc');
    }
  };

  const sortIcon = (key: SortKey) =>
    key === sortKey ? (sortDir === 'asc' ? '▲' : '▼') : '';



  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          <h3 className="text-[13px] font-semibold">Share & Social Traffic</h3>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <Button
              key={r.label}
              size="sm"
              variant={rangeHours === r.hours ? 'default' : 'outline'}
              className="h-7 px-2 text-[10px]"
              onClick={() => setRangeHours(r.hours)}
            >
              {r.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px] gap-1"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Share clicks', value: stats.clicks, icon: Share2 },
          { label: 'Visits from shares', value: stats.visits, icon: ExternalLink },
          { label: 'Properties shared', value: stats.uniqueProperties, icon: Users },
          { label: 'Canonical ≠ og:url', value: stats.canonicalMismatch, icon: Link2 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <s.icon className="h-3 w-3" />
                {s.label}
              </div>
              <div className="text-xl font-semibold mt-1 tabular-nums">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[12px]">Share channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {stats.channels.length === 0 && (
              <p className="text-[11px] text-muted-foreground">No share clicks in this range.</p>
            )}
            {stats.channels.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-[11px]">
                <span className="capitalize">{c.name.replace(/_/g, ' ')}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="tabular-nums">{fmt(c.last)}</span>
                  <Badge variant="secondary" className="text-[10px]">{c.count}</Badge>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[12px]">Inbound referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {stats.referrers.length === 0 && (
              <p className="text-[11px] text-muted-foreground">No referred visits in this range.</p>
            )}
            {stats.referrers.map((r) => (
              <div key={r.name} className="flex items-center justify-between text-[11px]">
                <span>{r.name}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="tabular-nums">{fmt(r.last)}</span>
                  <Badge variant="secondary" className="text-[10px]">{r.count}</Badge>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[12px]">Shared properties</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[360px] overflow-auto divide-y divide-border/50">
              {propertyTally.length === 0 && (
                <p className="p-3 text-[11px] text-muted-foreground">
                  No property-level share activity in this range.
                </p>
              )}
              {propertyTally.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProperty(p.id === selectedProperty ? null : p.id)}
                  className={`w-full text-left p-2.5 transition-colors ${
                    p.id === selectedProperty ? 'bg-primary/10' : 'hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] truncate">{p.id}</span>
                    <Badge variant="secondary" className="text-[10px]">{p.total}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{p.clicks} clicks</span>
                    <span>·</span>
                    <span>{p.visits} visits</span>
                    <span className="ml-auto tabular-nums">{fmt(p.last)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[12px]">
              {selectedProperty ? 'Property timeline' : 'Property drilldown'}
            </CardTitle>
            {selectedProperty && (
              <div className="flex items-center gap-1">
                <a
                  href={`/property/${selectedProperty}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-primary underline underline-offset-2"
                >
                  Open page
                </a>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => setSelectedProperty(null)}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {!selectedProperty ? (
              <p className="p-3 text-[11px] text-muted-foreground">
                Select a property on the left to see its share events, referrers and timeline.
              </p>
            ) : (
              <div className="max-h-[360px] overflow-auto">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                    <tr className="text-left text-muted-foreground">
                      {([
                        ['created_at', 'Time'],
                        ['event_type', 'Type'],
                        ['channel', 'Channel'],
                        ['referrer', 'Referrer'],
                      ] as [SortKey, string][]).map(([key, label]) => (
                        <th key={key} className="p-2 font-medium">
                          <button
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            onClick={() => toggleSort(key)}
                          >
                            {label} <span className="text-[9px]">{sortIcon(key)}</span>
                          </button>
                        </th>
                      ))}
                      <th className="p-2 font-medium">Campaign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilldownRows.length === 0 && (
                      <tr>
                        <td className="p-3 text-muted-foreground" colSpan={5}>
                          No events for this property in the selected range.
                        </td>
                      </tr>
                    )}
                    {drilldownRows.map((r) => (
                      <tr key={r.id} className="border-t border-border/50">
                        <td className="p-2 whitespace-nowrap tabular-nums">{fmt(r.created_at)}</td>
                        <td className="p-2">
                          <Badge
                            variant={r.event_type === 'share_click' ? 'default' : 'secondary'}
                            className="text-[10px]"
                          >
                            {r.event_type === 'share_click' ? 'click' : 'visit'}
                          </Badge>
                        </td>
                        <td className="p-2 capitalize">
                          {(r.channel || r.referrer_source || '—').replace(/_/g, ' ')}
                        </td>
                        <td className="p-2 max-w-[200px] truncate" title={r.referrer || ''}>
                          {r.referrer_source || r.referrer_host || '—'}
                        </td>
                        <td className="p-2 text-muted-foreground truncate max-w-[140px]">
                          {r.utm_campaign || r.utm_source || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[12px]">Recent events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                <tr className="text-left text-muted-foreground">
                  <th className="p-2 font-medium">Time</th>
                  <th className="p-2 font-medium">Type</th>
                  <th className="p-2 font-medium">Channel / Source</th>
                  <th className="p-2 font-medium">Route</th>
                  <th className="p-2 font-medium">Canonical</th>
                  <th className="p-2 font-medium">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={6}>
                      Loading share events…
                    </td>
                  </tr>
                )}
                {!isLoading && rows.length === 0 && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={6}>
                      No share activity recorded in this range.
                    </td>
                  </tr>
                )}
                {rows.slice(0, 200).map((r) => (
                  <tr key={r.id} className="border-t border-border/50">
                    <td className="p-2 whitespace-nowrap tabular-nums">{fmt(r.created_at)}</td>
                    <td className="p-2">
                      <Badge
                        variant={r.event_type === 'share_click' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {r.event_type === 'share_click' ? 'click' : 'visit'}
                      </Badge>
                    </td>
                    <td className="p-2 capitalize">
                      {(r.channel || r.referrer_source || '—').replace(/_/g, ' ')}
                      {r.utm_campaign ? (
                        <span className="text-muted-foreground"> · {r.utm_campaign}</span>
                      ) : null}
                    </td>
                    <td className="p-2 font-mono">{r.route_pattern}</td>
                    <td className="p-2 max-w-[220px] truncate" title={r.canonical_url || ''}>
                      {r.canonical_url || '—'}
                    </td>
                    <td className="p-2 max-w-[200px] truncate" title={r.referrer || ''}>
                      {r.referrer_host || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareTrafficAnalytics;
