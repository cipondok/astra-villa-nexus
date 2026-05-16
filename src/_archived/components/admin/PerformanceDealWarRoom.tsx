import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Trophy, Target, Zap, Clock, Eye, Star, AlertTriangle, Activity,
  ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, CheckCircle,
  Camera, FileText, Tag, Calendar, MessageSquare, Shield, Search,
  ChevronRight, Building, MapPin, BarChart3
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell
} from "recharts";

const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };

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

const Kpi = ({ icon: Icon, label, value, delta, sub, accent }: {
  icon: React.ElementType; label: string; value: string; delta?: number; sub?: string; accent?: string;
}) => (
  <motion.div variants={fadeUp}>
    <Card className="p-3 border-border/40 bg-card/80">
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-7 w-7 rounded-lg ${accent || "bg-primary/10"} flex items-center justify-center`}>
          <Icon className={`h-3.5 w-3.5 ${accent ? accent.replace("bg-", "text-").replace("/10", "") : "text-primary"}`} />
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

// ─── Tab 1: Agent Performance Incentive Tracker ──────────────────────────────
const agents = [
  { name: "Wayan Sudira", deals: 12, commission: 48.5, viewings: 34, responseMin: 8, freshness: 94, tier: "Elite" as const, bonusPct: 100 },
  { name: "Kadek Sari", deals: 10, commission: 41.2, viewings: 28, responseMin: 12, freshness: 88, tier: "Closer" as const, bonusPct: 92 },
  { name: "Made Artana", deals: 8, commission: 32.8, viewings: 22, responseMin: 15, freshness: 82, tier: "Closer" as const, bonusPct: 78 },
  { name: "Ketut Widia", deals: 5, commission: 19.4, viewings: 18, responseMin: 22, freshness: 71, tier: "Performer" as const, bonusPct: 55 },
  { name: "Putu Darma", deals: 3, commission: 11.6, viewings: 12, responseMin: 35, freshness: 58, tier: "Starter" as const, bonusPct: 30 },
  { name: "Nyoman Rai", deals: 2, commission: 8.2, viewings: 8, responseMin: 48, freshness: 42, tier: "Starter" as const, bonusPct: 18 },
];

const tierStyle = {
  Elite: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Closer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Performer: "bg-primary/10 text-primary border-primary/20",
  Starter: "bg-muted/20 text-muted-foreground border-border/40",
};

const weeklyDeals = [
  { week: "W1", deals: 6 }, { week: "W2", deals: 9 }, { week: "W3", deals: 11 }, { week: "W4", deals: 8 },
];

const AgentIncentives = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Kpi icon={Trophy} label="Top Agent Deals" value="12" delta={20} sub="Wayan Sudira" />
      <Kpi icon={DollarSign} label="Total Commission" value="Rp 161.7M" delta={15} accent="bg-emerald-500/10" />
      <Kpi icon={Eye} label="Avg Viewings/Agent" value="20.3" delta={8} />
      <Kpi icon={Zap} label="Avg Response" value="23 min" delta={-12} accent="bg-amber-500/10" sub="Target: <15 min" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Leaderboard */}
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <Card className="p-4 border-border/40 bg-card/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Agent Performance Leaderboard</h3>
            <Badge variant="outline" className="text-[8px] h-5 border-primary/30 text-primary">This Month</Badge>
          </div>
          <div className="space-y-1">
            {agents.map((a, i) => (
              <div key={a.name} className={`flex items-center gap-3 p-2 rounded-lg ${i < 3 ? "bg-primary/5" : "bg-muted/5"} hover:bg-muted/15 transition-colors`}>
                <span className={`text-[10px] font-bold w-5 text-center ${i === 0 ? "text-amber-400" : i === 1 ? "text-foreground/70" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-foreground">{a.name}</span>
                    <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${tierStyle[a.tier]}`}>{a.tier}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-right">
                  <div><p className="text-[10px] font-bold text-foreground">{a.deals}</p><p className="text-[7px] text-muted-foreground">Deals</p></div>
                  <div><p className="text-[10px] font-bold text-foreground">{a.commission}M</p><p className="text-[7px] text-muted-foreground">Commission</p></div>
                  <div><p className="text-[10px] font-bold text-foreground">{a.viewings}</p><p className="text-[7px] text-muted-foreground">Viewings</p></div>
                  <div><p className={`text-[10px] font-bold ${a.responseMin <= 15 ? "text-emerald-400" : a.responseMin <= 30 ? "text-amber-400" : "text-destructive"}`}>{a.responseMin}m</p><p className="text-[7px] text-muted-foreground">Response</p></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Bonus Progress */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Bonus Eligibility</h3>
          <div className="space-y-3">
            {agents.slice(0, 4).map(a => (
              <div key={a.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-foreground">{a.name.split(" ")[0]}</span>
                  <span className="text-[9px] font-bold text-foreground">{a.bonusPct}%</span>
                </div>
                <Progress value={a.bonusPct} className="h-1.5" />
                {a.bonusPct >= 90 && <p className="text-[8px] text-emerald-400 mt-0.5">✓ Bonus qualified</p>}
                {a.bonusPct >= 70 && a.bonusPct < 90 && <p className="text-[8px] text-amber-400 mt-0.5">2 viewings to bonus threshold</p>}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h4 className="text-[10px] font-bold text-foreground mb-2">Weekly Deals Trend</h4>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={weeklyDeals}>
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="deals" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Tab 2: Buyer Qualification Scoring ──────────────────────────────────────
const buyers = [
  { name: "Ahmad K.", score: 92, budget: "Rp 3.5B", financing: "Cash Ready", viewings: 5, responseHrs: 2, intent: "High" as const, segment: "high" as const, risk: "low" as const, action: "Schedule final viewing + prepare offer template" },
  { name: "Sarah L.", score: 84, budget: "Rp 2.1B", financing: "Pre-approved", viewings: 3, responseHrs: 6, intent: "High" as const, segment: "high" as const, risk: "low" as const, action: "Send comparable property alternatives" },
  { name: "Michael R.", score: 68, budget: "Rp 2.8B", financing: "In Process", viewings: 2, responseHrs: 18, intent: "Medium" as const, segment: "warm" as const, risk: "medium" as const, action: "Follow up on financing status" },
  { name: "Jessica T.", score: 55, budget: "Rp 1.5B", financing: "Not Started", viewings: 1, responseHrs: 36, intent: "Medium" as const, segment: "warm" as const, risk: "medium" as const, action: "Qualify budget and timeline expectations" },
  { name: "David W.", score: 32, budget: "Rp 800M", financing: "Unknown", viewings: 0, responseHrs: 72, intent: "Low" as const, segment: "low" as const, risk: "high" as const, action: "Send automated property alerts only" },
  { name: "Linda M.", score: 18, budget: "Undisclosed", financing: "Unknown", viewings: 0, responseHrs: 120, intent: "Low" as const, segment: "low" as const, risk: "high" as const, action: "Deprioritize — auto-nurture sequence" },
];

const intentStyle = { High: "border-emerald-500/30 text-emerald-400", Medium: "border-amber-500/30 text-amber-400", Low: "border-destructive/30 text-destructive" };
const segmentCounts = { high: buyers.filter(b => b.segment === "high").length, warm: buyers.filter(b => b.segment === "warm").length, low: buyers.filter(b => b.segment === "low").length };

const BuyerQualification = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Kpi icon={Target} label="High-Intent Buyers" value={String(segmentCounts.high)} accent="bg-emerald-500/10" sub="Ready to close" />
      <Kpi icon={Users} label="Warm Prospects" value={String(segmentCounts.warm)} accent="bg-amber-500/10" sub="Needs nurturing" />
      <Kpi icon={AlertTriangle} label="Low Probability" value={String(segmentCounts.low)} accent="bg-destructive/10" sub="Auto-nurture" />
      <Kpi icon={Clock} label="Avg Response Time" value="42h" delta={-15} sub="Across all buyers" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">Buyer Qualification Scores</h3>
          <Badge variant="outline" className="text-[8px] h-5 border-primary/30 text-primary">{buyers.length} Active Leads</Badge>
        </div>
        <div className="space-y-1.5">
          {buyers.map(b => (
            <div key={b.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              {/* Score Gauge */}
              <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0 ${
                b.score >= 80 ? "border-emerald-500/40" : b.score >= 50 ? "border-amber-500/40" : "border-destructive/40"
              }`}>
                <span className={`text-xs font-bold ${
                  b.score >= 80 ? "text-emerald-400" : b.score >= 50 ? "text-amber-400" : "text-destructive"
                }`}>{b.score}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-foreground">{b.name}</span>
                  <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${intentStyle[b.intent]}`}>{b.intent} Intent</Badge>
                  {b.risk === "high" && <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-destructive/30 text-destructive">Drop-off Risk</Badge>}
                </div>
                <p className="text-[9px] text-muted-foreground">Budget: {b.budget} · Financing: {b.financing} · {b.viewings} viewings · Response: {b.responseHrs}h</p>
              </div>
              <div className="text-right shrink-0 max-w-[200px]">
                <p className="text-[8px] text-primary font-medium">{b.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 3: Listing Quality Optimization ─────────────────────────────────────
const listings = [
  { title: "Villa Seminyak 3BR Pool", views: 342, inquiries: 28, ratio: 8.2, photos: 12, photoScore: 94, priceScore: 88, completeness: 96, dom: 8, status: "top" as const },
  { title: "Canggu Modern Apartment", views: 218, inquiries: 14, ratio: 6.4, photos: 8, photoScore: 78, priceScore: 82, completeness: 88, dom: 14, status: "good" as const },
  { title: "Ubud Jungle Villa 2BR", views: 156, inquiries: 6, ratio: 3.8, photos: 5, photoScore: 52, priceScore: 71, completeness: 64, dom: 28, status: "needs_work" as const },
  { title: "Sanur Beachfront Land", views: 98, inquiries: 2, ratio: 2.0, photos: 3, photoScore: 38, priceScore: 45, completeness: 48, dom: 45, status: "underperform" as const },
];

const statusLabel = { top: "Top Performer", good: "Good", needs_work: "Needs Work", underperform: "Underperforming" };
const statusColor = { top: "border-emerald-500/30 text-emerald-400", good: "border-primary/30 text-primary", needs_work: "border-amber-500/30 text-amber-400", underperform: "border-destructive/30 text-destructive" };

const suggestions = [
  { listing: "Ubud Jungle Villa 2BR", type: "photos", msg: "Add 5+ interior photos — listings with 10+ photos get 3× more inquiries", icon: Camera },
  { listing: "Sanur Beachfront Land", type: "pricing", msg: "Price is 22% above district median — consider reducing to Rp 2.8B range", icon: Tag },
  { listing: "Ubud Jungle Villa 2BR", type: "description", msg: "Description missing: pool type, view description, proximity to center", icon: FileText },
  { listing: "Sanur Beachfront Land", type: "visibility", msg: "0 inquiries in 14 days — promote to Premium for 5× visibility boost", icon: Star },
];

const ListingQuality = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Kpi icon={Eye} label="Avg View-to-Inquiry" value="5.1%" delta={12} />
      <Kpi icon={Camera} label="Avg Photo Score" value="65.5" sub="Target: 80+" accent="bg-amber-500/10" />
      <Kpi icon={Tag} label="Price Competitiveness" value="71.5" sub="Avg across listings" />
      <Kpi icon={Clock} label="Avg Days on Market" value="24" delta={-8} accent="bg-emerald-500/10" />
    </div>

    {/* Listing Table */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <h3 className="text-sm font-bold text-foreground mb-3">Listing Performance Analysis</h3>
        <div className="space-y-1.5">
          {listings.map(l => (
            <div key={l.title} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-foreground">{l.title}</span>
                  <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${statusColor[l.status]}`}>{statusLabel[l.status]}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3 text-right shrink-0">
                <div><p className="text-[10px] font-bold text-foreground">{l.views}</p><p className="text-[7px] text-muted-foreground">Views</p></div>
                <div><p className="text-[10px] font-bold text-foreground">{l.inquiries}</p><p className="text-[7px] text-muted-foreground">Inquiries</p></div>
                <div>
                  <p className={`text-[10px] font-bold ${l.ratio >= 6 ? "text-emerald-400" : l.ratio >= 3 ? "text-amber-400" : "text-destructive"}`}>{l.ratio}%</p>
                  <p className="text-[7px] text-muted-foreground">Conv.</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold ${l.photoScore >= 80 ? "text-emerald-400" : l.photoScore >= 60 ? "text-amber-400" : "text-destructive"}`}>{l.photoScore}</p>
                  <p className="text-[7px] text-muted-foreground">Photos</p>
                </div>
                <div><p className="text-[10px] font-bold text-foreground">{l.dom}d</p><p className="text-[7px] text-muted-foreground">DOM</p></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    {/* Optimization Suggestions */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-amber-500/15 bg-amber-500/5">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-amber-400" />Optimization Suggestions
        </h3>
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-card/60">
              <s.icon className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-bold text-foreground">{s.listing}</span>
                <p className="text-[9px] text-muted-foreground">{s.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 4: Daily Deal War-Room Summary ──────────────────────────────────────
const funnelData = [
  { stage: "Active Leads", count: 24 },
  { stage: "Qualified", count: 14 },
  { stage: "Viewing Done", count: 9 },
  { stage: "Negotiating", count: 6 },
  { stage: "Offer In", count: 4 },
  { stage: "Closing", count: 2 },
];

const districtHeat = [
  { district: "Seminyak", activity: 92, deals: 5, signal: "Hot" },
  { district: "Canggu", activity: 78, deals: 3, signal: "Warm" },
  { district: "Ubud", activity: 54, deals: 2, signal: "Growing" },
  { district: "Sanur", activity: 38, deals: 1, signal: "Slow" },
  { district: "Uluwatu", activity: 26, deals: 0, signal: "Cold" },
];

const priorityDeals = [
  { property: "Villa Seminyak 3BR", buyer: "Ahmad K.", value: "Rp 3.2B", alert: "78% close probability — push today", type: "close" as const },
  { property: "Canggu Apartment 2BR", buyer: "Sarah L.", value: "Rp 1.95B", alert: "Buyer has competing offer — respond within 4h", type: "urgent" as const },
  { property: "Ubud Land 800m²", buyer: "Michael R.", value: "Rp 2.5B", alert: "Negotiation stalled 5 days — seller flexibility detected", type: "stall" as const },
];

const alertStyle = { close: "border-emerald-500/20 bg-emerald-500/5", urgent: "border-destructive/20 bg-destructive/5", stall: "border-amber-500/20 bg-amber-500/5" };
const alertIcon = { close: CheckCircle, urgent: AlertTriangle, stall: Clock };

const DealWarRoom = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <Kpi icon={Activity} label="Active Deals Today" value="6" delta={20} />
      <Kpi icon={Calendar} label="Viewings Next 48h" value="4" />
      <Kpi icon={FileText} label="Offers Expected" value="2" sub="This week" accent="bg-emerald-500/10" />
      <Kpi icon={Target} label="Near Closing" value="2" accent="bg-amber-500/10" />
      <Kpi icon={DollarSign} label="Pipeline Value" value="Rp 12.8B" delta={15} accent="bg-emerald-500/10" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Priority Deals */}
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <Card className="p-4 border-border/40 bg-card/80">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-400" />Priority Action Deals
          </h3>
          <div className="space-y-1.5">
            {priorityDeals.map((d, i) => {
              const AIcon = alertIcon[d.type];
              return (
                <div key={i} className={`p-3 rounded-lg border ${alertStyle[d.type]}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AIcon className={`h-3.5 w-3.5 shrink-0 ${d.type === "close" ? "text-emerald-400" : d.type === "urgent" ? "text-destructive" : "text-amber-400"}`} />
                    <span className="text-[10px] font-bold text-foreground">{d.property}</span>
                    <span className="text-[9px] text-muted-foreground">· {d.buyer}</span>
                    <span className="text-[10px] font-bold text-foreground ml-auto">{d.value}</span>
                  </div>
                  <p className="text-[9px] text-foreground/80 ml-5">{d.alert}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Execution Readiness */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Execution Readiness</h3>
          <div className="flex items-center justify-center mb-3">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.2" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeDasharray={`${78 * 2.64} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">78</span>
                <span className="text-[7px] text-muted-foreground">/ 100</span>
              </div>
            </div>
          </div>
          <p className="text-center text-[9px] text-muted-foreground mb-3">Daily Execution Score</p>

          <h4 className="text-[10px] font-bold text-foreground mb-2">District Traction</h4>
          <div className="space-y-1.5">
            {districtHeat.map(d => (
              <div key={d.district} className="flex items-center gap-2">
                <span className="text-[9px] text-foreground w-16">{d.district}</span>
                <div className="flex-1"><Progress value={d.activity} className="h-1.5" /></div>
                <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${
                  d.signal === "Hot" ? "border-emerald-500/30 text-emerald-400" :
                  d.signal === "Warm" ? "border-primary/30 text-primary" :
                  d.signal === "Growing" ? "border-amber-500/30 text-amber-400" :
                  "border-destructive/30 text-destructive"
                }`}>{d.signal}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>

    {/* Pipeline Funnel */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <h3 className="text-sm font-bold text-foreground mb-3">Deal Pipeline Funnel</h3>
        <div className="flex items-end gap-1 justify-center h-32">
          {funnelData.map((f, i) => (
            <div key={f.stage} className="flex flex-col items-center flex-1">
              <span className="text-sm font-bold text-foreground mb-1">{f.count}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary/40"
                style={{ height: `${(f.count / funnelData[0].count) * 100}%`, minHeight: 8 }}
              />
              <span className="text-[7px] text-muted-foreground mt-1 text-center leading-tight">{f.stage}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const PerformanceDealWarRoom = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Performance & Deal War-Room</h1>
        <p className="text-[10px] text-muted-foreground">Agent incentives • Buyer qualification • Listing optimization • Daily war-room</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
        <Activity className="h-3 w-3 mr-1" />Intelligence
      </Badge>
    </div>

    <Tabs defaultValue="incentives" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="incentives" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Trophy className="h-3 w-3" />Agent Incentives
        </TabsTrigger>
        <TabsTrigger value="buyers" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Target className="h-3 w-3" />Buyer Scoring
        </TabsTrigger>
        <TabsTrigger value="listings" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Star className="h-3 w-3" />Listing Quality
        </TabsTrigger>
        <TabsTrigger value="warroom" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Zap className="h-3 w-3" />War-Room
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incentives"><AgentIncentives /></TabsContent>
      <TabsContent value="buyers"><BuyerQualification /></TabsContent>
      <TabsContent value="listings"><ListingQuality /></TabsContent>
      <TabsContent value="warroom"><DealWarRoom /></TabsContent>
    </Tabs>
  </div>
);

export default PerformanceDealWarRoom;
