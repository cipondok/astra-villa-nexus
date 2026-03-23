import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Rocket, Globe, Building, TrendingUp, ArrowUpRight, ArrowDownRight,
  Target, Zap, Shield, DollarSign, Users, BarChart3, Activity,
  MapPin, Clock, Star, AlertTriangle, ChevronRight, Lightbulb,
  Play, Pause, RefreshCw, Radio, Crown, Sparkles, Eye,
  ArrowRight, CheckCircle, Lock, Compass, Layers, Send, Square, Trash2, MessageSquare
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useFounderCopilot } from "@/hooks/useFounderCopilot";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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

const KpiCard = ({ icon: Icon, label, value, delta, sub, variant }: {
  icon: React.ElementType; label: string; value: string; delta?: number; sub?: string;
  variant?: "danger" | "warning" | "success" | "premium";
}) => {
  const vm = {
    danger: { bg: "bg-destructive/10", text: "text-destructive" },
    warning: { bg: "bg-amber-500/10", text: "text-amber-400" },
    success: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
    premium: { bg: "bg-primary/10", text: "text-primary" },
  };
  const v = variant ? vm[variant] : { bg: "bg-primary/10", text: "text-primary" };
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className={`h-7 w-7 rounded-lg ${v.bg} flex items-center justify-center`}>
            <Icon className={`h-3.5 w-3.5 ${v.text}`} />
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

// ─── Tab 1: AI Copilot ──────────────────────────────────────────────────────
const decisionMatrix = [
  { action: "Agent Expansion — North District", reward: 82, risk: 24, confidence: 78, impact: "+22% deal velocity" },
  { action: "Premium Launch — Seminyak Villas", reward: 74, risk: 18, confidence: 84, impact: "+Rp 420M revenue" },
  { action: "Marketing Push — Canggu Buyers", reward: 68, risk: 32, confidence: 62, impact: "+48 qualified leads" },
  { action: "Vendor Incentive — Ubud Listings", reward: 56, risk: 14, confidence: 72, impact: "+18 exclusive listings" },
];

const impactTimeline = [
  { week: "W1", velocity: 12, revenue: 82, agents: 28 },
  { week: "W2", velocity: 18, revenue: 94, agents: 32 },
  { week: "W3", velocity: 24, revenue: 118, agents: 34 },
  { week: "W4", velocity: 28, revenue: 142, agents: 38 },
  { week: "W5", velocity: 34, revenue: 168, agents: 42 },
  { week: "W6", velocity: 38, revenue: 198, agents: 44 },
];

const AICopilot = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Brain} label="Strategic Confidence" value="78" delta={6} variant="premium" sub="Strong" />
      <KpiCard icon={Target} label="Focus Score" value="84" delta={4} variant="success" />
      <KpiCard icon={Zap} label="Decision Velocity" value="3.2/day" delta={18} />
      <KpiCard icon={Shield} label="Risk Exposure" value="Low" variant="success" sub="Well-managed" />
    </div>

    {/* Daily Focus */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Compass className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Today's Strategic Focus</p>
            <h3 className="text-sm font-bold text-foreground">Accelerate North District Agent Coverage</h3>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">Analysis indicates 34% agent shortage in North District while buyer demand surged 28% this week. Closing this gap could unlock Rp 680M in pipeline value within 30 days.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { action: "Deploy 4 agents to North zone", priority: "Immediate", icon: Users },
            { action: "Launch targeted listing drive", priority: "Today", icon: Target },
            { action: "Activate buyer retargeting campaign", priority: "This week", icon: Zap },
          ].map(a => (
            <div key={a.action} className="p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <a.icon className="h-3 w-3 text-primary" />
                <Badge variant="outline" className="text-[7px] h-4 px-1 border-primary/30 text-primary">{a.priority}</Badge>
              </div>
              <span className="text-[9px] font-bold text-foreground">{a.action}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Decision Matrix */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Risk vs Reward Decision Matrix</h3>
          <div className="space-y-2">
            {decisionMatrix.map(d => (
              <div key={d.action} className="p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-foreground">{d.action}</span>
                  <Badge variant="outline" className={`text-[7px] h-4 px-1 ${d.confidence >= 75 ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"}`}>{d.confidence}% conf</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[8px] text-muted-foreground mb-0.5">
                      <span>Reward: <span className="text-emerald-400 font-bold">{d.reward}</span></span>
                      <span>Risk: <span className={`font-bold ${d.risk > 25 ? "text-amber-400" : "text-foreground"}`}>{d.risk}</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden flex">
                      <div className="bg-emerald-500/40 rounded-l-full" style={{ width: `${d.reward}%` }} />
                      <div className="bg-destructive/30 rounded-r-full" style={{ width: `${d.risk}%` }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-primary font-medium shrink-0">{d.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Impact Timeline */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Decision Impact Projection</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={impactTimeline}>
              <defs>
                <linearGradient id="copilotGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#copilotGrad)" name="Revenue (M)" />
              <Line dataKey="velocity" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Deal Velocity" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground"><span className="font-bold">AI Copilot:</span> Prioritizing agent expansion in North District may increase deal velocity by 22% — estimated Rp 680M pipeline unlock within 30 days.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 2: City Launch Simulator ────────────────────────────────────────────
const launchProjection = [
  { month: "M1", listings: 24, agents: 8, buyers: 42, deals: 2 },
  { month: "M2", listings: 58, agents: 14, buyers: 98, deals: 6 },
  { month: "M3", listings: 96, agents: 22, buyers: 178, deals: 14 },
  { month: "M4", listings: 142, agents: 28, buyers: 284, deals: 24 },
  { month: "M5", listings: 198, agents: 34, buyers: 412, deals: 38 },
  { month: "M6", listings: 262, agents: 42, buyers: 568, deals: 56 },
];

const CityLaunchSimulator = () => {
  const [population, setPopulation] = useState([500]);
  const [budget, setBudget] = useState([50]);
  const [agents, setAgents] = useState([12]);
  const [competition, setCompetition] = useState([30]);

  const multiplier = (population[0] / 500) * (budget[0] / 50) * (agents[0] / 12) * (1 - competition[0] / 200);
  const estDeals = Math.round(56 * multiplier);
  const breakEven = Math.round(9 / multiplier);
  const leaderProb = Math.min(95, Math.round(62 * multiplier));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KpiCard icon={Rocket} label="Est. 6-Month Deals" value={String(estDeals)} variant="premium" sub="Projected" />
        <KpiCard icon={Clock} label="Break-Even" value={`${breakEven}mo`} sub="Timeline" />
        <KpiCard icon={Crown} label="Leadership Prob." value={`${leaderProb}%`} variant={leaderProb >= 70 ? "success" : "warning"} />
        <KpiCard icon={DollarSign} label="Projected GMV" value={`Rp ${Math.round(estDeals * 1.8)}B`} variant="success" />
      </div>

      {/* Controls */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Simulation Variables</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "City Population (K)", val: population, set: setPopulation, min: 100, max: 2000, unit: "K" },
              { label: "Marketing Budget (M Rp)", val: budget, set: setBudget, min: 10, max: 200, unit: "M" },
              { label: "Initial Agent Force", val: agents, set: setAgents, min: 4, max: 40, unit: "" },
              { label: "Competitive Intensity (%)", val: competition, set: setCompetition, min: 10, max: 80, unit: "%" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-muted-foreground font-medium">{s.label}</span>
                  <span className="text-[10px] font-bold text-primary">{s.val[0]}{s.unit}</span>
                </div>
                <Slider value={s.val} onValueChange={s.set} min={s.min} max={s.max} step={1} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <h3 className="text-sm font-bold text-foreground mb-3">6-Month Launch Projection</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={launchProjection.map(d => ({
                ...d,
                listings: Math.round(d.listings * multiplier),
                buyers: Math.round(d.buyers * multiplier),
                deals: Math.round(d.deals * multiplier),
              }))}>
                <defs>
                  <linearGradient id="launchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Area dataKey="buyers" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#launchGrad)" name="Buyers" />
                <Line dataKey="listings" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Listings" />
                <Line dataKey="deals" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Deals" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <h3 className="text-sm font-bold text-foreground mb-3">Launch Readiness Profile</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={[
                { metric: "Supply Velocity", value: Math.min(95, Math.round(68 * multiplier)) },
                { metric: "Agent Density", value: Math.min(95, Math.round(58 * multiplier)) },
                { metric: "Demand Signal", value: Math.min(95, Math.round(72 * multiplier)) },
                { metric: "Marketing Eff.", value: Math.min(95, Math.round(64 * multiplier)) },
                { metric: "Liquidity Prob.", value: Math.min(95, Math.round(52 * multiplier)) },
                { metric: "Comp. Advantage", value: Math.min(95, Math.round(78 * (1 - competition[0] / 100))) },
              ]}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <p className="text-[10px] text-foreground"><span className="font-bold">Simulation:</span> At current parameters, expect {estDeals} deals in 6 months with break-even at month {breakEven}. Market leadership probability: {leaderProb}%.</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ─── Tab 3: Global Capital Flow ──────────────────────────────────────────────
const capitalFlowTrend = [
  { quarter: "Q1'25", crossBorder: 2.4, institutional: 1.8, retail: 3.2 },
  { quarter: "Q2'25", crossBorder: 2.8, institutional: 2.4, retail: 3.6 },
  { quarter: "Q3'25", crossBorder: 3.4, institutional: 3.2, retail: 4.1 },
  { quarter: "Q4'25", crossBorder: 4.2, institutional: 4.1, retail: 4.8 },
  { quarter: "Q1'26", crossBorder: 5.1, institutional: 5.2, retail: 5.4 },
];

const cityCapitalRanking = [
  { city: "Bali", attraction: 92, yield: 8.4, institutional: 78, liquidity: 86, trend: "Accelerating" },
  { city: "Jakarta", attraction: 78, yield: 6.8, institutional: 84, liquidity: 72, trend: "Stable" },
  { city: "Surabaya", attraction: 54, yield: 7.2, institutional: 42, liquidity: 48, trend: "Emerging" },
  { city: "Bandung", attraction: 48, yield: 6.4, institutional: 34, liquidity: 42, trend: "Early" },
  { city: "Lombok", attraction: 62, yield: 9.2, institutional: 28, liquidity: 38, trend: "Emerging" },
];

const GlobalCapitalFlow = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={Globe} label="Cross-Border Flow" value="$5.1B" delta={22} variant="premium" sub="Quarterly" />
      <KpiCard icon={Building} label="Institutional Index" value="78" delta={14} variant="success" />
      <KpiCard icon={Activity} label="Yield Compression" value="-0.4%" sub="Tightening" />
      <KpiCard icon={MapPin} label="Active Markets" value="5" delta={25} />
      <KpiCard icon={TrendingUp} label="Capital Velocity" value="High" variant="success" sub="Accelerating" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Investment Flow Trends ($B)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={capitalFlowTrend}>
            <defs>
              <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Area dataKey="institutional" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#capGrad)" name="Institutional" />
            <Line dataKey="crossBorder" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Cross-Border" />
            <Line dataKey="retail" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Retail" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Strategic City Capital Attraction Ranking</h3>
        <div className="space-y-1.5">
          {cityCapitalRanking.map((c, i) => (
            <div key={c.city} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                i === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground"
              }`}>{i + 1}</div>
              <span className="text-[11px] font-bold text-foreground w-20">{c.city}</span>
              <div className="flex-1 flex gap-4 text-[9px]">
                <div className="text-center">
                  <span className="text-muted-foreground block">Attraction</span>
                  <span className={`font-bold ${c.attraction >= 70 ? "text-emerald-400" : "text-foreground"}`}>{c.attraction}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Yield</span>
                  <span className="font-bold text-foreground">{c.yield}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Institutional</span>
                  <span className={`font-bold ${c.institutional >= 70 ? "text-emerald-400" : c.institutional >= 40 ? "text-foreground" : "text-amber-400"}`}>{c.institutional}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Liquidity</span>
                  <span className="font-bold text-foreground">{c.liquidity}</span>
                </div>
              </div>
              <Badge variant="outline" className={`text-[7px] h-4 px-1.5 shrink-0 ${
                c.trend === "Accelerating" ? "border-emerald-500/30 text-emerald-400" :
                c.trend === "Stable" ? "border-primary/30 text-primary" :
                c.trend === "Emerging" ? "border-amber-500/30 text-amber-400" : "border-border/60 text-muted-foreground"
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
          <p className="text-[10px] text-foreground"><span className="font-bold">Capital Intelligence:</span> Emerging secondary cities (Lombok, Surabaya) showing rising institutional acquisition activity — early positioning may yield 2.4× capital appreciation over 36 months.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 4: Economic Infrastructure Narrative ────────────────────────────────
const phases = [
  { phase: "Early Traction", label: "Marketplace Activation", progress: 82, status: "active" as const, metrics: "342 listings • 34 agents • 56 deals" },
  { phase: "City Dominance", label: "First City Leadership", progress: 48, status: "in-progress" as const, metrics: "Target: 500+ listings • 60% market share" },
  { phase: "National Network", label: "Multi-City Expansion", progress: 12, status: "planned" as const, metrics: "Target: 5 cities • 2,000+ listings" },
  { phase: "Regional Grid", label: "SEA Economic Grid", progress: 0, status: "vision" as const, metrics: "Target: 3+ countries • $1B+ GMV" },
  { phase: "Global Infrastructure", label: "Planetary Liquidity Layer", progress: 0, status: "vision" as const, metrics: "Target: 20+ markets • $10B+ GMV" },
];

const infraMetrics = [
  { month: "Jan", listings: 142, transactions: 22, liquidity: 34 },
  { month: "Feb", listings: 198, transactions: 38, liquidity: 42 },
  { month: "Mar", listings: 268, transactions: 56, liquidity: 52 },
  { month: "Apr", listings: 342, transactions: 78, liquidity: 64 },
  { month: "May", listings: 428, transactions: 98, liquidity: 72 },
];

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-primary/20 text-primary border-primary/30",
  planned: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  vision: "bg-muted/20 text-muted-foreground border-border/40",
};

const InfrastructureNarrative = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    {/* Headline */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">ASTRA Real Estate Liquidity Infrastructure</p>
            <h3 className="text-base font-bold text-foreground mt-1">Development Status</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Marketplace → Network → Infrastructure evolution trajectory</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">Phase 1</span>
            <p className="text-[9px] text-primary font-medium">Early Traction</p>
          </div>
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Layers} label="Infrastructure Index" value="34" delta={18} variant="premium" sub="Building" />
      <KpiCard icon={Globe} label="Market Penetration" value="1 city" sub="Bali operational" />
      <KpiCard icon={Activity} label="Liquidity Density" value="72" delta={22} variant="success" />
      <KpiCard icon={TrendingUp} label="Impact Projection" value="High" variant="success" sub="Strong trajectory" />
    </div>

    {/* Phase Timeline */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Evolution Timeline</h3>
        <div className="space-y-2">
          {phases.map((p, i) => (
            <div key={p.phase} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${statusColors[p.status]}`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-foreground">{p.phase}</span>
                  <span className="text-[9px] text-muted-foreground">— {p.label}</span>
                  <Badge variant="outline" className={`text-[7px] h-4 px-1 ${statusColors[p.status]}`}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={p.progress} className="h-1.5 flex-1" />
                  <span className="text-[9px] font-bold text-primary w-8">{p.progress}%</span>
                </div>
                <p className="text-[8px] text-muted-foreground mt-0.5">{p.metrics}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Infrastructure Growth Metrics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={infraMetrics}>
              <defs>
                <linearGradient id="infraGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area dataKey="listings" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#infraGrad)" name="Listings" />
              <Line dataKey="transactions" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Transactions" />
              <Line dataKey="liquidity" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Liquidity Index" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Strategic Milestone Tracker</h3>
          <div className="space-y-2">
            {[
              { milestone: "First 100 Deals", status: "achieved" as const, date: "Mar 2026" },
              { milestone: "City Liquidity Threshold", status: "in-progress" as const, date: "Est. Jun 2026" },
              { milestone: "1,000 Active Listings", status: "projected" as const, date: "Est. Sep 2026" },
              { milestone: "Second City Launch", status: "planned" as const, date: "Est. Q4 2026" },
              { milestone: "$1M Monthly Revenue", status: "planned" as const, date: "Est. Q1 2027" },
            ].map(m => (
              <div key={m.milestone} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/10">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                  m.status === "achieved" ? "bg-emerald-500/20" : m.status === "in-progress" ? "bg-primary/20" : "bg-muted/20"
                }`}>
                  {m.status === "achieved" ? <CheckCircle className="h-3 w-3 text-emerald-400" /> :
                   m.status === "in-progress" ? <Activity className="h-3 w-3 text-primary" /> :
                   <Clock className="h-3 w-3 text-muted-foreground" />}
                </div>
                <span className="text-[10px] font-bold text-foreground flex-1">{m.milestone}</span>
                <span className="text-[9px] text-muted-foreground">{m.date}</span>
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
  </motion.div>
);

// ─── Tab 5: Live AI Chat ─────────────────────────────────────────────────────
const quickPrompts = [
  { label: "Daily Execution Plan", prompt: "Give me my top 5 priority actions for today based on current marketplace data." },
  { label: "Agent Outreach Script", prompt: "Generate a WhatsApp outreach script for recruiting property agents in Bali focusing on villa listings." },
  { label: "Investor Response", prompt: "An investor from Singapore is interested in Bali villas with $200K budget seeking 8%+ rental yield. Draft a personalized WhatsApp response." },
  { label: "Deal Negotiation", prompt: "A buyer offered Rp 2.8B on a villa listed at Rp 3.2B in Seminyak with high demand. What's the optimal counter-offer strategy?" },
  { label: "Listing Optimization", prompt: "Optimize this listing: 3BR villa in Canggu, 200sqm, rice field views, Rp 4.5B. Target: international investors seeking rental yield." },
];

const LiveAIChat = () => {
  const { messages, isStreaming, sendMessage, stopStreaming, clearMessages } = useFounderCopilot();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isStreaming) return;
    sendMessage(prompt);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden flex flex-col" style={{ height: "520px" }}>
        {/* Chat header */}
        <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-foreground">ASTRA Founder Copilot</span>
              <p className="text-[8px] text-muted-foreground">Real-time marketplace intelligence • 5 task modes</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearMessages} className="p-1.5 rounded-md hover:bg-muted/50 transition-colors">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-foreground">Founder AI Copilot</h3>
                <p className="text-[10px] text-muted-foreground max-w-xs mt-1">
                  Agent outreach scripts • Investor responses • Deal negotiation • Listing optimization • Daily execution
                </p>
              </div>
              <div className="w-full max-w-md grid grid-cols-1 gap-1.5">
                {quickPrompts.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleQuickPrompt(q.prompt)}
                    className="text-left px-3 py-2 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-foreground">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[80%] rounded-xl px-3.5 py-2.5",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/40 text-foreground rounded-bl-sm border border-border/30"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-[11px] leading-relaxed [&_p]:mb-1.5 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-[11px] [&_strong]:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-[11px]">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-muted/40 rounded-xl rounded-bl-sm px-4 py-3 border border-border/30">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border/30 bg-muted/5">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about agents, investors, deals, listings, or daily execution..."
              className="flex-1 text-[11px] h-9 bg-background/60 border-border/40"
              disabled={isStreaming}
            />
            {isStreaming ? (
              <button onClick={stopStreaming} className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0">
                <Square className="h-3.5 w-3.5 text-destructive" />
              </button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim()} className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-30 shrink-0">
                <Send className="h-3.5 w-3.5 text-primary" />
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const FounderAICopilotGlobalIntel = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Founder AI Copilot & Global Intelligence</h1>
        <p className="text-[10px] text-muted-foreground">Live AI chat • Strategic decision AI • City launch simulator • Capital flow • Infrastructure</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
        <Brain className="h-3 w-3 mr-1" />AI Copilot Active
      </Badge>
    </div>

    <Tabs defaultValue="chat" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="chat" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <MessageSquare className="h-3 w-3" />Live Chat
        </TabsTrigger>
        <TabsTrigger value="copilot" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Brain className="h-3 w-3" />Dashboard
        </TabsTrigger>
        <TabsTrigger value="launch" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Rocket className="h-3 w-3" />City Launch
        </TabsTrigger>
        <TabsTrigger value="capital" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Globe className="h-3 w-3" />Capital Flow
        </TabsTrigger>
        <TabsTrigger value="infrastructure" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Layers className="h-3 w-3" />Infrastructure
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat"><LiveAIChat /></TabsContent>
      <TabsContent value="copilot"><AICopilot /></TabsContent>
      <TabsContent value="launch"><CityLaunchSimulator /></TabsContent>
      <TabsContent value="capital"><GlobalCapitalFlow /></TabsContent>
      <TabsContent value="infrastructure"><InfrastructureNarrative /></TabsContent>
    </Tabs>
  </div>
);

export default FounderAICopilotGlobalIntel;
