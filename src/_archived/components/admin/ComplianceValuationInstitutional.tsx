import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale, Shield, FileCheck, AlertTriangle, Globe, Clock, CheckCircle,
  TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3, Activity,
  DollarSign, Building, Users, Star, Eye, Gem, Crown, MapPin,
  Zap, Lock, FileText, Target, Award, ChevronRight, Briefcase,
  Heart, Sparkles, Radio
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
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
  const variantMap = {
    danger: { bg: "bg-destructive/10", text: "text-destructive" },
    warning: { bg: "bg-amber-500/10", text: "text-amber-400" },
    success: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
    premium: { bg: "bg-primary/10", text: "text-primary" },
  };
  const v = variant ? variantMap[variant] : { bg: "bg-primary/10", text: "text-primary" };
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

const StatusBadge = ({ status }: { status: "approved" | "pending" | "blocked" | "in-progress" }) => {
  const cls = {
    approved: "border-emerald-500/30 text-emerald-400",
    pending: "border-amber-500/30 text-amber-400",
    blocked: "border-red-500/30 text-red-400",
    "in-progress": "border-primary/30 text-primary",
  };
  return <Badge variant="outline" className={`text-[7px] h-4 px-1.5 ${cls[status]}`}>{status}</Badge>;
};

// ─── Tab 1: Legal Compliance & Regulatory ────────────────────────────────────
const regionCompliance = [
  { region: "Bali", license: "approved" as const, kyc: 92, aml: 88, risk: "low", docs: 14, docsTotal: 15, readiness: 94 },
  { region: "Jakarta", license: "in-progress" as const, kyc: 78, aml: 72, risk: "medium", docs: 8, docsTotal: 15, readiness: 62 },
  { region: "Surabaya", license: "pending" as const, kyc: 45, aml: 38, risk: "high", docs: 4, docsTotal: 15, readiness: 34 },
  { region: "Bandung", license: "pending" as const, kyc: 52, aml: 48, risk: "medium", docs: 6, docsTotal: 15, readiness: 42 },
  { region: "Lombok", license: "blocked" as const, kyc: 22, aml: 18, risk: "high", docs: 2, docsTotal: 15, readiness: 18 },
];

const complianceTimeline = [
  { month: "Jan", bali: 72, jakarta: 28, surabaya: 12 },
  { month: "Feb", bali: 78, jakarta: 38, surabaya: 18 },
  { month: "Mar", bali: 84, jakarta: 48, surabaya: 22 },
  { month: "Apr", bali: 88, jakarta: 55, surabaya: 28 },
  { month: "May", bali: 94, jakarta: 62, surabaya: 34 },
];

