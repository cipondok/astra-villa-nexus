import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Users, Target,
  BarChart3, Zap, Crown, Eye, Rocket, AlertTriangle, CheckCircle, Timer,
  Sparkles, Gift, Bell, Play, Send, ChevronRight, Flame, Star, Globe, MapPin,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};

const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.05, duration: 0.35 },
});

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);

/* ── KPI Card ── */
const KPI = ({ label, value, sub, delta, positive = true, icon: Icon }: {
  label: string; value: string; sub?: string; delta?: string; positive?: boolean; icon: React.ElementType;
}) => (
  <div className="p-3.5 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-1.5">
      <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
      {delta && (
        <Badge variant="outline" className={`text-[8px] h-4 px-1.5 gap-0.5 font-bold border-0 ${positive ? 'bg-chart-1/10 text-chart-1' : 'bg-destructive/10 text-destructive'}`}>
          {positive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}{delta}
        </Badge>
      )}
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
    <p className="text-xl font-black tabular-nums text-foreground leading-none mt-0.5">{value}</p>
    {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — REVENUE TARGET TRACKING ENGINE
   ══════════════════════════════════════════════════════════════ */
const cumulativeData = [
  { month: 'Jul', revenue: 12, target: 55 },
  { month: 'Aug', revenue: 40, target: 110 },
  { month: 'Sep', revenue: 98, target: 165 },
  { month: 'Oct', revenue: 185, target: 250 },
  { month: 'Nov', revenue: 310, target: 370 },
  { month: 'Dec', revenue: 468, target: 500 },
  { month: 'Jan', revenue: 612, target: 640 },
  { month: 'Feb', revenue: 762, target: 790 },
  { month: 'Mar', revenue: 892, target: 900 },
  { month: 'Apr', revenue: null, target: 1000 },
];

const streamBreakdown = [
  { name: 'Transaction Fees', value: 38, fill: 'hsl(var(--primary))' },
  { name: 'Listing Boosts', value: 26, fill: 'hsl(var(--chart-1))' },
  { name: 'Vendor Subs', value: 20, fill: 'hsl(var(--chart-2))' },
  { name: 'Investor Unlocks', value: 12, fill: 'hsl(var(--chart-3))' },
  { name: 'Data & API', value: 4, fill: 'hsl(var(--chart-4))' },
];

const weeklyVelocity = [
  { week: 'W1', revenue: 18.2 }, { week: 'W2', revenue: 22.4 }, { week: 'W3', revenue: 19.8 },
  { week: 'W4', revenue: 28.6 }, { week: 'W5', revenue: 24.2 }, { week: 'W6', revenue: 31.4 },
  { week: 'W7', revenue: 27.8 }, { week: 'W8', revenue: 35.2 }, { week: 'W9', revenue: 32.6 },
  { week: 'W10', revenue: 38.4 }, { week: 'W11', revenue: 34.8 }, { week: 'W12', revenue: 42.1 },
];

const RevenueTargetSection = () => (
  <motion.div {...fade(0)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10"><Target className="h-4 w-4 text-primary" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Revenue Target Tracking</h2>
            <p className="text-[10px] text-muted-foreground">Progress toward first $1M cumulative milestone</p>
          </div>
          <Badge className="ml-auto bg-chart-1/10 text-chart-1 border-chart-1/20 text-[9px] font-bold">89.2% Complete</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Big Progress */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Cumulative Revenue</p>
              <p className="text-3xl font-black text-foreground tabular-nums">Rp 892M</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Target</p>
              <p className="text-3xl font-black text-primary tabular-nums">Rp 1B</p>
            </div>
          </div>
          <Progress value={89.2} className="h-3 mb-1.5" />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>Gap: <span className="font-bold text-foreground">Rp 108M</span> remaining</span>
            <span>Est. achievement: <span className="font-bold text-chart-1">~3.2 weeks</span></span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={DollarSign} label="Monthly Revenue" value="Rp 130M" delta="+17% MoM" sub="Current run-rate" />
          <KPI icon={Activity} label="Weekly Velocity" value="Rp 42.1M" delta="+21%" sub="Last 7 days" />
          <KPI icon={TrendingUp} label="Revenue Growth" value="28.4%" delta="+5.2pp" sub="Month-over-month" />
          <KPI icon={Timer} label="Days to $1M" value="~22d" delta="-8d" sub="vs last projection" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Cumulative Revenue vs Target (M IDR)</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted)/0.15)" strokeWidth={1.5} strokeDasharray="4 4" name="Target" />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2.5} name="Actual Revenue" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Revenue Mix</p>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={streamBreakdown} cx="50%" cy="50%" innerRadius={32} outerRadius={55} dataKey="value" stroke="hsl(var(--background))" strokeWidth={2}>
                    {streamBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {streamBreakdown.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.fill }} />
                    <span className="text-[9px] text-foreground flex-1">{r.name}</span>
                    <span className="text-[9px] font-bold tabular-nums text-foreground">{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Velocity Sparkline */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Weekly Revenue Velocity (M IDR)</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={weeklyVelocity}>
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <Tooltip contentStyle={tt} />
              <Bar dataKey="revenue" fill="hsl(var(--chart-1)/0.6)" radius={[4, 4, 0, 0]} name="Revenue (M)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — LISTING BOOST SALES ACCELERATOR
   ══════════════════════════════════════════════════════════════ */
const boostByCity = [
  { city: 'Jakarta', sold: 42, target: 50, revenue: 63, conv: 8.4 },
  { city: 'Bali', sold: 28, target: 35, revenue: 42, conv: 7.2 },
  { city: 'Bandung', sold: 18, target: 25, revenue: 27, conv: 6.8 },
  { city: 'Surabaya', sold: 14, target: 20, revenue: 21, conv: 5.9 },
  { city: 'Yogyakarta', sold: 8, target: 15, revenue: 12, conv: 5.1 },
];

const boostTrend = [
  { day: 'Mon', standard: 12, premium: 6, elite: 2 },
  { day: 'Tue', standard: 15, premium: 8, elite: 3 },
  { day: 'Wed', standard: 10, premium: 5, elite: 1 },
  { day: 'Thu', standard: 18, premium: 9, elite: 4 },
  { day: 'Fri', standard: 22, premium: 12, elite: 5 },
  { day: 'Sat', standard: 14, premium: 7, elite: 3 },
  { day: 'Sun', standard: 8, premium: 4, elite: 1 },
];

const BoostSection = () => {
  const [scarcityMode, setScarcityMode] = useState(false);
  return (
    <motion.div {...fade(1)}>
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-chart-1/10"><Rocket className="h-4 w-4 text-chart-1" /></div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Listing Boost Sales Accelerator</h2>
              <p className="text-[10px] text-muted-foreground">Daily boost sales operations & conversion optimization</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI icon={Rocket} label="Boosts Sold Today" value="110" delta="+14%" sub="Target: 145" />
            <KPI icon={DollarSign} label="Boost Revenue" value="Rp 165M" delta="+22%" sub="This month" />
            <KPI icon={Target} label="Conversion Rate" value="6.8%" delta="+0.9pp" sub="View → Purchase" />
            <KPI icon={Crown} label="Elite Tier Share" value="18%" delta="+4pp" sub="Highest margin" />
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* By City */}
            <div className="col-span-12 md:col-span-5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Performance by City</p>
              <div className="space-y-2">
                {boostByCity.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-muted/10 border border-border/20">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-foreground">{c.city}</span>
                      </div>
                      <span className="text-[9px] font-bold tabular-nums text-chart-1">Rp {c.revenue}M</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(c.sold / c.target) * 100} className="h-1.5 flex-1" />
                      <span className="text-[9px] tabular-nums text-muted-foreground">{c.sold}/{c.target}</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-0.5">Conv: {c.conv}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend Chart */}
            <div className="col-span-12 md:col-span-7">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Daily Boost Sales by Tier</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={boostTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} />
                  <Bar dataKey="standard" stackId="a" fill="hsl(var(--chart-2)/0.5)" name="Standard" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="premium" stackId="a" fill="hsl(var(--chart-1)/0.6)" name="Premium" />
                  <Bar dataKey="elite" stackId="a" fill="hsl(var(--primary)/0.8)" name="Elite" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-3 p-3 rounded-xl bg-chart-1/5 border border-chart-1/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 text-chart-1" />
                    <span className="text-[10px] font-bold text-foreground">Scarcity Promotion Mode</span>
                  </div>
                  <Switch checked={scarcityMode} onCheckedChange={setScarcityMode} />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Show "Only X slots left" badges on listings — avg +32% boost conversion</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — VENDOR SUBSCRIPTION GROWTH
   ══════════════════════════════════════════════════════════════ */
const vendorFunnel = [
  { stage: 'Free Vendors', count: 672, pct: 100 },
  { stage: 'Viewed Plans', count: 284, pct: 42 },
  { stage: 'Started Trial', count: 148, pct: 22 },
  { stage: 'Converted Paid', count: 86, pct: 13 },
  { stage: 'Retained 3mo+', count: 62, pct: 9 },
];

const subGrowth = [
  { month: 'Jul', active: 8, mrr: 4 }, { month: 'Aug', active: 18, mrr: 9 },
  { month: 'Sep', active: 32, mrr: 19 }, { month: 'Oct', active: 48, mrr: 32 },
  { month: 'Nov', active: 62, mrr: 45 }, { month: 'Dec', active: 72, mrr: 56 },
  { month: 'Jan', active: 78, mrr: 64 }, { month: 'Feb', active: 82, mrr: 72 },
  { month: 'Mar', active: 86, mrr: 78 },
];

const churnRisks = [
  { vendor: 'PT Mitra Bangunan', risk: 'high', reason: 'No logins 14d, subscription renews in 5d', ltv: 4.8 },
  { vendor: 'Jaya Interior Design', risk: 'medium', reason: '60% drop in lead engagement', ltv: 3.2 },
  { vendor: 'Surya Property Services', risk: 'medium', reason: 'Downgrade intent detected', ltv: 5.6 },
];

const VendorSubSection = () => (
  <motion.div {...fade(2)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-2/10"><Users className="h-4 w-4 text-chart-2" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Vendor Subscription Growth</h2>
            <p className="text-[10px] text-muted-foreground">Subscription funnel, churn prevention & LTV optimization</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Crown} label="Premium Vendors" value="86" delta="+5 this week" sub="13% of total" />
          <KPI icon={DollarSign} label="Subscription MRR" value="Rp 78M" delta="+8% MoM" sub="Recurring" />
          <KPI icon={Target} label="Upgrade Conv." value="13.2%" delta="+2.1pp" sub="Free → Paid" />
          <KPI icon={Timer} label="Avg LTV" value="Rp 4.2M" delta="+18%" sub="Per vendor" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Upgrade Funnel */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Upgrade Funnel</p>
            <div className="space-y-1.5">
              {vendorFunnel.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px] font-semibold text-foreground">{s.stage}</span>
                      <span className="text-[9px] tabular-nums text-muted-foreground">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-chart-2/60"
                        initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }} />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold tabular-nums text-chart-2 w-8 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* MRR Growth */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Subscription MRR Growth (M IDR)</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={subGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="mrr" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.12)" strokeWidth={2} name="MRR (M IDR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Risks */}
        <div>
          <p className="text-[10px] font-semibold text-destructive uppercase tracking-widest mb-2">⚠ Churn Risk Alerts</p>
          <div className="space-y-1.5">
            {churnRisks.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-destructive/5 border border-destructive/15">
                <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${v.risk === 'high' ? 'text-destructive' : 'text-chart-3'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-foreground truncate">{v.vendor}</p>
                  <p className="text-[9px] text-muted-foreground">{v.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 mb-0.5 ${v.risk === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-chart-3/10 text-chart-3'}`}>{v.risk}</Badge>
                  <p className="text-[8px] text-muted-foreground">LTV Rp {v.ltv}M</p>
                </div>
                <Button size="sm" variant="outline" className="h-6 text-[8px] px-2 shrink-0">Retain</Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — INVESTOR UNLOCK REVENUE DRIVER
   ══════════════════════════════════════════════════════════════ */
const unlockTrend = [
  { week: 'W1', unlocks: 34, revenue: 5.1 }, { week: 'W2', unlocks: 42, revenue: 6.3 },
  { week: 'W3', unlocks: 38, revenue: 5.7 }, { week: 'W4', unlocks: 56, revenue: 8.4 },
  { week: 'W5', unlocks: 48, revenue: 7.2 }, { week: 'W6', unlocks: 62, revenue: 9.3 },
  { week: 'W7', unlocks: 54, revenue: 8.1 }, { week: 'W8', unlocks: 72, revenue: 10.8 },
];

const investorSegments = [
  { segment: 'Yield Hunters', count: 342, unlockRate: 18, avgSpend: 'Rp 240K', intent: 92 },
  { segment: 'Capital Growth', count: 486, unlockRate: 14, avgSpend: 'Rp 185K', intent: 78 },
  { segment: 'Luxury Buyers', count: 128, unlockRate: 22, avgSpend: 'Rp 520K', intent: 85 },
  { segment: 'Institutional', count: 64, unlockRate: 38, avgSpend: 'Rp 2.4M', intent: 96 },
];

const InvestorUnlockSection = () => {
  const [exclusiveCampaign, setExclusiveCampaign] = useState(false);
  return (
    <motion.div {...fade(3)}>
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-chart-3/10"><Eye className="h-4 w-4 text-chart-3" /></div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Investor Unlock Revenue</h2>
              <p className="text-[10px] text-muted-foreground">Deal unlock monetization, urgency scoring & segment intelligence</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI icon={Eye} label="Unlocks This Month" value="482" delta="+24%" sub="Paid deal reveals" />
            <KPI icon={DollarSign} label="Unlock Revenue" value="Rp 72.3M" delta="+28%" sub="Growing stream" />
            <KPI icon={Target} label="Avg Unlock Value" value="Rp 150K" delta="+12%" sub="Per transaction" />
            <KPI icon={Sparkles} label="Conversion to Deal" value="8.6%" delta="+1.4pp" sub="Unlock → closed" />
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Weekly Unlock Volume & Revenue (M IDR)</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={unlockTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                  <Tooltip contentStyle={tt} />
                  <Bar yAxisId="left" dataKey="unlocks" fill="hsl(var(--chart-3)/0.4)" name="Unlocks" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Revenue (M)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-12 md:col-span-5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Monetization Segments</p>
              <div className="space-y-2">
                {investorSegments.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-muted/10 border border-border/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-foreground">{s.segment}</span>
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-chart-3/20 text-chart-3">{s.unlockRate}% rate</Badge>
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>{s.count} investors</span>
                      <span>Avg: {s.avgSpend}</span>
                      <span>Intent: <span className="font-bold text-foreground">{s.intent}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-chart-3/5 border border-chart-3/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 text-chart-3" />
                    <span className="text-[10px] font-bold text-foreground">Exclusive Deal Campaign</span>
                  </div>
                  <Switch checked={exclusiveCampaign} onCheckedChange={setExclusiveCampaign} />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Release 12 exclusive properties — avg +45% unlock rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — REVENUE MOMENTUM ALERTS
   ══════════════════════════════════════════════════════════════ */
const alerts = [
  { type: 'opportunity', icon: Sparkles, title: 'Demand Spike in Bali — Premium Zone', desc: 'Investor searches up 42% in Seminyak. Activate boost pricing surge for +Rp 8M potential.', time: '2m ago', color: 'chart-1' },
  { type: 'warning', icon: AlertTriangle, title: 'Revenue Slowdown — Bandung Boosts', desc: 'Boost sales down 18% vs last week. Consider flash discount or scarcity trigger.', time: '15m ago', color: 'chart-3' },
  { type: 'opportunity', icon: Crown, title: 'Vendor Upgrade Surge Signal', desc: '8 vendors hit performance threshold — auto-send upgrade prompt for +Rp 6M MRR.', time: '32m ago', color: 'chart-2' },
  { type: 'critical', icon: Flame, title: 'High-Value Investor Cluster Active', desc: '12 institutional investors browsing Jakarta luxury. Trigger exclusive deal notification.', time: '48m ago', color: 'primary' },
  { type: 'info', icon: TrendingUp, title: 'Weekly Velocity Above Target', desc: 'Revenue velocity Rp 42.1M — 8% above plan. Maintain momentum with weekend campaign.', time: '1h ago', color: 'chart-1' },
];

const MomentumAlerts = () => (
  <motion.div {...fade(4)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-destructive/10"><Bell className="h-4 w-4 text-destructive" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Revenue Momentum Alerts</h2>
            <p className="text-[10px] text-muted-foreground">Real-time monetization signals & intervention triggers</p>
          </div>
          <Badge className="ml-auto bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-bold animate-pulse">5 Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={`flex items-start gap-3 p-3 rounded-xl bg-${a.color}/5 border border-${a.color}/15`}
                style={{ background: `hsl(var(--${a.color})/0.04)`, borderColor: `hsl(var(--${a.color})/0.12)` }}>
                <div className="p-1.5 rounded-lg shrink-0" style={{ background: `hsl(var(--${a.color})/0.1)` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: `hsl(var(--${a.color}))` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[10px] font-bold text-foreground">{a.title}</p>
                    <span className="text-[8px] text-muted-foreground shrink-0">{a.time}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{a.desc}</p>
                </div>
                <Button size="sm" variant="outline" className="h-6 text-[8px] px-2 shrink-0">Act</Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 6 — FOUNDER ACTION COMMAND PANEL
   ══════════════════════════════════════════════════════════════ */
const founderActions = [
  { icon: Zap, label: 'Launch Flash Campaign', desc: '48h revenue sprint — activate all boost discounts 20% + urgency banners', impact: '+Rp 15-25M', risk: 'Low', color: 'primary' },
  { icon: TrendingUp, label: 'Increase Boost Pricing', desc: 'Raise Standard → Rp 1.8M, Premium → Rp 3.5M (+15% across tiers)', impact: '+Rp 8-12M/mo', risk: 'Medium', color: 'chart-1' },
  { icon: Gift, label: 'Release Premium Inventory', desc: 'Unlock 24 exclusive properties for paid investor access', impact: '+Rp 18M unlocks', risk: 'Low', color: 'chart-3' },
  { icon: Send, label: 'Investor Urgency Blast', desc: 'Push notification to 1,480 investors — "3 deals closing in 48h"', impact: '+42% unlock rate', risk: 'Low', color: 'chart-2' },
  { icon: Crown, label: 'Vendor Upgrade Push', desc: 'Auto-send upgrade prompts to 28 qualifying free vendors', impact: '+Rp 5.6M MRR', risk: 'Low', color: 'primary' },
  { icon: Flame, label: 'Activate Surge Pricing', desc: 'Enable demand-based dynamic pricing in Jakarta & Bali zones', impact: '+22% rev/boost', risk: 'Medium', color: 'chart-1' },
];

const FounderActionPanel = () => {
  const [executing, setExecuting] = useState<string | null>(null);

  const handleExecute = (label: string) => {
    setExecuting(label);
    setTimeout(() => setExecuting(null), 2000);
  };

  return (
    <motion.div {...fade(5)}>
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10"><Play className="h-4 w-4 text-primary" /></div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Founder Action Command</h2>
              <p className="text-[10px] text-muted-foreground">One-click revenue acceleration — all actions executable within 3 clicks</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {founderActions.map((a, i) => {
              const Icon = a.icon;
              const isExecuting = executing === a.label;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-3.5 rounded-2xl bg-muted/10 border border-border/30 hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl shrink-0" style={{ background: `hsl(var(--${a.color})/0.1)` }}>
                      <Icon className="h-4 w-4" style={{ color: `hsl(var(--${a.color}))` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-foreground">{a.label}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{a.desc}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-chart-1/20 text-chart-1">{a.impact}</Badge>
                        <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-0 ${a.risk === 'Low' ? 'bg-chart-1/10 text-chart-1' : 'bg-chart-3/10 text-chart-3'}`}>{a.risk} risk</Badge>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleExecute(a.label)} disabled={isExecuting}
                      className="h-7 text-[9px] px-3 shrink-0">
                      {isExecuting ? <><CheckCircle className="h-3 w-3 mr-1" /> Done</> : <><Play className="h-3 w-3 mr-1" /> Execute</>}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const FirstMillionRevenueSystem: React.FC = () => {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-foreground uppercase">First $1M Revenue Execution System</h1>
          <p className="text-[10px] text-muted-foreground">Tactical monetization control center — aggressive early-stage revenue acceleration</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Progress</p>
            <p className="text-lg font-black text-chart-1 tabular-nums">89.2%</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">ETA</p>
            <p className="text-lg font-black text-primary tabular-nums">~22d</p>
          </div>
        </div>
      </div>

      <RevenueTargetSection />
      <BoostSection />
      <VendorSubSection />
      <InvestorUnlockSection />
      <MomentumAlerts />
      <FounderActionPanel />
    </div>
  );
};

export default FirstMillionRevenueSystem;
