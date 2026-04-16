import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  total_signals_24h: number;
  total_signals_7d: number;
  high_severity_count: number;
  interventions_24h: number;
  signal_distribution: Record<string, number> | null;
  severity_distribution: Record<string, number> | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

export default function TrustRiskDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['fraud-dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_fraud_dashboard_stats' as any);
      if (error) throw error;
      return data as unknown as DashboardStats;
    },
    refetchInterval: 30000,
  });

  const { data: recentSignals } = useQuery({
    queryKey: ['recent-fraud-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_signals' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });

  const { data: recentInterventions } = useQuery({
    queryKey: ['recent-interventions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intervention_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });

  const signalChartData = stats?.signal_distribution
    ? Object.entries(stats.signal_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const severityChartData = stats?.severity_distribution
    ? Object.entries(stats.severity_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Trust & Risk Intelligence</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
          label="Fraud Signals (24h)"
          value={stats?.total_signals_24h ?? 0}
          loading={isLoading}
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-amber-400" />}
          label="High Severity (unresolved)"
          value={stats?.high_severity_count ?? 0}
          loading={isLoading}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
          label="Interventions (24h)"
          value={stats?.interventions_24h ?? 0}
          loading={isLoading}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-emerald-400" />}
          label="Signals (7d)"
          value={stats?.total_signals_7d ?? 0}
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Signal Types (7d)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signalChartData}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Severity Distribution (7d)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {severityChartData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Signals & Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Recent Fraud Signals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(recentSignals as any[])?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                  <div>
                    <span className="font-medium text-foreground">{s.signal_type}</span>
                    <span className="ml-2 text-muted-foreground">val: {s.signal_value}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    s.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                    s.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    s.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {s.severity}
                  </span>
                </div>
              )) || <p className="text-muted-foreground text-xs">No signals recorded</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Recent Interventions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(recentInterventions as any[])?.map((i: any) => (
                <div key={i.id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                  <div>
                    <span className="font-medium text-foreground">{i.intervention_type}</span>
                    <span className="ml-2 text-muted-foreground">
                      CS: {i.conversion_score ?? '-'} | FS: {i.fraud_score ?? '-'}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(i.created_at).toLocaleTimeString()}
                  </span>
                </div>
              )) || <p className="text-muted-foreground text-xs">No interventions</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: number; loading: boolean }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{loading ? '...' : value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
