import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Star, Zap, Crown,
  Eye, MessageSquare, Calendar, Users, CreditCard, BarChart3, RefreshCcw,
  AlertTriangle, ChevronRight, Target, Sparkles, Activity, ShieldCheck,
  Phone, CheckCircle2, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line
} from 'recharts';

// ── Mock Data ──

const DAILY_REVENUE = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  revenue: Math.round(800000 + Math.random() * 2400000),
  upgrades: Math.round(2 + Math.random() * 6),
}));

const WEEKLY_TREND = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  revenue: Math.round(12000000 + Math.random() * 8000000 + i * 1200000),
  upgrades: Math.round(8 + Math.random() * 12 + i * 1.5),
}));

const UPLIFT_DATA = [
  { metric: 'Views', free: 120, premium: 480, uplift: 300 },
  { metric: 'Inquiries', free: 8, premium: 32, uplift: 300 },
  { metric: 'Viewings', free: 3, premium: 14, uplift: 367 },
  { metric: 'Avg Days to Close', free: 45, premium: 18, uplift: -60 },
];

const UPLIFT_MONTHLY = Array.from({ length: 6 }, (_, i) => ({
  month: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i],
  views: 180 + i * 42 + Math.round(Math.random() * 30),
  inquiries: 220 + i * 38 + Math.round(Math.random() * 25),
  bookings: 250 + i * 55 + Math.round(Math.random() * 35),
}));

const UPSELL_PIPELINE = [
  { stage: 'Sellers Contacted', count: 342, icon: Phone, color: 'text-chart-2', value: 0 },
  { stage: 'Considering Upgrade', count: 128, icon: Eye, color: 'text-primary', value: 0 },
  { stage: 'Negotiating Package', count: 48, icon: MessageSquare, color: 'text-chart-3', value: 0 },
  { stage: 'Upgrade Completed', count: 22, icon: CheckCircle2, color: 'text-chart-1', value: 86400000 },
];

interface PricingPkg {
  name: string;
  icon: React.ElementType;
  price: string;
  priceNum: number;
  activeSellers: number;
  revenue30d: number;
  shareOfRevenue: number;
  viewsBoost: string;
  inquiryBoost: string;
  featured: boolean;
}

const PACKAGES: PricingPkg[] = [
  { name: 'Basic Boost', icon: Zap, price: 'Rp 250K', priceNum: 250000, activeSellers: 186, revenue30d: 46500000, shareOfRevenue: 18.2, viewsBoost: '+80%', inquiryBoost: '+45%', featured: false },
  { name: 'Featured Listing', icon: Star, price: 'Rp 750K', priceNum: 750000, activeSellers: 124, revenue30d: 93000000, shareOfRevenue: 36.4, viewsBoost: '+220%', inquiryBoost: '+180%', featured: true },
  { name: 'District Spotlight', icon: Target, price: 'Rp 1.5M', priceNum: 1500000, activeSellers: 52, revenue30d: 78000000, shareOfRevenue: 30.5, viewsBoost: '+350%', inquiryBoost: '+280%', featured: false },
  { name: 'Homepage Hero', icon: Crown, price: 'Rp 3M', priceNum: 3000000, activeSellers: 12, revenue30d: 36000000, shareOfRevenue: 14.1, viewsBoost: '+500%', inquiryBoost: '+420%', featured: false },
];

const SUBSCRIPTION_DATA = {
  active: 284,
  mrr: 142000000,
  mrrGrowth: 14.2,
  churnRate: 3.8,
  churnRisk: 18,
  renewalScore: 82,
  avgLifetime: 8.4,
};

const MRR_TREND = Array.from({ length: 12 }, (_, i) => ({
  month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i],
  mrr: Math.round(68000000 + i * 7200000 + Math.random() * 4000000),
  churn: Math.round(3 + Math.random() * 3),
}));

