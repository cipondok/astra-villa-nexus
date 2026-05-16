import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Clock, Zap, Star, Award, Shield, Target, MapPin, Eye, BarChart3,
  Megaphone, Activity, ArrowRight, ChevronRight, AlertTriangle, Flame,
  Radio, Network, Heart, RefreshCw, Crown, Timer, Building
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
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

// ─── Tab 1: Agent Commission Gamification ────────────────────────────────────
const agentLeaderboard = [
  { name: "Alex Hartono", deals: 8, commission: 284, viewings: 22, response: 4.2, tier: "Elite" as const, badge: "Top Closer" },
  { name: "Rina Santoso", deals: 6, commission: 198, viewings: 18, response: 6.1, tier: "Gold" as const, badge: "Fast Responder" },
  { name: "Budi Pratama", deals: 5, commission: 172, viewings: 15, response: 8.4, tier: "Gold" as const, badge: "Listing Champion" },
  { name: "Dewi Lestari", deals: 4, commission: 136, viewings: 14, response: 5.8, tier: "Silver" as const, badge: null },
  { name: "Fahri Maulana", deals: 3, commission: 98, viewings: 11, response: 12.0, tier: "Silver" as const, badge: null },
  { name: "Citra Anggraini", deals: 2, commission: 64, viewings: 8, response: 9.2, tier: "Bronze" as const, badge: null },
];

const tierColors: Record<string, string> = {
  Elite: "border-primary/40 text-primary bg-primary/10",
  Gold: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  Silver: "border-muted-foreground/40 text-muted-foreground bg-muted/20",
  Bronze: "border-border/60 text-muted-foreground bg-muted/10",
};

const challenges = [
  { title: "Close 3 deals this week", progress: 67, reward: "Rp 500K bonus" },
  { title: "Book 10 viewings", progress: 80, reward: "Listing boost credit" },
  { title: "Respond to all inquiries < 5 min", progress: 42, reward: "Fast Responder badge" },
];

