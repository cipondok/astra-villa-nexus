import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp, Target, DollarSign, BarChart3, Layers,
  ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Gauge, Users, Building, Store
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { useRevenueForecastInsights } from '@/hooks/useRevenueForecastInsights';
import {
  projectRevenue,
  sensitivityAnalysis,
  detectHighMarginOpportunities,
  type ScenarioKey,
  type ProjectionInputs,
} from '@/utils/revenueProjectionEngine';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
};

const fmtIDR = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(0)}K`;
  return `Rp ${v}`;
};

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '11px',
  },
  labelStyle: { color: 'hsl(var(--popover-foreground))' },
};

const STREAM_COLORS = {
  transaction: 'hsl(var(--primary))',
  subscription: 'hsl(var(--chart-2))',
  premium: 'hsl(var(--chart-4))',
  vendor: 'hsl(var(--chart-5))',
};

const SCENARIO_LABELS: Record<ScenarioKey, { label: string; color: string }> = {
  conservative: { label: 'Conservative', color: 'hsl(var(--chart-3))' },
  base: { label: 'Base Case', color: 'hsl(var(--primary))' },
  aggressive: { label: 'Aggressive', color: 'hsl(var(--chart-2))' },
};

export default function RevenueProjectionModelPage() {
  const { data, isLoading } = useRevenueForecastInsights(24);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('base');
  const [overrides, setOverrides] = useState<Partial<ProjectionInputs>>({});

  // Recompute with slider overrides
  const result = useMemo(() => {
    if (!data) return null;
    const inputs = { ...data.inputs, ...overrides };
    return projectRevenue(inputs, activeScenario, 24);
  }, [data, activeScenario, overrides]);

  const sensitivity = useMemo(() => {
    if (!data) return [];
    return sensitivityAnalysis({ ...data.inputs, ...overrides }, activeScenario);
  }, [data, activeScenario, overrides]);

  const opportunities = useMemo(() => {
    if (!data || !result) return [];
    return detectHighMarginOpportunities({ ...data.inputs, ...overrides }, result);
  }, [data, result, overrides]);

  if (isLoading || !data || !result) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const monthly = result.monthly;
  const m12 = monthly[Math.min(11, monthly.length - 1)];
  const m24 = monthly[monthly.length - 1];

  const summaryCards = [
    {
      label: 'M12 ARR',
      value: fmtIDR(result.m12ARR),
      sub: `${m12.deals} deals/mo`,
      icon: TrendingUp,
      trend: result.revenueCAGR > 0 ? 'up' as const : 'down' as const,
      trendVal: `${(result.revenueCAGR * 100).toFixed(1)}% CMGR`,
    },
    {
      label: 'M12 Revenue',
      value: fmtIDR(result.m12Revenue),
      sub: `Net: ${fmtIDR(result.m12Net)}`,
      icon: DollarSign,
      trend: result.m12Net > 0 ? 'up' as const : 'down' as const,
      trendVal: result.m12Net > 0 ? 'Profitable' : 'Pre-profit',
    },
    {
      label: 'Break-Even',
      value: result.breakEven.month ? `Month ${result.breakEven.month}` : 'N/A',
      sub: result.breakEven.isProfitable ? 'Within horizon' : `Investment: ${fmtIDR(result.breakEven.cumulativeInvestment)}`,
      icon: Target,
      trend: result.breakEven.isProfitable ? 'up' as const : 'down' as const,
      trendVal: result.breakEven.isProfitable ? 'On track' : 'Extend runway',
    },
    {
      label: 'M24 Cumulative',
      value: fmtIDR(result.m24Revenue),
      sub: `${m24.subscribers} subs · ${m24.vendors} vendors`,
      icon: BarChart3,
      trend: 'up' as const,
      trendVal: `${m24.listings} listings`,
    },
  ];

  // Chart data for area chart
  const areaData = monthly.map(m => ({
    name: `M${m.month}`,
    Transaction: Math.round(m.transactionRevenue / 1e6),
    Subscription: Math.round(m.subscriptionRevenue / 1e6),
    Premium: Math.round(m.premiumRevenue / 1e6),
    Vendor: Math.round(m.vendorRevenue / 1e6),
    Total: Math.round(m.totalRevenue / 1e6),
    Net: Math.round(m.netIncome / 1e6),
  }));

  // Revenue mix at M12
  const mixData = [
    { name: 'Transactions', value: m12.transactionRevenue, color: STREAM_COLORS.transaction },
    { name: 'Subscriptions', value: m12.subscriptionRevenue, color: STREAM_COLORS.subscription },
    { name: 'Premium', value: m12.premiumRevenue, color: STREAM_COLORS.premium },
    { name: 'Vendor', value: m12.vendorRevenue, color: STREAM_COLORS.vendor },
  ];

  // Scenario comparison data
  const scenarioComparison = Array.from({ length: 24 }, (_, i) => ({
    name: `M${i + 1}`,
    conservative: Math.round((data.scenarios.conservative.monthly[i]?.totalRevenue ?? 0) / 1e6),
    base: Math.round((data.scenarios.base.monthly[i]?.totalRevenue ?? 0) / 1e6),
    aggressive: Math.round((data.scenarios.aggressive.monthly[i]?.totalRevenue ?? 0) / 1e6),
  }));

  // Sensitivity tornado data
  const tornadoVars = [...new Set(sensitivity.map(s => s.variable))];
  const tornadoData = tornadoVars.map(v => {
    const pts = sensitivity.filter(s => s.variable === v);
    const low = pts.find(p => p.variablePct === -20);
    const high = pts.find(p => p.variablePct === 20);
    return {
      variable: v,
      lowDelta: low?.deltaRevenuePct ?? 0,
      highDelta: high?.deltaRevenuePct ?? 0,
    };
  }).sort((a, b) => Math.abs(b.highDelta - b.lowDelta) - Math.abs(a.highDelta - a.lowDelta));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">
                Financial Model · Live Data
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Revenue Projection Engine</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            24-month financial forecast powered by real platform metrics — {data.inputs.activeListings} active listings,{' '}
            {data.inputs.activeSubscribers} subscribers, {(data.inputs.monthlyDealConversionRate * 100).toFixed(1)}% conversion rate.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6 space-y-6">
        {/* Summary Cards */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <motion.div key={card.label} variants={fadeSlide}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                      <p className="text-2xl font-black tabular-nums text-foreground">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.sub}</p>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                      <card.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${card.trend === 'up' ? 'text-chart-1' : 'text-destructive'}`}>
                    {card.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {card.trendVal}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projection" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="projection">Revenue Projection</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
          </TabsList>

          {/* ── Projection Tab ── */}
          <TabsContent value="projection" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">24-Month Revenue Trajectory (Rp M)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="txnGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={STREAM_COLORS.transaction} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={STREAM_COLORS.transaction} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={STREAM_COLORS.subscription} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={STREAM_COLORS.subscription} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [`Rp ${v}M`, '']} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="Transaction" stackId="1" stroke={STREAM_COLORS.transaction} fill="url(#txnGrad)" />
                      <Area type="monotone" dataKey="Subscription" stackId="1" stroke={STREAM_COLORS.subscription} fill="url(#subGrad)" />
                      <Area type="monotone" dataKey="Premium" stackId="1" stroke={STREAM_COLORS.premium} fill={STREAM_COLORS.premium} fillOpacity={0.15} />
                      <Area type="monotone" dataKey="Vendor" stackId="1" stroke={STREAM_COLORS.vendor} fill={STREAM_COLORS.vendor} fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">M12 Revenue Mix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={mixData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                          {mixData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip {...tooltipStyle} formatter={(v: number) => [fmtIDR(v), '']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1 mt-2">
                      {mixData.map(m => (
                        <div key={m.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                            <span className="text-muted-foreground">{m.name}</span>
                          </div>
                          <span className="font-medium tabular-nums text-foreground">
                            {m12.totalRevenue > 0 ? `${Math.round((m.value / m12.totalRevenue) * 100)}%` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Net Income Trajectory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={areaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip {...tooltipStyle} formatter={(v: number) => [`Rp ${v}M`, '']} />
                        <Bar dataKey="Net" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Scenarios Tab ── */}
          <TabsContent value="scenarios" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Scenario Comparison — Total Revenue (Rp M)</CardTitle>
                  <div className="flex gap-2">
                    {(Object.entries(SCENARIO_LABELS) as [ScenarioKey, typeof SCENARIO_LABELS.base][]).map(([key, meta]) => (
                      <Badge
                        key={key}
                        variant={activeScenario === key ? 'default' : 'outline'}
                        className="cursor-pointer text-[10px]"
                        onClick={() => setActiveScenario(key)}
                      >
                        {meta.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart data={scenarioComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip {...tooltipStyle} formatter={(v: number) => [`Rp ${v}M`, '']} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="conservative" stroke={SCENARIO_LABELS.conservative.color} strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                    <Line type="monotone" dataKey="base" stroke={SCENARIO_LABELS.base.color} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="aggressive" stroke={SCENARIO_LABELS.aggressive.color} strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.entries(data.scenarios) as [ScenarioKey, typeof data.scenarios.base][]).map(([key, s]) => (
                <Card key={key} className={key === activeScenario ? 'ring-1 ring-primary/40' : ''}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{SCENARIO_LABELS[key].label}</Badge>
                      {s.breakEven.isProfitable
                        ? <ShieldCheck className="h-4 w-4 text-chart-1" />
                        : <AlertTriangle className="h-4 w-4 text-chart-3" />}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">M12 ARR</span><span className="font-semibold tabular-nums">{fmtIDR(s.m12ARR)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">M12 Net</span><span className="font-semibold tabular-nums">{fmtIDR(s.m12Net)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Break-even</span><span className="font-semibold tabular-nums">{s.breakEven.month ? `Month ${s.breakEven.month}` : '—'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">M24 Total</span><span className="font-semibold tabular-nums">{fmtIDR(s.m24Revenue)}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Sensitivity Tab ── */}
          <TabsContent value="sensitivity" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Revenue Sensitivity — ±20% Variable Change Impact on M12 Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tornadoData.map(t => {
                    const maxRange = Math.max(...tornadoData.map(d => Math.abs(d.highDelta - d.lowDelta)));
                    const barScale = maxRange > 0 ? 100 / maxRange : 1;
                    const lowWidth = Math.abs(t.lowDelta) * barScale;
                    const highWidth = Math.abs(t.highDelta) * barScale;

                    return (
                      <div key={t.variable} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-36 text-right shrink-0">{t.variable}</span>
                        <div className="flex-1 flex items-center gap-0.5">
                          <div className="flex-1 flex justify-end">
                            <div
                              className="h-5 bg-destructive/30 rounded-l"
                              style={{ width: `${lowWidth}%` }}
                            />
                          </div>
                          <div className="w-px h-6 bg-border shrink-0" />
                          <div className="flex-1">
                            <div
                              className="h-5 bg-chart-1/30 rounded-r"
                              style={{ width: `${highWidth}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-24 shrink-0">
                          {t.lowDelta > 0 ? '+' : ''}{t.lowDelta.toFixed(1)}% / +{t.highDelta.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-4">
                  Red bars = -20% variable reduction impact · Green bars = +20% variable increase impact
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Opportunities Tab ── */}
          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map(opp => (
                <Card key={opp.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{opp.stream}</Badge>
                      <span className="text-xs font-bold text-chart-1 tabular-nums">{opp.margin}% margin</span>
                    </div>
                    <p className="text-sm text-foreground font-medium">{opp.rationale}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Current: <span className="font-semibold text-foreground tabular-nums">{fmtIDR(opp.currentRevenue)}</span></span>
                      <ArrowUpRight className="h-3 w-3 text-chart-1" />
                      <span>Potential: <span className="font-semibold text-foreground tabular-nums">{fmtIDR(opp.potentialRevenue)}</span></span>
                      <span className="text-chart-1 font-semibold">+{opp.upliftPct}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Simulator Tab ── */}
          <TabsContent value="simulator" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Dynamic Recalibration — Adjust Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SimSlider
                    label="Active Listings"
                    icon={Building}
                    value={overrides.activeListings ?? data.inputs.activeListings}
                    min={10} max={5000} step={10}
                    format={(v) => v.toString()}
                    onChange={(v) => setOverrides(p => ({ ...p, activeListings: v }))}
                  />
                  <SimSlider
                    label="Conversion Rate"
                    icon={Target}
                    value={Math.round((overrides.monthlyDealConversionRate ?? data.inputs.monthlyDealConversionRate) * 1000) / 10}
                    min={0.5} max={12} step={0.1}
                    format={(v) => `${v}%`}
                    onChange={(v) => setOverrides(p => ({ ...p, monthlyDealConversionRate: v / 100 }))}
                  />
                  <SimSlider
                    label="Commission %"
                    icon={DollarSign}
                    value={Math.round((overrides.commissionPct ?? data.inputs.commissionPct) * 1000) / 10}
                    min={0.5} max={3} step={0.1}
                    format={(v) => `${v}%`}
                    onChange={(v) => setOverrides(p => ({ ...p, commissionPct: v / 100 }))}
                  />
                  <SimSlider
                    label="Subscribers"
                    icon={Users}
                    value={overrides.activeSubscribers ?? data.inputs.activeSubscribers}
                    min={0} max={2000} step={5}
                    format={(v) => v.toString()}
                    onChange={(v) => setOverrides(p => ({ ...p, activeSubscribers: v }))}
                  />
                  <SimSlider
                    label="Active Vendors"
                    icon={Store}
                    value={overrides.activeVendors ?? data.inputs.activeVendors}
                    min={0} max={1000} step={5}
                    format={(v) => v.toString()}
                    onChange={(v) => setOverrides(p => ({ ...p, activeVendors: v }))}
                  />
                  <SimSlider
                    label="Fixed Costs (M)"
                    icon={Gauge}
                    value={Math.round((overrides.monthlyFixedCosts ?? data.inputs.monthlyFixedCosts) / 1e6)}
                    min={10} max={200} step={5}
                    format={(v) => `Rp ${v}M`}
                    onChange={(v) => setOverrides(p => ({ ...p, monthlyFixedCosts: v * 1e6 }))}
                  />
                </div>

                {result && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
                    <MiniKPI label="M12 ARR" value={fmtIDR(result.m12ARR)} />
                    <MiniKPI label="M12 Net" value={fmtIDR(result.m12Net)} positive={result.m12Net > 0} />
                    <MiniKPI label="Break-Even" value={result.breakEven.month ? `M${result.breakEven.month}` : '—'} />
                    <MiniKPI label="M24 Revenue" value={fmtIDR(result.m24Revenue)} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function SimSlider({
  label, icon: Icon, value, min, max, step, format, onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground">{format(value)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="cursor-pointer"
      />
    </div>
  );
}

function MiniKPI({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="text-center space-y-1 p-3 rounded-lg bg-muted/30">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className={`text-lg font-black tabular-nums ${positive === false ? 'text-destructive' : positive ? 'text-chart-1' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
