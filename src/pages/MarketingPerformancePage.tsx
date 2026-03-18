import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketingPerformance, type DailyTrend } from '@/hooks/useMarketingPerformance';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  Eye, MousePointerClick, Users, TrendingUp, DollarSign,
  Target, BarChart3, Zap, ArrowUpRight, ArrowDownRight,
  Minus, Loader2, Activity, Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEOHead } from '@/components/SEOHead';

/* ─── Helpers ─── */

function fmt(n: number, type: 'number' | 'currency' | 'percent' = 'number') {
  if (type === 'currency') {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
    return `Rp ${n.toFixed(0)}`;
  }
  if (type === 'percent') return `${n.toFixed(1)}%`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function StatusDot({ value, thresholds }: { value: number; thresholds: [number, number] }) {
  const color = value >= thresholds[1] ? 'bg-emerald-500' : value >= thresholds[0] ? 'bg-amber-500' : 'bg-destructive';
  return <span className={cn('inline-block w-2 h-2 rounded-full', color)} />;
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  if (value < 0) return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

/* ─── Mini Sparkline ─── */

function Sparkline({ data, dataKey, height = 32 }: { data: DailyTrend[]; dataKey: keyof DailyTrend; height?: number }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => Number(d[dataKey]) || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 88;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');

  return (
    <svg width={w} height={height} className="flex-shrink-0">
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(values.length - 1) * step} cy={height - ((values[values.length - 1] - min) / range) * (height - 4) - 2} r="2.5" fill="hsl(var(--primary))" />
    </svg>
  );
}

/* ─── KPI Card ─── */

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  sparkData?: DailyTrend[];
  sparkKey?: keyof DailyTrend;
  status?: { value: number; thresholds: [number, number] };
}

