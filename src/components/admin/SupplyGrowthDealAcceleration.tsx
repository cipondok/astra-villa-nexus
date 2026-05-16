import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, Users, Target, Zap, Clock, Eye, Star, AlertTriangle, Activity,
  ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, CheckCircle,
  MapPin, Building, Search, ChevronRight, Phone, FileText, Calendar,
  Shield, Check, Plus, Heart
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
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

// ─── Tab 1: Seller Listing Acquisition Tracker ──────────────────────────────
const districtSupply = [
  { district: "Seminyak", current: 48, target: 60, gap: 12, agent: "Wayan S." },
  { district: "Canggu", current: 35, target: 50, gap: 15, agent: "Made A." },
  { district: "Ubud", current: 22, target: 40, gap: 18, agent: "Ketut W." },
  { district: "Sanur", current: 18, target: 30, gap: 12, agent: "Putu D." },
  { district: "Uluwatu", current: 8, target: 25, gap: 17, agent: "Nyoman R." },
];

const agentListingBoard = [
  { name: "Wayan Sudira", listings: 14, exclusive: 8, calls: 22 },
  { name: "Made Artana", listings: 11, exclusive: 5, calls: 18 },
  { name: "Kadek Sari", listings: 9, exclusive: 6, calls: 15 },
  { name: "Ketut Widia", listings: 6, exclusive: 2, calls: 12 },
  { name: "Putu Darma", listings: 3, exclusive: 1, calls: 8 },
];

const weeklySupply = [
  { week: "W1", listings: 12 }, { week: "W2", listings: 18 }, { week: "W3", listings: 22 }, { week: "W4", listings: 16 },
];

