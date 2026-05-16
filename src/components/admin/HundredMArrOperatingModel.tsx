import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Target, TrendingUp, DollarSign, Users, Globe,
  BarChart3, Layers, Building2, Zap, Shield,
  ArrowUpRight, ChevronRight, Brain, Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

// ── Revenue Engine Data ──

const REVENUE_STREAMS = [
  { stream: 'Transaction Commissions', y1: 2.4, y2: 8.5, y3: 22, y4: 38, y5: 42, share5: 42, color: 'hsl(var(--primary))' },
  { stream: 'Investor Subscriptions', y1: 0.8, y2: 3.2, y3: 9.5, y4: 16, y5: 22, share5: 22, color: 'hsl(var(--chart-1))' },
  { stream: 'Vendor SaaS Plans', y1: 0.6, y2: 2.8, y3: 7, y4: 12, y5: 16, share5: 16, color: 'hsl(var(--chart-2))' },
  { stream: 'Premium Listings', y1: 0.3, y2: 1.5, y3: 3.5, y4: 6, y5: 8, share5: 8, color: 'hsl(var(--chart-3))' },
  { stream: 'Data Licensing', y1: 0, y2: 0.5, y3: 3, y4: 8, y5: 12, share5: 12, color: 'hsl(var(--chart-4))' },
];

const ARR_RAMP = [
  { year: 'Y1', arr: 4.1, cities: 2, investors: 4500, vendors: 420, deals: 660, phase: 'Foundation' },
  { year: 'Y2', arr: 16.5, cities: 8, investors: 22000, vendors: 1800, deals: 3600, phase: 'Acceleration' },
  { year: 'Y3', arr: 45, cities: 20, investors: 68000, vendors: 5200, deals: 12000, phase: 'Dominance' },
  { year: 'Y4', arr: 80, cities: 35, investors: 140000, vendors: 11000, deals: 28000, phase: 'Regional Scale' },
  { year: 'Y5', arr: 100, cities: 50, investors: 250000, vendors: 18000, deals: 48000, phase: 'Infrastructure' },
];

const KPI_PYRAMID = {
  top: [
    { label: 'ARR Growth Rate', target: '80-120% YoY', current: 'Tracking', icon: TrendingUp },
    { label: 'Monthly GMV', target: '$500M+ by Y5', current: 'Rp 85B', icon: DollarSign },
    { label: 'Liquidity Cycle Speed', target: '<21 days median', current: '41 days', icon: Zap },
  ],
  mid: [
    { label: 'Investor Conversion', target: '12% Pro+Elite', current: '10%', progress: 83 },
    { label: 'Vendor Retention', target: '85% annual', current: '78%', progress: 92 },
    { label: 'Listing Absorption', target: '70% in 60 days', current: '52%', progress: 74 },
    { label: 'NPS Score', target: '65+', current: '54', progress: 83 },
  ],
  base: [
    { label: 'Investor CAC', target: 'Rp 75K', current: 'Rp 95K', trend: 'improving' },
    { label: 'Vendor CAC', target: 'Rp 300K', current: 'Rp 380K', trend: 'improving' },
    { label: 'Engagement Depth', target: '8+ sessions/mo', current: '5.2', trend: 'stable' },
    { label: 'Lead Response', target: '<2 hrs', current: '4 hrs', trend: 'improving' },
    { label: 'Deal Velocity', target: '28 days', current: '41 days', trend: 'improving' },
    { label: 'Referral Rate', target: '25%', current: '18%', trend: 'stable' },
  ],
};

const TEAM_STRUCTURE = [
  {
    unit: 'City Launch Squads', headcount: '5 per city', y5Total: '150-200',
    roles: ['City GM', 'Sales Lead ×2', 'Ops Coordinator', 'Marketing Specialist'],
    kpis: ['Listings onboarded', 'Vendor density', 'Break-even timeline'],
  },
  {
    unit: 'Liquidity Intelligence', headcount: 'Central team', y5Total: '25-30',
    roles: ['Head of AI/ML', 'Data Engineers ×4', 'ML Engineers ×3', 'Analytics ×2'],
    kpis: ['Prediction accuracy', 'Signal freshness', 'Moat depth score'],
  },
  {
    unit: 'Growth Experimentation', headcount: 'Central team', y5Total: '15-20',
    roles: ['VP Growth', 'Growth Engineers ×3', 'Product Marketers ×2', 'CRO Specialist'],
    kpis: ['Experiment velocity', 'CAC reduction', 'Conversion lift'],
  },
  {
    unit: 'Monetization Cell', headcount: 'Central team', y5Total: '10-15',
    roles: ['Revenue Ops Lead', 'Pricing Analyst', 'Subscription PM', 'Finance Ops ×2'],
    kpis: ['ARPU growth', 'Take-rate optimization', 'Churn reduction'],
  },
  {
    unit: 'Investor Relations', headcount: 'Central team', y5Total: '8-10',
    roles: ['VP IR', 'Fund Relations ×2', 'Data Room Manager', 'Compliance Lead'],
    kpis: ['Institutional pipeline', 'Board reporting cadence', 'Due diligence readiness'],
  },
];