function KPICard({ title, value, icon, trend, sparkData, sparkKey, status }: KPICardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {status && <StatusDot value={status.value} thresholds={status.thresholds} />}
                <p className="text-xs text-muted-foreground truncate">{title}</p>
              </div>
              <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
              {trend !== undefined && (
                <div className="flex items-center gap-0.5 mt-1">
                  <TrendIcon value={trend} />
                  <span className={cn('text-xs font-medium', trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
              {sparkData && sparkKey && <Sparkline data={sparkData} dataKey={sparkKey} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Chart Tooltip ─── */

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value >= 1000 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const CHANNEL_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--accent))',
];

/* ─── Main Page ─── */

export default function MarketingPerformancePage() {
  const [period, setPeriod] = useState(30);
  const { metrics, channels, trends, isLoading } = useMarketingPerformance(period);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const m = metrics || {
    totalVisitors: 0, avgCTR: 0, conversionRate: 0, watchlistActionsPerUser: 0,
    inquiryRate: 0, avgSessionMinutes: 0, dealsInfluenced: 0, costPerDeal: 0,
    totalSpend: 0, totalRevenue: 0, totalConversions: 0, totalClicks: 0,
    totalImpressions: 0, roi: 0,
  };

  const t = trends || [];
  const ch = channels || [];

  const pieData = ch.map((c, i) => ({ name: c.channel, value: c.spend, fill: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }));

  return (
    <>
      <SEOHead title="Marketing Performance Dashboard" description="Monitor campaign performance, user acquisition, and marketing ROI in real-time." />
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              Marketing Performance
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Campaign effectiveness & investor acquisition intelligence</p>
          </div>
          <div className="flex gap-1.5 bg-muted/50 p-1 rounded-lg">
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  period === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards - Traffic */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Traffic Acquisition
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard title="Total Impressions" value={fmt(m.totalImpressions)} icon={<Eye className="h-4 w-4" />} sparkData={t} sparkKey="impressions" />
            <KPICard title="Total Clicks" value={fmt(m.totalClicks)} icon={<MousePointerClick className="h-4 w-4" />} sparkData={t} sparkKey="clicks" />
            <KPICard title="Avg CTR" value={fmt(m.avgCTR, 'percent')} icon={<Target className="h-4 w-4" />} status={{ value: m.avgCTR, thresholds: [1, 3] }} />
            <KPICard title="Conversion Rate" value={fmt(m.conversionRate, 'percent')} icon={<Zap className="h-4 w-4" />} status={{ value: m.conversionRate, thresholds: [2, 5] }} />
          </div>
        </div>

        {/* KPI Cards - Engagement */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> User Engagement
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard title="Watchlist Actions/User" value={m.watchlistActionsPerUser.toFixed(1)} icon={<BarChart3 className="h-4 w-4" />} />
            <KPICard title="Inquiry Rate" value={fmt(m.inquiryRate, 'percent')} icon={<Users className="h-4 w-4" />} status={{ value: m.inquiryRate, thresholds: [1, 3] }} />
            <KPICard title="Avg Session" value={`${m.avgSessionMinutes.toFixed(1)} min`} icon={<Activity className="h-4 w-4" />} />
            <KPICard title="Total Signups" value={fmt(m.totalConversions)} icon={<Users className="h-4 w-4" />} sparkData={t} sparkKey="conversions" />
          </div>
        </div>

        {/* KPI Cards - Revenue */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Revenue Attribution
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard title="Deals Influenced" value={fmt(m.dealsInfluenced)} icon={<TrendingUp className="h-4 w-4" />} />
            <KPICard title="Cost Per Deal" value={fmt(m.costPerDeal, 'currency')} icon={<Target className="h-4 w-4" />} />
            <KPICard title="Total Spend" value={fmt(m.totalSpend, 'currency')} icon={<DollarSign className="h-4 w-4" />} sparkData={t} sparkKey="spend" />
            <KPICard title="Marketing ROI" value={fmt(m.roi, 'percent')} icon={<ArrowUpRight className="h-4 w-4" />} status={{ value: m.roi, thresholds: [0, 100] }} />
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="channels">Channel Breakdown</TabsTrigger>
            <TabsTrigger value="spend">Budget Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Daily Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={t}>
                      <defs>
                        <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="clicks" name="Clicks" stroke="hsl(var(--primary))" fill="url(#clicksGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="conversions" name="Conversions" stroke="hsl(var(--chart-2))" fill="url(#convGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {ch.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No channel data available for this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['Channel', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'Spend', 'CPA', 'Revenue', 'ROI'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ch.map((c, i) => (
                          <tr key={c.channel} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-2 font-medium text-foreground flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                              {c.channel}
                            </td>
                            <td className="py-2.5 px-2 text-muted-foreground">{fmt(c.impressions)}</td>
                            <td className="py-2.5 px-2 text-muted-foreground">{fmt(c.clicks)}</td>
                            <td className="py-2.5 px-2">
                              <Badge variant={c.ctr >= 3 ? 'default' : c.ctr >= 1 ? 'secondary' : 'destructive'} className="text-xs">
                                {c.ctr.toFixed(1)}%
                              </Badge>
                            </td>
                            <td className="py-2.5 px-2 font-medium text-foreground">{fmt(c.conversions)}</td>
                            <td className="py-2.5 px-2 text-muted-foreground">{fmt(c.spend, 'currency')}</td>
                            <td className="py-2.5 px-2 text-muted-foreground">{fmt(c.cpa, 'currency')}</td>
                            <td className="py-2.5 px-2 font-medium text-foreground">{fmt(c.revenue, 'currency')}</td>
                            <td className="py-2.5 px-2">
                              <Badge variant={c.roi > 0 ? 'default' : 'destructive'} className="text-xs">
                                {c.roi.toFixed(0)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spend">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Budget Allocation by Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2} strokeWidth={0}>
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Spend vs Revenue by Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ch} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => fmt(v, 'currency')} />
                        <YAxis type="category" dataKey="channel" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="spend" name="Spend" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
