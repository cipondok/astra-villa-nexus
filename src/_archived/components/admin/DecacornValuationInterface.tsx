import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, ArrowUpRight, Activity, Users, Target,
  Globe, Shield, Sparkles, Layers, Building2, MapPin, Brain, Database,
  Gauge, Crown, Eye, Zap, BarChart3, Star, Lock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};

const fade = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4 },
});

/* ── Shared Components ── */
const Metric = ({ label, value, delta, sub, icon: Icon }: {
  label: string; value: string; delta?: string; sub?: string; icon: React.ElementType;
}) => (
  <div className="p-4 rounded-[20px] bg-card/60 border border-border/40 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
      {delta && (
        <Badge variant="outline" className="text-[8px] h-4 px-1.5 gap-0.5 font-bold bg-chart-1/10 text-chart-1 border-0">
          <ArrowUpRight className="h-2.5 w-2.5" />{delta}
        </Badge>
      )}
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
    <p className="text-2xl font-black tabular-nums text-foreground leading-none mt-1">{value}</p>
    {sub && <p className="text-[9px] text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const SectionHead = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) => (
  <div className="flex items-center gap-2 mb-1">
    <div className="p-2 rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
    <div>
      <h2 className="text-sm font-black uppercase tracking-wide text-foreground">{title}</h2>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — MARKET DOMINANCE SIGNAL PANEL
   ══════════════════════════════════════════════════════════════ */
const liquidityLeadership = [
  { city: 'Jakarta', astra: 82, competitor1: 41, competitor2: 28 },
  { city: 'Bali', astra: 76, competitor1: 38, competitor2: 32 },
  { city: 'Bandung', astra: 68, competitor1: 35, competitor2: 24 },
  { city: 'Surabaya', astra: 61, competitor1: 42, competitor2: 18 },
  { city: 'Yogyakarta', astra: 54, competitor1: 28, competitor2: 15 },
];

const dominanceMetrics = [
  { metric: 'Liquidity Index', value: 88 },
  { metric: 'Deal Velocity', value: 82 },
  { metric: 'Inventory Depth', value: 76 },
  { metric: 'Pricing Power', value: 71 },
  { metric: 'Network Density', value: 84 },
  { metric: 'Brand Authority', value: 68 },
];

const captureEfficiency = [
  { month: 'Jul', capture: 12, exclusive: 8 },
  { month: 'Aug', capture: 18, exclusive: 14 },
  { month: 'Sep', capture: 28, exclusive: 21 },
  { month: 'Oct', capture: 38, exclusive: 29 },
  { month: 'Nov', capture: 46, exclusive: 36 },
  { month: 'Dec', capture: 54, exclusive: 42 },
  { month: 'Jan', capture: 61, exclusive: 48 },
  { month: 'Feb', capture: 68, exclusive: 54 },
  { month: 'Mar', capture: 74, exclusive: 61 },
];

const MarketDominance = () => (
  <motion.div {...fade(0)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-5 pb-3 border-b border-border/20">
        <SectionHead icon={Crown} title="Market Dominance Signals" sub="Real-time competitive positioning & liquidity leadership across active markets" />
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={Gauge} label="Dominance Index" value="74.2" delta="+18pp YTD" sub="Weighted market share" />
          <Metric icon={Lock} label="Exclusive Rate" value="28.6%" delta="+12pp" sub="Platform-only inventory" />
          <Metric icon={Target} label="Demand Capture" value="61.4%" delta="+8pp QoQ" sub="vs competitor avg 22%" />
          <Metric icon={Activity} label="Velocity Lead" value="2.4x" delta="+0.6x" sub="Faster than #2 platform" />
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Liquidity Leadership */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Liquidity Index Leadership by City</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={liquidityLeadership} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="city" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="astra" fill="hsl(var(--primary))" name="ASTRA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="competitor1" fill="hsl(var(--muted-foreground)/0.25)" name="Competitor A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="competitor2" fill="hsl(var(--muted-foreground)/0.12)" name="Competitor B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dominance Radar */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Competitive Positioning</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={dominanceMetrics} outerRadius="72%">
                <PolarGrid className="stroke-border" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--foreground))', fontSize: 8 }} />
                <PolarRadiusAxis tick={false} domain={[0, 100]} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.18)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capture Efficiency */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Demand Capture & Exclusive Penetration (% of Market)</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={captureEfficiency}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={tt} />
              <Area type="monotone" dataKey="capture" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2.5} name="Demand Capture %" />
              <Area type="monotone" dataKey="exclusive" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.08)" strokeWidth={2} name="Exclusive Inventory %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — INTELLIGENCE MOAT VISUALIZATION
   ══════════════════════════════════════════════════════════════ */
