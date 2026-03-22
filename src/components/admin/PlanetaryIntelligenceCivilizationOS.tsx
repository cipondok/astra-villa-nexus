import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Activity, TrendingUp, ArrowUpRight, ArrowDownRight,
  Zap, DollarSign, BarChart3, MapPin, Clock, Layers,
  Radio, Sparkles, Crown, Eye, Building, Users, Target,
  ChevronRight, CheckCircle, Shield, Compass, Brain,
  Network, Orbit, Landmark, Scale, Heart
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const Delta = ({ v }: { v: number }) => (
  <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${v >= 0 ? "text-emerald-400" : "text-red-400"}`}>
    {v >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {Math.abs(v)}%
  </span>
);

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/60 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-bold text-foreground">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const KpiCard = ({ icon: Icon, label, value, delta, sub, variant = "premium" }: {
  icon: React.ElementType; label: string; value: string; delta?: number; sub?: string;
  variant?: "danger" | "warning" | "success" | "premium";
}) => {
  const colors = {
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-amber-500/10 text-amber-400",
    success: "bg-emerald-500/10 text-emerald-400",
    premium: "bg-primary/10 text-primary",
  };
  const [bg, text] = colors[variant].split(" ");
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`h-3.5 w-3.5 ${text}`} />
          </div>
          <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
        </div>
        <div className="flex items-end gap-1.5">
          <span className="text-lg font-bold text-foreground leading-none">{value}</span>
          {delta !== undefined && <Delta v={delta} />}
        </div>
        {sub && <p className="text-[8px] text-muted-foreground mt-0.5">{sub}</p>}
      </Card>
    </motion.div>
  );
};

// ─── Tab 1: Planetary Intelligence Grid ──────────────────────────────────────
const globalFlow = [
  { quarter: "Q1'25", seAsia: 2.8, midEast: 4.2, europe: 3.6, americas: 5.1, africa: 0.8 },
  { quarter: "Q2'25", seAsia: 3.4, midEast: 4.8, europe: 3.8, americas: 5.4, africa: 1.1 },
  { quarter: "Q3'25", seAsia: 4.2, midEast: 5.1, europe: 4.2, americas: 5.8, africa: 1.4 },
  { quarter: "Q4'25", seAsia: 5.1, midEast: 5.6, europe: 4.4, americas: 6.2, africa: 1.8 },
  { quarter: "Q1'26", seAsia: 6.2, midEast: 6.1, europe: 4.8, americas: 6.8, africa: 2.2 },
];

const corridors = [
  { route: "Singapore → Bali", velocity: 94, volume: "$2.4B", trend: "Accelerating", liquidity: 88 },
  { route: "Dubai → Jakarta", velocity: 78, volume: "$1.8B", trend: "Stable", liquidity: 72 },
  { route: "Hong Kong → KL", velocity: 82, volume: "$1.6B", trend: "Accelerating", liquidity: 76 },
  { route: "London → Lisbon", velocity: 68, volume: "$3.2B", trend: "Stable", liquidity: 84 },
  { route: "Sydney → Bali", velocity: 86, volume: "$0.9B", trend: "Emerging", liquidity: 64 },
  { route: "Tokyo → Bangkok", velocity: 72, volume: "$1.2B", trend: "Emerging", liquidity: 58 },
];

const PlanetaryGrid = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Globe} label="Global Liquidity Index" value="76" delta={12} sub="Strengthening" />
      <KpiCard icon={Activity} label="Active Corridors" value="24" delta={8} variant="success" />
      <KpiCard icon={TrendingUp} label="Capital Velocity" value="$26.1B" delta={18} sub="Quarterly" />
      <KpiCard icon={Shield} label="Market Resilience" value="82" delta={4} variant="success" sub="Strong" />
    </div>

    {/* Global Map Placeholder */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 backdrop-blur-sm overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Planetary Transaction Network</p>
            <h3 className="text-sm font-bold text-foreground">Global Real Estate Liquidity Flow</h3>
          </div>
          <Badge variant="outline" className="text-[8px] h-5 border-emerald-500/30 text-emerald-400">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />LIVE SIGNALS
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={globalFlow}>
            <defs>
              <linearGradient id="pgSeAsia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Area dataKey="seAsia" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#pgSeAsia)" name="SE Asia" />
            <Line dataKey="midEast" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Mid-East" />
            <Line dataKey="americas" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Americas" />
            <Line dataKey="europe" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="2 4" dot={false} name="Europe" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>

    {/* Transaction Corridors */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Active Transaction Corridors</h3>
        <div className="space-y-1.5">
          {corridors.map((c, i) => (
            <div key={c.route} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                i < 2 ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground"
              }`}>{i + 1}</div>
              <span className="text-[10px] font-bold text-foreground w-32 shrink-0">{c.route}</span>
              <div className="flex-1 flex gap-4 text-[9px]">
                <div className="text-center"><span className="text-muted-foreground block">Volume</span><span className="font-bold text-foreground">{c.volume}</span></div>
                <div className="text-center"><span className="text-muted-foreground block">Velocity</span><span className={`font-bold ${c.velocity >= 80 ? "text-emerald-400" : "text-foreground"}`}>{c.velocity}</span></div>
                <div className="text-center"><span className="text-muted-foreground block">Liquidity</span><span className="font-bold text-foreground">{c.liquidity}</span></div>
              </div>
              <Badge variant="outline" className={`text-[7px] h-4 px-1.5 shrink-0 ${
                c.trend === "Accelerating" ? "border-emerald-500/30 text-emerald-400" :
                c.trend === "Stable" ? "border-primary/30 text-primary" : "border-amber-500/30 text-amber-400"
              }`}>{c.trend}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground"><span className="font-bold">Intelligence Signal:</span> Secondary urban clusters in Southeast Asia showing accelerating liquidity synchronization — cross-border capital velocity up 18% QoQ.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 2: Autonomous Wealth Infrastructure ─────────────────────────────────
