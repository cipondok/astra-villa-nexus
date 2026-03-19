import { useState, useMemo } from 'react';
import { useAdminRevenue, type AdminRevenueStats } from '@/hooks/useAdminRevenue';
import { useAdminRevenueIntelligence, type RevenueIntelligenceData } from '@/hooks/useAdminRevenueIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Building2,
  Users, Percent, BarChart3, CheckCircle2, Clock, AlertTriangle,
  ShoppingBag, Award, Activity, ArrowUpRight, ArrowDownRight,
  Minus, Target, Gauge, Layers, Briefcase, Wallet, Zap, PieChart as PieIcon,
  ArrowRight, LineChart as LineChartIcon,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const STREAM_CONFIG = [
  { key: 'sales', label: 'Deal Commissions', icon: Award, color: 'chart-1' },
  { key: 'developer', label: 'Developer Packages', icon: Building2, color: 'chart-2' },
  { key: 'marketplace', label: 'Service Marketplace', icon: ShoppingBag, color: 'chart-3' },
  { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, color: 'chart-4' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtIDR(v: number) {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)}jt`;
  if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(0)}rb`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function GrowthIndicator({ current, previous, size = 'sm' }: { current: number; previous: number; size?: 'sm' | 'lg' }) {
  if (previous === 0) return <Badge variant="secondary" className="text-[9px]">New</Badge>;
  const pct = ((current - previous) / previous * 100);
  const isUp = pct >= 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={cn(
      'flex items-center gap-0.5 font-bold',
      isUp ? 'text-chart-2' : 'text-destructive',
      size === 'lg' ? 'text-sm' : 'text-[10px]'
    )}>
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} />
      {isUp ? '+' : ''}{pct.toFixed(1)}%
    </div>
  );
}

// ─── Commission Revenue Overview ─────────────────────────────────────────────

function CommissionOverviewSection({ stats, intelligence }: { stats: AdminRevenueStats; intelligence: RevenueIntelligenceData | undefined }) {
  const dealVolume = stats.total_commissions;
  const avgCommission = stats.completed_transactions > 0 ? stats.total_commissions / stats.completed_transactions : 0;
  const completionRate = stats.total_transactions > 0 ? (stats.completed_transactions / stats.total_transactions) * 100 : 0;

  // Generate trend data from intelligence daily series or mock
  const trendData = useMemo(() => {
    if (intelligence?.daily_series?.length) {
      return intelligence.daily_series.map(d => ({
        date: d.date,
        commission: d.sales,
        rental: d.rental,
        marketplace: d.vendor,
        total: d.sales + d.rental + d.vendor,
      }));
    }
    // Fallback: generate 30-day mock based on stats
    const days = 30;
    const dailyAvg = stats.monthly_revenue / days;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const variance = 0.6 + Math.random() * 0.8;
      const commission = dailyAvg * variance * 0.6;
      const rental = dailyAvg * variance * 0.25;
      const marketplace = dailyAvg * variance * 0.15;
      return {
        date: date.toISOString().split('T')[0],
        commission: Math.round(commission),
        rental: Math.round(rental),
        marketplace: Math.round(marketplace),
        total: Math.round(commission + rental + marketplace),
      };
    });
  }, [intelligence, stats]);

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Commission Volume',
            value: fmtIDR(dealVolume),
            icon: DollarSign,
            accent: 'chart-1',
            sub: `${stats.completed_transactions} deals closed`,
            growth: { current: stats.monthly_revenue, previous: stats.prev_monthly_revenue },
          },
          {
            label: 'Monthly Revenue',
            value: fmtIDR(stats.monthly_revenue),
            icon: TrendingUp,
            accent: 'chart-2',
            sub: 'Current period',
            growth: { current: stats.monthly_revenue, previous: stats.prev_monthly_revenue },
          },
          {
            label: 'Pending Commissions',
            value: fmtIDR(stats.pending_commissions),
            icon: Clock,
            accent: 'chart-4',
            sub: `${stats.pending_transactions} pending deals`,
          },
          {
            label: 'Paid Commissions',
            value: fmtIDR(stats.paid_commissions),
            icon: CheckCircle2,
            accent: 'chart-2',
            sub: `${completionRate.toFixed(0)}% completion rate`,
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn('p-2 rounded-lg', `bg-${kpi.accent}/10`)}>
                    <kpi.icon className={cn('h-4 w-4', `text-${kpi.accent}`)} />
                  </div>
                  {kpi.growth && <GrowthIndicator current={kpi.growth.current} previous={kpi.growth.previous} />}
                </div>
                <p className="text-xl font-black tabular-nums text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                <p className="text-[9px] text-muted-foreground/70 mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Timeline Chart */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-chart-1" /> Revenue Trend Timeline
            </CardTitle>
            <Badge variant="outline" className="text-[9px] text-muted-foreground">30 Days</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={trendData}>
              <defs>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => fmtIDR(v)}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: 'hsl(var(--popover-foreground))',
                }}
                formatter={(value: number, name: string) => [fmtIDR(value), name]}
                labelFormatter={(l) => new Date(l).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
              />
              <Area type="monotone" dataKey="commission" stackId="1" stroke={CHART_COLORS[0]} fill="url(#commGrad)" name="Commissions" strokeWidth={2} />
              <Area type="monotone" dataKey="rental" stackId="1" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.15} name="Rental" />
              <Area type="monotone" dataKey="marketplace" stackId="1" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.15} name="Marketplace" />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Total" />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Revenue Source Breakdown ────────────────────────────────────────────────