const dataVolume = [
  { month: 'Jul', signals: 12, accuracy: 62 }, { month: 'Aug', signals: 28, accuracy: 68 },
  { month: 'Sep', signals: 56, accuracy: 74 }, { month: 'Oct', signals: 98, accuracy: 79 },
  { month: 'Nov', signals: 164, accuracy: 83 }, { month: 'Dec', signals: 248, accuracy: 86 },
  { month: 'Jan', signals: 380, accuracy: 89 }, { month: 'Feb', signals: 520, accuracy: 91 },
  { month: 'Mar', signals: 680, accuracy: 93 },
];

const moatLayers = [
  { layer: 'Behavioral Data', depth: 93, replication: '24+ months', proprietary: true },
  { layer: 'Price Prediction', depth: 91, replication: '18+ months', proprietary: true },
  { layer: 'Liquidity Scoring', depth: 88, replication: '20+ months', proprietary: true },
  { layer: 'Deal Routing AI', depth: 86, replication: '15+ months', proprietary: true },
  { layer: 'Demand Forecasting', depth: 84, replication: '12+ months', proprietary: true },
  { layer: 'Investor Matching', depth: 82, replication: '14+ months', proprietary: true },
];

const routingEfficiency = [
  { month: 'Jul', efficiency: 42, matchRate: 28 }, { month: 'Aug', efficiency: 48, matchRate: 34 },
  { month: 'Sep', efficiency: 56, matchRate: 42 }, { month: 'Oct', efficiency: 64, matchRate: 51 },
  { month: 'Nov', efficiency: 72, matchRate: 58 }, { month: 'Dec', efficiency: 78, matchRate: 64 },
  { month: 'Jan', efficiency: 82, matchRate: 71 }, { month: 'Feb', efficiency: 86, matchRate: 76 },
  { month: 'Mar', efficiency: 88, matchRate: 82 },
];

const IntelligenceMoat = () => (
  <motion.div {...fade(1)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-5 pb-3 border-b border-border/20">
        <SectionHead icon={Brain} title="Intelligence Moat" sub="Proprietary data flywheel — compounding AI advantage unreplicable by competitors" />
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={Database} label="Data Signals" value="680K" delta="+31% MoM" sub="Behavioral events/month" />
          <Metric icon={Brain} label="AI Accuracy" value="93%" delta="+31pp" sub="From 62% at launch" />
          <Metric icon={Zap} label="Routing Speed" value="88%" delta="+46pp" sub="Optimal deal matching" />
          <Metric icon={Shield} label="Replication Gap" value="24mo+" delta="Widening" sub="Competitor catch-up time" />
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Data Volume & Accuracy */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Data Volume (K) × AI Accuracy (%)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dataVolume}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[50, 100]} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area yAxisId="left" type="monotone" dataKey="signals" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.1)" strokeWidth={1.5} name="Signals (K)" />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Moat Depth Layers */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Moat Depth by AI Layer</p>
            <div className="space-y-2.5">
              {moatLayers.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-bold text-foreground">{m.layer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-muted-foreground">{m.replication}</span>
                      <span className="text-[10px] font-black tabular-nums text-primary">{m.depth}%</span>
                    </div>
                  </div>
                  <Progress value={m.depth} className="h-1.5" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Routing Efficiency */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Deal Routing Efficiency & Investor Match Rate (%)</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={routingEfficiency}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={tt} />
              <Area type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2.5} name="Routing Efficiency %" />
              <Area type="monotone" dataKey="matchRate" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.08)" strokeWidth={2} name="Match Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — NETWORK EFFECT STRENGTH
   ══════════════════════════════════════════════════════════════ */
