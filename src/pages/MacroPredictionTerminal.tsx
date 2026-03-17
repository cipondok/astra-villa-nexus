import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, BarChart3, Gauge, Zap, Building2,
  Droplets, Brain, AlertTriangle, ChevronUp, ChevronDown, Minus, Radio,
  Signal, Cpu, Timer, Globe, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// ─── Cycle Phases ────────────────────────────────────────────────────
type CyclePhase = 'expansion' | 'peak' | 'correction' | 'recovery';

const CYCLE_CONFIG: Record<CyclePhase, { label: string; color: string; bg: string; icon: typeof TrendingUp; signal: string }> = {
  expansion: { label: 'EXPANSION', color: 'text-emerald-400', bg: 'bg-emerald-400', icon: TrendingUp, signal: 'Strong growth momentum — favorable entry window' },
  peak: { label: 'PEAK', color: 'text-amber-400', bg: 'bg-amber-400', icon: ChevronUp, signal: 'Market approaching ceiling — monitor for exit signals' },
  correction: { label: 'CORRECTION', color: 'text-rose-400', bg: 'bg-rose-400', icon: TrendingDown, signal: 'Price contraction active — defensive positioning advised' },
  recovery: { label: 'RECOVERY', color: 'text-sky-400', bg: 'bg-sky-400', icon: Activity, signal: 'Early upturn detected — accumulation opportunity zone' },
};

// ─── Synthetic Data ──────────────────────────────────────────────────
const CURRENT_PHASE: CyclePhase = 'expansion';
const CYCLE_CONFIDENCE = 78;