const AgentGamification = () => {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KpiCard icon={Trophy} label="Top Closer" value="Alex H." sub="8 deals this month" />
        <KpiCard icon={DollarSign} label="Total Commission" value="Rp 952M" delta={24} />
        <KpiCard icon={Users} label="Active Agents" value="34" delta={8} />
        <KpiCard icon={Clock} label="Avg Response" value="7.6m" delta={-18} sub="Improving" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Leaderboard */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Agent Leaderboard</h3>
              <div className="flex gap-1">
                <Badge variant={period === "weekly" ? "default" : "outline"} className="text-[9px] h-5 cursor-pointer" onClick={() => setPeriod("weekly")}>Weekly</Badge>
                <Badge variant={period === "monthly" ? "default" : "outline"} className="text-[9px] h-5 cursor-pointer" onClick={() => setPeriod("monthly")}>Monthly</Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              {agentLeaderboard.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    i === 0 ? "bg-primary/20 text-primary" : i < 3 ? "bg-muted/30 text-foreground" : "bg-muted/15 text-muted-foreground"
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-foreground">{a.name}</span>
                      <Badge variant="outline" className={`text-[7px] h-4 px-1 ${tierColors[a.tier]}`}>{a.tier}</Badge>
                      {a.badge && <Badge variant="outline" className="text-[7px] h-4 px-1 border-primary/30 text-primary">{a.badge}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-3 text-[9px] text-muted-foreground">
                    <span><span className="text-foreground font-bold">{a.deals}</span> deals</span>
                    <span><span className="text-foreground font-bold">Rp {a.commission}M</span></span>
                    <span><span className="text-foreground font-bold">{a.response}m</span> resp</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Challenges + Milestones */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Weekly Challenges</h3>
              <div className="space-y-2">
                {challenges.map(c => (
                  <div key={c.title} className="p-2 rounded-lg bg-muted/10">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-foreground font-medium">{c.title}</span>
                      <span className="text-primary font-bold">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5 mb-1" />
                    <span className="text-[8px] text-muted-foreground">Reward: {c.reward}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/40 pt-3">
              <h4 className="text-[10px] font-bold text-foreground mb-2">Tier Progression</h4>
              {[
                { agent: "Dewi L.", current: "Silver", next: "Gold", dealsNeeded: 2 },
                { agent: "Alex H.", current: "Elite", next: "Elite+", dealsNeeded: 0 },
              ].map(t => (
                <div key={t.agent} className="flex items-center gap-2 p-1.5 rounded bg-muted/10 mb-1">
                  <span className="text-[10px] font-bold text-foreground">{t.agent}</span>
                  <Badge variant="outline" className={`text-[7px] h-4 px-1 ${tierColors[t.current]}`}>{t.current}</Badge>
                  {t.dealsNeeded > 0 && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                      <span className="text-[9px] text-primary font-bold">{t.dealsNeeded} deals to {t.next}</span>
                    </>
                  )}
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
            <p className="text-[10px] text-foreground"><span className="font-bold">Agent Alex</span> is 1 deal away from Elite tier bonus — Rp 2M achievement reward unlocked at next closing.</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ─── Tab 2: Seller Urgency Psychology ────────────────────────────────────────
const sellerListings = [
  { property: "Villa Oceana, Seminyak", days: 8, responsiveness: 92, inquiryView: 3.2, priceComp: 95, visibility: 88, status: "Healthy" as const },
  { property: "Penthouse Canggu 12", days: 14, responsiveness: 78, inquiryView: 2.4, priceComp: 88, visibility: 72, status: "Monitor" as const },
  { property: "Land Ubud 1200sqm", days: 32, responsiveness: 45, inquiryView: 1.1, priceComp: 72, visibility: 38, status: "Stagnating" as const },
  { property: "Townhouse Sanur B4", days: 28, responsiveness: 52, inquiryView: 1.4, priceComp: 68, visibility: 42, status: "Stagnating" as const },
  { property: "Studio Kuta Complex", days: 45, responsiveness: 34, inquiryView: 0.6, priceComp: 58, visibility: 22, status: "Critical" as const },
];

const statusColors: Record<string, string> = {
  Healthy: "border-emerald-500/30 text-emerald-400",
  Monitor: "border-amber-500/30 text-amber-400",
  Stagnating: "border-red-500/30 text-red-400",
  Critical: "border-red-500/50 text-red-400",
};

const SellerUrgency = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Timer} label="Avg Days on Market" value="18" delta={-12} sub="Improving" />
      <KpiCard icon={Eye} label="Avg Visibility Score" value="62" delta={8} />
      <KpiCard icon={Activity} label="Seller Response Rate" value="68%" delta={5} />
      <KpiCard icon={AlertTriangle} label="Stagnating Listings" value="6" sub="Need intervention" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">Listing Health Monitor</h3>
        <div className="space-y-1.5">
          {sellerListings.map(s => (
            <div key={s.property} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-foreground truncate block">{s.property}</span>
              </div>
              <div className="flex gap-3 text-[9px]">
                <div className="text-center w-12">
                  <span className="text-muted-foreground block">Days</span>
                  <span className={`font-bold ${s.days > 25 ? "text-red-400" : "text-foreground"}`}>{s.days}</span>
                </div>
                <div className="text-center w-14">
                  <span className="text-muted-foreground block">Response</span>
                  <span className="font-bold text-foreground">{s.responsiveness}%</span>
                </div>
                <div className="text-center w-14">
                  <span className="text-muted-foreground block">Inq:View</span>
                  <span className="font-bold text-foreground">{s.inquiryView}</span>
                </div>
                <div className="text-center w-14">
                  <span className="text-muted-foreground block">Price Idx</span>
                  <span className={`font-bold ${s.priceComp < 70 ? "text-amber-400" : "text-foreground"}`}>{s.priceComp}</span>
                </div>
                <div className="text-center w-14">
                  <span className="text-muted-foreground block">Visibility</span>
                  <span className="font-bold text-foreground">{s.visibility}</span>
                </div>
              </div>
              <Badge variant="outline" className={`text-[8px] h-4 px-1.5 ${statusColors[s.status]}`}>{s.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Behavioral Triggers</h3>
          <div className="space-y-2">
            {[
              { trigger: "Urgency Alert", desc: "3 listings stagnating > 25 days — send price review notification", icon: AlertTriangle, variant: "danger" as const },
              { trigger: "Price Adjustment", desc: "Reducing price by 2–4% could increase viewing probability by 35%", icon: TrendingUp, variant: "warning" as const },
              { trigger: "Premium Upgrade", desc: "5 listings below visibility threshold — recommend Featured upgrade", icon: Star, variant: "info" as const },
              { trigger: "Competition Pressure", desc: "4 new competing listings in Seminyak — alert affected sellers", icon: Shield, variant: "warning" as const },
            ].map(t => {
              const cls = { danger: "bg-red-500/10 text-red-400", warning: "bg-amber-500/10 text-amber-400", info: "bg-primary/10 text-primary" };
              return (
                <div key={t.trigger} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/10">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${cls[t.variant]}`}>
                    <t.icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-foreground">{t.trigger}</span>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Days on Market Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { range: "0-7d", count: 28 }, { range: "8-14d", count: 22 },
              { range: "15-21d", count: 14 }, { range: "22-30d", count: 8 },
              { range: "31-45d", count: 5 }, { range: "45d+", count: 3 },
            ]} barSize={20}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Listings">
                {[28, 22, 14, 8, 5, 3].map((v, i) => (
                  <Cell key={i} fill={i < 2 ? "hsl(var(--primary))" : i < 4 ? "hsl(var(--muted-foreground) / 0.4)" : "hsl(var(--destructive) / 0.5)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Tab 3: Hyperlocal Marketing ROI ─────────────────────────────────────────
const districtMarketing = [
  { district: "Seminyak", leads: 86, cpi: 42, viewings: 18, spend: 8.4, deals: 4, roi: 3.8 },
  { district: "Canggu", leads: 72, cpi: 38, viewings: 14, spend: 6.2, deals: 3, roi: 3.2 },
  { district: "Ubud", leads: 34, cpi: 62, viewings: 6, spend: 4.8, deals: 1, roi: 1.4 },
  { district: "Jimbaran", leads: 48, cpi: 48, viewings: 10, spend: 5.2, deals: 2, roi: 2.6 },
  { district: "Sanur", leads: 28, cpi: 72, viewings: 4, spend: 3.6, deals: 1, roi: 1.2 },
];

const channelPerformance = [
  { channel: "Instagram", leads: 124, spend: 12.4, conv: 4.8, roi: 3.2 },
  { channel: "Google Ads", leads: 86, spend: 14.2, conv: 3.2, roi: 2.4 },
  { channel: "Facebook", leads: 62, spend: 6.8, conv: 2.8, roi: 2.8 },
  { channel: "TikTok", leads: 48, spend: 4.2, conv: 5.2, roi: 4.1 },
  { channel: "WhatsApp", leads: 38, spend: 1.8, conv: 8.4, roi: 6.2 },
];

const MarketingROI = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KpiCard icon={Megaphone} label="Total Spend" value="Rp 28.2M" delta={12} sub="This month" />
      <KpiCard icon={Users} label="Leads Generated" value="268" delta={22} />
      <KpiCard icon={DollarSign} label="Avg CPI" value="Rp 48K" delta={-8} sub="Improving" />
      <KpiCard icon={Target} label="Blended ROI" value="2.8×" delta={15} />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-3">District Marketing Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/40">
                {["District", "Leads", "CPI (Rp K)", "Viewings", "Spend (M)", "Deals", "ROI"].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districtMarketing.map(d => (
                <tr key={d.district} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="py-2.5 px-2 font-bold text-foreground">{d.district}</td>
                  <td className="py-2.5 px-2 font-semibold text-foreground">{d.leads}</td>
                  <td className={`py-2.5 px-2 font-bold ${d.cpi > 60 ? "text-amber-400" : "text-foreground"}`}>{d.cpi}</td>
                  <td className="py-2.5 px-2 text-foreground">{d.viewings}</td>
                  <td className="py-2.5 px-2 text-foreground">{d.spend}</td>
                  <td className="py-2.5 px-2 font-bold text-foreground">{d.deals}</td>
                  <td className={`py-2.5 px-2 font-bold ${d.roi >= 3 ? "text-emerald-400" : d.roi >= 2 ? "text-foreground" : "text-amber-400"}`}>{d.roi}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Channel ROI Comparison</h3>
          <div className="space-y-2">
            {channelPerformance.map(c => (
              <div key={c.channel} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10">
                <span className="text-[11px] font-bold text-foreground w-20">{c.channel}</span>
                <div className="flex-1">
                  <Progress value={(c.roi / 7) * 100} className="h-1.5" />
                </div>
                <div className="flex gap-3 text-[9px] text-muted-foreground">
                  <span><span className="text-foreground font-bold">{c.leads}</span> leads</span>
                  <span><span className="text-foreground font-bold">{c.conv}%</span> conv</span>
                  <span className={`font-bold ${c.roi >= 4 ? "text-emerald-400" : "text-foreground"}`}>{c.roi}× ROI</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">AI Budget Suggestions</h3>
          </div>
          <div className="space-y-2">
            {[
              { action: "Shift 20% budget from Google Ads to TikTok", impact: "+34% lead efficiency", priority: "high" as const },
              { action: "Increase Seminyak ad spend by Rp 3M", impact: "+8 qualified leads/week", priority: "high" as const },
              { action: "Pause Sanur campaigns — ROI below 1.5×", impact: "Save Rp 3.6M/month", priority: "medium" as const },
              { action: "Launch WhatsApp retargeting in Canggu", impact: "+12 viewings/month est.", priority: "medium" as const },
            ].map(s => (
              <div key={s.action} className="p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-foreground">{s.action}</span>
                  <Badge variant="outline" className={`text-[7px] h-4 px-1 ${
                    s.priority === "high" ? "border-emerald-500/30 text-emerald-400" : "border-border/60 text-muted-foreground"
                  }`}>{s.priority}</Badge>
                </div>
                <p className="text-[9px] text-primary font-medium">Expected: {s.impact}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ─── Tab 4: Network Effect Tracker ───────────────────────────────────────────
const networkTrend = [
  { month: "Jan", listings: 42, buyers: 120, agents: 12, inquiries: 180 },
  { month: "Feb", listings: 68, buyers: 185, agents: 18, inquiries: 310 },
  { month: "Mar", listings: 98, buyers: 260, agents: 24, inquiries: 520 },
  { month: "Apr", listings: 128, buyers: 380, agents: 28, inquiries: 780 },
  { month: "May", listings: 162, buyers: 520, agents: 34, inquiries: 1100 },
];

const networkRadar = [
  { metric: "Supply Growth", value: 72 }, { metric: "Demand Accel.", value: 84 },
  { metric: "Agent Density", value: 58 }, { metric: "Inquiry/Listing", value: 76 },
  { metric: "Repeat Users", value: 42 }, { metric: "Referral Rate", value: 38 },
];

const NetworkEffectTracker = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    {/* Headline Score */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Marketplace Network Effect Strength</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground">62</span>
              <span className="text-sm text-muted-foreground font-medium">/ 100</span>
              <Delta v={18} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Early network effect formation detected — demand accelerating faster than supply</p>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <Network className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {[
        { label: "Supply:Demand", value: "1:3.2", icon: BarChart3, delta: 14 },
        { label: "Agent Growth", value: "+42%", icon: Users, delta: 8 },
        { label: "Inq/Listing", value: "6.8", icon: Activity, delta: 22 },
        { label: "Repeat Users", value: "28%", icon: RefreshCw, delta: 12 },
        { label: "Referral Growth", value: "18%", icon: Heart, delta: 34 },
      ].map(m => (
        <KpiCard key={m.label} icon={m.icon} label={m.label} value={m.value} delta={m.delta} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Growth curves */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Supply vs Demand Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={networkTrend}>
              <defs>
                <linearGradient id="demGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area dataKey="buyers" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#demGrad)" name="Buyers" />
              <Line dataKey="listings" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Listings" />
              <Line dataKey="inquiries" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} name="Inquiries" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Radar */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm h-full">
          <h3 className="text-sm font-bold text-foreground mb-2">Network Health Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={networkRadar}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>

    {/* Flywheel signals */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-foreground mb-2">Flywheel Formation Signals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { signal: "Demand > Supply", desc: "Buyer growth outpacing listings 3.2:1 — natural urgency forming", strength: 84 },
            { signal: "Organic Discovery", desc: "18% of new users from referrals — word-of-mouth emerging", strength: 58 },
            { signal: "Agent Retention", desc: "82% agent 30-day retention — workforce becoming sticky", strength: 72 },
          ].map(s => (
            <div key={s.signal} className="p-3 rounded-lg bg-muted/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-foreground">{s.signal}</span>
                <span className="text-[10px] font-bold text-primary">{s.strength}%</span>
              </div>
              <Progress value={s.strength} className="h-1.5 mb-1" />
              <p className="text-[8px] text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const BehavioralGrowthEngine = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Behavioral Growth Engine</h1>
        <p className="text-[10px] text-muted-foreground">Agent gamification • Seller psychology • Marketing ROI • Network effects</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-emerald-500/30 text-emerald-400">
        <Radio className="h-3 w-3 mr-1" />Behavioral Engine Active
      </Badge>
    </div>

    <Tabs defaultValue="gamification" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="gamification" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Trophy className="h-3 w-3" />Agent Gamification
        </TabsTrigger>
        <TabsTrigger value="seller" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Flame className="h-3 w-3" />Seller Urgency
        </TabsTrigger>
        <TabsTrigger value="marketing" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Megaphone className="h-3 w-3" />Marketing ROI
        </TabsTrigger>
        <TabsTrigger value="network" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Network className="h-3 w-3" />Network Effects
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gamification"><AgentGamification /></TabsContent>
      <TabsContent value="seller"><SellerUrgency /></TabsContent>
      <TabsContent value="marketing"><MarketingROI /></TabsContent>
      <TabsContent value="network"><NetworkEffectTracker /></TabsContent>
    </Tabs>
  </div>
);

export default BehavioralGrowthEngine;
