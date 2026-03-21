import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  TrendingUp, ArrowUpRight, DollarSign, BarChart3, Users, Gauge,
  Shield, Target, Building2, Briefcase, PieChart, Layers,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart,
} from 'recharts';

const tt = {
  background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11,
};
const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, duration: 0.35 } });

const KPI = ({ label, value, delta, sub, icon: Icon }: { label: string; value: string; delta?: string; sub?: string; icon: React.ElementType }) => (
  <div className="p-3.5 rounded-[20px] bg-card/60 border border-border/40">
    <div className="flex items-center justify-between mb-1">
      <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
      {delta && <Badge variant="outline" className="text-[8px] h-4 px-1.5 gap-0.5 font-bold bg-chart-1/10 text-chart-1 border-0"><ArrowUpRight className="h-2.5 w-2.5" />{delta}</Badge>}
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
    <p className="text-xl font-black tabular-nums text-foreground leading-none mt-0.5">{value}</p>
    {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

/* ═══ DATA ═══ */
const revenueQuarterly = [
  { q: 'Q1 24', rev: 0.12, margin: 42 }, { q: 'Q2 24', rev: 0.34, margin: 48 },
  { q: 'Q3 24', rev: 0.68, margin: 54 }, { q: 'Q4 24', rev: 1.2, margin: 58 },
  { q: 'Q1 25', rev: 1.8, margin: 62 }, { q: 'Q2 25', rev: 2.6, margin: 65 },
  { q: 'Q3 25', rev: 3.8, margin: 68 }, { q: 'Q4 25', rev: 5.2, margin: 71 },
];

const diversification = [
  { stream: 'Marketplace Tx', pct: 38, trend: '+4%' },
  { stream: 'Vendor Subscriptions', pct: 24, trend: '+12%' },
  { stream: 'Investor SaaS', pct: 18, trend: '+22%' },
  { stream: 'Data & APIs', pct: 12, trend: '+34%' },
  { stream: 'Capital Markets', pct: 8, trend: '+48%' },
];

const scaleMetrics = [
  { month: 'Jan', listings: 2.4, investors: 1.8, vendors: 0.6, txVelocity: 120 },
  { month: 'Mar', listings: 3.2, investors: 2.4, vendors: 0.9, txVelocity: 180 },
  { month: 'May', listings: 4.8, investors: 3.6, vendors: 1.4, txVelocity: 280 },
  { month: 'Jul', listings: 6.8, investors: 5.2, vendors: 2.0, txVelocity: 420 },
  { month: 'Sep', listings: 9.2, investors: 7.4, vendors: 2.8, txVelocity: 620 },
  { month: 'Nov', listings: 12.4, investors: 10.2, vendors: 3.8, txVelocity: 880 },
];

const efficiency = [
  { q: 'Q1 24', cac: 180, ltv: 420, automationPct: 35, revPerEmp: 28 },
  { q: 'Q2 24', cac: 155, ltv: 520, automationPct: 42, revPerEmp: 38 },
  { q: 'Q3 24', cac: 128, ltv: 640, automationPct: 52, revPerEmp: 52 },
  { q: 'Q4 24', cac: 105, ltv: 780, automationPct: 62, revPerEmp: 72 },
  { q: 'Q1 25', cac: 88, ltv: 920, automationPct: 71, revPerEmp: 95 },
  { q: 'Q2 25', cac: 72, ltv: 1080, automationPct: 78, revPerEmp: 124 },
];

const profitability = [
  { q: 'Q1 24', opMargin: -42, grossMargin: 42, leverage: 0.6 },
  { q: 'Q2 24', opMargin: -28, grossMargin: 48, leverage: 0.8 },
  { q: 'Q3 24', opMargin: -14, grossMargin: 54, leverage: 1.1 },
  { q: 'Q4 24', opMargin: -4, grossMargin: 58, leverage: 1.4 },
  { q: 'Q1 25', opMargin: 6, grossMargin: 62, leverage: 1.8 },
  { q: 'Q2 25', opMargin: 14, grossMargin: 65, leverage: 2.2 },
  { q: 'Q3 25', opMargin: 22, grossMargin: 68, leverage: 2.6 },
  { q: 'Q4 25', opMargin: 28, grossMargin: 71, leverage: 3.0 },
];

/* ═══ SECTION 1 ═══ */
const FinancialPanel = () => (
  <motion.div {...fade(0)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10"><DollarSign className="h-4 w-4 text-primary" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Financial Performance Authority</h2>
            <p className="text-[10px] text-muted-foreground">Revenue trajectory, margin expansion & monetization diversification</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <KPI icon={DollarSign} label="ARR Run-Rate" value="$5.2M" delta="+124% YoY" sub="Q4 2025" />
          <KPI icon={TrendingUp} label="Gross Margin" value="71%" delta="+29pp" sub="From 42% Q1'24" />
          <KPI icon={PieChart} label="Revenue Streams" value="5" delta="Diversified" sub="No stream >40%" />
          <KPI icon={BarChart3} label="QoQ Growth" value="37%" delta="Compounding" sub="8 consecutive Qs" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Revenue ($M) × Gross Margin (%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={revenueQuarterly}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="q" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[30, 80]} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar yAxisId="left" dataKey="rev" fill="hsl(var(--primary)/0.6)" name="Revenue ($M)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3 }} name="Gross Margin %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Revenue Diversification</p>
            <div className="space-y-2">
              {diversification.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground w-28 shrink-0">{d.stream}</span>
                  <Progress value={d.pct} className="h-2 flex-1" />
                  <span className="text-[9px] font-bold tabular-nums text-foreground w-8 text-right">{d.pct}%</span>
                  <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-0 bg-chart-1/10 text-chart-1">{d.trend}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-chart-1/5 border border-chart-1/15">
              <p className="text-[8px] text-chart-1 font-bold">Herfindahl Index: 0.24 — Healthy diversification</p>
              <p className="text-[8px] text-muted-foreground">No single stream exceeds 40% dependency</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══ SECTION 2 ═══ */
const ScalePanel = () => (
  <motion.div {...fade(1)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-1/10"><Building2 className="h-4 w-4 text-chart-1" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Marketplace Scale Dominance</h2>
            <p className="text-[10px] text-muted-foreground">Listings growth, investor expansion & transaction velocity</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <KPI icon={Layers} label="Active Listings" value="12.4K" delta="+417% YoY" />
          <KPI icon={Users} label="Active Investors" value="10.2K" delta="+467%" />
          <KPI icon={Briefcase} label="Vendors" value="3.8K" delta="+533%" />
          <KPI icon={Gauge} label="Tx Velocity" value="880/mo" delta="+633%" />
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Network Growth (K)</p>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={scaleMetrics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="listings" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.08)" strokeWidth={2} name="Listings (K)" />
                <Area type="monotone" dataKey="investors" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.06)" strokeWidth={1.5} name="Investors (K)" />
                <Area type="monotone" dataKey="vendors" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.04)" strokeWidth={1.5} name="Vendors (K)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-12 md:col-span-6">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Transaction Velocity (deals/month)</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={scaleMetrics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Bar dataKey="txVelocity" fill="hsl(var(--primary)/0.6)" name="Tx Velocity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══ SECTION 3 ═══ */
const EfficiencyPanel = () => (
  <motion.div {...fade(2)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-2/10"><Target className="h-4 w-4 text-chart-2" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Operational Efficiency Signals</h2>
            <p className="text-[10px] text-muted-foreground">CAC reduction, LTV expansion & automation leverage</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <KPI icon={Target} label="CAC" value="$72" delta="-60%" sub="From $180" />
          <KPI icon={TrendingUp} label="LTV" value="$1,080" delta="+157%" sub="LTV/CAC: 15x" />
          <KPI icon={Gauge} label="Automation" value="78%" delta="+43pp" sub="Platform ops" />
          <KPI icon={DollarSign} label="Rev/Employee" value="$124K" delta="+343%" sub="Annualized" />
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">CAC ($) vs LTV ($) Trend</p>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={efficiency}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="q" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="ltv" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3 }} name="LTV ($)" />
                <Line type="monotone" dataKey="cac" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} name="CAC ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-12 md:col-span-6">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Automation Coverage & Rev/Employee ($K)</p>
            <ResponsiveContainer width="100%" height={190}>
              <ComposedChart data={efficiency}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="q" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area yAxisId="left" type="monotone" dataKey="automationPct" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.08)" strokeWidth={1.5} name="Automation %" />
                <Line yAxisId="right" type="monotone" dataKey="revPerEmp" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ r: 3 }} name="Rev/Emp ($K)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══ SECTION 4 ═══ */
const ProfitabilityPanel = () => (
  <motion.div {...fade(3)}>
    <Card className="border-border/30 bg-card/80 rounded-[20px]">
      <CardHeader className="p-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-chart-3/10"><Shield className="h-4 w-4 text-chart-3" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Profitability Pathway</h2>
            <p className="text-[10px] text-muted-foreground">Break-even trajectory, margin expansion & operating leverage</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <KPI icon={TrendingUp} label="Operating Margin" value="+28%" delta="+70pp" sub="From -42%" />
          <KPI icon={Shield} label="Break-Even" value="Q4 '24" delta="Achieved" sub="4 quarters ahead" />
          <KPI icon={Gauge} label="Op. Leverage" value="3.0x" delta="+400%" sub="Revenue/OpEx ratio" />
          <KPI icon={DollarSign} label="Net Margin" value="+18%" delta="Profitable" sub="Trailing quarter" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-7">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Margin Evolution (%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={profitability}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="q" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <YAxis domain={[-50, 80]} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="grossMargin" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.08)" strokeWidth={2} name="Gross Margin" />
                <Area type="monotone" dataKey="opMargin" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.06)" strokeWidth={2.5} name="Operating Margin" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-12 md:col-span-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Operating Leverage (Revenue/OpEx)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={profitability}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="q" tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }} />
                <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={tt} />
                <Line type="monotone" dataKey="leverage" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--chart-2))', r: 4 }} name="Leverage" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IPO Readiness Checklist */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
          <p className="text-[10px] font-bold text-primary mb-2">IPO Readiness Checklist</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { item: 'Revenue >$10M ARR', status: true },
              { item: 'Gross Margin >65%', status: true },
              { item: 'Positive Operating Margin', status: true },
              { item: 'Revenue Diversification', status: true },
              { item: 'LTV/CAC >10x', status: true },
              { item: '3+ QoQ Growth', status: true },
              { item: 'Audited Financials', status: false },
              { item: 'Board Independence', status: false },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.status ? 'bg-chart-1' : 'bg-chart-3 animate-pulse'}`} />
                <span className={`text-[8px] ${c.status ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{c.item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══ MAIN ═══ */
const IPOReadinessMetrics: React.FC = () => (
  <div className="space-y-5 animate-in fade-in duration-300">
    <div className="flex items-center gap-3 flex-wrap">
      <div className="p-2.5 rounded-xl bg-primary/10"><Briefcase className="h-5 w-5 text-primary" /></div>
      <div>
        <h1 className="text-sm font-black tracking-tight text-foreground uppercase">IPO Readiness Command</h1>
        <p className="text-[10px] text-muted-foreground">Institutional-grade financial maturity & public-market readiness signals</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Readiness</p>
          <p className="text-sm font-black text-chart-1">6/8</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">ARR</p>
          <p className="text-sm font-black text-primary tabular-nums">$5.2M</p>
        </div>
      </div>
    </div>
    <FinancialPanel />
    <ScalePanel />
    <EfficiencyPanel />
    <ProfitabilityPanel />
  </div>
);

export default IPOReadinessMetrics;
