import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, Users, Eye, CheckCircle, XCircle, Clock,
  TrendingUp, ArrowUpRight, ArrowDownRight, Star, FileCheck, Search,
  Lock, Unlock, Flag, ThumbsUp, Award, BarChart3, Activity,
  MapPin, Radio, Zap, DollarSign, FileText, Upload, ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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
  icon: React.ElementType; label: string; value: string; delta?: number; sub?: string; variant?: "danger" | "warning" | "success";
}) => {
  const variantCls = variant === "danger" ? "bg-destructive/10" : variant === "warning" ? "bg-amber-500/10" : variant === "success" ? "bg-emerald-500/10" : "bg-primary/10";
  const iconCls = variant === "danger" ? "text-destructive" : variant === "warning" ? "text-amber-400" : variant === "success" ? "text-emerald-400" : "text-primary";
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className={`h-7 w-7 rounded-lg ${variantCls} flex items-center justify-center`}>
            <Icon className={`h-3.5 w-3.5 ${iconCls}`} />
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

const RiskBadge = ({ level }: { level: "low" | "medium" | "high" | "critical" }) => {
  const cls = {
    low: "border-emerald-500/30 text-emerald-400",
    medium: "border-amber-500/30 text-amber-400",
    high: "border-red-500/30 text-red-400",
    critical: "border-red-500/50 text-red-400 bg-red-500/10",
  };
  return <Badge variant="outline" className={`text-[7px] h-4 px-1.5 ${cls[level]}`}>{level}</Badge>;
};

// ─── Tab 1: Trust & Safety Risk Monitoring ──────────────────────────────────
const riskTrend = [
  { week: "W1", alerts: 12, resolved: 10, score: 82 },
  { week: "W2", alerts: 18, resolved: 14, score: 78 },
  { week: "W3", alerts: 14, resolved: 13, score: 84 },
  { week: "W4", alerts: 22, resolved: 18, score: 76 },
  { week: "W5", alerts: 16, resolved: 15, score: 86 },
  { week: "W6", alerts: 10, resolved: 9, score: 88 },
];

const alertFeed = [
  { id: 1, type: "Identity Verification Required", entity: "User #4821", time: "12m ago", risk: "high" as const, desc: "Unverified seller posted 4 high-value listings" },
  { id: 2, type: "Unusual Inquiry Pattern", entity: "User #3192", time: "28m ago", risk: "medium" as const, desc: "42 inquiries sent in 15 minutes — possible bot activity" },
  { id: 3, type: "High Complaint Activity", entity: "Agent R. Santos", time: "1h ago", risk: "medium" as const, desc: "3 buyer complaints about delayed viewing schedules" },
  { id: 4, type: "Duplicate Listing", entity: "Property #7742", time: "2h ago", risk: "low" as const, desc: "90% content match with Property #7738" },
  { id: 5, type: "Price Manipulation", entity: "Seller #1294", time: "3h ago", risk: "critical" as const, desc: "Listing price changed 5 times in 24h — possible bait-and-switch" },
];

const geoRisk = [
  { district: "Seminyak", risk: 18, listings: 142, incidents: 3 },
  { district: "Canggu", risk: 24, listings: 98, incidents: 5 },
  { district: "Ubud", risk: 12, listings: 64, incidents: 1 },
  { district: "Jimbaran", risk: 32, listings: 48, incidents: 4 },
  { district: "Sanur", risk: 8, listings: 52, incidents: 0 },
];

const RiskMonitoring = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={AlertTriangle} label="Active Alerts" value="8" delta={-22} sub="Declining" variant="warning" />
      <KpiCard icon={Flag} label="High-Risk Listings" value="3" variant="danger" sub="Need review" />
      <KpiCard icon={Users} label="Verification Queue" value="14" delta={-8} />
      <KpiCard icon={FileText} label="Dispute Cases" value="2" variant="warning" sub="In progress" />
      <KpiCard icon={Shield} label="Trust Score" value="86" delta={4} variant="success" sub="Strong" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Risk Trend & Resolution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={riskTrend}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area dataKey="alerts" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#riskGrad)" name="Alerts" />
              <Line dataKey="resolved" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Geographic Risk Concentration</h3>
          <div className="space-y-2">
            {geoRisk.sort((a, b) => b.risk - a.risk).map(d => (
              <div key={d.district} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-foreground w-20">{d.district}</span>
                <div className="flex-1">
                  <Progress value={d.risk} className="h-1.5" />
                </div>
                <span className={`text-[9px] font-bold w-8 text-right ${d.risk > 25 ? "text-red-400" : d.risk > 15 ? "text-amber-400" : "text-emerald-400"}`}>{d.risk}%</span>
                <span className="text-[8px] text-muted-foreground">{d.incidents} inc.</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Real-Time Alert Feed</h3>
        <div className="space-y-1.5">
          {alertFeed.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                a.risk === "critical" || a.risk === "high" ? "bg-destructive/10" : "bg-amber-500/10"
              }`}>
                <AlertTriangle className={`h-3.5 w-3.5 ${a.risk === "critical" || a.risk === "high" ? "text-destructive" : "text-amber-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-foreground">{a.type}</span>
                  <RiskBadge level={a.risk} />
                </div>
                <p className="text-[9px] text-muted-foreground truncate">{a.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] text-muted-foreground">{a.entity}</span>
                <p className="text-[8px] text-muted-foreground">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 2: Fraud Detection & Listing Verification ──────────────────────────
const suspiciousListings = [
  { id: "L-7742", title: "Villa Oceanview Seminyak", price: "Rp 2.8B", confidence: 34, issue: "45% below district avg", docStatus: "Unverified", photoAuth: 62, risk: "critical" as const },
  { id: "L-8104", title: "Land Plot Ubud 2000sqm", price: "Rp 890M", confidence: 52, issue: "Duplicate content detected", docStatus: "Pending", photoAuth: 78, risk: "high" as const },
  { id: "L-6891", title: "Penthouse Canggu 3BR", price: "Rp 4.2B", confidence: 68, issue: "New seller, high-value listing", docStatus: "Verified", photoAuth: 88, risk: "medium" as const },
  { id: "L-9023", title: "Townhouse Sanur Block C", price: "Rp 1.6B", confidence: 82, issue: "Minor pricing variance", docStatus: "Verified", photoAuth: 94, risk: "low" as const },
  { id: "L-5519", title: "Studio Kuta Complex", price: "Rp 380M", confidence: 28, issue: "Stock photos detected", docStatus: "Missing", photoAuth: 22, risk: "critical" as const },
];

const FraudDetection = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Search} label="Listings Scanned" value="342" sub="This week" />
      <KpiCard icon={Flag} label="Flagged" value="8" variant="danger" delta={-14} />
      <KpiCard icon={FileCheck} label="Verified" value="298" variant="success" delta={6} />
      <KpiCard icon={XCircle} label="Suspended" value="4" variant="danger" sub="Action taken" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">AI Listing Authenticity Analysis</h3>
        <div className="space-y-2">
          {suspiciousListings.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-foreground">{l.id}</span>
                  <span className="text-[10px] text-foreground">{l.title}</span>
                  <RiskBadge level={l.risk} />
                </div>
                <p className="text-[9px] text-muted-foreground">{l.issue}</p>
              </div>
              <div className="flex gap-4 text-[9px] shrink-0">
                <div className="text-center">
                  <span className="text-muted-foreground block">Confidence</span>
                  <span className={`font-bold ${l.confidence < 50 ? "text-red-400" : l.confidence < 70 ? "text-amber-400" : "text-emerald-400"}`}>{l.confidence}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Photo Auth</span>
                  <span className={`font-bold ${l.photoAuth < 50 ? "text-red-400" : "text-foreground"}`}>{l.photoAuth}%</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Docs</span>
                  <Badge variant="outline" className={`text-[7px] h-4 px-1 ${
                    l.docStatus === "Verified" ? "border-emerald-500/30 text-emerald-400" :
                    l.docStatus === "Missing" ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-400"
                  }`}>{l.docStatus}</Badge>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="outline" className="h-6 text-[9px] px-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                  <CheckCircle className="h-3 w-3 mr-1" />Approve
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-[9px] px-2 border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <XCircle className="h-3 w-3 mr-1" />Suspend
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground">
            <span className="font-bold">AI Insight:</span> Listing L-7742 price is 45% below Seminyak district average — verify seller intent and documentation before approving.
          </p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 3: Reputation & Review Intelligence ────────────────────────────────
const topAgents = [
  { name: "Alex Hartono", rating: 4.9, reviews: 48, deals: 32, repeat: 28, speed: "4.2m" },
  { name: "Rina Santoso", rating: 4.8, reviews: 36, deals: 24, repeat: 22, speed: "5.8m" },
  { name: "Budi Pratama", rating: 4.7, reviews: 28, deals: 18, repeat: 16, speed: "6.4m" },
  { name: "Dewi Lestari", rating: 4.5, reviews: 22, deals: 14, repeat: 8, speed: "8.2m" },
  { name: "Fahri Maulana", rating: 4.2, reviews: 16, deals: 10, repeat: 4, speed: "12.0m" },
];

const repTrend = [
  { month: "Jan", agentRating: 4.4, sellerResp: 62, buyerSat: 72 },
  { month: "Feb", agentRating: 4.5, sellerResp: 66, buyerSat: 74 },
  { month: "Mar", agentRating: 4.6, sellerResp: 72, buyerSat: 78 },
  { month: "Apr", agentRating: 4.7, sellerResp: 74, buyerSat: 82 },
  { month: "May", agentRating: 4.7, sellerResp: 78, buyerSat: 84 },
];

const ReputationIntelligence = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <KpiCard icon={Star} label="Avg Agent Rating" value="4.6" delta={5} variant="success" />
      <KpiCard icon={Activity} label="Seller Response" value="78%" delta={8} />
      <KpiCard icon={ThumbsUp} label="Buyer Satisfaction" value="84%" delta={6} variant="success" />
      <KpiCard icon={FileCheck} label="Verified Reviews" value="186" delta={22} />
      <KpiCard icon={Users} label="Repeat Tx Ratio" value="24%" delta={12} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <motion.div variants={fadeUp} className="lg:col-span-2">
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Top Trusted Agents</h3>
          <div className="space-y-1.5">
            {topAgents.map((a, i) => (
              <div key={a.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  i === 0 ? "bg-primary/20 text-primary" : i < 3 ? "bg-muted/30 text-foreground" : "bg-muted/15 text-muted-foreground"
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-foreground">{a.name}</span>
                    {i === 0 && <Badge variant="outline" className="text-[7px] h-4 px-1 border-primary/30 text-primary">Top Trusted</Badge>}
                  </div>
                </div>
                <div className="flex gap-3 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400" /><span className="font-bold text-foreground">{a.rating}</span></span>
                  <span><span className="font-bold text-foreground">{a.reviews}</span> reviews</span>
                  <span><span className="font-bold text-foreground">{a.deals}</span> deals</span>
                  <span><span className="font-bold text-foreground">{a.repeat}%</span> repeat</span>
                  <span><span className="font-bold text-foreground">{a.speed}</span> resp</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Reputation Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={repTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip content={<Tip />} />
              <Line dataKey="buyerSat" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Buyer Satisfaction" />
              <Line dataKey="sellerResp" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Seller Response" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground">
            <span className="font-bold">Insight:</span> Listings handled by top-rated agents close 28% faster — prioritize buyer routing to agents with 4.7+ rating.
          </p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 4: Transaction Escrow & Secure Deal Flow ───────────────────────────
const escrowDeals = [
  { id: "TX-4821", property: "Villa Oceana Seminyak", buyer: "James L.", amount: "Rp 2.8B", stage: "Document Verification", progress: 50, docs: 3, docsTotal: 5, risk: "low" as const },
  { id: "TX-3914", property: "Penthouse Canggu 12", buyer: "Sarah K.", amount: "Rp 4.2B", stage: "Payment Milestone", progress: 67, docs: 4, docsTotal: 5, risk: "low" as const },
  { id: "TX-5102", property: "Land Ubud 1200sqm", buyer: "Michael R.", amount: "Rp 890M", stage: "Escrow Initiated", progress: 33, docs: 2, docsTotal: 5, risk: "medium" as const },
  { id: "TX-2847", property: "Townhouse Sanur B4", buyer: "Linda W.", amount: "Rp 1.6B", stage: "Legal Confirmation", progress: 83, docs: 5, docsTotal: 5, risk: "low" as const },
];

const dealStages = ["Offer Submitted", "Escrow Initiated", "Document Verification", "Payment Milestone", "Legal Confirmation", "Transaction Closed"];

const SecureDealFlow = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Lock} label="Active Escrow" value="4" sub="Rp 9.49B secured" variant="success" />
      <KpiCard icon={FileCheck} label="Docs Verified" value="14/20" delta={12} />
      <KpiCard icon={DollarSign} label="Escrow Balance" value="Rp 4.2B" sub="Held securely" />
      <KpiCard icon={CheckCircle} label="Completed This Month" value="6" delta={50} variant="success" />
    </div>

    {/* Timeline visualization */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Deal Security Pipeline</h3>
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
          {dealStages.map((stage, i) => (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < 4 ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted-foreground"
                }`}>{i + 1}</div>
                <span className="text-[8px] text-muted-foreground mt-1 text-center max-w-[80px]">{stage}</span>
              </div>
              {i < dealStages.length - 1 && (
                <div className={`h-0.5 w-8 shrink-0 ${i < 3 ? "bg-primary/40" : "bg-border/40"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="space-y-2">
          {escrowDeals.map(d => (
            <div key={d.id} className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold text-primary">{d.id}</span>
                <span className="text-[10px] font-bold text-foreground">{d.property}</span>
                <RiskBadge level={d.risk} />
                <span className="text-[9px] text-muted-foreground ml-auto">{d.buyer}</span>
                <span className="text-[10px] font-bold text-foreground">{d.amount}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[9px] mb-1">
                    <span className="text-muted-foreground">{d.stage}</span>
                    <span className="text-primary font-bold">{d.progress}%</span>
                  </div>
                  <Progress value={d.progress} className="h-1.5" />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge variant="outline" className="text-[7px] h-4 px-1 border-border/60 text-muted-foreground">
                    <FileText className="h-2.5 w-2.5 mr-0.5" />{d.docs}/{d.docsTotal} docs
                  </Badge>
                  <Button size="sm" variant="outline" className="h-6 text-[9px] px-2">
                    <Eye className="h-3 w-3 mr-1" />Details
                  </Button>
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
          <h3 className="text-sm font-bold text-foreground mb-3">Pending Actions</h3>
          <div className="space-y-2">
            {[
              { action: "Upload seller title deed", deal: "TX-5102", urgency: "high" as const, icon: Upload },
              { action: "Verify buyer financing proof", deal: "TX-4821", urgency: "medium" as const, icon: FileCheck },
              { action: "Confirm payment milestone #2", deal: "TX-3914", urgency: "high" as const, icon: DollarSign },
              { action: "Schedule notary appointment", deal: "TX-2847", urgency: "low" as const, icon: Clock },
            ].map(a => (
              <div key={a.action} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                  a.urgency === "high" ? "bg-amber-500/10" : "bg-muted/20"
                }`}>
                  <a.icon className={`h-3.5 w-3.5 ${a.urgency === "high" ? "text-amber-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-foreground">{a.action}</span>
                  <p className="text-[8px] text-muted-foreground">{a.deal}</p>
                </div>
                <RiskBadge level={a.urgency} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Escrow Security Metrics</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={[
              { metric: "Doc Completeness", value: 72 },
              { metric: "Payment Security", value: 88 },
              { metric: "Identity Verified", value: 82 },
              { metric: "Legal Compliance", value: 76 },
              { metric: "Dispute Resolution", value: 90 },
              { metric: "Fraud Prevention", value: 84 },
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

// ─── Main ────────────────────────────────────────────────────────────────────
const TrustSafetyIntelligence = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Trust & Safety Intelligence</h1>
        <p className="text-[10px] text-muted-foreground">Risk monitoring • Fraud detection • Reputation signals • Secure transactions</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
        <Shield className="h-3 w-3 mr-1" />Platform Trust: 86/100
      </Badge>
    </div>

    <Tabs defaultValue="risk" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="risk" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Shield className="h-3 w-3" />Risk Monitor
        </TabsTrigger>
        <TabsTrigger value="fraud" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Search className="h-3 w-3" />Fraud Detection
        </TabsTrigger>
        <TabsTrigger value="reputation" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Star className="h-3 w-3" />Reputation
        </TabsTrigger>
        <TabsTrigger value="escrow" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Lock className="h-3 w-3" />Secure Deals
        </TabsTrigger>
      </TabsList>

      <TabsContent value="risk"><RiskMonitoring /></TabsContent>
      <TabsContent value="fraud"><FraudDetection /></TabsContent>
      <TabsContent value="reputation"><ReputationIntelligence /></TabsContent>
      <TabsContent value="escrow"><SecureDealFlow /></TabsContent>
    </Tabs>
  </div>
);

export default TrustSafetyIntelligence;