const GROWTH_PHASES = [
  {
    phase: 'Phase 1: Foundation', timeline: 'Year 1', arr: '$4.1M',
    milestones: ['2 cities profitable', '4,500 investors', '420 vendors', 'Series A closed'],
    capital: '$2-5M', burn: '$200K/mo', risk: 'PMF validation', mitigation: 'Tight city-level unit economics tracking',
  },
  {
    phase: 'Phase 2: Acceleration', timeline: 'Year 2', arr: '$16.5M',
    milestones: ['8 cities live', '22K investors', 'Data API beta', 'Series B closed'],
    capital: '$15-25M', burn: '$800K/mo', risk: 'Execution speed', mitigation: 'Playbook replication + city GM autonomy',
  },
  {
    phase: 'Phase 3: Dominance', timeline: 'Year 3', arr: '$45M',
    milestones: ['20 cities', '68K investors', 'Institutional API live', 'SEA expansion pilot'],
    capital: '$40-60M', burn: '$2.5M/mo', risk: 'Regional complexity', mitigation: 'Country-level leadership + local partnerships',
  },
  {
    phase: 'Phase 4: Regional Scale', timeline: 'Year 4', arr: '$80M',
    milestones: ['35 cities across 3 countries', '140K investors', 'Enterprise tier launched'],
    capital: '$80-120M', burn: '$5M/mo', risk: 'Margin pressure', mitigation: 'AI automation + platform leverage',
  },
  {
    phase: 'Phase 5: Infrastructure', timeline: 'Year 5', arr: '$100M',
    milestones: ['50 cities across 6 countries', '250K investors', 'IPO readiness', 'Category leadership'],
    capital: 'Cash-flow positive', burn: 'Breakeven', risk: 'Competitive response', mitigation: 'Data moat + network lock-in',
  },
];

const UNIT_ECONOMICS = [
  { metric: 'Avg Deal Value', y1: 'Rp 1.8B', y3: 'Rp 2.2B', y5: 'Rp 2.8B' },
  { metric: 'Platform Take-Rate', y1: '1.15%', y3: '1.6%', y5: '2.0%' },
  { metric: 'Revenue per Deal', y1: 'Rp 20.7M', y3: 'Rp 35.2M', y5: 'Rp 56M' },
  { metric: 'Blended CAC', y1: 'Rp 95K', y3: 'Rp 65K', y5: 'Rp 45K' },
  { metric: 'Investor LTV', y1: 'Rp 6.4M', y3: 'Rp 9.8M', y5: 'Rp 14.2M' },
  { metric: 'LTV/CAC Ratio', y1: '67×', y3: '151×', y5: '316×' },
  { metric: 'Gross Margin', y1: '62%', y3: '74%', y5: '82%' },
  { metric: 'Net Revenue Retention', y1: '115%', y3: '135%', y5: '145%' },
];

const formatCompact = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
};