const SellerAcquisition = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <Kpi icon={Package} label="New Listings This Week" value="16" delta={14} />
      <Kpi icon={Star} label="Exclusive Ratio" value="42%" delta={6} accent="bg-emerald-500/10" />
      <Kpi icon={Target} label="Target Progress" value="64%" sub="131 / 205 listings" />
      <Kpi icon={Phone} label="Outreach Calls" value="75" delta={22} />
      <Kpi icon={AlertTriangle} label="Supply Gaps" value="5" accent="bg-destructive/10" sub="Districts below target" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* District Supply Ranking */}
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <Card className="p-4 border-border/40 bg-card/80">
          <h3 className="text-sm font-bold text-foreground mb-3">District Supply Progress</h3>
          <div className="space-y-2">
            {districtSupply.map(d => {
              const pct = Math.round((d.current / d.target) * 100);
              const isLow = pct < 50;
              return (
                <div key={d.district} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-3 w-3 ${isLow ? "text-destructive" : "text-primary"}`} />
                      <span className="text-[10px] font-bold text-foreground">{d.district}</span>
                      {isLow && <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-destructive/30 text-destructive">Under-supplied</Badge>}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{d.current}/{d.target} · Gap: {d.gap}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>

          {/* Tactical Suggestion */}
          <div className="mt-3 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[9px] text-foreground">Secure 8 more mid-range homes in Ubud district to reach liquidity threshold. Agent Ketut W. has 3 warm seller leads ready for follow-up.</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Agent Leaderboard + Chart */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Agent Acquisition Leaders</h3>
          <div className="space-y-1.5 mb-4">
            {agentListingBoard.map((a, i) => (
              <div key={a.name} className="flex items-center gap-2 p-1.5 rounded-md bg-muted/10">
                <span className={`text-[9px] font-bold w-4 ${i === 0 ? "text-amber-400" : "text-muted-foreground"}`}>#{i + 1}</span>
                <span className="text-[9px] font-bold text-foreground flex-1 truncate">{a.name}</span>
                <span className="text-[9px] text-foreground font-bold">{a.listings}</span>
                <span className="text-[7px] text-muted-foreground">({a.exclusive} excl.)</span>
              </div>
            ))}
          </div>
          <h4 className="text-[10px] font-bold text-foreground mb-1">Weekly Trend</h4>
          <ResponsiveContainer width="100%" height={70}>
            <BarChart data={weeklySupply}>
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="listings" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Tab 2: Hot Buyer Matchmaking Engine ─────────────────────────────────────
const buyerMatches = [
  {
    buyer: "Ahmad K.", budget: "Rp 3.0–3.8B", location: "Seminyak / Canggu", urgency: "High" as const,
    matches: [
      { listing: "L-78: Villa Seminyak 3BR Pool", price: "Rp 3.5B", confidence: 92, dom: 8 },
      { listing: "L-45: Canggu Modern Villa 3BR", price: "Rp 3.2B", confidence: 78, dom: 14 },
      { listing: "L-112: Seminyak Townhouse 4BR", price: "Rp 3.8B", confidence: 65, dom: 22 },
    ]
  },
  {
    buyer: "Sarah L.", budget: "Rp 1.8–2.2B", location: "Canggu", urgency: "High" as const,
    matches: [
      { listing: "L-92: Canggu Apartment 2BR", price: "Rp 2.1B", confidence: 88, dom: 12 },
      { listing: "L-67: Canggu Studio Loft", price: "Rp 1.9B", confidence: 72, dom: 18 },
    ]
  },
  {
    buyer: "Michael R.", budget: "Rp 2.5–3.0B", location: "Ubud", urgency: "Medium" as const,
    matches: [
      { listing: "L-55: Ubud Land 800m²", price: "Rp 2.8B", confidence: 82, dom: 28 },
      { listing: "L-88: Ubud Jungle Villa 2BR", price: "Rp 2.6B", confidence: 74, dom: 34 },
    ]
  },
];

const urgencyStyle = { High: "border-destructive/30 text-destructive", Medium: "border-amber-500/30 text-amber-400", Low: "border-border/40 text-muted-foreground" };

const BuyerMatchmaking = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Kpi icon={Heart} label="Active Buyer Profiles" value="14" delta={18} />
      <Kpi icon={Target} label="Avg Match Score" value="77%" delta={8} accent="bg-emerald-500/10" />
      <Kpi icon={Eye} label="Viewings from Matches" value="8" sub="This week" />
      <Kpi icon={CheckCircle} label="Match → Offer Rate" value="34%" delta={12} accent="bg-emerald-500/10" />
    </div>

    <div className="space-y-3">
      {buyerMatches.map(bm => (
        <motion.div key={bm.buyer} variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-foreground">{bm.buyer}</span>
                <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${urgencyStyle[bm.urgency]}`}>{bm.urgency} Urgency</Badge>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-muted-foreground">{bm.budget} · {bm.location}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {bm.matches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    m.confidence >= 85 ? "border-emerald-500/40" : m.confidence >= 70 ? "border-primary/40" : "border-amber-500/40"
                  }`}>
                    <span className={`text-[10px] font-bold ${
                      m.confidence >= 85 ? "text-emerald-400" : m.confidence >= 70 ? "text-primary" : "text-amber-400"
                    }`}>{m.confidence}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-foreground block">{m.listing}</span>
                    <p className="text-[9px] text-muted-foreground">{m.price} · {m.dom} days on market</p>
                  </div>
                  {m.confidence >= 80 && (
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-emerald-500/20 text-emerald-400 shrink-0">Top Match</Badge>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[9px] gap-1 shrink-0" onClick={() => toast.success(`Viewing scheduled for ${bm.buyer}`)}>
                    <Calendar className="h-3 w-3" />Book Viewing
                  </Button>
                </div>
              ))}
            </div>
            {bm.matches[0]?.confidence >= 80 && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-[9px] text-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-emerald-400" />
                  Buyer {bm.buyer} has {bm.matches[0].confidence}% match probability with {bm.matches[0].listing.split(":")[0]}. Recommend priority viewing.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// ─── Tab 3: Deal Bottleneck Detection ────────────────────────────────────────
const bottlenecks = [
  { deal: "D-332", property: "Ubud Land 800m²", stage: "Negotiation", stuckDays: 12, issue: "Price gap mediation needed", risk: 72, type: "price" as const },
  { deal: "D-289", property: "Sanur Villa 4BR", stage: "Financing", stuckDays: 8, issue: "Bank loan approval delayed", risk: 65, type: "finance" as const },
  { deal: "D-401", property: "Canggu Apartment 2BR", stage: "Documentation", stuckDays: 6, issue: "Seller title deed verification pending", risk: 48, type: "docs" as const },
  { deal: "D-198", property: "Seminyak Studio", stage: "Viewing", stuckDays: 5, issue: "Buyer rescheduled twice — engagement declining", risk: 55, type: "viewing" as const },
];

const stageDelays = [
  { stage: "Inquiry", avg: 1.2, benchmark: 1 },
  { stage: "Qualification", avg: 2.8, benchmark: 2 },
  { stage: "Viewing", avg: 4.5, benchmark: 3 },
  { stage: "Negotiation", avg: 8.2, benchmark: 5 },
  { stage: "Documentation", avg: 6.1, benchmark: 4 },
  { stage: "Closing", avg: 5.4, benchmark: 3 },
];

const typeIcon = { price: DollarSign, finance: Shield, docs: FileText, viewing: Eye };
const typeAccent = { price: "border-amber-500/20 bg-amber-500/5", finance: "border-destructive/20 bg-destructive/5", docs: "border-primary/20 bg-primary/5", viewing: "border-amber-500/20 bg-amber-500/5" };

const BottleneckDetection = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Kpi icon={AlertTriangle} label="Stuck Deals" value="4" accent="bg-destructive/10" sub="Beyond threshold" />
      <Kpi icon={Clock} label="Avg Cycle Time" value="28d" delta={-5} sub="vs 22d benchmark" accent="bg-amber-500/10" />
      <Kpi icon={Activity} label="Pipeline Health" value="68%" sub="Active progression rate" />
      <Kpi icon={Target} label="Drop-off Risk" value="2" accent="bg-destructive/10" sub="High probability" />
    </div>

    {/* Bottleneck Cards */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-400" />Active Bottlenecks
        </h3>
        <div className="space-y-1.5">
          {bottlenecks.map(b => {
            const BIcon = typeIcon[b.type];
            return (
              <div key={b.deal} className={`p-3 rounded-lg border ${typeAccent[b.type]}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BIcon className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
                  <span className="text-[10px] font-bold text-foreground">{b.deal}: {b.property}</span>
                  <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-amber-500/30 text-amber-400">{b.stage}</Badge>
                  <span className="text-[9px] text-destructive font-bold ml-auto">{b.stuckDays}d stuck</span>
                </div>
                <p className="text-[9px] text-foreground/80 ml-5 mb-1">{b.issue}</p>
                <div className="flex items-center gap-2 ml-5">
                  <span className="text-[8px] text-muted-foreground">Drop-off risk:</span>
                  <Progress value={b.risk} className="h-1 w-20" />
                  <span className={`text-[9px] font-bold ${b.risk >= 60 ? "text-destructive" : "text-amber-400"}`}>{b.risk}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>

    {/* Stage Delay Comparison */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <h3 className="text-sm font-bold text-foreground mb-3">Stage Cycle Time vs Benchmark (days)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={stageDelays} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="stage" type="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="benchmark" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[0, 3, 3, 0]} name="Benchmark" />
            <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>

    {/* AI Recommendation */}
    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5">
        <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />AI Recommendations
        </h4>
        <div className="space-y-1.5">
          <p className="text-[9px] text-foreground">• <strong>D-332</strong>: Price gap mediation needed. Seller showed 5% flexibility — suggest buyer counter at Rp 2.65B.</p>
          <p className="text-[9px] text-foreground">• <strong>D-289</strong>: Bank contact unresponsive 4 days. Escalate via relationship manager or suggest cash alternative.</p>
          <p className="text-[9px] text-foreground">• <strong>D-198</strong>: Buyer engagement declining. Send curated comparable listings to re-activate interest.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 4: Weekly Revenue Sprint Planner ────────────────────────────────────
const sprintWeeks = [
  { week: "W1", revenue: 42, target: 50 },
  { week: "W2", revenue: 68, target: 50 },
  { week: "W3", revenue: 55, target: 60 },
  { week: "W4", revenue: 38, target: 60 },
];

const closingDeals = [
  { deal: "D-101", property: "Villa Seminyak 3BR", commission: "Rp 48M", probability: 92, agent: "Wayan S." },
  { deal: "D-204", property: "Canggu Apartment 2BR", commission: "Rp 28M", probability: 78, agent: "Made A." },
  { deal: "D-156", property: "Ubud Jungle Villa", commission: "Rp 35M", probability: 65, agent: "Ketut W." },
];

const sprintChecklist = [
  { task: "Follow up on D-101 closing documentation", done: true },
  { task: "Send final offer template to Sarah L. for D-204", done: true },
  { task: "Schedule price mediation call for D-332", done: false },
  { task: "Contact 5 premium listing upsell candidates", done: false },
  { task: "Review agent commission pipeline for month-end", done: false },
  { task: "Push 3 stalled deals past negotiation stage", done: false },
];

const WeeklyRevenueSprint = () => {
  const [checklist, setChecklist] = useState(sprintChecklist);
  const completed = checklist.filter(c => c.done).length;
  const sprintPct = Math.round((completed / checklist.length) * 100);

  const toggleCheck = (idx: number) => {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, done: !c.done } : c));
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      {/* Sprint Banner */}
      <motion.div variants={fadeUp}>
        <Card className="p-3 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <span className="text-sm font-bold text-foreground">Revenue Acceleration Week</span>
                <p className="text-[9px] text-muted-foreground">Week 4 Sprint · Target: Rp 60M</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">Rp 38M</span>
              <p className="text-[8px] text-muted-foreground">of Rp 60M target</p>
            </div>
          </div>
          <Progress value={63} className="h-2 mt-2" />
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Kpi icon={Target} label="Week Revenue Target" value="Rp 60M" />
        <Kpi icon={CheckCircle} label="Deals Likely to Close" value="3" accent="bg-emerald-500/10" sub="Within 7 days" />
        <Kpi icon={DollarSign} label="Commission Potential" value="Rp 111M" delta={24} />
        <Kpi icon={Star} label="Premium Upsell Opp." value="5" sub="Listings eligible" accent="bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Closing Deals */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <h3 className="text-sm font-bold text-foreground mb-3">Deals Closing This Week</h3>
            <div className="space-y-1.5">
              {closingDeals.map(d => (
                <div key={d.deal} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    d.probability >= 80 ? "border-emerald-500/40" : d.probability >= 60 ? "border-amber-500/40" : "border-border/40"
                  }`}>
                    <span className={`text-[10px] font-bold ${
                      d.probability >= 80 ? "text-emerald-400" : d.probability >= 60 ? "text-amber-400" : "text-muted-foreground"
                    }`}>{d.probability}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-foreground block">{d.deal}: {d.property}</span>
                    <p className="text-[9px] text-muted-foreground">Agent: {d.agent}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 shrink-0">{d.commission}</span>
                </div>
              ))}
            </div>

            <h4 className="text-[10px] font-bold text-foreground mt-4 mb-2">Weekly Revenue Momentum</h4>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={sprintWeeks}>
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="target" fill="hsl(var(--muted-foreground))" opacity={0.2} radius={[3, 3, 0, 0]} name="Target (M)" />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Actual (M)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Sprint Checklist */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Sprint Action Checklist</h3>
              <Badge variant="outline" className="text-[8px] h-5 border-primary/30 text-primary">{completed}/{checklist.length}</Badge>
            </div>
            <Progress value={sprintPct} className="h-1.5 mb-3" />
            <div className="space-y-1">
              {checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/10 transition-colors">
                  <button onClick={() => toggleCheck(i)} className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center ${
                    c.done ? "bg-emerald-500/20 border-emerald-500/40" : "border-border/60"
                  }`}>
                    {c.done && <Check className="h-3 w-3 text-emerald-400" />}
                  </button>
                  <span className={`text-[9px] ${c.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{c.task}</span>
                </div>
              ))}
            </div>

            {/* Milestone Banners */}
            <div className="mt-4 space-y-1">
              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center">
                <span className="text-[9px] font-bold text-emerald-400">✓ Rp 25M Milestone Reached</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/15 text-center">
                <span className="text-[9px] font-bold text-amber-400">→ Rp 50M — 2 closings away</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/10 border border-border/30 text-center">
                <span className="text-[9px] text-muted-foreground">Rp 100M Monthly Target</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const SupplyGrowthDealAcceleration = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Supply Growth & Deal Acceleration</h1>
        <p className="text-[10px] text-muted-foreground">Listing acquisition • Buyer matching • Bottleneck detection • Revenue sprints</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
        <TrendingUp className="h-3 w-3 mr-1" />Growth Engine
      </Badge>
    </div>

    <Tabs defaultValue="supply" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="supply" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Package className="h-3 w-3" />Seller Acquisition
        </TabsTrigger>
        <TabsTrigger value="matching" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Heart className="h-3 w-3" />Buyer Matching
        </TabsTrigger>
        <TabsTrigger value="bottlenecks" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <AlertTriangle className="h-3 w-3" />Bottlenecks
        </TabsTrigger>
        <TabsTrigger value="sprint" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <DollarSign className="h-3 w-3" />Revenue Sprint
        </TabsTrigger>
      </TabsList>

      <TabsContent value="supply"><SellerAcquisition /></TabsContent>
      <TabsContent value="matching"><BuyerMatchmaking /></TabsContent>
      <TabsContent value="bottlenecks"><BottleneckDetection /></TabsContent>
      <TabsContent value="sprint"><WeeklyRevenueSprint /></TabsContent>
    </Tabs>
  </div>
);

export default SupplyGrowthDealAcceleration;
