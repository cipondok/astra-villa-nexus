import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Users, MapPin, Zap, Activity, Target, Eye,
  ArrowUpRight, ArrowDownRight, Crown, Flame, BarChart3, Layers,
  ChevronRight, Lightbulb, AlertTriangle, CheckCircle2, ArrowRight,
  Gauge, Building, ShieldCheck, Sparkles, Clock, LineChart
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, LineChart as RLineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel,
  LabelList, Cell
} from "recharts";

// ─── Animation ────────────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `Rp ${(n / 1e3).toFixed(0)}K`;
  return `Rp ${n}`;
};

const Delta = ({ v }: { v: number }) => (
  <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${v >= 0 ? "text-emerald-400" : "text-red-400"}`}>
    {v >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {Math.abs(v)}%
  </span>
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const valuationMetrics = [
  { label: "Liquidity Growth Rate", value: "24.8%", delta: 4.2, icon: Activity, spark: [18, 20, 19, 22, 24, 23, 25, 28] },
  { label: "Deal Pipeline Value", value: fmt(18_700_000_000), delta: 12.6, icon: DollarSign, spark: [8, 10, 9, 12, 14, 15, 17, 19] },
  { label: "Monthly Revenue Run-Rate", value: fmt(890_000_000), delta: 8.3, icon: TrendingUp, spark: [40, 48, 52, 55, 62, 68, 75, 89] },
  { label: "Agent Network Velocity", value: "+34/mo", delta: 18.5, icon: Users, spark: [12, 14, 18, 20, 24, 28, 30, 34] },
  { label: "Buyer Demand Index", value: "87.4", delta: 6.1, icon: Target, spark: [60, 65, 68, 72, 78, 80, 84, 87] },
  { label: "City Expansion Score", value: "72/100", delta: 3.8, icon: MapPin, spark: [50, 52, 55, 58, 62, 66, 69, 72] },
];

const valuationScore = 74;
const valuationBadges = [
  { label: "Liquidity Inflection Zone", color: "text-emerald-400 border-emerald-500/30" },
  { label: "Hyper-Growth Signal", color: "text-amber-400 border-amber-500/30" },
  { label: "Network Effect Emerging", color: "text-primary border-primary/30" },
];

const pricingProperties = [
  { title: "Luxury Villa Seminyak", currentPrice: 8_500_000_000, suggestedPrice: 8_200_000_000, demandStrength: 89, daysOnMarket: 14, liquidityProb: 82, competitors: 6, confidence: 91 },
  { title: "Modern Apartment Canggu", currentPrice: 3_200_000_000, suggestedPrice: 3_400_000_000, demandStrength: 94, daysOnMarket: 8, liquidityProb: 91, competitors: 3, confidence: 87 },
  { title: "Beachfront Land Ubud", currentPrice: 12_000_000_000, suggestedPrice: 11_400_000_000, demandStrength: 62, daysOnMarket: 32, liquidityProb: 54, competitors: 9, confidence: 76 },
];

const funnelData = [
  { name: "Listing Created", value: 1200, fill: "hsl(var(--primary))" },
  { name: "Listing Optimized", value: 840, fill: "hsl(var(--primary) / 0.85)" },
  { name: "Inquiry Received", value: 620, fill: "hsl(var(--primary) / 0.7)" },
  { name: "Viewing Booked", value: 380, fill: "hsl(var(--primary) / 0.55)" },
  { name: "Premium Upgrade", value: 190, fill: "hsl(var(--primary) / 0.4)" },
  { name: "Negotiation", value: 120, fill: "hsl(var(--primary) / 0.3)" },
  { name: "Deal Closed", value: 68, fill: "hsl(var(--primary) / 0.2)" },
];

const funnelConversions = [
  { stage: "Created → Optimized", rate: 70, alert: false },
  { stage: "Optimized → Inquiry", rate: 74, alert: false },
  { stage: "Inquiry → Viewing", rate: 61, alert: true },
  { stage: "Viewing → Premium", rate: 50, alert: true },
  { stage: "Premium → Negotiation", rate: 63, alert: false },
  { stage: "Negotiation → Closed", rate: 57, alert: false },
];

const growthMonths = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const gtvData = growthMonths.map((m, i) => ({ month: m, gtv: [2.1, 2.8, 3.4, 4.2, 5.1, 6.3, 7.8, 9.2, 11.4][i], deals: [24, 32, 41, 52, 68, 84, 102, 128, 156][i] }));
const revenueCompound = growthMonths.map((m, i) => ({ month: m, actual: [120, 180, 240, 320, 420, 540, 680, 780, 890][i], projected: [120, 190, 260, 360, 480, 620, 790, 960, 1140][i] }));

const unicornMetrics = [
  { label: "Gross Transaction Value", value: "Rp 11.4B", delta: 23.9 },
  { label: "Listings Liquidity Ratio", value: "68.4%", delta: 4.2 },
  { label: "Inquiry→Deal Velocity", value: "12.3 days", delta: -8.1 },
  { label: "Deal Cycle Compression", value: "-18%", delta: 18.0 },
  { label: "Revenue CAGR", value: "142%", delta: 12.4 },
  { label: "Network Density Index", value: "7.8/10", delta: 6.3 },
  { label: "Market Share Momentum", value: "34.2%", delta: 5.7 },
];

const districtHeat = [
  { district: "Seminyak", deals: 42, revenue: 4.2, growth: 28, density: 92 },
  { district: "Canggu", deals: 38, revenue: 3.1, growth: 34, density: 87 },
  { district: "Ubud", deals: 24, revenue: 2.8, growth: 12, density: 64 },
  { district: "Sanur", deals: 18, revenue: 1.6, growth: 8, density: 58 },
  { district: "Jimbaran", deals: 15, revenue: 2.1, growth: 22, density: 71 },
];

const radarData = [
  { metric: "Liquidity", value: 82 },
  { metric: "Revenue", value: 74 },
  { metric: "Network", value: 68 },
  { metric: "Expansion", value: 72 },
  { metric: "AI Adoption", value: 85 },
  { metric: "Retention", value: 78 },
];

const milestones = [
  { label: "100 Deals", reached: true },
  { label: "1,000 Deals", reached: false, progress: 15.6 },
  { label: "City Dominance", reached: false, progress: 34 },
  { label: "Rp 1B MRR", reached: false, progress: 89 },
];

// ─── Mini Spark ───────────────────────────────────────────────────────────────
const MiniSpark = ({ data }: { data: number[] }) => (
  <ResponsiveContainer width={64} height={28}>
    <AreaChart data={data.map((v, i) => ({ v, i }))}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Score Gauge ──────────────────────────────────────────────────────────────
const ScoreGauge = ({ score, label, size = 120 }: { score: number; label: string; size?: number }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const offset = arc - (arc * score) / 100;
  const color = score >= 75 ? "hsl(var(--primary))" : score >= 50 ? "hsl(45 100% 55%)" : "hsl(0 80% 60%)";
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={7} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          initial={{ strokeDashoffset: arc }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{score}</span>
        <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
      </div>
    </div>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/60 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-bold text-foreground">{p.name}: {typeof p.value === "number" && p.value > 1000 ? `Rp ${p.value}M` : p.value}</p>
      ))}
    </div>
  );
};

// ─── Tab 1: Investor Valuation ────────────────────────────────────────────────
const InvestorValuationTab = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
    {/* Valuation Perception Score */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ScoreGauge score={valuationScore} label="Valuation Score" size={140} />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Investor Perception Index</h3>
              <p className="text-[10px] text-muted-foreground">Composite score from 6 strategic signals shaping investor confidence</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {valuationBadges.map(b => (
                <Badge key={b.label} variant="outline" className={`text-[9px] px-2 h-5 ${b.color}`}>
                  <Sparkles className="h-2.5 w-2.5 mr-1" />{b.label}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">3.2x</p>
                <p className="text-[9px] text-muted-foreground">LTV:CAC</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">142%</p>
                <p className="text-[9px] text-muted-foreground">Revenue CAGR</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">15x</p>
                <p className="text-[9px] text-muted-foreground">ARR Multiple</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>

    {/* Metric Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {valuationMetrics.map(m => (
        <motion.div key={m.label} variants={fadeUp}>
          <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">{m.value}</span>
                    <Delta v={m.delta} />
                  </div>
                </div>
              </div>
              <MiniSpark data={m.spark} />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Revenue Run-Rate Chart */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Revenue Momentum</h3>
            <p className="text-[10px] text-muted-foreground">Actual vs Projected MRR (Rp Millions)</p>
          </div>
          <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
            <TrendingUp className="h-3 w-3 mr-1" />On Track
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueCompound}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area dataKey="projected" stroke="hsl(var(--border))" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Projected" />
            <Area dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" name="Actual" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 2: AI Smart Pricing ──────────────────────────────────────────────────
const AIPricingTab = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
    {pricingProperties.map((p, idx) => {
      const diff = p.suggestedPrice - p.currentPrice;
      const diffPct = ((diff / p.currentPrice) * 100).toFixed(1);
      const isDown = diff < 0;
      return (
        <motion.div key={idx} variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">{p.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-muted-foreground">Current: <span className="font-semibold text-foreground">{fmt(p.currentPrice)}</span></span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-[10px] font-bold ${isDown ? "text-amber-400" : "text-emerald-400"}`}>
                    AI: {fmt(p.suggestedPrice)} ({isDown ? "" : "+"}{diffPct}%)
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
                <Sparkles className="h-2.5 w-2.5 mr-1" />{p.confidence}% conf.
              </Badge>
            </div>

            {/* Price Range Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                <span>Below Market</span><span>Fair Value</span><span>Premium</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted/40">
                <div className="absolute h-2 rounded-full bg-gradient-to-r from-red-500/60 via-emerald-500/60 to-amber-500/60" style={{ width: "100%" }} />
                <motion.div className="absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-foreground shadow-md"
                  initial={{ left: "50%" }} animate={{ left: `${Math.min(95, Math.max(5, p.liquidityProb))}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <Flame className="h-3 w-3 mx-auto text-primary mb-0.5" />
                <p className="text-xs font-bold text-foreground">{p.demandStrength}</p>
                <p className="text-[8px] text-muted-foreground">Demand</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <Clock className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
                <p className="text-xs font-bold text-foreground">{p.daysOnMarket}d</p>
                <p className="text-[8px] text-muted-foreground">Est. DOM</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <Activity className="h-3 w-3 mx-auto text-emerald-400 mb-0.5" />
                <p className="text-xs font-bold text-foreground">{p.liquidityProb}%</p>
                <p className="text-[8px] text-muted-foreground">Liquidity</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/20">
                <Layers className="h-3 w-3 mx-auto text-amber-400 mb-0.5" />
                <p className="text-xs font-bold text-foreground">{p.competitors}</p>
                <p className="text-[8px] text-muted-foreground">Competitors</p>
              </div>
            </div>

            {isDown && (
              <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-300/90">
                    Price adjustment {diffPct}% may increase inquiry flow by ~{Math.abs(Math.round(parseFloat(diffPct) * 14))}% based on demand elasticity modeling.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      );
    })}
  </motion.div>
);

// ─── Tab 3: Seller Conversion ─────────────────────────────────────────────────
const SellerConversionTab = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
    {/* Visual Funnel */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Seller Conversion Funnel</h3>
        <div className="space-y-1.5">
          {funnelData.map((stage, i) => {
            const widthPct = (stage.value / funnelData[0].value) * 100;
            return (
              <motion.div key={stage.name} variants={fadeUp} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-medium w-28 truncate text-right">{stage.name}</span>
                <div className="flex-1 h-7 relative">
                  <motion.div
                    className="h-full rounded-md bg-primary/20 flex items-center px-2"
                    initial={{ width: 0 }} animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    style={{ background: `hsl(var(--primary) / ${0.15 + (1 - i / funnelData.length) * 0.25})` }}
                  >
                    <span className="text-[10px] font-bold text-foreground">{stage.value.toLocaleString()}</span>
                  </motion.div>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground w-12 text-right">
                  {i === 0 ? "100%" : `${((stage.value / funnelData[0].value) * 100).toFixed(1)}%`}
                </span>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>

    {/* Stage Conversions */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Stage Conversion Rates</h3>
        <div className="space-y-2">
          {funnelConversions.map(c => (
            <div key={c.stage} className="flex items-center gap-3">
              {c.alert ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="text-[10px] text-muted-foreground font-medium flex-1">{c.stage}</span>
              <Progress value={c.rate} className="h-1.5 w-24" />
              <span className={`text-[10px] font-bold w-10 text-right ${c.alert ? "text-amber-400" : "text-foreground"}`}>
                {c.rate}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    {/* Psychological Triggers */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">AI Persuasion Recommendations</h3>
        <div className="space-y-2">
          {[
            { trigger: "Urgency Messaging", desc: "3 buyers viewing similar properties — activate scarcity signal", impact: "High", icon: Zap },
            { trigger: "Price Competitiveness Alert", desc: "Listing 8% above district average — suggest repositioning", impact: "Critical", icon: AlertTriangle },
            { trigger: "Visibility Boost Offer", desc: "Premium upgrade would 4x exposure in target demographic", impact: "Medium", icon: Eye },
            { trigger: "Social Proof Cascade", desc: "Show seller that 12 saved this listing in 48hrs", impact: "High", icon: Users },
          ].map(t => (
            <div key={t.trigger} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <t.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-foreground">{t.trigger}</span>
                  <Badge variant="outline" className={`text-[8px] h-4 px-1 ${
                    t.impact === "Critical" ? "border-red-500/30 text-red-400" :
                    t.impact === "High" ? "border-amber-500/30 text-amber-400" :
                    "border-border/60 text-muted-foreground"
                  }`}>{t.impact}</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 4: Unicorn Growth Terminal ───────────────────────────────────────────
const UnicornGrowthTab = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
    {/* Unicorn Probability */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Unicorn Probability Signal</p>
            <p className="text-3xl font-bold text-foreground mt-1">34.2%</p>
            <p className="text-[10px] text-muted-foreground">Based on growth velocity, market capture, and revenue trajectory</p>
          </div>
          <ScoreGauge score={34} label="Probability" size={100} />
        </div>
      </Card>
    </motion.div>

    {/* Growth Metrics Strip */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {unicornMetrics.slice(0, 4).map(m => (
        <motion.div key={m.label} variants={fadeUp}>
          <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
            <p className="text-[9px] text-muted-foreground font-medium">{m.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-bold text-foreground">{m.value}</span>
              <Delta v={m.delta} />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* GTV Growth Chart */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">GTV & Deal Volume Growth</h3>
            <p className="text-[10px] text-muted-foreground">Gross Transaction Value (Rp Billions)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={gtvData}>
            <defs>
              <linearGradient id="gtvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area dataKey="gtv" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gtvGrad)" name="GTV (B)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>

    {/* District Heat + Radar */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">District Performance Heat</h3>
          <div className="space-y-2">
            {districtHeat.map(d => (
              <div key={d.district} className="flex items-center gap-3">
                <span className="text-[10px] font-semibold text-foreground w-20">{d.district}</span>
                <div className="flex-1 grid grid-cols-4 gap-1">
                  {[
                    { v: d.deals, max: 50, label: "Deals" },
                    { v: d.revenue * 10, max: 50, label: "Rev" },
                    { v: d.growth, max: 40, label: "Growth" },
                    { v: d.density, max: 100, label: "Density" },
                  ].map(cell => (
                    <div key={cell.label} className="h-6 rounded-sm flex items-center justify-center text-[8px] font-bold"
                      style={{
                        backgroundColor: `hsl(var(--primary) / ${0.05 + (cell.v / cell.max) * 0.35})`,
                        color: cell.v / cell.max > 0.6 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                      }}>
                      {cell.v}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-1 mt-1">
              {["Deals", "Revenue", "Growth%", "Density"].map(l => (
                <span key={l} className="flex-1 text-[8px] text-muted-foreground text-center">{l}</span>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-2">Platform Health Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>

    {/* Milestones */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Strategic Milestones</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {milestones.map(m => (
            <div key={m.label} className={`p-3 rounded-lg border ${m.reached ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40 bg-muted/10"}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {m.reached ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Target className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-[10px] font-bold text-foreground">{m.label}</span>
              </div>
              {m.reached ? (
                <Badge variant="outline" className="text-[8px] h-4 border-emerald-500/30 text-emerald-400">Achieved</Badge>
              ) : (
                <Progress value={m.progress} className="h-1.5" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const InvestorGrowthIntelligence = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Investor Perception & Growth Intelligence</h1>
          <p className="text-[10px] text-muted-foreground">Strategic intelligence terminal • Valuation signals • Pricing AI • Growth metrics</p>
        </div>
        <div className="flex gap-1.5">
          <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
            <Activity className="h-3 w-3 mr-1" />Live
          </Badge>
          <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
            <LineChart className="h-3 w-3 mr-1" />Q1 2026
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="valuation" className="space-y-4">
        <TabsList className="bg-muted/30 border border-border/40 h-9">
          <TabsTrigger value="valuation" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <BarChart3 className="h-3 w-3" />Investor Valuation
          </TabsTrigger>
          <TabsTrigger value="pricing" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Sparkles className="h-3 w-3" />AI Pricing
          </TabsTrigger>
          <TabsTrigger value="conversion" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Target className="h-3 w-3" />Seller Funnel
          </TabsTrigger>
          <TabsTrigger value="unicorn" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Crown className="h-3 w-3" />Unicorn Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="valuation"><InvestorValuationTab /></TabsContent>
        <TabsContent value="pricing"><AIPricingTab /></TabsContent>
        <TabsContent value="conversion"><SellerConversionTab /></TabsContent>
        <TabsContent value="unicorn"><UnicornGrowthTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorGrowthIntelligence;