const LegalCompliance = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={Scale} label="Regions Approved" value="1/5" sub="Bali operational" variant="success" />
      <KpiCard icon={FileCheck} label="KYC Completion" value="72%" delta={8} />
      <KpiCard icon={Shield} label="AML Compliance" value="68%" delta={5} />
      <KpiCard icon={AlertTriangle} label="Legal Risk Alerts" value="3" variant="warning" />
      <KpiCard icon={FileText} label="Doc Checklist" value="34/75" sub="45% complete" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Regional Compliance Readiness</h3>
        <div className="space-y-2">
          {regionCompliance.map(r => (
            <div key={r.region} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="w-20">
                <span className="text-[11px] font-bold text-foreground">{r.region}</span>
              </div>
              <StatusBadge status={r.license} />
              <div className="flex-1 flex gap-4 text-[9px]">
                <div className="text-center">
                  <span className="text-muted-foreground block">KYC</span>
                  <span className={`font-bold ${r.kyc >= 80 ? "text-emerald-400" : r.kyc >= 50 ? "text-amber-400" : "text-red-400"}`}>{r.kyc}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">AML</span>
                  <span className={`font-bold ${r.aml >= 80 ? "text-emerald-400" : r.aml >= 50 ? "text-amber-400" : "text-red-400"}`}>{r.aml}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Docs</span>
                  <span className="font-bold text-foreground">{r.docs}/{r.docsTotal}</span>
                </div>
              </div>
              <div className="w-32">
                <div className="flex items-center justify-between text-[9px] mb-0.5">
                  <span className="text-muted-foreground">Readiness</span>
                  <span className={`font-bold ${r.readiness >= 80 ? "text-emerald-400" : r.readiness >= 50 ? "text-amber-400" : "text-red-400"}`}>{r.readiness}%</span>
                </div>
                <Progress value={r.readiness} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Compliance Progress Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={complianceTimeline}>
              <defs>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<Tip />} />
              <Area dataKey="bali" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#compGrad)" name="Bali" />
              <Line dataKey="jakarta" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Jakarta" />
              <Line dataKey="surabaya" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Surabaya" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Regulatory Risk Alerts</h3>
          <div className="space-y-2">
            {[
              { alert: "Brokerage licensing requirement", region: "Jakarta", severity: "high" as const, desc: "City expansion blocked — brokerage license submission needed" },
              { alert: "AML reporting threshold update", region: "All", severity: "medium" as const, desc: "New OJK regulation requires lower transaction reporting threshold" },
              { alert: "Foreign investment restriction", region: "Lombok", severity: "high" as const, desc: "Land ownership restriction for foreign entities — requires local partnership structure" },
            ].map(a => (
              <div key={a.alert} className="p-2.5 rounded-lg bg-muted/10">
                <div className="flex items-center gap-2 mb-0.5">
                  <AlertTriangle className={`h-3 w-3 ${a.severity === "high" ? "text-red-400" : "text-amber-400"}`} />
                  <span className="text-[10px] font-bold text-foreground">{a.alert}</span>
                  <Badge variant="outline" className={`text-[7px] h-4 px-1 ${a.severity === "high" ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-400"}`}>{a.severity}</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground ml-5">{a.desc} — <span className="text-foreground font-medium">{a.region}</span></p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground"><span className="font-bold">Compliance Insight:</span> Jakarta expansion readiness blocked by brokerage licensing requirement — estimated 6–8 weeks to clearance with current documentation pace.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 2: Property Valuation Intelligence ──────────────────────────────────
const districtPriceIndex = [
  { month: "Jan", seminyak: 28.4, canggu: 22.1, ubud: 14.8, jimbaran: 18.2 },
  { month: "Feb", seminyak: 29.1, canggu: 23.4, ubud: 15.2, jimbaran: 18.8 },
  { month: "Mar", seminyak: 30.2, canggu: 24.8, ubud: 15.6, jimbaran: 19.4 },
  { month: "Apr", seminyak: 31.8, canggu: 26.2, ubud: 16.0, jimbaran: 20.1 },
  { month: "May", seminyak: 33.2, canggu: 27.8, ubud: 16.4, jimbaran: 20.8 },
];

const valuationMetrics = [
  { district: "Seminyak", median: "Rp 33.2M/sqm", change: 12, liquidity: 84, volatility: 18, confidence: 88 },
  { district: "Canggu", median: "Rp 27.8M/sqm", change: 14, liquidity: 76, volatility: 22, confidence: 82 },
  { district: "Jimbaran", median: "Rp 20.8M/sqm", change: 8, liquidity: 62, volatility: 14, confidence: 78 },
  { district: "Ubud", median: "Rp 16.4M/sqm", change: 6, liquidity: 48, volatility: 12, confidence: 72 },
  { district: "Sanur", median: "Rp 18.6M/sqm", change: 4, liquidity: 54, volatility: 10, confidence: 74 },
];

const supplyDemand = [
  { district: "Seminyak", supply: 42, demand: 78 },
  { district: "Canggu", supply: 38, demand: 72 },
  { district: "Ubud", supply: 52, demand: 34 },
  { district: "Jimbaran", supply: 28, demand: 48 },
  { district: "Sanur", supply: 44, demand: 38 },
];

const ValuationIntelligence = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={TrendingUp} label="Avg Price Growth" value="+8.8%" delta={3} variant="success" sub="Quarterly" />
      <KpiCard icon={BarChart3} label="Median Price/sqm" value="Rp 25.4M" delta={6} />
      <KpiCard icon={Activity} label="Liquidity Score" value="72" delta={8} />
      <KpiCard icon={Target} label="Valuation Confidence" value="82%" delta={4} variant="success" />
      <KpiCard icon={AlertTriangle} label="Volatility Index" value="16" delta={-12} sub="Stabilizing" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">District Price Index Trend (M/sqm)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={districtPriceIndex}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Line dataKey="seminyak" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Seminyak" />
            <Line dataKey="canggu" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Canggu" />
            <Line dataKey="jimbaran" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Jimbaran" />
            <Line dataKey="ubud" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="2 4" dot={false} name="Ubud" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Valuation Benchmark</h3>
          <div className="space-y-1.5">
            {valuationMetrics.map(d => (
              <div key={d.district} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <span className="text-[10px] font-bold text-foreground w-20">{d.district}</span>
                <span className="text-[10px] font-bold text-foreground w-28">{d.median}</span>
                <Delta v={d.change} />
                <div className="flex gap-3 text-[9px] text-muted-foreground ml-auto">
                  <span>Liq: <span className={`font-bold ${d.liquidity >= 70 ? "text-emerald-400" : d.liquidity >= 50 ? "text-foreground" : "text-amber-400"}`}>{d.liquidity}</span></span>
                  <span>Vol: <span className="font-bold text-foreground">{d.volatility}</span></span>
                  <span>Conf: <span className="font-bold text-primary">{d.confidence}%</span></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Supply vs Demand Pressure</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={supplyDemand} barSize={14} barGap={2}>
              <XAxis dataKey="district" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="supply" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} name="Supply" />
              <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Demand" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground"><span className="font-bold">AI Valuation Insight:</span> Apartment segment in Canggu showing 14% quarterly price acceleration — demand outpacing supply 1.9:1.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 3: Institutional Deal Flow ──────────────────────────────────────────
const institutionalDeals = [
  { id: "INS-001", name: "Seminyak Villa Portfolio (12 units)", value: "Rp 42B", yield: 8.4, risk: "low", irr: 14.2, status: "Due Diligence" as const, confidence: 88 },
  { id: "INS-002", name: "Canggu Mixed-Use Development", value: "Rp 68B", yield: 7.8, risk: "medium", irr: 16.8, status: "Pipeline" as const, confidence: 72 },
  { id: "INS-003", name: "Ubud Eco-Resort Land Bundle", value: "Rp 28B", yield: 6.2, risk: "medium", irr: 12.4, status: "Pipeline" as const, confidence: 64 },
  { id: "INS-004", name: "Jimbaran Beachfront Portfolio", value: "Rp 86B", yield: 9.2, risk: "low", irr: 18.6, status: "Term Sheet" as const, confidence: 92 },
  { id: "INS-005", name: "Sanur Commercial Hub", value: "Rp 34B", yield: 7.4, risk: "high", irr: 11.2, status: "Pipeline" as const, confidence: 56 },
];

const capitalDeployment = [
  { quarter: "Q1", deployed: 42, pipeline: 128 },
  { quarter: "Q2", deployed: 68, pipeline: 186 },
  { quarter: "Q3", deployed: 112, pipeline: 242 },
  { quarter: "Q4 (proj)", deployed: 164, pipeline: 320 },
];

const InstitutionalDealFlow = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={Briefcase} label="Active Deals" value="5" sub="Rp 258B pipeline" variant="premium" />
      <KpiCard icon={DollarSign} label="Capital Deployed" value="Rp 42B" delta={68} variant="success" />
      <KpiCard icon={TrendingUp} label="Avg IRR" value="14.6%" delta={4} />
      <KpiCard icon={Target} label="Inst. Confidence" value="78" delta={12} variant="success" />
      <KpiCard icon={Activity} label="Market Depth" value="High" sub="Strong liquidity" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Institutional Opportunity Pipeline</h3>
        <div className="space-y-1.5">
          {institutionalDeals.map((d, i) => (
            <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                d.confidence >= 85 ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground"
              }`}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary">{d.id}</span>
                  <span className="text-[10px] font-bold text-foreground truncate">{d.name}</span>
                </div>
              </div>
              <div className="flex gap-4 text-[9px] shrink-0">
                <div className="text-center">
                  <span className="text-muted-foreground block">Value</span>
                  <span className="font-bold text-foreground">{d.value}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Yield</span>
                  <span className="font-bold text-emerald-400">{d.yield}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">IRR</span>
                  <span className="font-bold text-foreground">{d.irr}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Confidence</span>
                  <span className={`font-bold ${d.confidence >= 80 ? "text-emerald-400" : d.confidence >= 60 ? "text-foreground" : "text-amber-400"}`}>{d.confidence}%</span>
                </div>
              </div>
              <Badge variant="outline" className={`text-[7px] h-4 px-1.5 shrink-0 ${
                d.status === "Term Sheet" ? "border-emerald-500/30 text-emerald-400" :
                d.status === "Due Diligence" ? "border-primary/30 text-primary" : "border-border/60 text-muted-foreground"
              }`}>{d.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Capital Deployment Velocity (Rp B)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={capitalDeployment} barSize={18} barGap={2}>
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="deployed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Deployed" />
              <Bar dataKey="pipeline" fill="hsl(var(--muted-foreground) / 0.2)" radius={[4, 4, 0, 0]} name="Pipeline" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Asset Cluster Profile</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={[
              { metric: "Yield Quality", value: 78 },
              { metric: "Liquidity Depth", value: 72 },
              { metric: "Risk-Adj Return", value: 82 },
              { metric: "Market Access", value: 68 },
              { metric: "Due Diligence", value: 74 },
              { metric: "Scale Potential", value: 86 },
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
  </motion.div>
);

// ─── Tab 4: Luxury Segment ───────────────────────────────────────────────────
const luxuryDistricts = [
  { district: "Seminyak", inventory: 42, inquiries: 86, satisfaction: 92, avgClose: 28, concierge: 78 },
  { district: "Canggu", inventory: 34, inquiries: 72, satisfaction: 88, avgClose: 32, concierge: 64 },
  { district: "Jimbaran", inventory: 18, inquiries: 48, satisfaction: 94, avgClose: 24, concierge: 82 },
  { district: "Ubud", inventory: 12, inquiries: 28, satisfaction: 86, avgClose: 38, concierge: 56 },
];

const luxuryTrend = [
  { month: "Jan", inquiries: 48, viewings: 22, deals: 4 },
  { month: "Feb", inquiries: 62, viewings: 28, deals: 6 },
  { month: "Mar", inquiries: 78, viewings: 36, deals: 8 },
  { month: "Apr", inquiries: 92, viewings: 42, deals: 10 },
  { month: "May", inquiries: 108, viewings: 52, deals: 12 },
];

const LuxurySegment = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={Gem} label="Luxury Listings" value="106" delta={18} variant="premium" sub="Above $500K" />
      <KpiCard icon={Crown} label="Premium Inquiries" value="234" delta={28} />
      <KpiCard icon={Star} label="Viewing Satisfaction" value="91%" delta={4} variant="success" />
      <KpiCard icon={Clock} label="Avg Close Timeline" value="28d" delta={-14} sub="Faster" />
      <KpiCard icon={Heart} label="Concierge Usage" value="72%" delta={22} />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Luxury District Performance</h3>
        <div className="space-y-1.5">
          {luxuryDistricts.map((d, i) => (
            <div key={d.district} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                i === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground"
              }`}>{i + 1}</div>
              <span className="text-[11px] font-bold text-foreground w-20">{d.district}</span>
              <div className="flex-1 flex gap-4 text-[9px]">
                <div className="text-center">
                  <span className="text-muted-foreground block">Inventory</span>
                  <span className="font-bold text-foreground">{d.inventory}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Inquiries</span>
                  <span className="font-bold text-foreground">{d.inquiries}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Satisfaction</span>
                  <span className="font-bold text-emerald-400">{d.satisfaction}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Avg Close</span>
                  <span className="font-bold text-foreground">{d.avgClose}d</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Concierge</span>
                  <span className="font-bold text-primary">{d.concierge}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">HNW Buyer Activity Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={luxuryTrend}>
              <defs>
                <linearGradient id="luxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area dataKey="inquiries" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#luxGrad)" name="Inquiries" />
              <Line dataKey="viewings" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Viewings" />
              <Line dataKey="deals" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Deals" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Experience Optimization Insights</h3>
          <div className="space-y-2">
            {[
              { insight: "Private viewing events", desc: "May increase engagement for waterfront villas by 42%", impact: "high" as const, icon: Eye },
              { insight: "Concierge travel packages", desc: "Bundled airport pickup + villa tour boosts satisfaction 18%", impact: "high" as const, icon: Sparkles },
              { insight: "Virtual walkthroughs", desc: "3D tours reduce unnecessary physical viewings by 34%", impact: "medium" as const, icon: Globe },
              { insight: "Exclusive preview access", desc: "48h early access for premium buyers increases offer velocity", impact: "medium" as const, icon: Lock },
            ].map(i => (
              <div key={i.insight} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${i.impact === "high" ? "bg-primary/10" : "bg-muted/20"}`}>
                  <i.icon className={`h-3.5 w-3.5 ${i.impact === "high" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-foreground">{i.insight}</span>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{i.desc}</p>
                </div>
                <Badge variant="outline" className={`text-[7px] h-4 px-1 shrink-0 mt-0.5 ${
                  i.impact === "high" ? "border-emerald-500/30 text-emerald-400" : "border-border/60 text-muted-foreground"
                }`}>{i.impact}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const ComplianceValuationInstitutional = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Compliance, Valuation & Institutional Intelligence</h1>
        <p className="text-[10px] text-muted-foreground">Regulatory readiness • Property valuation • Institutional deals • Luxury segment</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
        <Scale className="h-3 w-3 mr-1" />Institutional Grade
      </Badge>
    </div>

    <Tabs defaultValue="compliance" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="compliance" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Scale className="h-3 w-3" />Compliance
        </TabsTrigger>
        <TabsTrigger value="valuation" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <TrendingUp className="h-3 w-3" />Valuation
        </TabsTrigger>
        <TabsTrigger value="institutional" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Briefcase className="h-3 w-3" />Institutional
        </TabsTrigger>
        <TabsTrigger value="luxury" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Gem className="h-3 w-3" />Luxury
        </TabsTrigger>
      </TabsList>

      <TabsContent value="compliance"><LegalCompliance /></TabsContent>
      <TabsContent value="valuation"><ValuationIntelligence /></TabsContent>
      <TabsContent value="institutional"><InstitutionalDealFlow /></TabsContent>
      <TabsContent value="luxury"><LuxurySegment /></TabsContent>
    </Tabs>
  </div>
);

export default ComplianceValuationInstitutional;