const flywheelData = [
  { month: 'Jul', vendors: 28, investors: 45, listings: 180, txns: 3 },
  { month: 'Aug', vendors: 64, investors: 112, listings: 340, txns: 8 },
  { month: 'Sep', vendors: 112, investors: 198, listings: 520, txns: 14 },
  { month: 'Oct', vendors: 178, investors: 312, listings: 780, txns: 22 },
  { month: 'Nov', vendors: 256, investors: 487, listings: 1040, txns: 32 },
  { month: 'Dec', vendors: 348, investors: 692, listings: 1380, txns: 38 },
  { month: 'Jan', vendors: 448, investors: 924, listings: 1780, txns: 44 },
  { month: 'Feb', vendors: 556, investors: 1180, listings: 2240, txns: 46 },
  { month: 'Mar', vendors: 672, investors: 1480, listings: 2680, txns: 48 },
];

const defensibility = [
  { metric: 'Data Volume', astra: 88, industry: 32 },
  { metric: 'Network Density', astra: 76, industry: 28 },
  { metric: 'Switching Cost', astra: 82, industry: 18 },
  { metric: 'AI Accuracy', astra: 93, industry: 45 },
  { metric: 'Brand Trust', astra: 68, industry: 35 },
  { metric: 'Integration Depth', astra: 72, industry: 22 },
];

const engagementLoop = [
  { cohort: 'Month 1', retention: 100, sessions: 2.1 },
  { cohort: 'Month 2', retention: 72, sessions: 2.8 },
  { cohort: 'Month 3', retention: 58, sessions: 3.2 },
  { cohort: 'Month 4', retention: 51, sessions: 3.6 },
  { cohort: 'Month 5', retention: 48, sessions: 3.4 },
  { cohort: 'Month 6', retention: 46, sessions: 3.8 },
  { cohort: 'Month 9', retention: 42, sessions: 4.1 },
  { cohort: 'Month 12', retention: 38, sessions: 4.6 },
];

const NetworkEffects = () => (
  <motion.div {...fade(2)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-5 pb-3 border-b border-border/20">
        <SectionHead icon={Globe} title="Network Effect Strength" sub="Compounding supply-demand flywheel creating winner-take-most dynamics" />
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={Users} label="Active Investors" value="1,480" delta="+25% MoM" sub="Demand side" />
          <Metric icon={Building2} label="Active Vendors" value="672" delta="+21% MoM" sub="Supply side" />
          <Metric icon={Layers} label="Live Listings" value="2,680" delta="+20% MoM" sub="Inventory depth" />
          <Metric icon={Star} label="Repeat Usage" value="3.4x/mo" delta="+0.8x" sub="Engagement loop" />
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Flywheel Growth */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Supply ↔ Demand Flywheel Acceleration</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={flywheelData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="investors" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} name="Investors" />
                <Area type="monotone" dataKey="vendors" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.08)" strokeWidth={2} name="Vendors" />
                <Area type="monotone" dataKey="listings" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.06)" strokeWidth={1.5} name="Listings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Defensibility vs Industry */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">ASTRA vs Industry Average</p>
            <div className="space-y-2.5">
              {defensibility.map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-foreground">{d.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground tabular-nums">Ind: {d.industry}</span>
                      <span className="text-[10px] font-black text-primary tabular-nums">{d.astra}</span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted/20 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-muted-foreground/15 rounded-full" style={{ width: `${d.industry}%` }} />
                    <motion.div className="absolute inset-y-0 left-0 bg-primary/60 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${d.astra}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retention & Engagement Loop */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Retention × Engagement Reinforcement Loop</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={engagementLoop}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="cohort" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
              <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={tt} />
              <Line yAxisId="left" type="monotone" dataKey="retention" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Retention %" />
              <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: 'hsl(var(--chart-1))', r: 3 }} name="Sessions/Month" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-[9px] text-muted-foreground">📈 Retention stabilizes at <span className="font-bold text-foreground">38-42%</span> while engagement <span className="font-bold text-chart-1">deepens to 4.6x/mo</span> — classic network effect signal</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — REVENUE SCALE TRAJECTORY
   ══════════════════════════════════════════════════════════════ */
