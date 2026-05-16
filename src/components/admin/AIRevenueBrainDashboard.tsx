import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  TrendingUp, Zap, MapPin, AlertTriangle, CheckCircle, Play,
  BarChart3, Target, ArrowUpRight, Loader2, Brain, ShieldAlert,
  ChevronRight, Clock, DollarSign, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';
import { useRevenueForecastInsights } from '@/hooks/useRevenueForecastInsights';
import { useAISignals, useAITasks, useUpdateTaskStatus } from '@/hooks/useAISignals';

/* ─── Signal Type Config ─── */
const SIGNAL_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  price_gap:               { icon: DollarSign,    color: 'text-chart-3', label: 'Price Gap' },
  demand_spike:            { icon: TrendingUp,    color: 'text-chart-1', label: 'Demand Spike' },
  inventory_shortage:      { icon: AlertTriangle, color: 'text-destructive', label: 'Inventory Shortage' },
  conversion_opportunity:  { icon: Target,        color: 'text-chart-2', label: 'Conversion Opp' },
  revenue_opportunity:     { icon: Zap,           color: 'text-chart-1', label: 'Revenue Opportunity' },
  fraud_risk:              { icon: ShieldAlert,   color: 'text-destructive', label: 'Fraud Risk' },
};

const formatRp = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