const HundredMArrOperatingModel = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">$100M ARR Operating Model</h1>
          <p className="text-sm text-muted-foreground">5-year scaling roadmap · revenue engine · KPI pyramid · team structure</p>
        </div>
      </div>

      {/* Top-line Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ARR_RAMP.map(y => (
          <Card key={y.year} className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{y.year} · {y.phase}</p>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-1">${y.arr}M</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{y.cities} cities · {formatCompact(y.investors)} investors</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap">
          <TabsTrigger value="revenue" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" />Revenue Engine</TabsTrigger>
          <TabsTrigger value="kpis" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />KPI Pyramid</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Team Structure</TabsTrigger>
          <TabsTrigger value="phases" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" />Growth Phases</TabsTrigger>
          <TabsTrigger value="economics" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" />Unit Economics</TabsTrigger>
        </TabsList>

        {/* ── Revenue Engine ── */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  ARR Growth Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={ARR_RAMP}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`$${v}M`, 'ARR']}
                    />
                    <Area type="monotone" dataKey="arr" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Revenue Stream Mix (Year 5)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={REVENUE_STREAMS} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}M`} />
                    <YAxis type="category" dataKey="stream" tick={{ fontSize: 10 }} width={130} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v}M`, 'Y5 ARR']} />
                    <Bar dataKey="y5" radius={[0, 4, 4, 0]}>
                      {REVENUE_STREAMS.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stream Details */}
            <div className="lg:col-span-2 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Stream Ramp Detail ($M)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Revenue Stream</th>
                      {['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].map(y => <th key={y} className="text-right py-2 px-3 font-medium text-muted-foreground">{y}</th>)}
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Y5 Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REVENUE_STREAMS.map(s => (
                      <tr key={s.stream} className="border-b border-border/20">
                        <td className="py-2 px-3 font-medium text-foreground">{s.stream}</td>
                        <td className="text-right py-2 px-3 tabular-nums text-foreground">${s.y1}M</td>
                        <td className="text-right py-2 px-3 tabular-nums text-foreground">${s.y2}M</td>
                        <td className="text-right py-2 px-3 tabular-nums text-foreground">${s.y3}M</td>
                        <td className="text-right py-2 px-3 tabular-nums text-foreground">${s.y4}M</td>
                        <td className="text-right py-2 px-3 tabular-nums font-bold text-foreground">${s.y5}M</td>
                        <td className="text-right py-2 px-3 tabular-nums text-muted-foreground">{s.share5}%</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border/40">
                      <td className="py-2 px-3 font-bold text-foreground">Total ARR</td>
                      {[4.1, 16.5, 45, 80, 100].map((v, i) => (
                        <td key={i} className={cn("text-right py-2 px-3 tabular-nums font-bold text-foreground", i === 4 && "text-primary")}>${v}M</td>
                      ))}
                      <td className="text-right py-2 px-3 tabular-nums font-bold text-primary">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── KPI Pyramid ── */}
        <TabsContent value="kpis">
          <div className="space-y-4">
            {/* Top Tier */}
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> North Star Metrics
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {KPI_PYRAMID.top.map(k => {
                  const Icon = k.icon;
                  return (
                    <Card key={k.label} className="border-primary/20 bg-primary/[0.02]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{k.label}</span>
                        </div>
                        <p className="text-lg font-bold text-foreground tabular-nums">{k.target}</p>
                        <p className="text-[10px] text-muted-foreground">Current: {k.current}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Mid Tier */}
            <div>
              <p className="text-xs font-bold text-chart-2 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> Growth Efficiency Metrics
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {KPI_PYRAMID.mid.map(k => (
                  <Card key={k.label} className="border-border/40">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-foreground mb-1">{k.label}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={k.progress} className="h-1.5 flex-1" />
                        <span className="text-[10px] tabular-nums text-muted-foreground">{k.progress}%</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Current: {k.current}</span>
                        <span className="font-medium text-foreground">Target: {k.target}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Base Tier */}
            <div>
              <p className="text-xs font-bold text-chart-4 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Operational Foundation Metrics
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {KPI_PYRAMID.base.map(k => (
                  <Card key={k.label} className="border-border/40">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">{k.label}</p>
                        <Badge variant="outline" className={cn("text-[9px]",
                          k.trend === 'improving' ? 'text-chart-2 bg-chart-2/10 border-chart-2/20' : 'text-muted-foreground bg-muted/50'
                        )}>
                          {k.trend === 'improving' ? '↑' : '→'} {k.trend}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-1 text-[10px]">
                        <span className="text-muted-foreground">Now: {k.current}</span>
                        <span className="font-medium text-foreground">→ {k.target}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Team Structure ── */}
        <TabsContent value="team">
          <div className="space-y-3">
            {TEAM_STRUCTURE.map(t => (
              <Card key={t.unit} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-bold text-foreground">{t.unit}</h3>
                        <Badge variant="outline" className="text-[10px]">{t.headcount}</Badge>
                        <Badge variant="outline" className="text-[10px] text-chart-1 bg-chart-1/10 border-chart-1/20">Y5: {t.y5Total}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Key Roles</p>
                          <div className="space-y-0.5">
                            {t.roles.map(r => (
                              <p key={r} className="text-xs text-foreground flex items-center gap-1">
                                <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />{r}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">KPIs Owned</p>
                          <div className="space-y-0.5">
                            {t.kpis.map(k => (
                              <p key={k} className="text-xs text-foreground flex items-center gap-1">
                                <Target className="h-2.5 w-2.5 text-primary" />{k}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Year 5 Total Headcount</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'City Squads', count: '150-200', pct: '60%' },
                    { label: 'Central Engineering', count: '50-60', pct: '20%' },
                    { label: 'Central Ops', count: '35-45', pct: '12%' },
                    { label: 'Leadership + Support', count: '20-25', pct: '8%' },
                  ].map(h => (
                    <div key={h.label}>
                      <p className="text-lg font-bold tabular-nums text-foreground">{h.count}</p>
                      <p className="text-xs text-muted-foreground">{h.label} ({h.pct})</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Growth Phases ── */}
        <TabsContent value="phases">
          <div className="space-y-3">
            {GROWTH_PHASES.map((p, i) => (
              <Card key={p.phase} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center bg-primary text-primary-foreground")}>
                          {i + 1}
                        </span>
                        <h3 className="text-sm font-bold text-foreground">{p.phase}</h3>
                        <Badge variant="outline" className="text-[10px]">{p.timeline}</Badge>
                        <Badge variant="outline" className="text-[10px] text-chart-1 bg-chart-1/10 border-chart-1/20 font-bold tabular-nums">{p.arr}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Milestones</p>
                          {p.milestones.map(m => (
                            <p key={m} className="text-foreground flex items-center gap-1 mb-0.5">
                              <ArrowUpRight className="h-2.5 w-2.5 text-chart-2 flex-shrink-0" />{m}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Capital & Burn</p>
                          <p className="font-medium text-foreground">Raise: {p.capital}</p>
                          <p className="text-muted-foreground">Burn: {p.burn}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Risk & Mitigation</p>
                          <p className="font-medium text-destructive">{p.risk}</p>
                          <p className="text-muted-foreground">{p.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Unit Economics ── */}
        <TabsContent value="economics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Unit Economics Evolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Metric</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Year 1</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Year 3</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Year 5</th>
                      </tr>
                    </thead>
                    <tbody>
                      {UNIT_ECONOMICS.map(u => (
                        <tr key={u.metric} className="border-b border-border/20">
                          <td className="py-2.5 px-3 font-medium text-foreground">{u.metric}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums text-muted-foreground">{u.y1}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums text-foreground">{u.y3}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums font-bold text-foreground">{u.y5}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-chart-2" />
                  Margin Expansion Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { lever: 'AI Automation', impact: 'Reduce ops headcount per city 40%', timeline: 'Y2-3', progress: 35 },
                  { lever: 'Take-Rate Expansion', impact: '1.15% → 2.0% as value increases', timeline: 'Y1-5', progress: 58 },
                  { lever: 'Data Licensing Revenue', impact: 'Near-100% margin stream to $12M', timeline: 'Y3-5', progress: 15 },
                  { lever: 'Network Effects on CAC', impact: 'Organic share from 18% → 45%', timeline: 'Y2-4', progress: 40 },
                  { lever: 'Vendor Self-Service', impact: 'Reduce onboarding cost 60%', timeline: 'Y2-3', progress: 25 },
                ].map(l => (
                  <div key={l.lever} className="rounded-lg border border-border/30 px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{l.lever}</span>
                      <Badge variant="outline" className="text-[9px]">{l.timeline}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">{l.impact}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={l.progress} className="h-1.5 flex-1" />
                      <span className="text-[10px] tabular-nums text-muted-foreground">{l.progress}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Operating Cadence */}
            <div className="lg:col-span-2">
              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    Operating Cadence Framework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { cadence: 'Daily', items: ['Revenue flash report', 'Deal pipeline status', 'Support ticket triage', 'Lead response SLA check'] },
                      { cadence: 'Weekly', items: ['City squad standups', 'Growth experiment review', 'Vendor SLA dashboard', 'Investor funnel analysis'] },
                      { cadence: 'Monthly', items: ['ARR board report', 'Unit economics review', 'City P&L deep-dive', 'Pricing experiment results'] },
                      { cadence: 'Quarterly', items: ['OKR scoring + reset', 'Fundraise readiness check', 'Market expansion decision', 'Team structure review'] },
                    ].map(c => (
                      <div key={c.cadence} className="rounded-lg border border-border/30 px-3 py-3">
                        <p className="text-xs font-bold text-foreground mb-2">{c.cadence}</p>
                        <div className="space-y-1">
                          {c.items.map(item => (
                            <p key={item} className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <ChevronRight className="h-2 w-2 text-primary flex-shrink-0" />{item}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HundredMArrOperatingModel;