const fmt = (v: number) => {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}K`;
  return `Rp ${v}`;
};

// ── Component ──

const PremiumListingsMonetization = () => {
  const todayRevenue = DAILY_REVENUE.reduce((s, d) => s + d.revenue, 0);
  const todayUpgrades = DAILY_REVENUE.reduce((s, d) => s + d.upgrades, 0);
  const avgPkgValue = Math.round(todayRevenue / Math.max(1, todayUpgrades));
  const conversionRate = 6.4;

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-chart-2" />
          <div>
            <h2 className="text-base font-bold text-foreground">Premium Listings Monetization</h2>
            <p className="text-[10px] text-muted-foreground">Revenue optimization & upsell intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[8px] h-5 text-chart-1 border-chart-1/20 gap-1">
            <Activity className="h-2.5 w-2.5" />LIVE
          </Badge>
          <Button variant="default" size="sm" className="h-7 text-[10px] gap-1">
            <Sparkles className="h-3 w-3" />Campaign Builder
          </Button>
        </div>
      </div>

      {/* ── KPI STRIP: Today's Premium Sales ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Listings Upgraded Today', value: todayUpgrades.toString(), icon: Star, delta: '+8 vs yesterday', up: true, accent: 'text-chart-2' },
          { label: 'Revenue Today', value: fmt(todayRevenue), icon: DollarSign, delta: '+22% vs avg', up: true, accent: 'text-chart-1' },
          { label: 'Avg Package Value', value: fmt(avgPkgValue), icon: CreditCard, delta: '+5% trend', up: true, accent: 'text-primary' },
          { label: 'Free → Premium Conv.', value: `${conversionRate}%`, icon: TrendingUp, delta: '+0.8% this week', up: true, accent: 'text-chart-3' },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/30 hover:border-border/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10")}>
                  <kpi.icon className={cn("h-4 w-4", kpi.accent)} />
                </div>
                <span className={cn("text-[8px] flex items-center gap-0.5 tabular-nums", kpi.up ? "text-chart-1" : "text-destructive")}>
                  {kpi.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {kpi.delta}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* LEFT */}
        <div className="space-y-4">
          {/* Revenue Chart */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-chart-1" />
                Weekly Revenue Trend
                <Badge variant="outline" className="text-[7px] h-4 ml-auto">7 days</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={WEEKLY_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={48}
                    tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }}
                    formatter={(v: number) => [fmt(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill="url(#gRev)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Premium Performance Analytics */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-chart-2" />
                Premium Performance Uplift
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {UPLIFT_DATA.map((u, i) => (
                  <motion.div key={u.metric} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="border-border/15">
                      <CardContent className="p-2.5 text-center">
                        <p className="text-[8px] text-muted-foreground mb-1">{u.metric}</p>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div>
                            <p className="text-[7px] text-muted-foreground">Free</p>
                            <p className="text-[10px] font-semibold text-foreground tabular-nums">{u.free}</p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-chart-1" />
                          <div>
                            <p className="text-[7px] text-chart-1">Premium</p>
                            <p className="text-[10px] font-bold text-chart-1 tabular-nums">{u.premium}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[6px] h-3.5",
                          u.uplift > 0 ? "text-chart-1 border-chart-1/20" : "text-chart-1 border-chart-1/20"
                        )}>
                          {u.uplift > 0 ? '+' : ''}{u.uplift}% uplift
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={UPLIFT_MONTHLY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Views Uplift %" />
                  <Line type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Inquiry Uplift %" />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Booking Uplift %" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2">
                {[{ label: 'Views', color: 'bg-chart-1' }, { label: 'Inquiries', color: 'bg-chart-2' }, { label: 'Bookings', color: 'bg-chart-3' }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-4 rounded-sm", l.color)} />
                    <span className="text-[8px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Package Performance */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Package Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20">
                      {['Package', 'Price', 'Active', '30d Revenue', 'Share', 'Views ↑', 'Inquiries ↑'].map(h => (
                        <th key={h} className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider py-2 px-2 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PACKAGES.map((pkg, i) => (
                      <motion.tr key={pkg.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={cn("border-b border-border/10 hover:bg-muted/5 transition-colors", pkg.featured && "bg-chart-2/[0.03]")}>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center",
                              i === 0 ? "bg-primary/10" : i === 1 ? "bg-chart-2/10" : i === 2 ? "bg-chart-3/10" : "bg-chart-1/10"
                            )}>
                              <pkg.icon className={cn("h-3.5 w-3.5",
                                i === 0 ? "text-primary" : i === 1 ? "text-chart-2" : i === 2 ? "text-chart-3" : "text-chart-1"
                              )} />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-foreground">{pkg.name}</p>
                              {pkg.featured && <Badge variant="outline" className="text-[5px] h-3 text-chart-2 border-chart-2/20">BEST SELLER</Badge>}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[10px] font-semibold tabular-nums text-foreground">{pkg.price}</td>
                        <td className="py-2.5 px-2 text-[10px] tabular-nums text-foreground">{pkg.activeSellers}</td>
                        <td className="py-2.5 px-2 text-[10px] tabular-nums text-foreground">{fmt(pkg.revenue30d)}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-muted/15 overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${pkg.shareOfRevenue}%` }} />
                            </div>
                            <span className="text-[9px] tabular-nums font-semibold text-foreground">{pkg.shareOfRevenue}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">{pkg.viewsBoost}</Badge>
                        </td>
                        <td className="py-2.5 px-2">
                          <Badge variant="outline" className="text-[7px] h-4 text-chart-2 border-chart-2/20">{pkg.inquiryBoost}</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT Column */}
        <div className="space-y-4">
          {/* Seller Upsell Pipeline */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <Target className="h-3 w-3 text-chart-2" />
                Seller Upsell Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-2">
              {UPSELL_PIPELINE.map((step, i) => {
                const convRate = i > 0 ? ((step.count / UPSELL_PIPELINE[i - 1].count) * 100).toFixed(0) : '100';
                return (
                  <motion.div key={step.stage} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/15 hover:border-border/30 transition-colors">
                      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center bg-card")}>
                        <step.icon className={cn("h-3.5 w-3.5", step.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-foreground">{step.stage}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-bold tabular-nums text-foreground">{step.count}</span>
                          {i > 0 && <Badge variant="outline" className="text-[5px] h-3 px-1 text-chart-2">{convRate}% conv</Badge>}
                        </div>
                      </div>
                    </div>
                    {i < UPSELL_PIPELINE.length - 1 && (
                      <div className="flex justify-center my-0.5">
                        <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/30 rotate-90" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div className="pt-2 border-t border-border/15 text-center">
                <p className="text-lg font-bold text-chart-1 tabular-nums">{((22 / 342) * 100).toFixed(1)}%</p>
                <p className="text-[7px] text-muted-foreground">Overall pipeline conversion</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Tracker */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <RefreshCcw className="h-3 w-3 text-primary" />
                Recurring Subscription Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-3">
              {/* MRR gauge */}
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground tabular-nums">{fmt(SUBSCRIPTION_DATA.mrr)}</p>
                <p className="text-[8px] text-muted-foreground">Monthly Recurring Revenue</p>
                <span className="text-[8px] text-chart-1 flex items-center justify-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5" />+{SUBSCRIPTION_DATA.mrrGrowth}% growth
                </span>
              </div>

              {/* Mini KPIs */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: 'Active Subscriptions', v: SUBSCRIPTION_DATA.active.toString(), accent: 'text-primary' },
                  { l: 'Avg Lifetime', v: `${SUBSCRIPTION_DATA.avgLifetime} mo`, accent: 'text-chart-2' },
                  { l: 'Churn Rate', v: `${SUBSCRIPTION_DATA.churnRate}%`, accent: 'text-destructive' },
                  { l: 'Renewal AI Score', v: `${SUBSCRIPTION_DATA.renewalScore}/100`, accent: 'text-chart-1' },
                ].map((m, i) => (
                  <div key={i} className="px-2 py-1.5 rounded-lg border border-border/15 bg-card/50 text-center">
                    <p className={cn("text-sm font-bold tabular-nums", m.accent)}>{m.v}</p>
                    <p className="text-[7px] text-muted-foreground">{m.l}</p>
                  </div>
                ))}
              </div>

              {/* Churn alert */}
              {SUBSCRIPTION_DATA.churnRisk > 10 && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-destructive/5 border border-destructive/15">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <div>
                    <p className="text-[9px] font-semibold text-destructive">{SUBSCRIPTION_DATA.churnRisk} vendors at risk</p>
                    <p className="text-[7px] text-muted-foreground">Low engagement score detected</p>
                  </div>
                </div>
              )}

              {/* MRR Trend */}
              <div>
                <p className="text-[8px] text-muted-foreground mb-1">MRR Growth (12 months)</p>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={MRR_TREND} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#gMrr)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Renewal probability bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-muted-foreground">AI Renewal Probability</span>
                  <span className="text-[8px] font-bold tabular-nums text-chart-1">{SUBSCRIPTION_DATA.renewalScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/15 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-chart-1"
                    initial={{ width: 0 }} animate={{ width: `${SUBSCRIPTION_DATA.renewalScore}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumListingsMonetization;
