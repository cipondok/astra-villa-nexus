import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp, Users, Store, DollarSign, Briefcase,
  Target, Zap, BarChart3, Percent, Clock, Layers,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Activity,
  SlidersHorizontal, PieChart as PieChartIcon, LineChart as LineChartIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';

/* ── Animation ── */

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

/* ── Formatting ── */

const formatRp = (v: number) => `Rp${(v / 1000).toFixed(0)}k`;
const formatRpFull = (v: number) => {
  if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `Rp${(v / 1000).toFixed(0)}k`;
  return `Rp${v}`;
};

/* ── Tooltip Styles ── */

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

/* ── Segment Model Types ── */

interface ChannelRow {
  channel: string;
  cac: number;
  mix: number; // percent 0-100
}

interface SegmentModel {
  key: string;
  label: string;
  icon: React.ElementType;
  accentBorder: string;
  accentBadge: string;
  channels: ChannelRow[];
  blendedCac: number;
  arpu: number;
  retentionMonths: number;
  subscriptionLtv: number;
  additionalLtvLabel: string;
  additionalLtv: number;
  totalLtv: number;
  ltvCacRatio: number;
  paybackMonths: number;
  verdict: string;
}

/* ── Static segment data ── */

const BASE_SEGMENTS: SegmentModel[] = [
  {
    key: 'investor', label: 'Investor', icon: Users,
    accentBorder: 'border-l-primary', accentBadge: 'bg-primary/10 text-primary border-primary/20',
    channels: [
      { channel: 'Paid Ads', cac: 180_000, mix: 30 },
      { channel: 'Organic / SEO', cac: 40_000, mix: 50 },
      { channel: 'Referral', cac: 25_000, mix: 20 },
    ],
    blendedCac: 95_000,
    arpu: 180_000,
    retentionMonths: 20,
    subscriptionLtv: 3_600_000,
    additionalLtvLabel: 'Deal contribution LTV',
    additionalLtv: 2_800_000,
    totalLtv: 6_400_000,
    ltvCacRatio: 67,
    paybackMonths: 0.53,
    verdict: 'Exceptional — organic-heavy mix creates near-zero marginal cost at scale',
  },
  {
    key: 'agent', label: 'Agent', icon: Briefcase,
    accentBorder: 'border-l-chart-4', accentBadge: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    channels: [
      { channel: 'Field Sales', cac: 320_000, mix: 40 },
      { channel: 'WhatsApp Outreach', cac: 85_000, mix: 35 },
      { channel: 'Agent Referral', cac: 50_000, mix: 25 },
    ],
    blendedCac: 170_000,
    arpu: 299_000,
    retentionMonths: 18,
    subscriptionLtv: 5_382_000,
    additionalLtvLabel: 'Commission share LTV',
    additionalLtv: 3_200_000,
    totalLtv: 8_582_000,
    ltvCacRatio: 50,
    paybackMonths: 0.57,
    verdict: 'Strong — CRM stickiness + deal commissions create compounding returns',
  },
  {
    key: 'vendor', label: 'Vendor', icon: Store,
    accentBorder: 'border-l-chart-2', accentBadge: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    channels: [
      { channel: 'Sales Rep Outreach', cac: 450_000, mix: 45 },
      { channel: 'Digital Funnel', cac: 250_000, mix: 30 },
      { channel: 'Events / Partnerships', cac: 600_000, mix: 25 },
    ],
    blendedCac: 380_000,
    arpu: 620_000,
    retentionMonths: 16,
    subscriptionLtv: 9_920_000,
    additionalLtvLabel: 'Lead commission LTV',
    additionalLtv: 4_500_000,
    totalLtv: 14_400_000,
    ltvCacRatio: 38,
    paybackMonths: 0.61,
    verdict: 'Validated — high ARPU compensates for higher acquisition cost',
  },
];

/* ── Compute blended CAC from channels ── */

function computeBlendedCac(channels: ChannelRow[]): number {
  const total = channels.reduce((s, ch) => s + (ch.cac * ch.mix / 100), 0);
  return Math.round(total);
}

function computeLtv(arpu: number, retentionMonths: number, additionalLtv: number): number {
  return arpu * retentionMonths + additionalLtv;
}

/* ── Live Data Hook ── */

