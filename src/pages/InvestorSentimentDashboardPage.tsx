import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp, TrendingDown, Shield, Activity, AlertTriangle,
  BarChart3, Eye, Radio, Gauge, ArrowUpRight, ArrowDownRight,
  Building2, Newspaper, Users, LineChart
} from 'lucide-react';
import {
  computeSentimentIndex,
  classifyNarrativeStrength,
  detectRiskAlerts,
  type SentimentInputs,
  type SentimentResult,
} from '@/hooks/useInvestorSentiment';

// ── Mock real-time data (replace with live feeds) ──
const LIVE_INPUTS: SentimentInputs = {
  analystUpgrades: 3,
  institutionalInflowTrend: 72,
  mediaToneScore: 68,
  retailMomentum: 61,
  shortInterestRatio: 18,
  optionsIVTrend: 32,
};

const HISTORICAL_SCORES = [
  { day: 'Mon', score: 64 }, { day: 'Tue', score: 67 },
  { day: 'Wed', score: 71 }, { day: 'Thu', score: 69 },
  { day: 'Fri', score: 73 }, { day: 'Sat', score: 72 },
  { day: 'Today', score: 0 }, // filled dynamically
];

const INST_FLOW_MAP = [
  { name: 'Sovereign Funds', flow: 82, delta: '+4.2%' },
  { name: 'Pension Allocators', flow: 71, delta: '+2.8%' },
  { name: 'Long-Only Funds', flow: 67, delta: '+1.5%' },
  { name: 'Crossover / Hedge', flow: 48, delta: '-1.3%' },
  { name: 'Retail Platforms', flow: 55, delta: '+3.1%' },
];

const REGIME_CONFIG = {
  bullish: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    barColor: 'bg-emerald-500',
    icon: TrendingUp,
    glow: 'shadow-emerald-500/10',
  },
  stable: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    barColor: 'bg-amber-500',
    icon: Activity,
    glow: 'shadow-amber-500/10',
  },
  defensive: {
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    barColor: 'bg-red-500',
    icon: Shield,
    glow: 'shadow-red-500/10',
  },
};

const ease = [0.16, 1, 0.3, 1];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
};

