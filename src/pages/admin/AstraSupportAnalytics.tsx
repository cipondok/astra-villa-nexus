import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { format, subDays, differenceInMinutes } from 'date-fns';

const COLORS = ['#00E0A4', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const AstraSupportAnalytics: React.FC = () => {
  const sevenDaysAgo = useMemo(() => subDays(new Date(), 7).toISOString(), []);

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

  const metrics = useMemo(() => {
    const total = cases.length;
    const conflicts = cases.filter(c => c.conflict_detected).length;
    const resolved = cases.filter(c => c.status === 'resolved').length;

    const avgResMinutes = resolved > 0
      ? cases
          .filter(c => c.status === 'resolved' && c.resolved_at)
          .reduce((sum, c) => sum + differenceInMinutes(new Date(c.resolved_at!), new Date(c.created_at)), 0)
        / resolved
      : 0;

    return {
      total,
      conflictRate: total > 0 ? ((conflicts / total) * 100).toFixed(1) : '0',
      autoResRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : '0',
      avgResTime: avgResMinutes < 60
        ? `${Math.round(avgResMinutes)}m`
        : `${(avgResMinutes / 60).toFixed(1)}h`,
      conflictRateNum: total > 0 ? (conflicts / total) * 100 : 0,
    };
  }, [cases]);

  // Cases over time (last 7 days)
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      days[format(subDays(new Date(), i), 'MMM dd')] = 0;
    }
    cases.forEach(c => {
      const key = format(new Date(c.created_at), 'MMM dd');
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [cases]);

  // Issue type distribution
  const issueTypeData = useMemo(() => {
    const map: Record<string, number> = { payment: 0, kyc: 0, document: 0, escrow: 0, other: 0 };
    cases.forEach(c => {
      const t = (c.issue_type || '').toLowerCase();
      if (t in map) map[t]++;
      else map.other++;
    });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [cases]);

  // Resolution breakdown
  const resolutionData = useMemo(() => {
    const auto = cases.filter(c => c.status === 'resolved' && c.issue_type?.includes('auto')).length;
    const resolved = cases.filter(c => c.status === 'resolved').length;
    const open = cases.filter(c => c.status !== 'resolved').length;
    return [
      { name: 'Auto-Resolved', value: auto },
      { name: 'Manual', value: Math.max(0, resolved - auto) },
      { name: 'Open', value: open },
    ].filter(d => d.value > 0);
  }, [cases]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B14' }}>
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#00E0A4' }} />
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Cases (7d)', value: metrics.total, icon: Activity, color: '#3B82F6' },
    {
      label: 'Conflict Rate',
      value: `${metrics.conflictRate}%`,
      icon: AlertTriangle,
      color: metrics.conflictRateNum > 30 ? '#EF4444' : '#F59E0B',
      alert: metrics.conflictRateNum > 30,
    },
    { label: 'Auto-Resolution Rate', value: `${metrics.autoResRate}%`, icon: CheckCircle2, color: '#00E0A4' },
    { label: 'Avg Resolution Time', value: metrics.avgResTime, icon: Clock, color: '#8B5CF6' },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: '#070B14', color: '#E2E8F0' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>
            ASTRA Support Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            System health · User friction · Performance trends
          </p>
        </div>
        <Badge variant="outline" className="border-[#00E0A4]/30 text-[#00E0A4] text-xs">
          LIVE · 30s refresh
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card
            key={m.label}
            className="border-0"
            style={{
              background: '#0F1726',
              boxShadow: m.alert ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
            }}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{ background: `${m.color}15` }}
              >
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#64748B' }}>{m.label}</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>
                  {m.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cases Over Time */}
        <Card className="border-0 lg:col-span-2" style={{ background: '#0F1726' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              Cases Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F8FAFC' }}
                />
                <Line type="monotone" dataKey="count" stroke="#00E0A4" strokeWidth={2} dot={{ r: 4, fill: '#00E0A4' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issue Type Distribution */}
        <Card className="border-0" style={{ background: '#0F1726' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              Issue Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {issueTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={issueTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {issueTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F8FAFC' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: '#475569' }}>No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolution Breakdown */}
      <Card className="border-0" style={{ background: '#0F1726' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            Resolution Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {resolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#F8FAFC' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {resolutionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm" style={{ color: '#475569' }}>No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AstraSupportAnalytics;
