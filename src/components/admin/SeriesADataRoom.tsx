import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, ArrowUpRight, Activity, Users, Target,
  BarChart3, Globe, Shield, Sparkles, Layers, Building2, MapPin,
  Zap, Crown, Eye, Brain, Database, LineChart, Gauge, CheckCircle,
  ArrowRight, Star,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart as RLineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};

const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.4 } });

/* ── Shared ── */
const SectionTitle = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
      <h2 className="text-sm font-black uppercase tracking-wide text-foreground">{title}</h2>
    </div>
    {sub && <p className="text-[10px] text-muted-foreground mt-1 ml-10">{sub}</p>}
  </div>
);

const KPI = ({ label, value, sub, delta, icon: Icon }: {
  label: string; value: string; sub?: string; delta?: string; icon: React.ElementType;
}) => (
  <div className="p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
      {delta && (
        <Badge variant="outline" className="text-[9px] h-5 px-2 border-chart-1/30 text-chart-1 font-bold gap-0.5">
          <ArrowUpRight className="h-3 w-3" />{delta}
        </Badge>
      )}
    </div>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
    <p className="text-2xl font-black tabular-nums text-foreground leading-none mt-1">{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — MARKET LIQUIDITY DOMINANCE
   ══════════════════════════════════════════════════════════════ */
const liquidityByCity = [
  { city: 'Jakarta', index: 82, inquiries: 1240, exclusive: 34 },
  { city: 'Bali', index: 76, inquiries: 890, exclusive: 41 },
  { city: 'Bandung', index: 68, inquiries: 420, exclusive: 28 },
  { city: 'Surabaya', index: 61, inquiries: 380, exclusive: 22 },
  { city: 'Yogyakarta', index: 54, inquiries: 190, exclusive: 18 },
];

const inquiryVelocity = [
  { month: 'Jul', velocity: 320 }, { month: 'Aug', velocity: 480 },
  { month: 'Sep', velocity: 720 }, { month: 'Oct', velocity: 1080 },
  { month: 'Nov', velocity: 1540 }, { month: 'Dec', velocity: 2180 },
  { month: 'Jan', velocity: 2940 }, { month: 'Feb', velocity: 3820 },
  { month: 'Mar', velocity: 4690 },
];

const supplyDemand = [
  { month: 'Jul', supply: 180, demand: 320 }, { month: 'Aug', supply: 340, demand: 480 },
  { month: 'Sep', supply: 520, demand: 720 }, { month: 'Oct', supply: 780, demand: 1080 },
  { month: 'Nov', supply: 1040, demand: 1540 }, { month: 'Dec', supply: 1380, demand: 2180 },
  { month: 'Jan', supply: 1780, demand: 2940 }, { month: 'Feb', supply: 2240, demand: 3420 },
  { month: 'Mar', supply: 2680, demand: 3860 },
];

const LiquiditySection = () => (
  <motion.div {...fade(0)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <SectionTitle icon={Activity} title="Market Liquidity Dominance" sub="Real-time marketplace velocity across 5 active cities" />
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Gauge} label="Avg Liquidity Index" value="68.2" delta="+24% QoQ" sub="Across 5 cities" />
          <KPI icon={Activity} label="Inquiry Velocity" value="4,690/mo" delta="+30% MoM" sub="Accelerating" />
          <KPI icon={Star} label="Exclusive Ratio" value="28.6%" delta="+8pp" sub="Platform-only listings" />
          <KPI icon={Layers} label="Days on Market" value="41d" delta="-12d" sub="vs 53d industry avg" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Liquidity by City */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">City Liquidity Index</p>
            <div className="space-y-2.5">
              {liquidityByCity.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-[11px] font-semibold text-foreground">{c.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tabular-nums text-muted-foreground">{c.inquiries} inquiries/mo</span>
                      <span className="text-[11px] font-black tabular-nums text-primary">{c.index}</span>
                    </div>
                  </div>
                  <Progress value={c.index} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry Velocity Curve */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Inquiry Velocity Growth (9-Month)</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={inquiryVelocity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="velocity" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2.5} name="Inquiries/Month" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supply-Demand Equilibrium */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Supply–Demand Equilibrium Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={supplyDemand}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={tt} />
              <Area type="monotone" dataKey="supply" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.1)" strokeWidth={2} name="Supply (Listings)" />
              <Area type="monotone" dataKey="demand" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.08)" strokeWidth={2} name="Demand (Inquiries)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — REVENUE TRACTION
   ══════════════════════════════════════════════════════════════ */
const mrrGrowth = [
  { month: 'Jul', mrr: 12 }, { month: 'Aug', mrr: 28 }, { month: 'Sep', mrr: 58 },
  { month: 'Oct', mrr: 124 }, { month: 'Nov', mrr: 248 }, { month: 'Dec', mrr: 420 },
  { month: 'Jan', mrr: 625 }, { month: 'Feb', mrr: 812 }, { month: 'Mar', mrr: 980 },
];

const revenueBreakdown = [
  { name: 'Transaction Fees', value: 42, fill: 'hsl(var(--primary))' },
  { name: 'Boost Revenue', value: 28, fill: 'hsl(var(--chart-1))' },
  { name: 'Vendor Subscriptions', value: 18, fill: 'hsl(var(--chart-2))' },
  { name: 'Investor SaaS', value: 8, fill: 'hsl(var(--chart-3))' },
  { name: 'Data & API', value: 4, fill: 'hsl(var(--chart-4))' },
];

const revenueTimeline = [
  { phase: 'City Launch', week: 'W0-2', revenue: 0, milestone: 'Seeding' },
  { phase: 'First Inquiry', week: 'W3', revenue: 0, milestone: 'Demand signal' },
  { phase: 'First Unlock', week: 'W4-5', revenue: 2.4, milestone: 'Revenue start' },
  { phase: 'First Commission', week: 'W6-8', revenue: 18, milestone: 'Transaction' },
  { phase: 'Break-even', week: 'W12-16', revenue: 85, milestone: 'Unit economics +' },
  { phase: 'Profitability', week: 'W20-24', revenue: 180, milestone: 'Scalable' },
];

const RevenueSection = () => (
  <motion.div {...fade(1)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <SectionTitle icon={DollarSign} title="Revenue Traction" sub="9-month revenue trajectory demonstrating strong unit economics" />
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={DollarSign} label="Monthly Revenue" value="Rp 980M" delta="+21% MoM" sub="$62K USD equivalent" />
          <KPI icon={TrendingUp} label="ARR Run-Rate" value="Rp 11.7B" delta="+82x" sub="vs 9 months ago" />
          <KPI icon={Target} label="Take Rate" value="1.15%" delta="+0.3pp" sub="Platform revenue / GMV" />
          <KPI icon={BarChart3} label="Rev / Active User" value="Rp 312K" delta="+18%" sub="Monetization efficiency" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* MRR Growth */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Monthly Revenue Growth (M IDR)</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mrrGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="mrr" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.15)" strokeWidth={2.5} name="Revenue (M IDR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Mix */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Revenue Diversification</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" stroke="hsl(var(--background))" strokeWidth={2}>
                    {revenueBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {revenueBreakdown.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.fill }} />
                    <span className="text-[10px] text-foreground flex-1">{r.name}</span>
                    <span className="text-[10px] font-bold tabular-nums text-foreground">{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Emergence */}
        <div className="p-3 rounded-2xl bg-chart-1/5 border border-chart-1/15">
          <p className="text-[10px] font-semibold text-chart-1 uppercase tracking-widest mb-2">Revenue Emergence — City Launch Playbook</p>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {revenueTimeline.map((s, i) => {
              const reached = i < 4;
              return (
                <React.Fragment key={i}>
                  <div className={`flex-1 min-w-[80px] text-center p-2 rounded-xl ${reached ? 'bg-chart-1/10' : 'bg-muted/15'}`}>
                    <div className={`mx-auto w-5 h-5 rounded-full flex items-center justify-center mb-1 ${reached ? 'bg-chart-1 text-white' : 'bg-muted/40 text-muted-foreground'}`}>
                      {reached ? <CheckCircle className="h-3 w-3" /> : <span className="text-[8px] font-bold">{i + 1}</span>}
                    </div>
                    <p className={`text-[9px] font-bold leading-tight ${reached ? 'text-chart-1' : 'text-muted-foreground'}`}>{s.phase}</p>
                    <p className="text-[8px] text-muted-foreground">{s.week}</p>
                    {s.revenue > 0 && <p className="text-[9px] font-black text-foreground mt-0.5">Rp {s.revenue}M</p>}
                  </div>
                  {i < revenueTimeline.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — NETWORK EFFECT METRICS
   ══════════════════════════════════════════════════════════════ */
const networkGrowth = [
  { month: 'Jul', vendors: 28, investors: 45, listings: 180 },
  { month: 'Aug', vendors: 64, investors: 112, listings: 340 },
  { month: 'Sep', vendors: 112, investors: 198, listings: 520 },
  { month: 'Oct', vendors: 178, investors: 312, listings: 780 },
  { month: 'Nov', vendors: 256, investors: 487, listings: 1040 },
  { month: 'Dec', vendors: 348, investors: 692, listings: 1380 },
  { month: 'Jan', vendors: 448, investors: 924, listings: 1780 },
  { month: 'Feb', vendors: 556, investors: 1180, listings: 2240 },
  { month: 'Mar', vendors: 672, investors: 1480, listings: 2680 },
];

const defensibility = [
  { metric: 'Data Volume', value: 88, full: 100 },
  { metric: 'Network Density', value: 76, full: 100 },
  { metric: 'Switching Cost', value: 82, full: 100 },
  { metric: 'AI Accuracy', value: 91, full: 100 },
  { metric: 'Brand Trust', value: 68, full: 100 },
  { metric: 'Integration Depth', value: 72, full: 100 },
];

const NetworkSection = () => (
  <motion.div {...fade(2)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <SectionTitle icon={Globe} title="Marketplace Network Effects" sub="Compounding supply-demand flywheel with defensible moats" />
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Users} label="Active Investors" value="1,480" delta="+25% MoM" sub="Growing demand side" />
          <KPI icon={Building2} label="Active Vendors" value="672" delta="+21% MoM" sub="Supply side" />
          <KPI icon={Layers} label="Live Listings" value="2,680" delta="+20% MoM" sub="Inventory depth" />
          <KPI icon={TrendingUp} label="Repeat Usage" value="3.4x/mo" delta="+0.8x" sub="Avg sessions per user" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Network Growth Correlation */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Supply ↔ Demand Growth Correlation</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={networkGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="investors" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} name="Investors" />
                <Area type="monotone" dataKey="vendors" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.1)" strokeWidth={2} name="Vendors" />
                <Area type="monotone" dataKey="listings" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.08)" strokeWidth={1.5} name="Listings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Defensibility Radar */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Marketplace Defensibility</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={defensibility} outerRadius="72%">
                <PolarGrid className="stroke-border" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <PolarRadiusAxis tick={false} domain={[0, 100]} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — AI INTELLIGENCE MOAT
   ══════════════════════════════════════════════════════════════ */
const aiAccuracy = [
  { month: 'Jul', accuracy: 62, signals: 12000 },
  { month: 'Aug', accuracy: 68, signals: 28000 },
  { month: 'Sep', accuracy: 74, signals: 56000 },
  { month: 'Oct', accuracy: 79, signals: 98000 },
  { month: 'Nov', accuracy: 83, signals: 164000 },
  { month: 'Dec', accuracy: 86, signals: 248000 },
  { month: 'Jan', accuracy: 89, signals: 380000 },
  { month: 'Feb', accuracy: 91, signals: 520000 },
  { month: 'Mar', accuracy: 93, signals: 680000 },
];

const aiModules = [
  { module: 'Price Prediction', accuracy: 93, improvement: '+31pp', signals: '680K', moat: 'Very Strong' },
  { module: 'Deal Routing', accuracy: 88, improvement: '+22pp', signals: '420K', moat: 'Strong' },
  { module: 'Liquidity Scoring', accuracy: 91, improvement: '+28pp', signals: '580K', moat: 'Very Strong' },
  { module: 'Investor Matching', accuracy: 86, improvement: '+24pp', signals: '340K', moat: 'Strong' },
  { module: 'Demand Forecasting', accuracy: 84, improvement: '+19pp', signals: '290K', moat: 'Building' },
];

const AISection = () => (
  <motion.div {...fade(3)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <SectionTitle icon={Brain} title="AI Intelligence Moat" sub="Proprietary data flywheel creating compounding competitive advantage" />
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Database} label="Behavioral Signals" value="680K" delta="+31% MoM" sub="Processed this month" />
          <KPI icon={Brain} label="Prediction Accuracy" value="93%" delta="+31pp" sub="From 62% at launch" />
          <KPI icon={Zap} label="Routing Efficiency" value="88%" delta="+22pp" sub="Deal → right vendor" />
          <KPI icon={Eye} label="Liquidity Detection" value="2.4h" delta="-18h" sub="Opportunity window" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Accuracy Improvement */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">AI Accuracy & Data Volume Growth</p>
            <ResponsiveContainer width="100%" height={200}>
              <RLineChart data={aiAccuracy}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="left" domain={[50, 100]} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Accuracy %" />
                <Area yAxisId="right" type="monotone" dataKey="signals" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.1)" strokeWidth={1.5} name="Signals Processed" />
              </RLineChart>
            </ResponsiveContainer>
          </div>

          {/* Module Breakdown */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">AI Module Performance</p>
            <div className="space-y-2">
              {aiModules.map((m, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-muted/10 border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-foreground">{m.module}</span>
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-chart-1/20 text-chart-1">{m.improvement}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={m.accuracy} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-black tabular-nums text-primary">{m.accuracy}%</span>
                  </div>
                  <div className="flex justify-between mt-1 text-[8px] text-muted-foreground">
                    <span>{m.signals} signals</span>
                    <span className="font-semibold text-foreground">{m.moat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — EXPANSION SCALABILITY MODEL
   ══════════════════════════════════════════════════════════════ */
const cityTimeline = [
  { city: 'Jakarta', launch: 'Jul 2025', weeks: 0, status: 'scaling', revenue: 288 },
  { city: 'Bali', launch: 'Sep 2025', weeks: 8, status: 'scaling', revenue: 167 },
  { city: 'Bandung', launch: 'Nov 2025', weeks: 16, status: 'active', revenue: 80 },
  { city: 'Surabaya', launch: 'Jan 2026', weeks: 24, status: 'active', revenue: 64 },
  { city: 'Yogyakarta', launch: 'Feb 2026', weeks: 28, status: 'seeding', revenue: 26 },
  { city: 'Semarang', launch: 'Q2 2026', weeks: 40, status: 'planned', revenue: 0 },
  { city: 'Makassar', launch: 'Q3 2026', weeks: 48, status: 'planned', revenue: 0 },
  { city: 'Medan', launch: 'Q3 2026', weeks: 52, status: 'planned', revenue: 0 },
];

const revenueScenarios = [
  { month: 'M12', base: 1.2, bull: 1.8, bear: 0.8 },
  { month: 'M18', base: 3.4, bull: 5.2, bear: 2.1 },
  { month: 'M24', base: 8.2, bull: 14.6, bear: 4.8 },
  { month: 'M30', base: 16.4, bull: 28.2, bear: 9.6 },
  { month: 'M36', base: 32.8, bull: 52.4, bear: 18.4 },
];

const capitalEfficiency = [
  { city: 'Jakarta', invested: 1.2, revenue: 3.5, roi: 192 },
  { city: 'Bali', invested: 0.8, revenue: 2.0, roi: 150 },
  { city: 'Bandung', invested: 0.5, revenue: 1.0, roi: 100 },
  { city: 'Surabaya', invested: 0.6, revenue: 0.8, roi: 33 },
];

const ExpansionSection = () => (
  <motion.div {...fade(4)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <SectionTitle icon={Globe} title="Expansion Scalability Model" sub="Repeatable city-launch playbook with improving capital efficiency" />
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Globe} label="Cities Active" value="5" delta="+3 planned" sub="8 total pipeline" />
          <KPI icon={DollarSign} label="Avg CAC/City" value="Rp 800M" delta="-15%" sub="Improving efficiency" />
          <KPI icon={Target} label="Time to Break-even" value="16 wks" delta="-4 wks" sub="Per city launch" />
          <KPI icon={TrendingUp} label="36-Mo Revenue" value="$2.1M" delta="Base case" sub="ARR projection" />
        </div>

        {/* City Launch Timeline */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">City Launch Replication Timeline</p>
          <div className="space-y-1.5">
            {cityTimeline.map((c, i) => {
              const statusColors: Record<string, string> = {
                scaling: 'bg-chart-1 text-white', active: 'bg-primary text-white',
                seeding: 'bg-chart-3 text-white', planned: 'bg-muted text-muted-foreground',
              };
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-2 rounded-xl bg-muted/10 border border-border/20">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-bold text-foreground w-20">{c.city}</span>
                  <span className="text-[9px] text-muted-foreground w-16">{c.launch}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
                    <motion.div className={`h-full rounded-full ${c.status === 'scaling' ? 'bg-chart-1' : c.status === 'active' ? 'bg-primary' : c.status === 'seeding' ? 'bg-chart-3' : 'bg-muted/40'}`}
                      initial={{ width: 0 }} animate={{ width: c.status === 'planned' ? '0%' : c.status === 'seeding' ? '30%' : c.status === 'active' ? '65%' : '90%' }}
                      transition={{ duration: 0.8, delay: i * 0.08 }} />
                  </div>
                  <Badge className={`text-[7px] h-4 px-1.5 border-0 ${statusColors[c.status]}`}>{c.status}</Badge>
                  {c.revenue > 0 && <span className="text-[10px] font-bold tabular-nums text-chart-1 w-14 text-right">Rp {c.revenue}M</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Revenue Scenarios */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">36-Month Revenue Scaling Scenarios (B IDR)</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueScenarios}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="bull" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.08)" strokeWidth={1.5} strokeDasharray="4 4" name="Bull Case" />
                <Area type="monotone" dataKey="base" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2.5} name="Base Case" />
                <Area type="monotone" dataKey="bear" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.08)" strokeWidth={1.5} strokeDasharray="4 4" name="Bear Case" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Capital Efficiency */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Capital Efficiency per City (B IDR)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={capitalEfficiency}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="city" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="invested" fill="hsl(var(--chart-3)/0.5)" name="Invested (B)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1)/0.7)" name="Revenue (B)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN — SERIES-A INVESTOR DATA ROOM
   ══════════════════════════════════════════════════════════════ */
const SeriesADataRoom: React.FC = () => {
  const navItems = [
    { key: 'liquidity', label: 'Liquidity', icon: Activity },
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
    { key: 'network', label: 'Network Effects', icon: Globe },
    { key: 'ai', label: 'AI Moat', icon: Brain },
    { key: 'expansion', label: 'Expansion', icon: MapPin },
  ];

  const scrollTo = (key: string) => {
    document.getElementById(`dataroom-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-12 z-20 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="p-2 rounded-xl bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-foreground">SERIES-A INVESTOR DATA ROOM</h1>
            <p className="text-[10px] text-muted-foreground">ASTRA PropTech · Confidential · March 2026</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Valuation Target</p>
              <p className="text-sm font-black text-primary">$25-40M</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Raise</p>
              <p className="text-sm font-black text-foreground">$3-5M</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {navItems.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.key} onClick={() => scrollTo(n.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                <Icon className="h-3.5 w-3.5" />{n.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero KPI Strip */}
      <motion.div {...fade(0)} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI icon={DollarSign} label="Monthly GMV" value="Rp 85B" delta="+28% MoM" />
        <KPI icon={Activity} label="Deals / Month" value="48" delta="+18%" />
        <KPI icon={TrendingUp} label="Monthly Revenue" value="Rp 980M" delta="+21% MoM" />
        <KPI icon={Target} label="Deal Conversion" value="6.4%" delta="+1.2pp" />
        <KPI icon={Globe} label="Active Cities" value="5" delta="+3 pipeline" />
      </motion.div>

      {/* Sections */}
      <div id="dataroom-liquidity"><LiquiditySection /></div>
      <div id="dataroom-revenue"><RevenueSection /></div>
      <div id="dataroom-network"><NetworkSection /></div>
      <div id="dataroom-ai"><AISection /></div>
      <div id="dataroom-expansion"><ExpansionSection /></div>
    </div>
  );
};

export default SeriesADataRoom;