function useLiveCacMetrics() {
  return useQuery({
    queryKey: ['cac-ltv-live-metrics'],
    queryFn: async () => {
      const d30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const d60 = new Date(Date.now() - 60 * 86400000).toISOString();

      const [analyticsRes, subsRes, commissionsRes, profilesRes] = await Promise.all([
        supabase.from('acquisition_analytics').select('channel, spend, conversions, revenue').gte('date', d30.split('T')[0]),
        supabase.from('user_subscriptions').select('id, status', { count: 'exact' }).eq('status', 'active'),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d30),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', d30),
      ]);

      const analytics = analyticsRes.data ?? [];
      const totalSpend = analytics.reduce((s, a) => s + (a.spend ?? 0), 0);
      const totalConversions = analytics.reduce((s, a) => s + (a.conversions ?? 0), 0);
      const totalRevenue = analytics.reduce((s, a) => s + (a.revenue ?? 0), 0);
      const liveCpa = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : 0;
      const activeSubs = subsRes.count ?? 0;
      const commissions = commissionsRes.data ?? [];
      const totalComm = commissions.reduce((s, c) => s + (c.commission_amount ?? 0), 0);
      const newUsers = profilesRes.count ?? 0;

      // Channel breakdown
      const channelMap = new Map<string, { spend: number; conversions: number }>();
      for (const a of analytics) {
        const ch = a.channel || 'direct';
        const e = channelMap.get(ch) ?? { spend: 0, conversions: 0 };
        channelMap.set(ch, { spend: e.spend + (a.spend ?? 0), conversions: e.conversions + (a.conversions ?? 0) });
      }
      const channelCpas = Array.from(channelMap.entries()).map(([name, d]) => ({
        name: name.length > 12 ? name.substring(0, 12) + '…' : name,
        cpa: d.conversions > 0 ? Math.round(d.spend / d.conversions) : 0,
        conversions: d.conversions,
        spend: d.spend,
      })).sort((a, b) => b.conversions - a.conversions).slice(0, 6);

      return {
        totalSpend, totalConversions, totalRevenue, liveCpa,
        activeSubs, totalComm, newUsers, channelCpas,
        roas: totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 10) / 10 : 0,
      };
    },
    staleTime: 60_000,
  });
}

/* ── Segment Model Card ── */