// ── Signal Input Card ──
function SignalCard({ label, value, weight, icon: Icon, trend }: {
  label: string; value: number; weight: string; icon: React.ElementType; trend?: 'up' | 'down' | 'flat';
}) {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;
  return (
    <motion.div variants={fadeSlide}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">{weight}</Badge>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{value}</span>
            <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
          </div>
          <Progress value={value} className="h-1 mt-2" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Institutional Flow Row ──
function FlowRow({ name, flow, delta }: { name: string; flow: number; delta: string }) {
  const positive = delta.startsWith('+');
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
      <span className="text-sm font-medium">{name}</span>
      <div className="flex items-center gap-3">
        <div className="w-24">
          <Progress value={flow} className="h-1.5" />
        </div>
        <span className="text-xs tabular-nums font-mono w-12 text-right">{flow}</span>
        <span className={`text-xs tabular-nums font-mono w-14 text-right ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {delta}
        </span>
      </div>
    </div>
  );
}

// ── Mini Sparkline (CSS-only) ──
function MiniSparkline({ scores, currentScore }: { scores: typeof HISTORICAL_SCORES; currentScore: number }) {
  const all = [...scores.slice(0, -1), { ...scores[scores.length - 1], score: currentScore }];
  const max = Math.max(...all.map(s => s.score));
  return (
    <div className="flex items-end gap-1 h-12">
      {all.map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={`w-full rounded-sm transition-all duration-500 ${
              i === all.length - 1 ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            style={{ height: `${(s.score / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-[9px] text-muted-foreground">{s.day.slice(0, 2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function InvestorSentimentDashboardPage() {
  const sentiment = useMemo(() => computeSentimentIndex(LIVE_INPUTS), []);
  const narrative = useMemo(
    () => classifyNarrativeStrength(LIVE_INPUTS.mediaToneScore, LIVE_INPUTS.analystUpgrades, LIVE_INPUTS.retailMomentum),
    []
  );
  const risks = useMemo(() => detectRiskAlerts(LIVE_INPUTS), []);
  const cfg = REGIME_CONFIG[sentiment.variant];
  const RegimeIcon = cfg.icon;

  const signals = [
    { label: 'Analyst Upgrades', value: Math.min(100, LIVE_INPUTS.analystUpgrades * 10 + 50), weight: '×0.25', icon: BarChart3, trend: 'up' as const },
    { label: 'Institutional Inflow', value: LIVE_INPUTS.institutionalInflowTrend, weight: '×0.25', icon: Building2, trend: 'up' as const },
    { label: 'Media Tone', value: LIVE_INPUTS.mediaToneScore, weight: '×0.15', icon: Newspaper, trend: 'up' as const },
    { label: 'Retail Momentum', value: LIVE_INPUTS.retailMomentum, weight: '×0.10', icon: Users, trend: 'flat' as const },
    { label: 'Short Interest (inv)', value: 100 - LIVE_INPUTS.shortInterestRatio, weight: '×0.15', icon: Eye, trend: 'up' as const },
    { label: 'Options IV (inv)', value: 100 - LIVE_INPUTS.optionsIVTrend, weight: '×0.10', icon: LineChart, trend: 'flat' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ── */}
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeSlide} className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Post-IPO Command</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Investor Sentiment Dashboard</h1>
            <p className="text-muted-foreground max-w-xl">
              Real-time sentiment index from 6 market signals. Founder daily command view.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Hero Score ── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlide}>
            <Card className={`border ${cfg.bg} ${cfg.glow} shadow-lg`}>
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <RegimeIcon className={`h-8 w-8 ${cfg.color} mb-2`} />
                    <span className={`text-6xl font-bold tabular-nums ${cfg.color}`}>{sentiment.score}</span>
                    <p className="text-sm font-semibold mt-1">{sentiment.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sentiment Index</p>
                  </div>

                  {/* Strategy */}
                  <div className="flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recommended Strategy</p>
                    <p className="text-sm font-medium leading-relaxed">{sentiment.strategy}</p>
                    <Separator className="my-3" />
                    <div className="flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        Narrative Strength: <span className={`font-semibold ${
                          narrative.level === 'STRONG' ? 'text-emerald-400' :
                          narrative.level === 'MODERATE' ? 'text-amber-400' : 'text-red-400'
                        }`}>{narrative.level}</span> ({narrative.score})
                      </p>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">7-Day Trend</p>
                    <MiniSparkline scores={HISTORICAL_SCORES} currentScore={sentiment.score} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ── 6 Signal Input Cards ── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlide}>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-4">Data Input Signals</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {signals.map(s => (
              <SignalCard key={s.label} {...s} />
            ))}
          </div>
        </motion.div>

        {/* ── Institutional Flow Heatmap + Risk Alerts ── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Institutional Flow */}
          <motion.div variants={fadeSlide}>
            <Card className="border-border/40 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Institutional Flow Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {INST_FLOW_MAP.map(f => (
                  <FlowRow key={f.name} {...f} />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Alerts */}
          <motion.div variants={fadeSlide}>
            <Card className="border-border/40 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Risk Alert Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {risks.length === 0 ? (
                  <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm">No active risk alerts — all signals healthy</span>
                  </div>
                ) : (
                  risks.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm">{alert}</p>
                    </div>
                  ))
                )}

                <Separator />

                {/* Valuation Momentum Trend */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Valuation Momentum</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={sentiment.score} className="h-2" />
                    </div>
                    <Badge variant={sentiment.score > 65 ? 'default' : 'secondary'} className="text-xs">
                      {sentiment.score > 65 ? 'Expanding' : sentiment.score > 45 ? 'Stable' : 'Compressing'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ── Regime Tiers Reference ── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlide}>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-4">Regime Classification</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { label: 'Bullish Momentum', range: '> 75', strategy: 'Secondary raise / acquisition timing', variant: 'bullish' as const },
              { label: 'Stable Accumulation', range: '50 – 75', strategy: 'Execution consistency focus', variant: 'stable' as const },
              { label: 'Defensive Regime', range: '< 50', strategy: 'Narrative reinforcement + insider signals', variant: 'defensive' as const },
            ]).map((tier) => {
              const tc = REGIME_CONFIG[tier.variant];
              const isActive = sentiment.variant === tier.variant;
              const TIcon = tc.icon;
              return (
                <motion.div key={tier.variant} variants={fadeSlide}>
                  <Card className={`border transition-all duration-300 ${
                    isActive ? `${tc.bg} ${tc.glow} shadow-md ring-1 ring-inset ring-current/10` : 'border-border/30 opacity-60'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <TIcon className={`h-5 w-5 ${tc.color}`} />
                        <span className={`font-semibold text-sm ${tc.color}`}>{tier.label}</span>
                        {isActive && <Badge className="ml-auto text-[10px]">Active</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">Score Range: <span className="font-mono">{tier.range}</span></p>
                      <p className="text-xs">{tier.strategy}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
