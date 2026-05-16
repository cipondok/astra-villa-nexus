import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, MapPin, TrendingUp, DollarSign, Users, Zap, Activity, Target,
  ArrowUpRight, ArrowDownRight, Shield, BarChart3, Layers, ChevronRight,
  Lightbulb, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Clock,
  LineChart, Play, Pause, Settings2, Rocket, Radio, Cpu, Network,
  Building, Eye, Flame, Crown, ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  AreaChart, Area, LineChart as RLineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";

// ─── Animation ────────────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const Delta = ({ v }: { v: number }) => (
  <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${v >= 0 ? "text-emerald-400" : "text-red-400"}`}>
    {v >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {Math.abs(v)}%
  </span>
);

const CustomTooltip = ({ active, payload, label }: any) => {
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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const expansionCities = [
  { city: "Bali (Current)", country: "Indonesia", readiness: 92, attractiveness: 95, capital: 0, liquidity: 88, agents: 34, regulatory: 12, status: "active" as const, lat: -8.4, lng: 115.2 },
  { city: "Jakarta", country: "Indonesia", readiness: 78, attractiveness: 88, capital: 2.4, liquidity: 72, agents: 0, regulatory: 18, status: "planned" as const, lat: -6.2, lng: 106.8 },
  { city: "Surabaya", country: "Indonesia", readiness: 65, attractiveness: 74, capital: 1.8, liquidity: 58, agents: 0, regulatory: 15, status: "planned" as const, lat: -7.3, lng: 112.7 },
  { city: "Kuala Lumpur", country: "Malaysia", readiness: 54, attractiveness: 82, capital: 3.6, liquidity: 45, agents: 0, regulatory: 42, status: "research" as const, lat: 3.1, lng: 101.7 },
  { city: "Bangkok", country: "Thailand", readiness: 48, attractiveness: 79, capital: 4.2, liquidity: 38, agents: 0, regulatory: 55, status: "research" as const, lat: 13.8, lng: 100.5 },
  { city: "Ho Chi Minh", country: "Vietnam", readiness: 42, attractiveness: 76, capital: 3.8, liquidity: 32, agents: 0, regulatory: 62, status: "research" as const, lat: 10.8, lng: 106.6 },
  { city: "Singapore", country: "Singapore", readiness: 38, attractiveness: 90, capital: 6.8, liquidity: 28, agents: 0, regulatory: 68, status: "future" as const, lat: 1.3, lng: 103.8 },
  { city: "Dubai", country: "UAE", readiness: 32, attractiveness: 86, capital: 8.5, liquidity: 22, agents: 0, regulatory: 45, status: "future" as const, lat: 25.2, lng: 55.3 },
];

const flywheelStages = [
  { stage: "Supply Activation", value: 82, icon: Building, desc: "Listing inventory growth rate", trend: "+18%" },
  { stage: "Demand Capture", value: 74, icon: Users, desc: "Buyer acquisition efficiency", trend: "+24%" },
  { stage: "Liquidity Formation", value: 68, icon: Activity, desc: "Transaction velocity index", trend: "+12%" },
  { stage: "Revenue Engine", value: 71, icon: DollarSign, desc: "Revenue per transaction", trend: "+8%" },
  { stage: "Network Effect", value: 56, icon: Network, desc: "Organic growth multiplier", trend: "+34%" },
];

const autonomousEvents = [
  { time: "2m ago", event: "Dynamic pricing adjusted 14 listings in Seminyak", type: "pricing" as const },
  { time: "8m ago", event: "Agent performance tier updated — 3 agents promoted", type: "agents" as const },
  { time: "15m ago", event: "Referral incentive boosted for Canggu district", type: "growth" as const },
  { time: "22m ago", event: "Supply gap detected in Ubud luxury segment", type: "alert" as const },
  { time: "31m ago", event: "Marketing ROI optimization: shifted 12% budget to Instagram", type: "marketing" as const },
  { time: "45m ago", event: "Buyer demand signal: 3x spike in beachfront searches", type: "demand" as const },
];

const liquidityPhases = [
  { phase: "Local Dominance", status: "active" as const, progress: 72, year: "2025-2026", metrics: "Bali market leader" },
  { phase: "National Network", status: "upcoming" as const, progress: 15, year: "2026-2027", metrics: "5 Indonesian cities" },
  { phase: "Regional Grid", status: "future" as const, progress: 0, year: "2027-2029", metrics: "SE Asia expansion" },
  { phase: "Global Infrastructure", status: "future" as const, progress: 0, year: "2029-2035", metrics: "Multi-continent" },
];

const globalFlowData = [
  { month: "Q1", domestic: 4.2, crossBorder: 0.8, projected: 6.5 },
  { month: "Q2", domestic: 5.8, crossBorder: 1.4, projected: 8.2 },
  { month: "Q3", domestic: 7.4, crossBorder: 2.1, projected: 11.0 },
  { month: "Q4", domestic: 9.2, crossBorder: 3.2, projected: 14.8 },
  { month: "Q5", domestic: 12.0, crossBorder: 4.8, projected: 19.5 },
  { month: "Q6", domestic: 15.4, crossBorder: 6.8, projected: 26.0 },
];

const networkMetrics = [
  { metric: "Liquidity", value: 68 }, { metric: "Penetration", value: 34 },
  { metric: "Resilience", value: 72 }, { metric: "Velocity", value: 78 },
  { metric: "Density", value: 56 }, { metric: "Autonomy", value: 62 },
];

// ─── Score Gauge ──────────────────────────────────────────────────────────────
const ScoreGauge = ({ score, label, size = 100 }: { score: number; label: string; size?: number }) => {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const offset = arc - (arc * score) / 100;
  const color = score >= 70 ? "hsl(var(--primary))" : score >= 45 ? "hsl(45 100% 55%)" : "hsl(var(--muted-foreground))";
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={6} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          initial={{ strokeDashoffset: arc }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground">{score}</span>
        <span className="text-[8px] text-muted-foreground font-medium">{label}</span>
      </div>
    </div>
  );
};

// ─── Tab 1: Global Expansion Simulator ────────────────────────────────────────
const ExpansionSimulator = () => {
  const [speed, setSpeed] = useState([50]);
  const [marketingBudget, setMarketingBudget] = useState([30]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const projectedDeals = useMemo(() => {
    const base = speed[0] * 0.6 + marketingBudget[0] * 0.4;
    return Math.round(base * 2.4);
  }, [speed, marketingBudget]);

  const statusColors: Record<string, string> = {
    active: "border-emerald-500/30 text-emerald-400",
    planned: "border-primary/30 text-primary",
    research: "border-amber-500/30 text-amber-400",
    future: "border-border/60 text-muted-foreground",
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      {/* Map Placeholder + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Expansion Map</h3>
              <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
                <Globe className="h-3 w-3 mr-1" />8 Cities Mapped
              </Badge>
            </div>
            {/* Map visualization with positioned nodes */}
            <div className="relative bg-muted/10 rounded-lg border border-border/30 h-[280px] overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 75% 60%, hsl(var(--primary)) 0%, transparent 40%)",
              }} />
              {expansionCities.map((c) => {
                const x = ((c.lng - 55) / 65) * 100;
                const y = ((25 - c.lat) / 40) * 100;
                return (
                  <motion.button key={c.city} className="absolute z-10 group" style={{ left: `${Math.min(92, Math.max(4, x))}%`, top: `${Math.min(88, Math.max(8, y))}%` }}
                    onClick={() => setSelectedCity(selectedCity === c.city ? null : c.city)}
                    whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.95 }}>
                    <div className={`h-4 w-4 rounded-full border-2 ${
                      c.status === "active" ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                      c.status === "planned" ? "bg-primary border-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]" :
                      c.status === "research" ? "bg-amber-500 border-amber-400" :
                      "bg-muted-foreground/40 border-muted-foreground/30"
                    }`} />
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.city.split(" (")[0]}
                    </span>
                  </motion.button>
                );
              })}
              {/* Legend */}
              <div className="absolute bottom-2 left-2 flex gap-3">
                {[
                  { label: "Active", cls: "bg-emerald-500" },
                  { label: "Planned", cls: "bg-primary" },
                  { label: "Research", cls: "bg-amber-500" },
                  { label: "Future", cls: "bg-muted-foreground/40" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${l.cls}`} />
                    <span className="text-[8px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Simulation Controls */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full space-y-4">
            <h3 className="text-sm font-bold text-foreground">Simulation Controls</h3>
            <div>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-muted-foreground font-medium">Expansion Speed</span>
                <span className="text-foreground font-semibold">{speed[0] < 33 ? "Conservative" : speed[0] < 66 ? "Moderate" : "Aggressive"}</span>
              </div>
              <Slider value={speed} onValueChange={setSpeed} min={0} max={100} step={1} className="mb-4" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-muted-foreground font-medium">Marketing Investment</span>
                <span className="text-foreground font-semibold">Rp {marketingBudget[0] * 10}M/mo</span>
              </div>
              <Slider value={marketingBudget} onValueChange={setMarketingBudget} min={5} max={100} step={5} />
            </div>
            <div className="border-t border-border/40 pt-3 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Projected Monthly Deals</span>
                <span className="text-lg font-bold text-primary">{projectedDeals}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Est. Break-even</span>
                <span className="font-semibold text-foreground">{speed[0] > 66 ? "6 months" : speed[0] > 33 ? "9 months" : "14 months"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Capital Required</span>
                <span className="font-semibold text-foreground">Rp {(marketingBudget[0] * 0.42).toFixed(1)}B</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] text-muted-foreground">Tier-2 coastal city clusters may generate 3x faster liquidity formation based on Bali benchmarks.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* City Readiness Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {expansionCities.map(c => (
          <motion.div key={c.city} variants={fadeUp}>
            <Card className={`p-3 border-border/40 bg-card/80 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/20 ${selectedCity === c.city ? "ring-1 ring-primary/30" : ""}`}
              onClick={() => setSelectedCity(selectedCity === c.city ? null : c.city)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[11px] font-bold text-foreground">{c.city.split(" (")[0]}</span>
                </div>
                <Badge variant="outline" className={`text-[8px] h-4 px-1 ${statusColors[c.status]}`}>{c.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div>
                  <span className="text-muted-foreground">Readiness</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Progress value={c.readiness} className="h-1 flex-1" />
                    <span className="font-bold text-foreground">{c.readiness}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Attract.</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Progress value={c.attractiveness} className="h-1 flex-1" />
                    <span className="font-bold text-foreground">{c.attractiveness}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Capital</span>
                  <span className="font-bold text-foreground block mt-0.5">{c.capital > 0 ? `Rp ${c.capital}B` : "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reg. Risk</span>
                  <span className={`font-bold block mt-0.5 ${c.regulatory > 50 ? "text-amber-400" : "text-foreground"}`}>{c.regulatory}%</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Liquidity Ramp Timeline */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-foreground mb-3">Projected Liquidity Ramp (New City)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={[
              { month: "M1", liquidity: 5, deals: 2 }, { month: "M2", liquidity: 12, deals: 6 },
              { month: "M3", liquidity: 22, deals: 14 }, { month: "M4", liquidity: 35, deals: 24 },
              { month: "M5", liquidity: 48, deals: 38 }, { month: "M6", liquidity: 58, deals: 52 },
              { month: "M9", liquidity: 74, deals: 86 }, { month: "M12", liquidity: 88, deals: 142 },
            ]}>
              <defs>
                <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="liquidity" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#liqGrad)" name="Liquidity Score" />
              <Line dataKey="deals" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Deals" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ─── Tab 2: Autonomous Growth Engine ──────────────────────────────────────────
const AutonomousGrowthEngine = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
    {/* Autonomous Confidence */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-primary" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Autonomous Growth Confidence</p>
            </div>
            <p className="text-[10px] text-muted-foreground">AI-driven marketplace optimization running across 6 growth loops</p>
          </div>
          <ScoreGauge score={71} label="Autonomy" />
        </div>
      </Card>
    </motion.div>

    {/* Flywheel Visualization */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Marketplace Flywheel Health</h3>
        <div className="flex flex-col gap-1.5">
          {flywheelStages.map((s, i) => (
            <div key={s.stage} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-semibold text-foreground">{s.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-emerald-400 font-bold">{s.trend}</span>
                    <span className="text-[10px] font-bold text-foreground">{s.value}%</span>
                  </div>
                </div>
                <Progress value={s.value} className="h-1.5" />
                <p className="text-[8px] text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
              {i < flywheelStages.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0 -mr-1" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    {/* AI Growth Panels */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Optimization Event Feed */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Autonomous Actions</h3>
            <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
              <Radio className="h-3 w-3 mr-1" />Live
            </Badge>
          </div>
          <div className="space-y-2">
            {autonomousEvents.map((e, i) => {
              const typeConfig: Record<string, { icon: React.ElementType; cls: string }> = {
                pricing: { icon: DollarSign, cls: "bg-primary/10 text-primary" },
                agents: { icon: Users, cls: "bg-amber-500/10 text-amber-400" },
                growth: { icon: Rocket, cls: "bg-emerald-500/10 text-emerald-400" },
                alert: { icon: AlertTriangle, cls: "bg-red-500/10 text-red-400" },
                marketing: { icon: Eye, cls: "bg-primary/10 text-primary" },
                demand: { icon: Flame, cls: "bg-amber-500/10 text-amber-400" },
              };
              const cfg = typeConfig[e.type] || typeConfig.growth;
              return (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-2 p-2 rounded-lg bg-muted/15 hover:bg-muted/25 transition-colors">
                  <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${cfg.cls}`}>
                    <cfg.icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-foreground leading-tight">{e.event}</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{e.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Growth Metrics */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Growth Loop Efficiency</h3>
          <div className="space-y-3">
            {[
              { label: "Supply Acquisition Automation", value: 78, target: 90, status: "Optimizing" },
              { label: "Demand Generation ROI", value: 3.2, target: 5.0, status: "Scaling", unit: "x" },
              { label: "Pricing Optimization Coverage", value: 64, target: 85, status: "Expanding" },
              { label: "Referral Network Virality", value: 1.4, target: 2.0, status: "Growing", unit: "K" },
              { label: "Agent Auto-Ranking Accuracy", value: 86, target: 95, status: "Learning" },
              { label: "Marketing Self-Adjustment", value: 52, target: 80, status: "Calibrating" },
            ].map(m => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground font-medium">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] h-4 px-1 border-border/60 text-muted-foreground">{m.status}</Badge>
                    <span className="font-bold text-foreground">{m.value}{m.unit || "%"}</span>
                  </div>
                </div>
                <Progress value={typeof m.target === "number" && m.target <= 100 ? (m.value / m.target) * 100 : m.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>

    {/* Manual Intervention Alerts */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-amber-500/15 bg-amber-500/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-foreground">Suggested Manual Interventions</h3>
        </div>
        <div className="space-y-1.5">
          {[
            "Ubud luxury supply gap widening — activate developer outreach program",
            "Agent churn risk elevated in Sanur — review incentive structure",
            "Cross-border buyer segment growing 4x — consider KL partnership acceleration",
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/15">
              <ChevronRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-foreground">{a}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 3: Planet-Scale Vision ───────────────────────────────────────────────
const PlanetScaleVision = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
    {/* Headline */}
    <motion.div variants={fadeUp}>
      <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm text-center">
        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-1">ASTRA LIQUIDITY NETWORK</p>
        <h2 className="text-xl font-bold text-foreground">Expansion Status</h2>
        <p className="text-[10px] text-muted-foreground mt-1">Building planet-scale real estate transaction infrastructure</p>
        <div className="flex justify-center gap-4 mt-3">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">1</p>
            <p className="text-[8px] text-muted-foreground">Active Markets</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">8</p>
            <p className="text-[8px] text-muted-foreground">Target Cities</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">3</p>
            <p className="text-[8px] text-muted-foreground">Countries</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">34.2%</p>
            <p className="text-[8px] text-muted-foreground">Market Penetration</p>
          </div>
        </div>
      </Card>
    </motion.div>

    {/* Phase Timeline */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Infrastructure Evolution Timeline</h3>
        <div className="space-y-3">
          {liquidityPhases.map((p, i) => (
            <div key={p.phase} className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                p.status === "active" ? "border-primary bg-primary/10" :
                p.status === "upcoming" ? "border-amber-500 bg-amber-500/10" :
                "border-border bg-muted/20"
              }`}>
                <span className="text-[10px] font-bold text-foreground">{i + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">{p.phase}</span>
                  <span className="text-[9px] text-muted-foreground">{p.year}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Progress value={p.progress} className="h-1.5 flex-1" />
                  <span className="text-[9px] font-semibold text-foreground w-8 text-right">{p.progress}%</span>
                </div>
                <p className="text-[8px] text-muted-foreground mt-0.5">{p.metrics}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    {/* Transaction Flow + Radar */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Transaction Flow Projection (Rp B)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={globalFlowData}>
              <defs>
                <linearGradient id="domGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="domestic" stackId="a" stroke="hsl(var(--primary))" fill="url(#domGrad)" strokeWidth={2} name="Domestic" />
              <Area dataKey="crossBorder" stackId="a" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground) / 0.1)" strokeWidth={1.5} name="Cross-Border" />
              <Line dataKey="projected" stroke="hsl(var(--border))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-2">Network Resilience Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={networkMetrics}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>

    {/* Strategic Insight Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {[
        { label: "Global Penetration", value: "34.2%", icon: Globe, delta: 8.4 },
        { label: "City Dominance", value: "1 / 8", icon: Crown, delta: 0 },
        { label: "Economic Impact", value: "Rp 11.4B", icon: BarChart3, delta: 23.9 },
        { label: "Network Resilience", value: "72/100", icon: Shield, delta: 6.1 },
      ].map(m => (
        <motion.div key={m.label} variants={fadeUp}>
          <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
            <m.icon className="h-4 w-4 text-primary mb-1.5" />
            <p className="text-[9px] text-muted-foreground font-medium">{m.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base font-bold text-foreground">{m.value}</span>
              {m.delta > 0 && <Delta v={m.delta} />}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const GlobalExpansionIntelligence = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Global Expansion & Autonomous Growth</h1>
        <p className="text-[10px] text-muted-foreground">Strategic simulation • AI growth engine • Planet-scale liquidity vision</p>
      </div>
      <div className="flex gap-1.5">
        <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
          <Activity className="h-3 w-3 mr-1" />Systems Active
        </Badge>
      </div>
    </div>

    <Tabs defaultValue="expansion" className="space-y-4">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="expansion" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Globe className="h-3 w-3" />Expansion Simulator
        </TabsTrigger>
        <TabsTrigger value="autonomous" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Cpu className="h-3 w-3" />AI Growth Engine
        </TabsTrigger>
        <TabsTrigger value="vision" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Network className="h-3 w-3" />Planet-Scale Vision
        </TabsTrigger>
      </TabsList>

      <TabsContent value="expansion"><ExpansionSimulator /></TabsContent>
      <TabsContent value="autonomous"><AutonomousGrowthEngine /></TabsContent>
      <TabsContent value="vision"><PlanetScaleVision /></TabsContent>
    </Tabs>
  </div>
);

export default GlobalExpansionIntelligence;