const revenueScenarios = [
  { year: 'Y1', base: 0.74, bull: 1.2, bear: 0.48 },
  { year: 'Y2', base: 4.8, bull: 8.6, bear: 2.8 },
  { year: 'Y3', base: 18.2, bull: 32.4, bear: 10.6 },
  { year: 'Y4', base: 48.6, bull: 86.2, bear: 28.4 },
  { year: 'Y5', base: 112, bull: 198, bear: 64 },
];

const cityRevenue = [
  { city: 'Jakarta', y1: 288, y2: 1200, marginal: 180, roi: 240 },
  { city: 'Bali', y1: 167, y2: 820, marginal: 120, roi: 210 },
  { city: 'Bandung', y1: 80, y2: 480, marginal: 85, roi: 170 },
  { city: 'Surabaya', y1: 64, y2: 420, marginal: 90, roi: 150 },
  { city: 'Yogyakarta', y1: 26, y2: 280, marginal: 75, roi: 140 },
  { city: '+5 Cities', y1: 0, y2: 1600, marginal: 420, roi: 180 },
];

const marginEvolution = [
  { year: 'Y1', gross: 68, operating: -42, net: -48 },
  { year: 'Y2', gross: 72, operating: 8, net: 2 },
  { year: 'Y3', gross: 76, operating: 28, net: 18 },
  { year: 'Y4', gross: 78, operating: 38, net: 28 },
  { year: 'Y5', gross: 82, operating: 48, net: 36 },
];

const monetizationDepth = [
  { layer: 'Transaction Fees', y1: 38, y3: 32, y5: 28 },
  { layer: 'Vendor SaaS', y1: 20, y3: 24, y5: 26 },
  { layer: 'Investor Premium', y1: 12, y3: 18, y5: 22 },
  { layer: 'Listing Boosts', y1: 26, y3: 16, y5: 10 },
  { layer: 'Data & API', y1: 4, y3: 10, y5: 14 },
];