const NATIONAL_TREND = Array.from({ length: 24 }, (_, i) => {
  const month = i;
  const base = 100 + Math.sin(month / 4) * 8 + month * 1.2;
  return {
    label: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month % 12]} ${2024 + Math.floor(month / 12)}`,
    index: Math.round(base * 10) / 10,
    forecast: month >= 18 ? Math.round((base + Math.random() * 4) * 10) / 10 : null,
    upper: month >= 18 ? Math.round((base + 6 + Math.random() * 3) * 10) / 10 : null,
    lower: month >= 18 ? Math.round((base - 4 + Math.random() * 2) * 10) / 10 : null,
  };
});

const CITY_OUTLOOK = [
  { city: 'Jakarta', current: 112.4, forecast: 118.2, growth: 5.2, phase: 'expansion' as CyclePhase, heat: 82 },
  { city: 'Bali', current: 128.6, forecast: 135.1, growth: 5.1, phase: 'peak' as CyclePhase, heat: 91 },
  { city: 'Surabaya', current: 105.3, forecast: 110.8, growth: 5.2, phase: 'expansion' as CyclePhase, heat: 68 },
  { city: 'Bandung', current: 103.1, forecast: 108.4, growth: 5.1, phase: 'recovery' as CyclePhase, heat: 62 },
  { city: 'BSD City', current: 118.9, forecast: 121.3, growth: 2.0, phase: 'peak' as CyclePhase, heat: 85 },
  { city: 'Yogyakarta', current: 98.7, forecast: 104.2, growth: 5.6, phase: 'recovery' as CyclePhase, heat: 55 },
  { city: 'Makassar', current: 96.2, forecast: 101.8, growth: 5.8, phase: 'expansion' as CyclePhase, heat: 48 },
  { city: 'Medan', current: 94.5, forecast: 98.1, growth: 3.8, phase: 'recovery' as CyclePhase, heat: 42 },
];

const RENTAL_DEMAND = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  residential: 60 + Math.sin(i / 2) * 15 + i * 1.5,
  commercial: 45 + Math.cos(i / 3) * 10 + i * 0.8,
  villa: 55 + Math.sin(i / 1.5) * 20 + i * 1.2,
}));

const CLIMATE_SIGNALS = [
  { label: 'Investor Activity Index', value: 74, delta: +6, trend: 'up' as const },
  { label: 'Developer Launch Momentum', value: 68, delta: +12, trend: 'up' as const },
  { label: 'Liquidity Heat Score', value: 61, delta: -3, trend: 'down' as const },
  { label: 'Foreign Capital Inflow', value: 52, delta: +8, trend: 'up' as const },
  { label: 'Mortgage Approval Rate', value: 71, delta: +2, trend: 'up' as const },
  { label: 'Absorption Speed Index', value: 66, delta: -5, trend: 'down' as const },
];

const RADAR_DATA = [
  { axis: 'Demand', value: 78 },
  { axis: 'Supply', value: 62 },
  { axis: 'Pricing', value: 71 },
  { axis: 'Liquidity', value: 61 },
  { axis: 'Sentiment', value: 82 },
  { axis: 'Foreign Flow', value: 52 },
];

const AI_STRATEGY = {
  phase: CURRENT_PHASE,
  summary: `Indonesian property market is in an expansion phase with 78% confidence. National price index rose 4.8% YoY driven by Jakarta corridor and Bali premium segments. Developer launches increased 12% MoM, signaling supply confidence. BI rate stability supports mortgage accessibility. Key risk: Bali approaching cycle peak — monitor for correction signals in Q3 2025.`,
  positioning: [
    'Overweight residential in Jakarta & Surabaya growth corridors',
    'Tactical allocation to Yogyakarta & Makassar early-recovery markets',
    'Reduce Bali exposure — take profits on premium villa positions',
    'Monitor BSD City for peak-to-correction transition signals',
    'Increase rental-focused holdings — demand momentum accelerating +6% QoQ',
  ],
  riskFactors: [
    { factor: 'BI Rate Hike Risk', severity: 'medium', impact: 'Mortgage demand compression' },
    { factor: 'Bali Oversupply', severity: 'high', impact: 'Villa segment price correction 5-8%' },
    { factor: 'Election Cycle', severity: 'low', impact: 'Temporary investor hesitation' },
  ],
};

// ─── Styled Tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/40 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-mono" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  );
}

// ─── Phase Band ──────────────────────────────────────────────────────
function CyclePhaseIndicator() {
  const phases: CyclePhase[] = ['recovery', 'expansion', 'peak', 'correction'];
  return (
    <div className="flex items-stretch rounded-lg overflow-hidden border border-border/30 h-10">
      {phases.map((p) => {
        const cfg = CYCLE_CONFIG[p];
        const active = p === CURRENT_PHASE;
        return (
          <div key={p} className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${active ? `${cfg.bg}/20 border-x border-border/20` : 'bg-muted/5'}`}>
            {active && <Radio className={`h-3 w-3 ${cfg.color} animate-pulse`} />}
            <span className={active ? `${cfg.color} font-bold` : 'text-muted-foreground/50'}>{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Signal Gauge Row ────────────────────────────────────────────────
function ClimateSignalRow({ s }: { s: typeof CLIMATE_SIGNALS[0] }) {
  const color = s.value >= 70 ? 'text-emerald-400' : s.value >= 50 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-foreground">{s.label}</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs font-mono font-bold ${color}`}>{s.value}</span>
            <span className={`text-[10px] flex items-center ${s.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {s.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(s.delta)}
            </span>
          </div>
        </div>
        <Progress value={s.value} className="h-1" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function MacroPredictionTerminal() {
  const phaseCfg = CYCLE_CONFIG[CURRENT_PHASE];
  const PhaseIcon = phaseCfg.icon;

  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Terminal Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/30 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight font-sans">Macro Prediction Terminal</h1>
                <p className="text-[11px] text-muted-foreground">Real-time property market cycle intelligence · Indonesia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border/30 bg-card/30">
                <Signal className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400">LIVE</span>
              </div>
              <div className="px-3 py-1.5 rounded border border-border/30 bg-card/30">
                <span className="text-[10px] text-muted-foreground">Updated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Cycle Phase Band */}
          <CyclePhaseIndicator />

          {/* Current Phase Summary */}
          <div className={`mt-3 flex items-center gap-3 px-4 py-2.5 rounded-lg border ${phaseCfg.bg}/5 border-current/10`}>
            <PhaseIcon className={`h-5 w-5 ${phaseCfg.color}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${phaseCfg.color}`}>{phaseCfg.label} PHASE</span>
                <Badge variant="outline" className={`text-[9px] ${phaseCfg.color} border-current/30`}>{CYCLE_CONFIDENCE}% confidence</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{phaseCfg.signal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ── Left: Charts (8 cols) ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* National Price Trend */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium font-sans flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" /> National Property Price Index — Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={NATIONAL_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillIndex" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.15)" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval={3} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(var(--chart-2))" fillOpacity={0.08} name="Upper Band" />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--chart-2))" fillOpacity={0.08} name="Lower Band" />
                    <Area type="monotone" dataKey="index" stroke="hsl(var(--primary))" fill="url(#fillIndex)" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="forecast" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast" />
                    <ReferenceLine x="Jul 2025" stroke="hsl(var(--muted-foreground)/0.3)" strokeDasharray="3 3" label={{ value: 'Now', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* City Outlook + Rental Demand */}
            <div className="grid grid-cols-2 gap-4">
              {/* City Appreciation */}
              <Card className="bg-card/40 border-border/30">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs font-medium font-sans flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" /> City Growth Outlook
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={CITY_OUTLOOK} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.1)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                      <YAxis type="category" dataKey="city" tick={{ fontSize: 9, fill: 'hsl(var(--foreground))' }} width={70} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="growth" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Growth %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Rental Demand */}
              <Card className="bg-card/40 border-border/30">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs font-medium font-sans flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> Rental Demand Macro Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={RENTAL_DEMAND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.1)" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="residential" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Residential" />
                      <Line type="monotone" dataKey="commercial" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Commercial" />
                      <Line type="monotone" dataKey="villa" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} name="Villa" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* City Detail Grid */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium font-sans flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> City-Level Market Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/20">
                        {['City', 'Current', 'Forecast', 'Growth', 'Phase', 'Heat'].map((h) => (
                          <th key={h} className="text-[10px] text-muted-foreground font-medium text-left py-2 px-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CITY_OUTLOOK.map((c) => {
                        const cfg = CYCLE_CONFIG[c.phase];
                        return (
                          <tr key={c.city} className="border-b border-border/10 hover:bg-muted/5 transition-colors">
                            <td className="py-2 px-2 font-medium text-foreground">{c.city}</td>
                            <td className="py-2 px-2 font-mono text-foreground">{c.current}</td>
                            <td className="py-2 px-2 font-mono text-foreground">{c.forecast}</td>
                            <td className="py-2 px-2">
                              <span className={`font-mono font-bold ${c.growth >= 5 ? 'text-emerald-400' : c.growth >= 3 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                                +{c.growth}%
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              <Badge variant="outline" className={`text-[9px] ${cfg.color} border-current/30`}>{cfg.label}</Badge>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1.5">
                                <Progress value={c.heat} className="h-1 w-12" />
                                <span className="font-mono text-[10px] text-muted-foreground">{c.heat}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Sidebar (4 cols) ── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Climate Signals */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium font-sans flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-primary" /> Investment Climate Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {CLIMATE_SIGNALS.map((s, i) => <ClimateSignalRow key={i} s={s} />)}
              </CardContent>
            </Card>

            {/* Market Radar */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-0 pt-4 px-4">
                <CardTitle className="text-xs font-medium font-sans flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Market Balance Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border)/0.2)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Strategy Panel */}
            <Card className="bg-card/60 border-primary/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium font-sans flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-primary" /> AI Strategic Advisory
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {/* Summary */}
                <div className="rounded-lg bg-muted/10 border border-border/20 p-3">
                  <p className="text-[11px] text-foreground leading-relaxed font-sans">{AI_STRATEGY.summary}</p>
                </div>

                {/* Positioning */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">Recommended Positioning</p>
                  <div className="space-y-1.5">
                    {AI_STRATEGY.positioning.map((p, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-primary text-[10px] font-bold mt-0.5 shrink-0">{i + 1}.</span>
                        <p className="text-[11px] text-foreground font-sans leading-relaxed">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="opacity-20" />

                {/* Risk Factors */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-rose-400 font-medium mb-2">Risk Factors</p>
                  <div className="space-y-2">
                    {AI_STRATEGY.riskFactors.map((r, i) => (
                      <div key={i} className={`rounded border p-2 ${r.severity === 'high' ? 'bg-rose-400/5 border-rose-400/20' : r.severity === 'medium' ? 'bg-amber-400/5 border-amber-400/20' : 'bg-muted/5 border-border/20'}`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-medium text-foreground">{r.factor}</span>
                          <Badge variant="outline" className={`text-[8px] h-4 ${r.severity === 'high' ? 'text-rose-400 border-rose-400/30' : r.severity === 'medium' ? 'text-amber-400 border-amber-400/30' : 'text-muted-foreground border-border/30'}`}>
                            {r.severity}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">{r.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
