import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Users, Target, DollarSign, Activity, TrendingUp, ArrowUpRight,
  ArrowDownRight, Phone, UserPlus, Clock, AlertTriangle, Zap, Shield,
  ChevronRight, Flame, Eye, BarChart3, CheckCircle2, FileText, Award,
  Crosshair, Radio, Building, Star, Timer, ArrowRight, Briefcase
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
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

const AlertBadge = ({ label, variant }: { label: string; variant: "danger" | "warning" | "success" }) => {
  const cls = {
    danger: "border-red-500/30 text-red-400 bg-red-500/5",
    warning: "border-amber-500/30 text-amber-400 bg-amber-500/5",
    success: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  };
  return <Badge variant="outline" className={`text-[8px] h-4 px-1.5 ${cls[variant]}`}>{label}</Badge>;
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

// ─── Tab 1: City Domination ──────────────────────────────────────────────────
const districtData = [
  { name: "Seminyak", listings: 42, demand: 88, liquidity: 82, alert: "Buyer Surge Area" as const },
  { name: "Canggu", listings: 38, demand: 92, liquidity: 78, alert: "Closing Opportunity Cluster" as const },
  { name: "Ubud", listings: 28, demand: 64, liquidity: 55, alert: "Supply Weak Zone" as const },
  { name: "Sanur", listings: 22, demand: 58, liquidity: 48, alert: "Supply Weak Zone" as const },
  { name: "Jimbaran", listings: 18, demand: 72, liquidity: 62, alert: "Buyer Surge Area" as const },
  { name: "Uluwatu", listings: 14, demand: 68, liquidity: 45, alert: "Closing Opportunity Cluster" as const },
];

const weeklyDeals = [
  { week: "W1", deals: 4, target: 8 }, { week: "W2", deals: 7, target: 8 },
  { week: "W3", deals: 6, target: 10 }, { week: "W4", deals: 11, target: 10 },
  { week: "W5", deals: 9, target: 12 }, { week: "W6", deals: 14, target: 12 },
];

const alertVariant = (a: string): "danger" | "warning" | "success" =>
  a.includes("Supply Weak") ? "danger" : a.includes("Surge") ? "warning" : "success";

const CityDomination = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      <KpiCard icon={Building} label="Total Listings" value="162" delta={14} sub="Across 6 districts" />
      <KpiCard icon={Eye} label="Active Inquiries" value="284" delta={22} sub="This week" />
      <KpiCard icon={Clock} label="Viewings Today" value="18" delta={8} />
      <KpiCard icon={Target} label="Weekly Deals" value="14" delta={27} sub="Target: 12" />
      <KpiCard icon={Activity} label="Liquidity Score" value="68" delta={5} sub="City average" />
      <KpiCard icon={Shield} label="Competitor Est." value="~95" delta={-3} sub="Listings tracked" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
      {/* District density */}
      <motion.div variants={fadeUp} className="lg:col-span-3">
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Micro-District Density & Demand</h3>
          <div className="space-y-2">
            {districtData.map(d => (
              <div key={d.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="w-20">
                  <span className="text-[11px] font-bold text-foreground">{d.name}</span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[8px] text-muted-foreground">Listings</span>
                    <div className="flex items-center gap-1">
                      <Progress value={(d.listings / 50) * 100} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-bold text-foreground w-5 text-right">{d.listings}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground">Demand</span>
                    <div className="flex items-center gap-1">
                      <Progress value={d.demand} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-bold text-foreground w-5 text-right">{d.demand}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground">Liquidity</span>
                    <div className="flex items-center gap-1">
                      <Progress value={d.liquidity} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-bold text-foreground w-5 text-right">{d.liquidity}</span>
                    </div>
                  </div>
                </div>
                <AlertBadge label={d.alert} variant={alertVariant(d.alert)} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Weekly deals chart */}
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Deal Closing Momentum</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyDeals} barGap={2}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="deals" radius={[4, 4, 0, 0]} name="Deals">
                {weeklyDeals.map((e, i) => (
                  <Cell key={i} fill={e.deals >= e.target ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} />
                ))}
              </Bar>
              <Bar dataKey="target" radius={[4, 4, 0, 0]} fill="hsl(var(--border))" name="Target" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-[9px] text-muted-foreground"><Zap className="h-3 w-3 text-primary inline mr-1" />Closing velocity accelerating — 27% above target this week</p>
          </div>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Tab 2: Agent Recruitment ────────────────────────────────────────────────
const recruitPipeline = [
  { stage: "New Leads", count: 84, icon: UserPlus },
  { stage: "Contacted", count: 52, icon: Phone },
  { stage: "Interviewed", count: 28, icon: Briefcase },
  { stage: "Onboarding", count: 14, icon: FileText },
  { stage: "Active", count: 34, icon: CheckCircle2 },
];

const topRecruiters = [
  { name: "Rina Santoso", recruited: 8, conversion: 62 },
  { name: "Budi Hartono", recruited: 6, conversion: 55 },
  { name: "Dewi Lestari", recruited: 5, conversion: 48 },
];

const districtShortage = [
  { district: "Ubud", current: 4, target: 12, gap: 8 },
  { district: "Sanur", current: 3, target: 10, gap: 7 },
  { district: "Uluwatu", current: 2, target: 8, gap: 6 },
  { district: "Jimbaran", current: 5, target: 10, gap: 5 },
];

const AgentRecruitment = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    {/* Target progress */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Agent Force Target</p>
            <p className="text-lg font-bold text-foreground">34 / 80 Agents</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">City Domination Threshold</p>
            <p className="text-sm font-bold text-foreground">80 agents across 6 districts</p>
          </div>
        </div>
        <Progress value={42.5} className="h-2" />
        <p className="text-[9px] text-muted-foreground mt-1">42.5% toward city domination force — 46 agents needed</p>
      </Card>
    </motion.div>

    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {recruitPipeline.map(s => (
        <motion.div key={s.stage} variants={fadeUp}>
          <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm text-center">
            <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{s.count}</p>
            <p className="text-[9px] text-muted-foreground">{s.stage}</p>
          </Card>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* District shortage */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">District Agent Shortage Radar</h3>
          <div className="space-y-2">
            {districtShortage.map(d => (
              <div key={d.district} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10">
                <span className="text-[11px] font-bold text-foreground w-16">{d.district}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-muted-foreground">{d.current} / {d.target} agents</span>
                    <span className="text-red-400 font-bold">−{d.gap} gap</span>
                  </div>
                  <Progress value={(d.current / d.target) * 100} className="h-1.5" />
                </div>
                <AlertBadge label="Shortage" variant="danger" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard + productivity */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Top Recruiters & Productivity</h3>
          <div className="space-y-2 mb-4">
            {topRecruiters.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-foreground">{r.name}</span>
                  <span className="text-[9px] text-muted-foreground ml-2">{r.recruited} recruited</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">{r.conversion}% conv.</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/40 pt-3 grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-muted/10 text-center">
              <p className="text-lg font-bold text-foreground">2.4</p>
              <p className="text-[8px] text-muted-foreground">Deals per Agent/mo</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/10 text-center">
              <p className="text-lg font-bold text-foreground">72</p>
              <p className="text-[8px] text-muted-foreground">Avg Productivity Score</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Tab 3: Buyer Conversion ─────────────────────────────────────────────────
const funnelStages = [
  { stage: "Leads Generated", count: 842, pct: 100 },
  { stage: "Leads Contacted", count: 624, pct: 74 },
  { stage: "Qualified Buyers", count: 312, pct: 37 },
  { stage: "Viewings Booked", count: 186, pct: 22 },
  { stage: "Offers Submitted", count: 68, pct: 8 },
  { stage: "Deals Progressing", count: 34, pct: 4 },
];

const leadSources = [
  { source: "Website", leads: 320, conv: 5.2 },
  { source: "WhatsApp", leads: 245, conv: 7.8 },
  { source: "Referral", leads: 142, conv: 12.4 },
  { source: "Social Media", leads: 98, conv: 3.1 },
  { source: "Walk-in", leads: 37, conv: 18.2 },
];

const highIntentBuyers = [
  { name: "Alex M.", score: 94, budget: "Rp 4.2B", status: "Viewing today" },
  { name: "Sarah K.", score: 88, budget: "Rp 2.8B", status: "Offer pending" },
  { name: "James L.", score: 85, budget: "Rp 6.5B", status: "Re-engaged" },
  { name: "Diana P.", score: 82, budget: "Rp 3.1B", status: "Qualified" },
];

const BuyerConversion = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Users} label="Total Leads" value="842" delta={18} sub="This month" />
      <KpiCard icon={Timer} label="Avg Response" value="14m" delta={-22} sub="Improving" />
      <KpiCard icon={Target} label="Conversion Rate" value="4.0%" delta={12} />
      <KpiCard icon={DollarSign} label="Pipeline Value" value="Rp 48B" delta={15} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
      {/* Funnel */}
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Conversion Funnel</h3>
          <div className="space-y-1.5">
            {funnelStages.map((s, i) => {
              const dropoff = i > 0 ? funnelStages[i - 1].pct - s.pct : 0;
              return (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="text-muted-foreground font-medium">{s.stage}</span>
                    <div className="flex items-center gap-2">
                      {dropoff > 15 && <AlertBadge label={`-${dropoff}% drop`} variant="warning" />}
                      <span className="font-bold text-foreground">{s.count}</span>
                    </div>
                  </div>
                  <div className="relative h-5 rounded bg-muted/15 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded bg-primary/20"
                      initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-foreground">{s.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Lead sources + High intent */}
      <motion.div variants={fadeUp} className="lg:col-span-3 space-y-3">
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-foreground mb-2">Lead Source Performance</h3>
          <div className="space-y-1.5">
            {leadSources.map(s => (
              <div key={s.source} className="flex items-center gap-3 p-1.5 rounded bg-muted/10">
                <span className="text-[10px] font-bold text-foreground w-20">{s.source}</span>
                <div className="flex-1">
                  <Progress value={(s.leads / 350) * 100} className="h-1.5" />
                </div>
                <span className="text-[10px] text-muted-foreground w-12 text-right">{s.leads}</span>
                <span className={`text-[10px] font-bold w-10 text-right ${s.conv > 10 ? "text-emerald-400" : "text-foreground"}`}>{s.conv}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground">High-Intent Buyer Alerts</h3>
            <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400"><Flame className="h-3 w-3 mr-1" />{highIntentBuyers.length} Hot</Badge>
          </div>
          <div className="space-y-1.5">
            {highIntentBuyers.map(b => (
              <div key={b.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{b.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-foreground">{b.name}</span>
                  <span className="text-[9px] text-muted-foreground ml-2">{b.budget}</span>
                </div>
                <Badge variant="outline" className="text-[8px] h-4 px-1 border-border/60 text-muted-foreground">{b.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>

    {/* AI suggestions */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">AI Conversion Suggestions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { title: "Follow-up Urgency", desc: "12 qualified leads haven't been contacted in 48h — prioritize callback", icon: Clock },
            { title: "Viewing Optimization", desc: "Saturday 10-12 AM shows 3.2x higher conversion — concentrate bookings", icon: Timer },
            { title: "Lead Prioritization", desc: "Referral leads convert 3.8x higher — increase referral incentive budget", icon: Star },
          ].map(s => (
            <div key={s.title} className="p-2 rounded-lg bg-card/50 border border-border/30">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-foreground">{s.title}</span>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 4: Closing Acceleration ─────────────────────────────────────────────
const pipelineDeals = [
  { id: "D-1042", property: "Villa Oceana, Seminyak", value: "Rp 4.8B", stage: "Negotiation", gap: "5%", risk: null, days: 12 },
  { id: "D-1038", property: "Penthouse Canggu 12", value: "Rp 3.2B", stage: "Closing Prep", gap: "2%", risk: null, days: 8 },
  { id: "D-1035", property: "Land Ubud 1200sqm", value: "Rp 2.1B", stage: "Offer", gap: "12%", risk: "Price Adjustment Needed", days: 18 },
  { id: "D-1031", property: "Townhouse Sanur B4", value: "Rp 1.6B", stage: "Financing", gap: "0%", risk: "Buyer Financing Delay", days: 24 },
  { id: "D-1028", property: "Villa Jimbaran Bay", value: "Rp 6.2B", stage: "Negotiation", gap: "8%", risk: "Deal Stalling Risk", days: 31 },
];

const closingTimeline = [
  { stage: "Inquiry", pct: 100 }, { stage: "Viewing", pct: 72 },
  { stage: "Offer", pct: 38 }, { stage: "Negotiation", pct: 24 },
  { stage: "Closing", pct: 14 },
];

const ClosingAcceleration = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Target} label="Near Closing" value="8" delta={33} sub="Expected this month" />
      <KpiCard icon={DollarSign} label="Pipeline Value" value="Rp 24.6B" delta={18} />
      <KpiCard icon={BarChart3} label="Avg Neg. Gap" value="5.4%" delta={-8} sub="Narrowing" />
      <KpiCard icon={Briefcase} label="Commission Forecast" value="Rp 1.2B" delta={22} />
    </div>

    {/* Deals table */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Active Closing Pipeline</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/40">
                {["Deal", "Property", "Value", "Stage", "Gap", "Days", "Risk"].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipelineDeals.map(d => (
                <tr key={d.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="py-2 px-2 font-bold text-primary">{d.id}</td>
                  <td className="py-2 px-2 font-semibold text-foreground">{d.property}</td>
                  <td className="py-2 px-2 font-bold text-foreground">{d.value}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className="text-[8px] h-4 px-1 border-border/60 text-muted-foreground">{d.stage}</Badge>
                  </td>
                  <td className={`py-2 px-2 font-bold ${parseFloat(d.gap) > 8 ? "text-amber-400" : "text-foreground"}`}>{d.gap}</td>
                  <td className={`py-2 px-2 font-bold ${d.days > 20 ? "text-red-400" : "text-foreground"}`}>{d.days}d</td>
                  <td className="py-2 px-2">
                    {d.risk ? <AlertBadge label={d.risk} variant={d.risk.includes("Stalling") ? "danger" : "warning"} /> : <span className="text-emerald-400">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Closing timeline */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Closing Funnel Conversion</h3>
          <div className="space-y-1.5">
            {closingTimeline.map((s, i) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="text-[10px] font-medium text-muted-foreground w-20">{s.stage}</span>
                <div className="flex-1 relative h-6 rounded bg-muted/15 overflow-hidden">
                  <motion.div className="absolute inset-y-0 left-0 rounded bg-primary/20"
                    initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.08 }} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-foreground">{s.pct}%</span>
                </div>
                {i < closingTimeline.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Status trackers */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Readiness Trackers</h3>
          <div className="space-y-3">
            {[
              { label: "Financing Readiness", value: 68, desc: "5/8 buyers pre-approved" },
              { label: "Seller Price Flexibility", value: 54, desc: "Moderate across pipeline" },
              { label: "Legal/Doc Progress", value: 42, desc: "3 deals pending notary" },
              { label: "Commission Realization", value: 78, desc: "Rp 1.2B expected this month" },
            ].map(t => (
              <div key={t.label}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground font-medium">{t.label}</span>
                  <span className="font-bold text-foreground">{t.value}%</span>
                </div>
                <Progress value={t.value} className="h-1.5" />
                <p className="text-[8px] text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const FirstCityDominationCommand = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">First City Domination Command</h1>
        <p className="text-[10px] text-muted-foreground">Tactical operations • Agent recruitment • Buyer conversion • Closing acceleration</p>
      </div>
      <div className="flex gap-1.5">
        <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
          <Radio className="h-3 w-3 mr-1" />Bali Operations Live
        </Badge>
      </div>
    </div>

    <Tabs defaultValue="domination" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="domination" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Crosshair className="h-3 w-3" />City Domination
        </TabsTrigger>
        <TabsTrigger value="recruitment" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <UserPlus className="h-3 w-3" />Agent Recruitment
        </TabsTrigger>
        <TabsTrigger value="conversion" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Target className="h-3 w-3" />Buyer Conversion
        </TabsTrigger>
        <TabsTrigger value="closing" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Zap className="h-3 w-3" />Closing Acceleration
        </TabsTrigger>
      </TabsList>

      <TabsContent value="domination"><CityDomination /></TabsContent>
      <TabsContent value="recruitment"><AgentRecruitment /></TabsContent>
      <TabsContent value="conversion"><BuyerConversion /></TabsContent>
      <TabsContent value="closing"><ClosingAcceleration /></TabsContent>
    </Tabs>
  </div>
);

export default FirstCityDominationCommand;