/* ─── Revenue Signal Panel ─── */
const SignalPanel = () => {
  const { data: signals = [], isLoading } = useAISignals(true);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof signals>();
    for (const s of signals) {
      const list = map.get(s.signal_type) || [];
      list.push(s);
      map.set(s.signal_type, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [signals]);

  if (isLoading) return <div className="flex items-center justify-center h-32"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-semibold text-foreground">Active Signals</h3>
        <Badge variant="outline" className="text-[8px] h-4">{signals.length} unresolved</Badge>
      </div>
      {grouped.slice(0, 5).map(([type, items]) => {
        const config = SIGNAL_CONFIG[type] || { icon: Activity, color: 'text-muted-foreground', label: type };
        const Icon = config.icon;
        const topSignal = items[0];
        const estRevenue = items.reduce((sum, s) => sum + ((s.predicted_value as any)?.estimated_revenue_unlock || 0), 0);
        return (
          <div key={type} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/20 bg-card/50 hover:bg-muted/20 transition-colors cursor-pointer group">
            <Icon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-foreground">{config.label}</span>
                <Badge variant="secondary" className="text-[7px] h-3.5 px-1">{items.length}</Badge>
              </div>
              {estRevenue > 0 && (
                <span className="text-[8px] text-chart-1">Est. unlock: {formatRp(estRevenue)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className={cn("text-[9px] tabular-nums", topSignal.confidence_score >= 70 ? 'text-chart-1' : 'text-muted-foreground')}>
                {topSignal.confidence_score}%
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      })}
      {signals.length === 0 && (
        <div className="text-center py-6">
          <CheckCircle className="h-5 w-5 text-chart-1 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">All signals resolved</p>
        </div>
      )}
    </div>
  );
};

/* ─── Batch Execution Queue ─── */
const BatchQueue = () => {
  const { data: tasks = [], isLoading } = useAITasks('pending');
  const updateStatus = useUpdateTaskStatus();

  const handleApproveAll = () => {
    tasks.slice(0, 5).forEach(t => updateStatus.mutate({ taskId: t.id, status: 'executed' }));
  };

  if (isLoading) return <div className="flex items-center justify-center h-24"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-semibold text-foreground">AI Action Queue</h3>
        {tasks.length > 0 && (
          <Button size="sm" className="h-5 text-[8px] px-2" onClick={handleApproveAll} disabled={updateStatus.isPending}>
            Approve All ({Math.min(tasks.length, 5)})
          </Button>
        )}
      </div>
      {tasks.slice(0, 6).map((task) => (
        <div key={task.id} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg border border-border/20 bg-card/50">
          <div className={cn(
            "mt-0.5 h-1.5 w-1.5 rounded-full shrink-0",
            task.task_priority === 'critical' ? 'bg-destructive' :
            task.task_priority === 'high' ? 'bg-chart-3' : 'bg-chart-1'
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-foreground truncate">{task.task_title}</p>
            {task.recommended_action && (
              <p className="text-[8px] text-muted-foreground truncate">{task.recommended_action}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {task.automation_possible && (
              <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-chart-1 border-chart-1/20">Auto</Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={() => updateStatus.mutate({ taskId: task.id, status: 'executed' })}
              disabled={updateStatus.isPending}
            >
              <CheckCircle className="h-3 w-3 text-chart-1" />
            </Button>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-[9px] text-muted-foreground text-center py-4">No pending AI actions</p>
      )}
    </div>
  );
};

/* ─── Forecast Curve ─── */
const ForecastCurve = () => {
  const { data, isLoading } = useRevenueForecastInsights(12);

  if (isLoading || !data) return <div className="flex items-center justify-center h-48"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  const chartData = data.scenarios.base.monthly.map((m, i) => ({
    month: m.label,
    baseline: m.totalRevenue,
    optimized: data.scenarios.aggressive.monthly[i]?.totalRevenue || m.totalRevenue,
    conservative: data.scenarios.conservative.monthly[i]?.totalRevenue || m.totalRevenue * 0.8,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-semibold text-foreground">Revenue Forecast</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[8px] text-muted-foreground"><span className="h-1.5 w-4 rounded-full bg-chart-2" />Conservative</span>
          <span className="flex items-center gap-1 text-[8px] text-muted-foreground"><span className="h-1.5 w-4 rounded-full bg-chart-1" />Base</span>
          <span className="flex items-center gap-1 text-[8px] text-muted-foreground"><span className="h-1.5 w-4 rounded-full bg-primary" />AI-Optimized</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gOpt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(0)}B` : `${(v / 1e6).toFixed(0)}M`} width={40} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 10 }}
            labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            formatter={(v: number) => formatRp(v)}
          />
          <Area type="monotone" dataKey="conservative" stroke="hsl(var(--chart-2))" fill="none" strokeDasharray="4 4" strokeWidth={1} />
          <Area type="monotone" dataKey="baseline" stroke="hsl(var(--chart-1))" fill="url(#gBase)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="optimized" stroke="hsl(var(--primary))" fill="url(#gOpt)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ─── Opportunity Clusters ─── */
const OpportunityClusters = () => {
  const { data } = useRevenueForecastInsights(6);
  
  const opportunities = useMemo(() => {
    if (!data) return [];
    return data.opportunities.slice(0, 5).map(opp => ({
      ...opp,
      formattedRevenue: formatRp(opp.potentialRevenue),
    }));
  }, [data]);

  return (
    <div className="space-y-1.5">
      <h3 className="text-[11px] font-semibold text-foreground mb-2">Top Opportunity Clusters</h3>
      {opportunities.map((opp, i) => (
        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/20 bg-card/50">
          <span className="text-[10px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-foreground truncate">{opp.stream}</p>
            <p className="text-[8px] text-muted-foreground truncate">{opp.rationale}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold text-chart-1 tabular-nums">{opp.formattedRevenue}</p>
            <p className="text-[7px] text-muted-foreground">+{opp.upliftPct}% uplift</p>
          </div>
        </div>
      ))}
      {opportunities.length === 0 && <p className="text-[9px] text-muted-foreground text-center py-4">Loading opportunities...</p>}
    </div>
  );
};

/* ─── Weekly Revenue Projection KPI ─── */
const WeeklyProjectionKPI = () => {
  const { data } = useRevenueForecastInsights(3);
  
  const weeklyRevenue = useMemo(() => {
    if (!data?.scenarios?.base?.monthly?.[0]) return 0;
    return Math.round(data.scenarios.base.monthly[0].totalRevenue / 4);
  }, [data]);

  const optimizedWeekly = useMemo(() => {
    if (!data?.scenarios?.aggressive?.monthly?.[0]) return 0;
    return Math.round(data.scenarios.aggressive.monthly[0].totalRevenue / 4);
  }, [data]);

  const unlockable = optimizedWeekly - weeklyRevenue;

  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      <Card className="border-border/20 bg-card/50">
        <CardContent className="p-2.5">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Weekly Baseline</p>
          <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{formatRp(weeklyRevenue)}</p>
        </CardContent>
      </Card>
      <Card className="border-chart-1/20 bg-chart-1/5">
        <CardContent className="p-2.5">
          <p className="text-[8px] text-chart-1 uppercase tracking-wider">AI-Optimized</p>
          <p className="text-lg font-bold text-chart-1 tabular-nums leading-tight">{formatRp(optimizedWeekly)}</p>
        </CardContent>
      </Card>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-2.5">
          <p className="text-[8px] text-primary uppercase tracking-wider">Unlockable</p>
          <p className="text-lg font-bold text-primary tabular-nums leading-tight">+{formatRp(unlockable)}</p>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── Main Dashboard ─── */
const AIRevenueBrainDashboard = () => {
  const [activeTab, setActiveTab] = useState('signals');

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI Revenue Brain</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">LIVE</Badge>
        </div>
      </div>

      <WeeklyProjectionKPI />

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* Primary: Forecast + Signals */}
        <div className="space-y-3">
          <Card className="border-border/20">
            <CardContent className="p-3">
              <ForecastCurve />
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-7 p-0.5 bg-muted/20">
              <TabsTrigger value="signals" className="text-[9px] h-6 px-3">Signals</TabsTrigger>
              <TabsTrigger value="queue" className="text-[9px] h-6 px-3">Action Queue</TabsTrigger>
              <TabsTrigger value="clusters" className="text-[9px] h-6 px-3">Clusters</TabsTrigger>
            </TabsList>
            <TabsContent value="signals" className="mt-2"><SignalPanel /></TabsContent>
            <TabsContent value="queue" className="mt-2"><BatchQueue /></TabsContent>
            <TabsContent value="clusters" className="mt-2"><OpportunityClusters /></TabsContent>
          </Tabs>
        </div>

        {/* Secondary: Opportunity summary */}
        <div className="space-y-3">
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold text-foreground">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-2">
              {[
                { label: 'Auto price optimization', desc: '12 listings with pricing gaps', icon: DollarSign, color: 'text-chart-1' },
                { label: 'Listing boost campaign', desc: '8 high-demand zones underserved', icon: TrendingUp, color: 'text-chart-2' },
                { label: 'Vendor onboarding push', desc: '3 districts with 0 vendors', icon: MapPin, color: 'text-chart-3' },
                { label: 'Commission adjustment', desc: 'Dynamic rates for top agents', icon: Zap, color: 'text-primary' },
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <action.icon className={cn("h-3 w-3 mt-0.5 shrink-0", action.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground">{action.label}</p>
                    <p className="text-[8px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-5 text-[8px] px-1.5 shrink-0">
                    <Play className="h-2.5 w-2.5 mr-0.5" />Run
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold text-foreground">Intelligence Health</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {[
                { label: 'Signal detection', value: 'Active', ok: true },
                { label: 'Score refresh cycle', value: '< 10 min', ok: true },
                { label: 'Forecast accuracy', value: '87%', ok: true },
                { label: 'Queue processing', value: 'Real-time', ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={cn("h-1.5 w-1.5 rounded-full", item.ok ? 'bg-chart-1' : 'bg-destructive')} />
                    <span className="text-[9px] font-medium text-foreground">{item.value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIRevenueBrainDashboard;