function ModelCard({ model }: { model: SegmentModel }) {
  const cacPct = Math.min(100, (model.blendedCac / model.totalLtv) * 100);
  const Icon = model.icon;

  return (
    <motion.div variants={fadeSlide}>
      <Card className={cn('border-border/50 border-l-4 h-full', model.accentBorder)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
              <Icon className="h-4.5 w-4.5 text-foreground" />
            </div>
            <div>
              <Badge variant="outline" className={cn('text-[9px] font-mono', model.accentBadge)}>
                {model.label} Side
              </Badge>
              <CardTitle className="text-base mt-0.5">
                LTV / CAC = {model.ltvCacRatio}×
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Acquisition Channels */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Acquisition Channels
            </span>
            <div className="space-y-1.5">
              {model.channels.map((ch) => (
                <div key={ch.channel} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground">{ch.channel}</span>
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">{ch.mix}% mix</Badge>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{formatRp(ch.cac)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Target className="h-3 w-3 text-primary" />Blended CAC
              </span>
              <span className="text-sm font-bold font-mono text-primary">{formatRp(model.blendedCac)}</span>
            </div>
          </div>

          {/* LTV Build-up */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              LTV Construction
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-0.5">
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />ARPU
                </span>
                <span className="text-sm font-bold font-mono text-foreground">{formatRp(model.arpu)}/mo</span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-0.5">
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />Retention
                </span>
                <span className="text-sm font-bold font-mono text-foreground">{model.retentionMonths}mo</span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-0.5">
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" />Payback
                </span>
                <span className="text-sm font-bold font-mono text-foreground">{model.paybackMonths < 1 ? `${Math.round(model.paybackMonths * 30)}d` : `${model.paybackMonths.toFixed(1)}mo`}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Subscription LTV</span>
                <span className="font-mono text-foreground">{formatRpFull(model.subscriptionLtv)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{model.additionalLtvLabel}</span>
                <span className="font-mono text-foreground">{formatRpFull(model.additionalLtv)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-foreground">Total LTV</span>
                <span className="font-mono text-primary font-bold">{formatRpFull(model.totalLtv)}</span>
              </div>
            </div>
          </div>

          {/* CAC Recovery bar */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              CAC Recovery Visual
            </span>
            <div className="relative">
              <Progress value={cacPct} className="h-3" />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">CAC {cacPct.toFixed(1)}%</span>
                <span className="text-[9px] text-primary">Margin {(100 - cacPct).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="p-2.5 rounded-lg bg-chart-1/5 border border-chart-1/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-chart-1">Assessment</span>
            <p className="text-xs text-foreground mt-0.5">{model.verdict}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Scenario Simulator ── */

function ScenarioSimulator() {
  const [paidMix, setPaidMix] = useState(30);
  const [organicMix, setOrganicMix] = useState(50);
  const [arpuMultiplier, setArpuMultiplier] = useState(100);
  const [retentionMultiplier, setRetentionMultiplier] = useState(100);
  const [budgetMultiplier, setBudgetMultiplier] = useState(100);

  const referralMix = Math.max(0, 100 - paidMix - organicMix);

  const simulated = useMemo(() => {
    const base = BASE_SEGMENTS[0]; // Investor
    const channels: ChannelRow[] = [
      { channel: 'Paid Ads', cac: Math.round(base.channels[0].cac * budgetMultiplier / 100), mix: paidMix },
      { channel: 'Organic / SEO', cac: base.channels[1].cac, mix: organicMix },
      { channel: 'Referral', cac: base.channels[2].cac, mix: referralMix },
    ];
    const blendedCac = computeBlendedCac(channels);
    const arpu = Math.round(base.arpu * arpuMultiplier / 100);
    const retention = Math.round(base.retentionMonths * retentionMultiplier / 100);
    const subLtv = arpu * retention;
    const addLtv = Math.round(base.additionalLtv * retentionMultiplier / 100);
    const totalLtv = subLtv + addLtv;
    const ratio = blendedCac > 0 ? Math.round(totalLtv / blendedCac) : 0;
    const payback = arpu > 0 ? blendedCac / arpu : 0;

    return { channels, blendedCac, arpu, retention, subLtv, addLtv, totalLtv, ratio, payback };
  }, [paidMix, organicMix, referralMix, arpuMultiplier, retentionMultiplier, budgetMultiplier]);

  // Payback curve data (monthly cumulative revenue vs CAC)
  const paybackCurve = useMemo(() => {
    const points = [];
    for (let m = 0; m <= 24; m++) {
      const cumRev = simulated.arpu * m;
      points.push({
        month: m,
        revenue: cumRev,
        cac: simulated.blendedCac,
      });
    }
    return points;
  }, [simulated]);

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="space-y-4">
      <motion.div variants={fadeSlide}>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Scenario Simulator — Investor Segment
            </CardTitle>
            <CardDescription className="text-xs">
              Adjust channel mix, pricing, and retention to see real-time impact on unit economics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sliders */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Paid Ads Mix</span>
                  <span className="text-xs font-mono text-foreground">{paidMix}%</span>
                </div>
                <Slider value={[paidMix]} onValueChange={([v]) => setPaidMix(Math.min(v, 100 - organicMix > 0 ? 100 - 5 : 95))} min={0} max={Math.min(80, 100 - organicMix)} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Organic Mix</span>
                  <span className="text-xs font-mono text-foreground">{organicMix}%</span>
                </div>
                <Slider value={[organicMix]} onValueChange={([v]) => setOrganicMix(Math.min(v, 100 - paidMix))} min={0} max={Math.min(80, 100 - paidMix)} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Referral Mix</span>
                  <span className="text-xs font-mono text-foreground">{referralMix}%</span>
                </div>
                <div className="h-5 flex items-center">
                  <Badge variant="outline" className="text-[9px] text-muted-foreground">Auto-balanced</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">ARPU Change</span>
                  <span className="text-xs font-mono text-foreground">{arpuMultiplier}%</span>
                </div>
                <Slider value={[arpuMultiplier]} onValueChange={([v]) => setArpuMultiplier(v)} min={50} max={200} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Retention Change</span>
                  <span className="text-xs font-mono text-foreground">{retentionMultiplier}%</span>
                </div>
                <Slider value={[retentionMultiplier]} onValueChange={([v]) => setRetentionMultiplier(v)} min={50} max={200} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Paid CAC Pressure</span>
                  <span className="text-xs font-mono text-foreground">{budgetMultiplier}%</span>
                </div>
                <Slider value={[budgetMultiplier]} onValueChange={([v]) => setBudgetMultiplier(v)} min={50} max={200} step={5} />
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Blended CAC', value: formatRp(simulated.blendedCac),
                  delta: simulated.blendedCac - BASE_SEGMENTS[0].blendedCac,
                  isLowerBetter: true,
                },
                {
                  label: 'Total LTV', value: formatRpFull(simulated.totalLtv),
                  delta: simulated.totalLtv - BASE_SEGMENTS[0].totalLtv,
                  isLowerBetter: false,
                },
                {
                  label: 'LTV / CAC', value: `${simulated.ratio}×`,
                  delta: simulated.ratio - BASE_SEGMENTS[0].ltvCacRatio,
                  isLowerBetter: false,
                },
                {
                  label: 'Payback', value: simulated.payback < 1 ? `${Math.round(simulated.payback * 30)}d` : `${simulated.payback.toFixed(1)}mo`,
                  delta: simulated.payback - BASE_SEGMENTS[0].paybackMonths,
                  isLowerBetter: true,
                },
              ].map((kpi) => {
                const isGood = kpi.isLowerBetter ? kpi.delta <= 0 : kpi.delta >= 0;
                return (
                  <Card key={kpi.label} className="border-border/50">
                    <CardContent className="p-3 space-y-0.5">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                      <div className="text-lg font-bold font-mono text-foreground">{kpi.value}</div>
                      <div className={cn('text-[9px] font-mono flex items-center gap-0.5', isGood ? 'text-chart-1' : 'text-destructive')}>
                        {isGood ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {kpi.delta > 0 ? '+' : ''}{typeof kpi.delta === 'number' && Math.abs(kpi.delta) > 1000 ? formatRpFull(Math.abs(kpi.delta)) : kpi.delta.toFixed(1)} vs base
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Payback Curve */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                CAC Payback Curve
              </span>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={paybackCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Month', position: 'insideBottom', offset: -2, fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => formatRp(v)} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => formatRpFull(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} strokeWidth={2} name="Cumulative Revenue" />
                  <Line type="monotone" dataKey="cac" stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="CAC Line" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Health Assessment */}
            <div className={cn('p-3 rounded-lg border', simulated.ratio >= 10 ? 'bg-chart-1/5 border-chart-1/10' : simulated.ratio >= 3 ? 'bg-chart-3/5 border-chart-3/10' : 'bg-destructive/5 border-destructive/10')}>
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider', simulated.ratio >= 10 ? 'text-chart-1' : simulated.ratio >= 3 ? 'text-chart-3' : 'text-destructive')}>
                {simulated.ratio >= 10 ? 'Exceptional Unit Economics' : simulated.ratio >= 3 ? 'Healthy Unit Economics' : 'Warning — Below Sustainability Threshold'}
              </span>
              <p className="text-xs text-foreground mt-0.5">
                {simulated.ratio >= 10
                  ? `At ${simulated.ratio}× LTV/CAC, growth capital generates outsized returns. Safe to invest aggressively in paid channels.`
                  : simulated.ratio >= 3
                  ? `At ${simulated.ratio}× LTV/CAC, unit economics are sustainable but optimize CAC or increase ARPU for stronger margins.`
                  : `At ${simulated.ratio}× LTV/CAC, customer acquisition is not profitable. Reduce paid spend or increase retention/ARPU.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ── Live Metrics Tab ── */

function LiveMetricsTab() {
  const { data: m, isLoading } = useLiveCacMetrics();

  if (isLoading || !m) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  const kpis = [
    { label: 'Live CPA (30d)', value: m.liveCpa > 0 ? formatRp(m.liveCpa) : '—', icon: Target, sub: `${m.totalConversions} conversions` },
    { label: 'Total Spend', value: formatRpFull(m.totalSpend), icon: DollarSign, sub: '30-day window' },
    { label: 'ROAS', value: m.roas > 0 ? `${m.roas}×` : '—', icon: TrendingUp, sub: formatRpFull(m.totalRevenue) + ' revenue' },
    { label: 'New Users', value: m.newUsers.toLocaleString(), icon: Users, sub: '30-day signups' },
    { label: 'Active Subs', value: m.activeSubs.toLocaleString(), icon: Activity, sub: 'Paying customers' },
    { label: 'Commission Rev', value: formatRpFull(m.totalComm), icon: BarChart3, sub: '30-day commissions' },
  ];

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="space-y-4">
      <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="p-3 space-y-0.5">
              <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="text-lg font-bold font-mono text-foreground">{kpi.value}</div>
              <span className="text-[9px] text-muted-foreground">{kpi.label}</span>
              <span className="text-[8px] text-muted-foreground/70 block">{kpi.sub}</span>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Channel CPA chart */}
      {m.channelCpas.length > 0 && (
        <motion.div variants={fadeSlide}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Channel CPA Performance — 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={m.channelCpas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => formatRp(v)} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => formatRpFull(v)} />
                  <Bar dataKey="cpa" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="CPA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Main Page ── */

export default function CacLtvModelPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Unit Economics</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">CAC vs LTV Model</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Three-sided unit economics — investor, agent, and vendor acquisition cost versus lifetime value with scenario simulation and live performance tracking.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        <Tabs defaultValue="model" className="w-full">
          <TabsList className="h-9">
            <TabsTrigger value="model" className="text-xs px-4">Segment Models</TabsTrigger>
            <TabsTrigger value="simulator" className="text-xs px-4">Scenario Simulator</TabsTrigger>
            <TabsTrigger value="live" className="text-xs px-4">Live Metrics</TabsTrigger>
          </TabsList>

          {/* Segment Models */}
          <TabsContent value="model" className="mt-4 space-y-6">
            {/* Summary KPIs */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Investor LTV/CAC', value: '67×', sub: 'Rp6.4M / Rp95k', icon: Users },
                { label: 'Agent LTV/CAC', value: '50×', sub: 'Rp8.6M / Rp170k', icon: Briefcase },
                { label: 'Vendor LTV/CAC', value: '38×', sub: 'Rp14.4M / Rp380k', icon: Store },
                { label: 'Avg Payback', value: '<18d', sub: 'All segments', icon: Zap },
              ].map((m) => (
                <motion.div key={m.label} variants={fadeSlide}>
                  <Card className="border-border/50">
                    <CardContent className="p-4 space-y-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                      <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <m.icon className="h-3 w-3 text-primary" />{m.sub}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Three model cards */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="grid lg:grid-cols-3 gap-5">
              {BASE_SEGMENTS.map((seg) => (
                <ModelCard key={seg.key} model={seg} />
              ))}
            </motion.div>

            {/* VC Benchmarks */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <motion.div variants={fadeSlide}>
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      VC Benchmark Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-4 gap-3">
                      {[
                        { range: 'LTV/CAC < 3×', status: 'Unsustainable', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/10' },
                        { range: 'LTV/CAC 3–5×', status: 'Healthy SaaS', color: 'text-chart-3', bg: 'bg-chart-3/5 border-chart-3/10' },
                        { range: 'LTV/CAC 5–10×', status: 'Strong moat', color: 'text-chart-2', bg: 'bg-chart-2/5 border-chart-2/10' },
                        { range: 'LTV/CAC > 10×', status: 'Exceptional', color: 'text-chart-1', bg: 'bg-chart-1/5 border-chart-1/10' },
                      ].map((b) => (
                        <div key={b.range} className={cn('p-3 rounded-lg border space-y-1', b.bg)}>
                          <span className="text-xs font-mono font-medium text-foreground">{b.range}</span>
                          <p className={cn('text-[10px] font-semibold', b.color)}>{b.status}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-foreground">
                        <span className="font-semibold text-primary">ASTRA position:</span>{' '}
                        All three segments (67×, 50×, 38×) far exceed the 10× exceptional threshold, signaling deep product-market fit and capital-efficient growth.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Key Assumptions */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key Assumptions & Thresholds</span>
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {[
                      'Deal probability per investor lifetime: 0.35',
                      'Platform net profit per deal: Rp8M',
                      'Investor avg retention: 20 months',
                      'Agent avg retention: 18 months',
                      'Vendor avg retention: 16 months',
                      'CAC blended across all channels by mix weight',
                      'LTV = subscription + transactional revenue',
                      'Alert threshold: LTV/CAC drops below 10× → flag review',
                    ].map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Percent className="h-3 w-3 shrink-0 mt-0.5 text-primary/50" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Scenario Simulator */}
          <TabsContent value="simulator" className="mt-4">
            <ScenarioSimulator />
          </TabsContent>

          {/* Live Metrics */}
          <TabsContent value="live" className="mt-4">
            <LiveMetricsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
