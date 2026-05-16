import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Target, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, MapPin,
  AlertTriangle, Zap, Clock, BarChart3, ChevronRight, FileText, Download,
  Mail, Star, Building, Users, Activity, Shield, Flame, Award, Eye,
  Radio, Briefcase, CalendarDays, Layers, ArrowRight, CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
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
        <p key={i} className="text-xs font-bold text-foreground">{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

const KpiCard = ({ icon: Icon, label, value, delta, sub }: {
  icon: React.ElementType; label: string; value: string; delta?: number; sub?: string;
}) => (
  <motion.div variants={fadeUp}>
    <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
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

// ─── Tab 1: Deal Priority AI ─────────────────────────────────────────────────
const priorityDeals = [
  { id: "A102", property: "Villa Oceana, Seminyak", closing: 78, commission: 120, urgency: "high" as const, buyerReady: 88, sellerFlex: 72, action: "Push closing meeting today", stale: false },
  { id: "A098", property: "Penthouse Canggu 12", closing: 72, commission: 96, urgency: "high" as const, buyerReady: 82, sellerFlex: 65, action: "Schedule final viewing", stale: false },
  { id: "A091", property: "Land Ubud 1200sqm", closing: 54, commission: 63, urgency: "medium" as const, buyerReady: 60, sellerFlex: 48, action: "Negotiate price −4%", stale: true },
  { id: "A087", property: "Townhouse Sanur B4", closing: 48, commission: 48, urgency: "medium" as const, buyerReady: 55, sellerFlex: 42, action: "Follow up buyer financing", stale: true },
  { id: "A082", property: "Villa Jimbaran Bay", closing: 38, commission: 186, urgency: "low" as const, buyerReady: 40, sellerFlex: 78, action: "Re-engage buyer with price drop", stale: false },
  { id: "A076", property: "Studio Kuta Complex", closing: 32, commission: 24, urgency: "low" as const, buyerReady: 35, sellerFlex: 80, action: "Consider de-prioritizing", stale: true },
];

const urgencyColors = { high: "border-emerald-500/30 text-emerald-400", medium: "border-amber-500/30 text-amber-400", low: "border-border/60 text-muted-foreground" };

const DealPriorityAI = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Target} label="Active Deals" value="24" delta={12} sub="In pipeline" />
      <KpiCard icon={DollarSign} label="Commission Pipeline" value="Rp 1.8B" delta={18} />
      <KpiCard icon={Zap} label="High Priority" value="8" sub="Push today" />
      <KpiCard icon={AlertTriangle} label="Stalling Deals" value="4" sub="Need intervention" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-primary font-bold uppercase tracking-wider">AI Priority Insight</p>
        </div>
        <p className="text-sm text-foreground font-medium">Deal #A102 should be pushed today — 78% closing likelihood. Commission value Rp 120M.</p>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">AI-Ranked Deal Priority List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/40">
                {["#", "Property", "Closing %", "Commission", "Urgency", "Buyer", "Seller", "Next Action", ""].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priorityDeals.map((d, i) => (
                <tr key={d.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="py-2.5 px-2 font-bold text-primary">{d.id}</td>
                  <td className="py-2.5 px-2 font-semibold text-foreground max-w-[160px] truncate">{d.property}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <Progress value={d.closing} className="h-1.5 w-12" />
                      <span className="font-bold text-foreground">{d.closing}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-foreground">Rp {d.commission}M</td>
                  <td className="py-2.5 px-2">
                    <Badge variant="outline" className={`text-[8px] h-4 px-1 ${urgencyColors[d.urgency]}`}>{d.urgency}</Badge>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-foreground">{d.buyerReady}</td>
                  <td className="py-2.5 px-2 font-bold text-foreground">{d.sellerFlex}</td>
                  <td className="py-2.5 px-2 text-muted-foreground max-w-[180px] truncate">{d.action}</td>
                  <td className="py-2.5 px-2">
                    {d.stale && <Badge variant="outline" className="text-[7px] h-4 px-1 border-red-500/30 text-red-400">Stalling</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 2: District Supply Tracker ──────────────────────────────────────────
const districtSupply = [
  { name: "Seminyak", added: 12, exclusive: 5, total: 42, target: 60, opportunity: 88, agentContrib: 8 },
  { name: "Canggu", added: 10, exclusive: 4, total: 38, target: 55, opportunity: 82, agentContrib: 7 },
  { name: "Ubud", added: 4, exclusive: 1, total: 28, target: 50, opportunity: 74, agentContrib: 3 },
  { name: "Sanur", added: 3, exclusive: 2, total: 22, target: 40, opportunity: 65, agentContrib: 2 },
  { name: "Jimbaran", added: 6, exclusive: 3, total: 18, target: 35, opportunity: 72, agentContrib: 4 },
  { name: "Uluwatu", added: 2, exclusive: 0, total: 14, target: 30, opportunity: 58, agentContrib: 1 },
];

const DistrictSupplyTracker = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Building} label="Listings Added (Week)" value="37" delta={22} />
      <KpiCard icon={Star} label="Exclusive Ratio" value="40%" delta={8} sub="15/37 exclusive" />
      <KpiCard icon={MapPin} label="Districts Covered" value="6/8" sub="2 gaps remaining" />
      <KpiCard icon={Target} label="Supply vs Target" value="64%" delta={5} sub="162/270 target" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">District Supply Acquisition Strength</h3>
        <div className="space-y-2">
          {districtSupply.map(d => {
            const pct = Math.round((d.total / d.target) * 100);
            const weak = pct < 50;
            return (
              <div key={d.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <span className="text-[11px] font-bold text-foreground w-20">{d.name}</span>
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <div>
                    <span className="text-[8px] text-muted-foreground">Added/wk</span>
                    <p className="text-[11px] font-bold text-foreground">{d.added}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground">Exclusive</span>
                    <p className="text-[11px] font-bold text-foreground">{d.exclusive}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground">Progress</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-[9px] font-bold text-foreground w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground">Opp. Score</span>
                    <p className={`text-[11px] font-bold ${d.opportunity >= 80 ? "text-emerald-400" : "text-foreground"}`}>{d.opportunity}</p>
                  </div>
                </div>
                {weak && <Badge variant="outline" className="text-[7px] h-4 px-1 border-red-500/30 text-red-400">Weak Supply</Badge>}
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-foreground">Secure <span className="font-bold">12 more listings in Ubud</span> to achieve liquidity threshold. Current density insufficient for consistent deal flow — prioritize agent outreach in north Ubud villages.</p>
        </div>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Weekly Supply Acquisition by District</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={districtSupply} layout="vertical" barSize={14}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={70} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="added" radius={[0, 4, 4, 0]} name="Added This Week">
              {districtSupply.map((d, i) => (
                <Cell key={i} fill={d.added >= 6 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 3: Investor Report Generator ────────────────────────────────────────
const reportSections = [
  { title: "Marketplace Growth", icon: TrendingUp, metrics: ["162 active listings (+14%)", "284 weekly inquiries (+22%)", "6 districts covered"], status: "strong" as const },
  { title: "Deal Pipeline Momentum", icon: Target, metrics: ["24 active deals", "Rp 1.8B pipeline", "14 weekly closings (+27%)"], status: "strong" as const },
  { title: "Revenue Progression", icon: DollarSign, metrics: ["Rp 342M monthly run-rate", "Rp 1.2B commission forecast", "+38% MoM growth"], status: "strong" as const },
  { title: "Agent Network", icon: Users, metrics: ["34 active agents", "42.5% of target force", "2.4 deals/agent/month"], status: "moderate" as const },
  { title: "Liquidity Intelligence", icon: Activity, metrics: ["68 city liquidity score", "14 avg days on market", "3 high-demand zones"], status: "strong" as const },
];

const InvestorReportGenerator = () => {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Investor Update Generator</h3>
              <p className="text-[10px] text-muted-foreground">Auto-compiled traction report ready for sharing</p>
            </div>
            <div className="flex gap-1.5">
              <Badge variant={period === "weekly" ? "default" : "outline"} className="text-[9px] h-6 cursor-pointer" onClick={() => setPeriod("weekly")}>Weekly</Badge>
              <Badge variant={period === "monthly" ? "default" : "outline"} className="text-[9px] h-6 cursor-pointer" onClick={() => setPeriod("monthly")}>Monthly</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Traction Signal</p>
              <p className="text-lg font-bold text-foreground mt-1">Accelerating</p>
              <Delta v={38} />
            </div>
            <div className="p-3 rounded-lg bg-muted/15 border border-border/30 text-center">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Market Leadership</p>
              <p className="text-lg font-bold text-foreground mt-1">72 / 100</p>
              <p className="text-[8px] text-muted-foreground">Confidence Score</p>
            </div>
          </div>

          <div className="space-y-2">
            {reportSections.map(s => (
              <div key={s.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-foreground">{s.title}</span>
                    <Badge variant="outline" className={`text-[7px] h-4 px-1 ${
                      s.status === "strong" ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"
                    }`}>{s.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {s.metrics.map(m => (
                      <span key={m} className="text-[9px] text-muted-foreground">• {m}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-border/40">
            <Button size="sm" className="text-[10px] h-8 gap-1.5">
              <Download className="h-3 w-3" />Generate PDF Report
            </Button>
            <Button size="sm" variant="outline" className="text-[10px] h-8 gap-1.5">
              <Mail className="h-3 w-3" />Export Email Summary
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: "First 100 Deals", current: 48, target: 100, icon: Award },
          { label: "City Dominance", current: 34, target: 100, icon: MapPin },
          { label: "Revenue Target", current: 342, target: 500, icon: DollarSign, unit: "M" },
          { label: "Agent Force", current: 34, target: 80, icon: Users },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
              <m.icon className="h-4 w-4 text-primary mb-1.5" />
              <p className="text-[9px] text-muted-foreground font-medium">{m.label}</p>
              <p className="text-base font-bold text-foreground">{m.current}{m.unit || ""} / {m.target}{m.unit || ""}</p>
              <Progress value={(m.current / m.target) * 100} className="h-1.5 mt-1" />
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Tab 4: Revenue Run-Rate Engine ──────────────────────────────────────────
const revenueProjection = [
  { month: "Jan", actual: 180, conservative: 180, expected: 180, aggressive: 180 },
  { month: "Feb", actual: 220, conservative: 210, expected: 220, aggressive: 240 },
  { month: "Mar", actual: 280, conservative: 250, expected: 280, aggressive: 320 },
  { month: "Apr", actual: 342, conservative: 300, expected: 350, aggressive: 420 },
  { month: "May", actual: null, conservative: 340, expected: 420, aggressive: 540 },
  { month: "Jun", actual: null, conservative: 380, expected: 510, aggressive: 680 },
  { month: "Jul", actual: null, conservative: 420, expected: 620, aggressive: 840 },
];

const revenueStreams = [
  { stream: "Transaction Commission", current: 210, projected: 380, growth: 81, pct: 61 },
  { stream: "Premium Listings", current: 72, projected: 120, growth: 67, pct: 21 },
  { stream: "Vendor Subscriptions", current: 38, projected: 65, growth: 71, pct: 11 },
  { stream: "Developer Fees", current: 22, projected: 55, growth: 150, pct: 7 },
];

const RevenueRunRate = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={DollarSign} label="Monthly Run-Rate" value="Rp 342M" delta={22} sub="Current" />
      <KpiCard icon={TrendingUp} label="Commission Pipeline" value="Rp 1.2B" delta={18} sub="Expected realization" />
      <KpiCard icon={Layers} label="Recurring Revenue" value="Rp 38M" delta={14} sub="MRR from subs" />
      <KpiCard icon={BarChart3} label="Break-even ETA" value="Month 9" sub="At current velocity" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Revenue Projection Scenarios (Rp M)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueProjection}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Area dataKey="aggressive" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Aggressive" />
            <Area dataKey="expected" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" name="Expected" />
            <Area dataKey="conservative" stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Conservative" />
            {/* Actual data points */}
            <Line dataKey="actual" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={{ fill: "hsl(var(--foreground))", r: 3 }} name="Actual" connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Revenue Stream Breakdown</h3>
          <div className="space-y-2.5">
            {revenueStreams.map(s => (
              <div key={s.stream}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground font-medium">{s.stream}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-bold">Rp {s.current}M</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-primary font-bold">Rp {s.projected}M</span>
                    <Delta v={s.growth} />
                  </div>
                </div>
                <Progress value={s.pct} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full space-y-3">
          <h3 className="text-sm font-bold text-foreground">Deal Velocity Sensitivity</h3>
          <div className="space-y-2">
            {[
              { scenario: "Current Pace", deals: "14/wk", revenue: "Rp 510M", growth: "1.5×", period: "90 days" },
              { scenario: "20% Acceleration", deals: "17/wk", revenue: "Rp 680M", growth: "2.0×", period: "90 days" },
              { scenario: "Agent Force at 80", deals: "24/wk", revenue: "Rp 920M", growth: "2.7×", period: "90 days" },
            ].map(s => (
              <div key={s.scenario} className="p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-foreground">{s.scenario}</span>
                  <Badge variant="outline" className="text-[8px] h-4 px-1 border-primary/30 text-primary">{s.growth} in {s.period}</Badge>
                </div>
                <div className="flex gap-4 text-[9px] text-muted-foreground">
                  <span>Deals: <span className="text-foreground font-semibold">{s.deals}</span></span>
                  <span>Revenue: <span className="text-foreground font-semibold">{s.revenue}</span></span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[9px] text-muted-foreground">At current closing velocity, revenue may grow <span className="text-foreground font-bold">2.4× within 90 days</span>. Scaling agent force to 80 unlocks <span className="text-foreground font-bold">Rp 920M monthly</span> run-rate.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const DealPriorityRevenueIntelligence = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Deal Priority & Revenue Intelligence</h1>
        <p className="text-[10px] text-muted-foreground">AI deal ranking • Supply acquisition • Investor updates • Revenue projection</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
        <Radio className="h-3 w-3 mr-1" />Intelligence Active
      </Badge>
    </div>

    <Tabs defaultValue="priority" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="priority" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Target className="h-3 w-3" />Deal Priority AI
        </TabsTrigger>
        <TabsTrigger value="supply" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <MapPin className="h-3 w-3" />Supply Tracker
        </TabsTrigger>
        <TabsTrigger value="investor" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <FileText className="h-3 w-3" />Investor Report
        </TabsTrigger>
        <TabsTrigger value="revenue" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <DollarSign className="h-3 w-3" />Revenue Engine
        </TabsTrigger>
      </TabsList>

      <TabsContent value="priority"><DealPriorityAI /></TabsContent>
      <TabsContent value="supply"><DistrictSupplyTracker /></TabsContent>
      <TabsContent value="investor"><InvestorReportGenerator /></TabsContent>
      <TabsContent value="revenue"><RevenueRunRate /></TabsContent>
    </Tabs>
  </div>
);

export default DealPriorityRevenueIntelligence;
