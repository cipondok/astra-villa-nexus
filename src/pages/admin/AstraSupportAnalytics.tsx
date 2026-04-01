import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw, Brain, ShieldAlert, Bell, TrendingUp, Zap, Eye } from 'lucide-react';
import { format, subDays, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';

const COLORS = ['#00E0A4', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
const CARD_BG = '#0F1726';
const PAGE_BG = '#070B14';
const ACCENT = '#00E0A4';

const severityColor: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
};

const AstraSupportAnalytics: React.FC = () => {
  const queryClient = useQueryClient();
  const sevenDaysAgo = useMemo(() => subDays(new Date(), 7).toISOString(), []);

  // ── DATA QUERIES ──
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['support-analytics-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_cases')
        .select('*')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['support-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_predictions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: riskSignals = [] } = useQuery({
    queryKey: ['support-risk-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_risk_signals')
        .select('*')
        .eq('is_reviewed', false)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: smartAlerts = [] } = useQuery({
    queryKey: ['support-smart-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_smart_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // ── RUN INTELLIGENCE ──
  const runIntelligence = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('support-intelligence', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Intelligence scan complete: ${data.predictions_generated} predictions, ${data.risk_signals_detected} risks, ${data.alerts_created} alerts`);
      queryClient.invalidateQueries({ queryKey: ['support-predictions'] });
      queryClient.invalidateQueries({ queryKey: ['support-risk-signals'] });
      queryClient.invalidateQueries({ queryKey: ['support-smart-alerts'] });
    },
    onError: (err: any) => toast.error(err.message || 'Intelligence scan failed'),
  });

  // ── COMPUTED METRICS ──
  const metrics = useMemo(() => {
    const total = cases.length;
    const conflicts = cases.filter((c: any) => c.conflict_detected).length;
    const resolved = cases.filter((c: any) => c.status === 'resolved').length;
    const avgResMinutes = resolved > 0
      ? cases
          .filter((c: any) => c.status === 'resolved' && c.resolved_at)
          .reduce((sum: number, c: any) => sum + differenceInMinutes(new Date(c.resolved_at), new Date(c.created_at)), 0) / resolved
      : 0;
    const conflictRateNum = total > 0 ? (conflicts / total) * 100 : 0;
    return {
      total,
      conflictRate: conflictRateNum.toFixed(1),
      autoResRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : '0',
      avgResTime: avgResMinutes < 60 ? `${Math.round(avgResMinutes)}m` : `${(avgResMinutes / 60).toFixed(1)}h`,
      conflictRateNum,
      healthGrade: total === 0 ? 'A' : conflictRateNum > 30 ? 'D' : conflictRateNum > 15 ? 'C' : conflictRateNum > 5 ? 'B' : 'A',
    };
  }, [cases]);

  const dailyData = useMemo(() => {
    const days: Record<string, { date: string; cases: number; conflicts: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const key = format(subDays(new Date(), i), 'MMM dd');
      days[key] = { date: key, cases: 0, conflicts: 0 };
    }
    cases.forEach((c: any) => {
      const key = format(new Date(c.created_at), 'MMM dd');
      if (days[key]) {
        days[key].cases++;
        if (c.conflict_detected) days[key].conflicts++;
      }
    });
    return Object.values(days);
  }, [cases]);

  const issueTypeData = useMemo(() => {
    const map: Record<string, number> = { payment: 0, kyc: 0, document: 0, escrow: 0, other: 0 };
    cases.forEach((c: any) => {
      const t = (c.issue_type || '').toLowerCase();
      if (t in map) map[t]++;
      else map.other++;
    });
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [cases]);

  const resolutionData = useMemo(() => {
    const auto = cases.filter((c: any) => c.status === 'resolved' && (c.issue_type || '').includes('auto')).length;
    const resolved = cases.filter((c: any) => c.status === 'resolved').length;
    const open = cases.filter((c: any) => c.status !== 'resolved').length;
    return [
      { name: 'Auto-Resolved', value: auto },
      { name: 'Manual', value: Math.max(0, resolved - auto) },
      { name: 'Open', value: open },
    ].filter(d => d.value > 0);
  }, [cases]);

  const gradeColor: Record<string, string> = { A: '#00E0A4', B: '#3B82F6', C: '#F59E0B', D: '#EF4444' };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_BG }}>
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: PAGE_BG, color: '#E2E8F0' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>
            ASTRA Support Intelligence
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Predictive analytics · Fraud detection · Smart alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${gradeColor[metrics.healthGrade]}15` }}>
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>System Health</span>
            <span className="text-lg font-bold" style={{ color: gradeColor[metrics.healthGrade] }}>{metrics.healthGrade}</span>
          </div>
          <Button
            size="sm"
            onClick={() => runIntelligence.mutate()}
            disabled={runIntelligence.isPending}
            className="gap-2"
            style={{ background: ACCENT, color: '#070B14' }}
          >
            {runIntelligence.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            Run Intelligence Scan
          </Button>
          <Badge variant="outline" className="border-[#00E0A4]/30 text-[#00E0A4] text-xs">
            LIVE · 30s
          </Badge>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total Cases (7d)', value: metrics.total, icon: Activity, color: '#3B82F6' },
          { label: 'Conflict Rate', value: `${metrics.conflictRate}%`, icon: AlertTriangle, color: metrics.conflictRateNum > 30 ? '#EF4444' : '#F59E0B', alert: metrics.conflictRateNum > 30 },
          { label: 'Auto-Resolution Rate', value: `${metrics.autoResRate}%`, icon: CheckCircle2, color: '#00E0A4' },
          { label: 'Avg Resolution Time', value: metrics.avgResTime, icon: Clock, color: '#8B5CF6' },
        ] as const).map((m) => (
          <Card key={m.label} className="border-0" style={{ background: CARD_BG, boxShadow: m.alert ? '0 0 20px rgba(239,68,68,0.15)' : 'none' }}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: `${m.color}15` }}>
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#64748B' }}>{m.label}</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Smart Alerts Banner */}
      {smartAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: '#F59E0B' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>Smart Alerts ({smartAlerts.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {smartAlerts.slice(0, 4).map((alert: any) => (
              <Card key={alert.id} className="border-0 border-l-4" style={{ background: CARD_BG, borderLeftColor: severityColor[alert.severity] || '#64748B' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-[10px] px-1.5 py-0" style={{ background: `${severityColor[alert.severity]}20`, color: severityColor[alert.severity] }}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs" style={{ color: '#64748B' }}>{alert.affected_area}</span>
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: '#F8FAFC' }}>{alert.title}</p>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: '#94A3B8' }}>{alert.message}</p>
                      {alert.recommended_action && (
                        <p className="text-xs mt-2 italic" style={{ color: ACCENT }}>→ {alert.recommended_action}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 lg:col-span-2" style={{ background: CARD_BG }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#94A3B8' }}>
              <TrendingUp className="w-4 h-4" /> Cases & Conflicts Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F8FAFC' }} />
                <Line type="monotone" dataKey="cases" name="Cases" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT }} />
                <Line type="monotone" dataKey="conflicts" name="Conflicts" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0" style={{ background: CARD_BG }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#94A3B8' }}>Issue Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {issueTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={issueTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {issueTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F8FAFC' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-sm" style={{ color: '#475569' }}>No data</div>}
          </CardContent>
        </Card>
      </div>

      {/* Resolution + Predictions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0" style={{ background: CARD_BG }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#94A3B8' }}>Resolution Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {resolutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F8FAFC' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {resolutionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-sm" style={{ color: '#475569' }}>No data</div>}
          </CardContent>
        </Card>

        {/* Predictions */}
        <Card className="border-0" style={{ background: CARD_BG }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#94A3B8' }}>
              <Brain className="w-4 h-4" style={{ color: ACCENT }} /> Predictive Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-56 overflow-y-auto">
            {predictions.length > 0 ? predictions.map((p: any) => (
              <div key={p.id} className="p-3 rounded-lg" style={{ background: '#121C2F' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="text-[10px] px-1.5 py-0" style={{ background: `${severityColor[p.severity]}20`, color: severityColor[p.severity] }}>
                    {p.severity}
                  </Badge>
                  <span className="text-xs" style={{ color: '#64748B' }}>{p.affected_area}</span>
                  <span className="text-xs ml-auto" style={{ color: ACCENT }}>{p.confidence_score?.toFixed(0)}% confidence</span>
                </div>
                <p className="text-xs" style={{ color: '#CBD5E1' }}>{p.prediction_text}</p>
              </div>
            )) : (
              <div className="h-40 flex flex-col items-center justify-center gap-2">
                <Brain className="w-8 h-8" style={{ color: '#1E293B' }} />
                <p className="text-xs" style={{ color: '#475569' }}>Run intelligence scan to generate predictions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Signals */}
      {riskSignals.length > 0 && (
        <Card className="border-0" style={{ background: CARD_BG }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#94A3B8' }}>
              <ShieldAlert className="w-4 h-4" style={{ color: '#EF4444' }} /> Risk & Fraud Signals ({riskSignals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: '#64748B' }}>
                    <th className="text-left py-2 px-3 font-medium">Risk Type</th>
                    <th className="text-left py-2 px-3 font-medium">Level</th>
                    <th className="text-left py-2 px-3 font-medium">Description</th>
                    <th className="text-left py-2 px-3 font-medium">Cases</th>
                    <th className="text-left py-2 px-3 font-medium">Detected</th>
                  </tr>
                </thead>
                <tbody>
                  {riskSignals.map((r: any) => (
                    <tr key={r.id} className="border-t" style={{ borderColor: '#1E293B' }}>
                      <td className="py-2.5 px-3 font-medium" style={{ color: '#F8FAFC' }}>{r.risk_type?.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3">
                        <Badge className="text-[10px] px-1.5 py-0" style={{ background: `${severityColor[r.risk_level]}20`, color: severityColor[r.risk_level] }}>
                          {r.risk_level}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate" style={{ color: '#CBD5E1' }}>{r.description}</td>
                      <td className="py-2.5 px-3" style={{ color: '#94A3B8' }}>{r.related_case_ids?.length || 0}</td>
                      <td className="py-2.5 px-3" style={{ color: '#64748B' }}>{format(new Date(r.created_at), 'MMM dd HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AstraSupportAnalytics;
