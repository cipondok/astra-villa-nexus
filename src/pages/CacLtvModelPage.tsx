import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, Users, Store, ArrowUpRight, DollarSign,
  Target, Zap, BarChart3, Percent, Clock, Layers
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

const formatRp = (v: number) => `Rp${(v / 1000).toFixed(0)}k`;
const formatRpFull = (v: number) => {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}M`;
  return `Rp${(v / 1000).toFixed(0)}k`;
};

interface ChannelRow {
  channel: string;
  cac: number;
  mix?: string;
}

interface SideModel {
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
  verdict: string;
}

const INVESTOR: SideModel = {
  label: 'Investor',
  icon: Users,
  accentBorder: 'border-l-primary',
  accentBadge: 'bg-primary/10 text-primary border-primary/20',
  channels: [
    { channel: 'Paid Ads', cac: 180_000 },
    { channel: 'Organic', cac: 40_000 },
    { channel: 'Referral', cac: 25_000 },
  ],
  blendedCac: 95_000,
  arpu: 180_000,
  retentionMonths: 20,
  subscriptionLtv: 3_600_000,
  additionalLtvLabel: 'Deal contribution LTV',
  additionalLtv: 2_800_000,
  totalLtv: 6_400_000,
  ltvCacRatio: 67,
  verdict: 'Extremely attractive for VCs',
};

const VENDOR: SideModel = {
  label: 'Vendor',
  icon: Store,
  accentBorder: 'border-l-chart-2',
  accentBadge: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  channels: [
    { channel: 'Sales Rep Outreach', cac: 450_000 },
    { channel: 'Digital Funnel', cac: 250_000 },
    { channel: 'Events / Partnerships', cac: 600_000 },
  ],
  blendedCac: 380_000,
  arpu: 620_000,
  retentionMonths: 16,
  subscriptionLtv: 9_920_000,
  additionalLtvLabel: 'Lead commission LTV',
  additionalLtv: 4_500_000,
  totalLtv: 14_400_000,
  ltvCacRatio: 38,
  verdict: 'Marketplace flywheel validated',
};

function ModelCard({ model }: { model: SideModel }) {
  const cacPct = Math.min(100, (model.blendedCac / model.totalLtv) * 100);

  return (
    <motion.div variants={fadeSlide}>
      <Card className={`border-border/50 border-l-4 ${model.accentBorder}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
              <model.icon className="h-4.5 w-4.5 text-foreground" />
            </div>
            <div>
              <Badge variant="outline" className={`text-[9px] font-mono ${model.accentBadge}`}>
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
                  <span className="text-xs text-foreground">{ch.channel}</span>
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
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-0.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />ARPU
                </span>
                <span className="text-sm font-bold font-mono text-foreground">{formatRp(model.arpu)}/mo</span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-0.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />Retention
                </span>
                <span className="text-sm font-bold font-mono text-foreground">{model.retentionMonths} months</span>
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

          {/* Visual ratio bar */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              CAC Recovery Visual
            </span>
            <div className="relative">
              <Progress value={cacPct} className="h-3" />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">CAC {cacPct.toFixed(1)}%</span>
                <span className="text-[9px] text-primary">LTV {(100 - cacPct).toFixed(1)}% margin</span>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="p-2.5 rounded-lg bg-chart-1/5 border border-chart-1/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-chart-1">Verdict</span>
            <p className="text-xs text-foreground mt-0.5 font-medium">{model.verdict}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
            Dual-sided unit economics — investor and vendor acquisition cost versus lifetime value with channel-level breakdown.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Summary metrics */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Investor LTV/CAC', value: '67×', sub: 'Rp6.4M / Rp95k', icon: Users },
            { label: 'Vendor LTV/CAC', value: '38×', sub: 'Rp14.4M / Rp380k', icon: Store },
            { label: 'Blended ARPU', value: 'Rp400k', sub: 'Weighted average', icon: DollarSign },
            { label: 'Payback', value: '<1 mo', sub: 'Both sides', icon: Zap },
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

        {/* Dual model cards */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid lg:grid-cols-2 gap-6">
          <ModelCard model={INVESTOR} />
          <ModelCard model={VENDOR} />
        </motion.div>

        {/* VC Benchmark Context */}
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
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { range: 'LTV/CAC < 3×', status: 'Unsustainable', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/10' },
                    { range: 'LTV/CAC 3–5×', status: 'Healthy SaaS', color: 'text-chart-3', bg: 'bg-chart-3/5 border-chart-3/10' },
                    { range: 'LTV/CAC > 10×', status: 'Exceptional moat', color: 'text-chart-1', bg: 'bg-chart-1/5 border-chart-1/10' },
                  ].map((b) => (
                    <div key={b.range} className={`p-3 rounded-lg border ${b.bg} space-y-1`}>
                      <span className="text-xs font-mono font-medium text-foreground">{b.range}</span>
                      <p className={`text-[10px] font-semibold ${b.color}`}>{b.status}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-foreground">
                    <span className="font-semibold text-primary">Astra position:</span>{' '}
                    Both investor (67×) and vendor (38×) ratios far exceed the 10× exceptional threshold.
                    This signals strong product-market fit with highly efficient acquisition channels and deep retention.
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
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key Assumptions</span>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {[
                  'Deal probability per investor lifetime: 0.35',
                  'Platform net profit per deal: Rp8M',
                  'Investor avg retention: 20 months',
                  'Vendor avg retention: 16 months',
                  'CAC blended across all channels',
                  'LTV includes subscription + transactional revenue',
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
      </div>
    </div>
  );
}