const wealthTrend = [
  { year: "2024", txActivity: 24, liquidity: 32, priceDisc: 28, capEff: 22, wealth: 18 },
  { year: "2025", txActivity: 42, liquidity: 48, priceDisc: 44, capEff: 38, wealth: 34 },
  { year: "2026", txActivity: 58, liquidity: 64, priceDisc: 58, capEff: 52, wealth: 48 },
  { year: "2027", txActivity: 72, liquidity: 78, priceDisc: 72, capEff: 68, wealth: 64 },
  { year: "2028", txActivity: 84, liquidity: 88, priceDisc: 82, capEff: 78, wealth: 76 },
  { year: "2030", txActivity: 92, liquidity: 94, priceDisc: 90, capEff: 88, wealth: 86 },
];

const flywheelStages = [
  { stage: "Transaction Activity", score: 72, icon: Activity, status: "active" as const },
  { stage: "Liquidity Depth", score: 64, icon: Layers, status: "active" as const },
  { stage: "Price Discovery", score: 58, icon: Eye, status: "building" as const },
  { stage: "Capital Efficiency", score: 48, icon: Target, status: "building" as const },
  { stage: "Wealth Creation", score: 34, icon: Crown, status: "emerging" as const },
];

const WealthInfrastructure = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={DollarSign} label="Wealth Index" value="48" delta={22} sub="Growing" />
      <KpiCard icon={Activity} label="Tx Density" value="1,842" delta={34} variant="success" />
      <KpiCard icon={TrendingUp} label="Yield Optimization" value="12.4%" delta={8} />
      <KpiCard icon={Shield} label="Stability Index" value="76" delta={6} variant="success" />
      <KpiCard icon={Layers} label="Compounding Rate" value="2.8×" delta={14} sub="Accelerating" />
    </div>

    {/* Flywheel */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Wealth Infrastructure Flywheel</h3>
        <div className="flex items-center gap-1">
          {flywheelStages.map((s, i) => (
            <React.Fragment key={s.stage}>
              <div className="flex-1 p-2.5 rounded-lg bg-muted/10 text-center">
                <div className={`h-8 w-8 rounded-full mx-auto mb-1.5 flex items-center justify-center ${
                  s.status === "active" ? "bg-emerald-500/20" : s.status === "building" ? "bg-primary/20" : "bg-muted/20"
                }`}>
                  <s.icon className={`h-4 w-4 ${
                    s.status === "active" ? "text-emerald-400" : s.status === "building" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <p className="text-[8px] font-bold text-foreground mb-1">{s.stage}</p>
                <Progress value={s.score} className="h-1 mb-0.5" />
                <span className="text-[8px] text-primary font-bold">{s.score}%</span>
              </div>
              {i < flywheelStages.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Wealth Accumulation Projection</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={wealthTrend}>
            <defs>
              <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Area dataKey="wealth" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#wealthGrad)" name="Wealth Index" />
            <Line dataKey="liquidity" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Liquidity" />
            <Line dataKey="capEff" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Capital Efficiency" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground"><span className="font-bold">Wealth Intelligence:</span> Increasing transaction density may reduce asset volatility by 18% and enhance capital stability — flywheel acceleration detected in Bali corridor.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 3: Intergenerational Legacy ─────────────────────────────────────────
const horizons = [
  { period: "10-Year", label: "National Infrastructure", confidence: 84, milestones: ["5-city dominance", "$1B GMV", "500+ agents", "Institutional partnerships"], phase: "active" as const },
  { period: "25-Year", label: "Regional Coordination", confidence: 62, milestones: ["SEA market leader", "$10B+ GMV", "Cross-border protocol", "Data sovereignty"], phase: "projected" as const },
  { period: "50-Year", label: "Global Integration", confidence: 38, milestones: ["20+ country grid", "$100B+ GMV", "Autonomous coordination", "Intergenerational wealth"], phase: "vision" as const },
];

const legacyPhases = [
  { phase: "Foundational Liquidity", progress: 72, status: "active" as const, year: "2025–2027" },
  { phase: "National Infrastructure", progress: 28, status: "building" as const, year: "2027–2030" },
  { phase: "Regional Coordination", progress: 8, status: "planned" as const, year: "2030–2035" },
  { phase: "Global System Integration", progress: 0, status: "vision" as const, year: "2035–2045" },
  { phase: "Intergenerational Institution", progress: 0, status: "vision" as const, year: "2045+" },
];

const impactData = [
  { metric: "Housing Access", value: 68 },
  { metric: "Market Efficiency", value: 72 },
  { metric: "Wealth Distribution", value: 54 },
  { metric: "Urban Development", value: 62 },
  { metric: "Innovation Index", value: 78 },
  { metric: "Capital Fluidity", value: 58 },
];

const statusMap = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  building: "bg-primary/20 text-primary border-primary/30",
  projected: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  planned: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  vision: "bg-muted/20 text-muted-foreground border-border/40",
};

const IntergenerationalLegacy = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
        <p className="text-[9px] text-primary font-bold uppercase tracking-wider">ASTRA Long-Term Civilization Impact</p>
        <h3 className="text-base font-bold text-foreground mt-1">Development Path</h3>
        <p className="text-[10px] text-muted-foreground mt-1">Multi-decade strategic horizon for lasting infrastructure impact</p>
      </Card>
    </motion.div>

    {/* Horizon Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      {horizons.map(h => (
        <motion.div key={h.period} variants={fadeUp}>
          <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[8px] h-5 px-1.5 ${statusMap[h.phase]}`}>{h.period}</Badge>
                <span className="text-[10px] font-bold text-foreground">{h.label}</span>
              </div>
              <span className="text-[9px] font-bold text-primary">{h.confidence}%</span>
            </div>
            <Progress value={h.confidence} className="h-1 mb-2" />
            <div className="space-y-1">
              {h.milestones.map(m => (
                <div key={m} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-primary/50 shrink-0" />
                  {m}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Phase Timeline */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Evolution Phases</h3>
          <div className="space-y-2">
            {legacyPhases.map((p, i) => (
              <div key={p.phase} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${statusMap[p.status]}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-foreground">{p.phase}</span>
                    <span className="text-[8px] text-muted-foreground">{p.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={p.progress} className="h-1 flex-1" />
                    <span className="text-[9px] font-bold text-primary w-8">{p.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Socio-Economic Impact */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Socio-Economic Impact Projection</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={impactData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Tab 4: Civilization OS ──────────────────────────────────────────────────
const civMetrics = [
  { month: "Jan", urbanSync: 34, housing: 42, ownership: 28, coordination: 22 },
  { month: "Feb", urbanSync: 38, housing: 48, ownership: 32, coordination: 28 },
  { month: "Mar", urbanSync: 44, housing: 54, ownership: 38, coordination: 34 },
  { month: "Apr", urbanSync: 52, housing: 62, ownership: 44, coordination: 42 },
  { month: "May", urbanSync: 58, housing: 68, ownership: 52, coordination: 48 },
  { month: "Jun", urbanSync: 64, housing: 74, ownership: 58, coordination: 56 },
];

const civMilestones = [
  { milestone: "First 1,000 Transactions", status: "achieved" as const, impact: "City liquidity threshold" },
  { milestone: "5-City Network Active", status: "in-progress" as const, impact: "National coordination" },
  { milestone: "Cross-Border Protocol", status: "planned" as const, impact: "Regional integration" },
  { milestone: "$10B Annual GMV", status: "vision" as const, impact: "Infrastructure status" },
  { milestone: "Autonomous Coordination", status: "vision" as const, impact: "Self-sustaining system" },
];

const CivilizationOS = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">ASTRA Global Property Coordination System</p>
            <h3 className="text-base font-bold text-foreground mt-1">Status</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Planet-scale transaction coordination • Urbanization synchronization • Housing access intelligence</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">42</span>
            <p className="text-[9px] text-primary font-medium">Coordination Index</p>
          </div>
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Globe} label="Network Status" value="Active" variant="success" sub="1 city operational" />
      <KpiCard icon={Building} label="Urbanization Sync" value="58" delta={12} sub="Aligning" />
      <KpiCard icon={Heart} label="Housing Access" value="68" delta={8} variant="success" />
      <KpiCard icon={Scale} label="Ownership Fluidity" value="52" delta={16} sub="Improving" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Civilization Coordination Metrics</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={civMetrics}>
              <defs>
                <linearGradient id="civGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area dataKey="housing" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#civGrad)" name="Housing Access" />
              <Line dataKey="urbanSync" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Urban Sync" />
              <Line dataKey="coordination" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Coordination" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Civilization-Scale Milestones</h3>
          <div className="space-y-2">
            {civMilestones.map(m => (
              <div key={m.milestone} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/10">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                  m.status === "achieved" ? "bg-emerald-500/20" : m.status === "in-progress" ? "bg-primary/20" : "bg-muted/20"
                }`}>
                  {m.status === "achieved" ? <CheckCircle className="h-3 w-3 text-emerald-400" /> :
                   m.status === "in-progress" ? <Activity className="h-3 w-3 text-primary" /> :
                   <Clock className="h-3 w-3 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-foreground">{m.milestone}</span>
                  <p className="text-[8px] text-muted-foreground">{m.impact}</p>
                </div>
                <Badge variant="outline" className={`text-[7px] h-4 px-1 ${
                  m.status === "achieved" ? "border-emerald-500/30 text-emerald-400" :
                  m.status === "in-progress" ? "border-primary/30 text-primary" : "border-border/60 text-muted-foreground"
                }`}>{m.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground"><span className="font-bold">Civilization Signal:</span> ASTRA coordination capability score trending upward — transitioning from marketplace operator toward economic infrastructure layer. Housing access influence expanding across Bali metropolitan corridor.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const PlanetaryIntelligenceCivilizationOS = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Planetary Intelligence & Civilization OS</h1>
        <p className="text-[10px] text-muted-foreground">Global liquidity grid • Wealth infrastructure • Intergenerational legacy • Civilization coordination</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
        <Globe className="h-3 w-3 mr-1" />Planetary Scale
      </Badge>
    </div>

    <Tabs defaultValue="planetary" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="planetary" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Globe className="h-3 w-3" />Intelligence Grid
        </TabsTrigger>
        <TabsTrigger value="wealth" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <DollarSign className="h-3 w-3" />Wealth Engine
        </TabsTrigger>
        <TabsTrigger value="legacy" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Crown className="h-3 w-3" />Legacy Strategy
        </TabsTrigger>
        <TabsTrigger value="civilization" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Layers className="h-3 w-3" />Civilization OS
        </TabsTrigger>
      </TabsList>

      <TabsContent value="planetary"><PlanetaryGrid /></TabsContent>
      <TabsContent value="wealth"><WealthInfrastructure /></TabsContent>
      <TabsContent value="legacy"><IntergenerationalLegacy /></TabsContent>
      <TabsContent value="civilization"><CivilizationOS /></TabsContent>
    </Tabs>
  </div>
);

export default PlanetaryIntelligenceCivilizationOS;
