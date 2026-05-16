import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface SupportCase {
  id: string;
  case_id: string;
  user_id: string | null;
  issue_type: string;
  status: string;
  priority: string;
  conflict_detected: boolean;
  confidence_score: number | null;
  created_at: string;
}

interface Metrics {
  totalToday: number;
  conflicts: number;
  highPriority: number;
  resolved: number;
}

const priorityColor: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const statusColor: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  escalated: 'bg-red-500/15 text-red-400 border-red-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function AstraSupportDashboard() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ totalToday: 0, conflicts: 0, highPriority: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [casesRes, todayRes, conflictsRes, highRes, resolvedRes] = await Promise.all([
      supabase.from('support_cases').select('id,case_id,user_id,issue_type,status,priority,conflict_detected,confidence_score,created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('support_cases').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
      supabase.from('support_cases').select('id', { count: 'exact', head: true }).eq('conflict_detected', true),
      supabase.from('support_cases').select('id', { count: 'exact', head: true }).in('priority', ['high', 'critical']),
      supabase.from('support_cases').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
    ]);

    if (casesRes.data) setCases(casesRes.data as SupportCase[]);
    setMetrics({
      totalToday: todayRes.count ?? 0,
      conflicts: conflictsRes.count ?? 0,
      highPriority: highRes.count ?? 0,
      resolved: resolvedRes.count ?? 0,
    });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const metricCards = [
    { label: 'Total Cases Today', value: metrics.totalToday, icon: Clock, accent: 'text-blue-400' },
    { label: 'Conflicts Detected', value: metrics.conflicts, icon: AlertTriangle, accent: 'text-red-400' },
    { label: 'High Priority', value: metrics.highPriority, icon: Shield, accent: 'text-orange-400' },
    { label: 'Resolved Cases', value: metrics.resolved, icon: CheckCircle2, accent: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-astra-bg-main p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-astra-text-primary tracking-tight">ASTRA Support Dashboard</h1>
          <p className="text-sm text-astra-text-muted mt-1">Real-time support case intelligence</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={refreshing}
          className="border-astra-border-subtle text-astra-text-secondary hover:bg-astra-bg-hover"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((m) => (
          <Card key={m.label} className="bg-astra-bg-card border-astra-border-subtle shadow-astra-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-astra-text-muted">{m.label}</CardTitle>
              <m.icon className={`h-4 w-4 ${m.accent}`} />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className={`text-3xl font-bold ${m.accent}`}>{loading ? '–' : m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cases Table */}
      <Card className="bg-astra-bg-card border-astra-border-subtle shadow-astra-soft overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-astra-border-subtle">
          <CardTitle className="text-sm font-medium text-astra-text-primary">Support Cases</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-astra-border-subtle hover:bg-transparent">
                {['Case ID', 'User ID', 'Issue Type', 'Status', 'Confidence', 'Priority', 'Created At'].map((h) => (
                  <TableHead key={h} className="text-xs uppercase tracking-wider text-astra-text-muted font-medium">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-astra-text-muted">Loading…</TableCell></TableRow>
              ) : cases.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-astra-text-muted">No support cases found</TableCell></TableRow>
              ) : (
                cases.map((c) => (
                  <TableRow
                    key={c.id}
                    className={`border-astra-border-subtle transition-colors ${
                      c.priority === 'high' || c.priority === 'critical' ? 'bg-red-500/[0.04]' : ''
                    } ${c.conflict_detected ? 'ring-1 ring-inset ring-red-500/20' : ''}`}
                  >
                    <TableCell className="font-mono text-xs text-astra-text-primary">{c.case_id}</TableCell>
                    <TableCell className="font-mono text-xs text-astra-text-secondary truncate max-w-[120px]">{c.user_id?.slice(0, 8) ?? '—'}…</TableCell>
                    <TableCell className="text-xs text-astra-text-secondary capitalize">{c.issue_type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusColor[c.status] ?? ''}`}>{c.status.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-astra-text-secondary">{c.confidence_score != null ? `${(c.confidence_score * 100).toFixed(0)}%` : '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${priorityColor[c.priority] ?? ''}`}>{c.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-astra-text-muted whitespace-nowrap">{format(new Date(c.created_at), 'MMM d, HH:mm')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