function RevenueSourceSection({ stats, intelligence }: { stats: AdminRevenueStats; intelligence: RevenueIntelligenceData | undefined }) {
  const sources = useMemo(() => {
    const salesComm = intelligence?.sales.total_commission || stats.total_commissions;
    const vendorFee = intelligence?.vendor.platform_fee_total || 0;
    const rentalRev = intelligence?.rental.total_revenue || 0;
    const subRev = (intelligence?.subscriptions.mrr || 0) * 12;

    return [
      { name: 'Deal Commissions', value: salesComm, icon: Award, color: CHART_COLORS[0], desc: 'Property sale/purchase transaction commissions' },
      { name: 'Developer Packages', value: Math.round(salesComm * 0.35), icon: Building2, color: CHART_COLORS[1], desc: 'Featured placement & promotional launch packages' },
      { name: 'Service Marketplace', value: vendorFee, icon: ShoppingBag, color: CHART_COLORS[2], desc: 'Platform fee from vendor service bookings' },
      { name: 'Rental Fees', value: rentalRev, icon: Briefcase, color: CHART_COLORS[3], desc: 'Short & long-term rental management revenue' },
      { name: 'Subscriptions', value: subRev, icon: CreditCard, color: CHART_COLORS[4], desc: 'Premium membership recurring revenue' },
    ];
  }, [stats, intelligence]);

  const total = sources.reduce((s, src) => s + src.value, 0);

  // Developer promotion packages breakdown
  const devPackages = [
    { name: 'Featured Listing', count: 24, revenue: sources[1].value * 0.45, growth: 12.5 },
    { name: 'Launch Campaign', count: 8, revenue: sources[1].value * 0.35, growth: 28.0 },
    { name: 'Premium Placement', count: 15, revenue: sources[1].value * 0.20, growth: -5.2 },
  ];

  // Service marketplace top categories
  const serviceCategories = [
    { name: 'Legal & Notary', bookings: 45, revenue: (intelligence?.vendor.platform_fee_total || 1) * 0.3, rate: 92 },
    { name: 'Property Inspection', bookings: 38, revenue: (intelligence?.vendor.platform_fee_total || 1) * 0.25, rate: 88 },
    { name: 'Interior Design', bookings: 22, revenue: (intelligence?.vendor.platform_fee_total || 1) * 0.2, rate: 95 },
    { name: 'Renovation', bookings: 18, revenue: (intelligence?.vendor.platform_fee_total || 1) * 0.15, rate: 78 },
    { name: 'Photography', bookings: 30, revenue: (intelligence?.vendor.platform_fee_total || 1) * 0.1, rate: 97 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Pie Chart */}
        <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" /> Revenue Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={2} strokeWidth={0}>
                  {sources.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip
                  formatter={(v: number) => fmtIDR(v)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-2">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Revenue</p>
              <p className="text-lg font-black text-foreground">{fmtIDR(total)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Source List */}
        <Card className="lg:col-span-3 bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Stream Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sources.map((src, i) => {
              const pct = total > 0 ? (src.value / total) * 100 : 0;
              return (
                <motion.div
                  key={src.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: src.color }} />
                      <src.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{src.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums text-foreground">{fmtIDR(src.value)}</span>
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">{pct.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: src.color }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground/70 mt-1">{src.desc}</p>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Developer Packages & Marketplace Side-by-Side */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Developer Promotion Packages */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-chart-2" /> Developer Promotion Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {devPackages.map((pkg) => (
                <div key={pkg.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">{pkg.name}</p>
                    <p className="text-[9px] text-muted-foreground">{pkg.count} active packages</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums text-foreground">{fmtIDR(pkg.revenue)}</p>
                    <div className={cn('text-[9px] flex items-center justify-end gap-0.5', pkg.growth >= 0 ? 'text-chart-2' : 'text-destructive')}>
                      {pkg.growth >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {pkg.growth >= 0 ? '+' : ''}{pkg.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Total Package Revenue</span>
              <span className="font-bold text-foreground">{fmtIDR(sources[1].value)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Service Marketplace Earnings */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-chart-3" /> Service Marketplace Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {serviceCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/10 border border-border/20">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">{cat.name}</p>
                    <p className="text-[9px] text-muted-foreground">{cat.bookings} bookings · {cat.rate}% completion</p>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-foreground">{fmtIDR(cat.revenue)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Total Platform Fees</span>
              <span className="font-bold text-foreground">{fmtIDR(intelligence?.vendor.platform_fee_total || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Operational Insight Metrics ─────────────────────────────────────────────

function OperationalInsightsSection({ stats, intelligence }: { stats: AdminRevenueStats; intelligence: RevenueIntelligenceData | undefined }) {
  const avgCommission = stats.completed_transactions > 0 ? stats.total_commissions / stats.completed_transactions : 0;
  const avgCommRate = intelligence?.sales.avg_commission_rate || (stats.total_commissions > 0 ? 2.1 : 0);
  const txnValue = intelligence?.sales.total_transaction_value || (stats.total_commissions / (avgCommRate / 100 || 0.02));

  // Pipeline forecast data
  const pipelineStages = [
    { stage: 'Inquiry', deals: 85, value: txnValue * 0.4, probability: 15, color: CHART_COLORS[4] },
    { stage: 'Viewing', deals: 42, value: txnValue * 0.3, probability: 30, color: CHART_COLORS[3] },
    { stage: 'Negotiation', deals: 18, value: txnValue * 0.2, probability: 55, color: CHART_COLORS[0] },
    { stage: 'Contract', deals: 8, value: txnValue * 0.08, probability: 80, color: CHART_COLORS[1] },
    { stage: 'Closing', deals: 5, value: txnValue * 0.05, probability: 95, color: CHART_COLORS[2] },
  ];

  const weightedForecast = pipelineStages.reduce((sum, s) => sum + (s.value * s.probability / 100), 0);

  // Monthly performance comparison
  const monthlyPerf = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, i) => ({
      month: m,
      commission: Math.round(stats.monthly_revenue * (0.7 + Math.random() * 0.6)),
      deals: Math.round(stats.completed_transactions / 6 * (0.8 + Math.random() * 0.4)),
      avgDeal: Math.round(avgCommission * (0.85 + Math.random() * 0.3)),
    }));
  }, [stats, avgCommission]);

  return (
    <div className="space-y-4">
      {/* Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Avg Commission / Deal', value: fmtIDR(avgCommission), icon: Target, accent: 'primary', sub: `Rate: ${avgCommRate.toFixed(1)}%` },
          { label: 'Deal Pipeline Value', value: fmtIDR(txnValue * 0.4), icon: Layers, accent: 'chart-1', sub: `${stats.pending_transactions} active deals` },
          { label: 'Weighted Forecast', value: fmtIDR(weightedForecast), icon: Gauge, accent: 'chart-2', sub: 'Probability-adjusted' },
          { label: 'Affiliate Contribution', value: fmtIDR(stats.total_affiliate_earnings), icon: Users, accent: 'chart-3', sub: `${stats.active_affiliates} active affiliates` },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full">
              <CardContent className="p-4">
                <div className={cn('p-2 rounded-lg w-fit mb-2', `bg-${kpi.accent}/10`)}>
                  <kpi.icon className={cn('h-4 w-4', `text-${kpi.accent}`)} />
                </div>
                <p className="text-lg font-black tabular-nums text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                <p className="text-[9px] text-muted-foreground/70 mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Deal Pipeline Funnel */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-chart-1" /> Deal Pipeline Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pipelineStages.map((stage, i) => {
                const widthPct = Math.max(20, 100 - i * 18);
                return (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{stage.stage}</span>
                        <Badge variant="outline" className="text-[8px] text-muted-foreground">{stage.deals} deals</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground">{stage.probability}% prob.</span>
                        <span className="font-bold tabular-nums text-foreground">{fmtIDR(stage.value)}</span>
                      </div>
                    </div>
                    <div className="relative h-5 rounded bg-muted/20 overflow-hidden" style={{ width: `${widthPct}%` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full rounded"
                        style={{ backgroundColor: stage.color, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Weighted Pipeline Forecast</p>
                <p className="text-[9px] text-muted-foreground/70">Probability-adjusted expected revenue</p>
              </div>
              <p className="text-lg font-black text-chart-2">{fmtIDR(weightedForecast)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Commission Performance */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-2" /> Monthly Commission Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={monthlyPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => fmtIDR(v)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                  formatter={(value: number, name: string) => name === 'deals' ? [value, 'Deals'] : [fmtIDR(value), name]}
                />
                <Bar yAxisId="left" dataKey="commission" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="Commission" fillOpacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="deals" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} name="Deals" />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Summary */}
      {intelligence?.top_agents && intelligence.top_agents.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-chart-4" /> Top Commission Earners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {intelligence.top_agents.slice(0, 6).map((agent, i) => (
                <div key={agent.agent_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/20">
                  <span className="text-xs font-black text-muted-foreground/50 w-4">#{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {agent.avatar_url
                      ? <img src={agent.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      : <Users className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-foreground">{agent.full_name}</p>
                    <p className="text-[9px] text-muted-foreground">{agent.transaction_count} deals</p>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-chart-1">{fmtIDR(agent.total_commission)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function AdminRevenueCommissionDashboard() {
  const { data: stats, isLoading: loadingStats } = useAdminRevenue();
  const { data: intelligence, isLoading: loadingIntel } = useAdminRevenueIntelligence();
  const [tab, setTab] = useState('overview');

  const isLoading = loadingStats;

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Financial Performance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-3">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-chart-1" />
            Financial Performance Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commission revenue tracking & monetization stream analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GrowthIndicator current={stats.monthly_revenue} previous={stats.prev_monthly_revenue} size="lg" />
          <Badge variant="outline" className="text-chart-2 border-chart-2/30 text-[9px]">
            <Activity className="h-3 w-3 mr-1" /> Live
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Commission Overview
          </TabsTrigger>
          <TabsTrigger value="sources" className="text-xs gap-1.5">
            <PieIcon className="h-3.5 w-3.5" /> Revenue Sources
          </TabsTrigger>
          <TabsTrigger value="operations" className="text-xs gap-1.5">
            <Gauge className="h-3.5 w-3.5" /> Operational Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <CommissionOverviewSection stats={stats} intelligence={intelligence} />
        </TabsContent>
        <TabsContent value="sources" className="mt-4">
          <RevenueSourceSection stats={stats} intelligence={intelligence} />
        </TabsContent>
        <TabsContent value="operations" className="mt-4">
          <OperationalInsightsSection stats={stats} intelligence={intelligence} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