const RevenueTrajectory = () => (
  <motion.div {...fade(3)}>
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm rounded-[20px]">
      <CardHeader className="p-5 pb-3 border-b border-border/20">
        <SectionHead icon={TrendingUp} title="Revenue Scale Trajectory" sub="5-year path from early revenue to national-scale platform monetization" />
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={DollarSign} label="Y1 ARR" value="$47K" delta="Foundation" sub="Rp 740M" />
          <Metric icon={TrendingUp} label="Y3 ARR" value="$1.2M" delta="16x Y1" sub="Rp 18.2B" />
          <Metric icon={Globe} label="Y5 ARR" value="$7.1M" delta="152x Y1" sub="Rp 112B" />
          <Metric icon={Target} label="Y5 Margin" value="36%" delta="Net profit" sub="Platform economics" />
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Revenue Scenario Fan */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">5-Year Revenue Scenarios (B IDR)</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueScenarios}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="bull" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.06)" strokeWidth={1.5} strokeDasharray="4 4" name="Bull Case" />
                <Area type="monotone" dataKey="base" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2.5} name="Base Case" />
                <Area type="monotone" dataKey="bear" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.06)" strokeWidth={1.5} strokeDasharray="4 4" name="Bear Case" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Margin Evolution */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Margin Evolution (%)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={marginEvolution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} domain={[-60, 100]} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="gross" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="Gross Margin %" />
                <Line type="monotone" dataKey="operating" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Operating Margin %" />
                <Line type="monotone" dataKey="net" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Net Margin %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Revenue Expansion */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Revenue Expansion per City (M IDR)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {cityRevenue.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="p-3 rounded-[16px] bg-muted/10 border border-border/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold text-foreground">{c.city}</span>
                </div>
                <div className="space-y-1">
                  <div>
                    <p className="text-[8px] text-muted-foreground">Y1 Rev</p>
                    <p className="text-[11px] font-black tabular-nums text-foreground">Rp {c.y1}M</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-muted-foreground">Y2 Proj</p>
                    <p className="text-[11px] font-black tabular-nums text-chart-1">Rp {c.y2}M</p>
                  </div>
                  <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-chart-1/20 text-chart-1">{c.roi}% ROI</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Monetization Depth */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Monetization Depth — Revenue Mix Evolution (%)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monetizationDepth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="layer" tick={{ fill: 'hsl(var(--foreground))', fontSize: 8 }} angle={-15} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={tt} />
              <Bar dataKey="y1" fill="hsl(var(--muted-foreground)/0.2)" name="Year 1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="y3" fill="hsl(var(--chart-1)/0.5)" name="Year 3" radius={[3, 3, 0, 0]} />
              <Bar dataKey="y5" fill="hsl(var(--primary)/0.8)" name="Year 5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center mt-2">
            <p className="text-[9px] text-muted-foreground">Revenue shifts from <span className="font-bold text-foreground">transaction-heavy (Y1)</span> to <span className="font-bold text-primary">diversified SaaS + data (Y5)</span> — higher-quality, recurring revenue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN — DECACORN VALUATION PERCEPTION INTERFACE
   ══════════════════════════════════════════════════════════════ */
const DecacornValuationInterface: React.FC = () => {
  const navItems = [
    { key: 'dominance', label: 'Market Dominance', icon: Crown },
    { key: 'moat', label: 'Intelligence Moat', icon: Brain },
    { key: 'network', label: 'Network Effects', icon: Globe },
    { key: 'trajectory', label: 'Revenue Trajectory', icon: TrendingUp },
  ];

  const scrollTo = (key: string) => {
    document.getElementById(`valuation-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-12 z-20 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="p-2.5 rounded-xl bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-foreground uppercase">Decacorn Valuation Perception</h1>
            <p className="text-[10px] text-muted-foreground">ASTRA PropTech · Strategic Intelligence · Confidential</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Y5 Revenue Target</p>
              <p className="text-sm font-black text-primary tabular-nums">$7.1M ARR</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Implied Valuation</p>
              <p className="text-sm font-black text-chart-1 tabular-nums">$100M+</p>
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

      {/* Hero Metrics */}
      <motion.div {...fade(0)} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Metric icon={DollarSign} label="Monthly GMV" value="Rp 85B" delta="+28% MoM" />
        <Metric icon={Activity} label="Deals / Month" value="48" delta="+18%" />
        <Metric icon={Globe} label="Active Cities" value="5" delta="+3 pipeline" />
        <Metric icon={Brain} label="AI Accuracy" value="93%" delta="+31pp" />
        <Metric icon={Shield} label="Moat Depth" value="24mo+" delta="Widening" />
      </motion.div>

      <div id="valuation-dominance"><MarketDominance /></div>
      <div id="valuation-moat"><IntelligenceMoat /></div>
      <div id="valuation-network"><NetworkEffects /></div>
      <div id="valuation-trajectory"><RevenueTrajectory /></div>
    </div>
  );
};

export default DecacornValuationInterface;
