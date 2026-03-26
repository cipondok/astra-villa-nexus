import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Building2, Crown, Layers, Wrench,
  BarChart3, ArrowUpRight, Target, Zap, CheckCircle2, Shield,
  Users, Globe, Star, Sparkles, Brain, Lock, Clock, ChevronRight,
  Calculator, PiggyBank, Activity, Percent, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   REVENUE STREAMS
   ═══════════════════════════════════════════ */

interface RevenueStream {
  name: string;
  type: 'Transactional' | 'Recurring' | 'Project-Based';
  icon: typeof DollarSign;
  color: string;
  bgColor: string;
  barColor: string;
  channels: {
    channel: string;
    model: string;
    currentRate: string;
    scaledRate: string;
    scaleTrigger: string;
  }[];
  y1Est: number;
  y2Est: number;
  y3Est: number;
}

const STREAMS: RevenueStream[] = [
  {
    name: 'Transaction Commissions',
    type: 'Transactional',
    icon: DollarSign,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    barColor: 'bg-chart-2',
    y1Est: 8.5, y2Est: 32, y3Est: 72,
    channels: [
      { channel: 'Property Sales Commission', model: '1.0–2.5% of transaction value', currentRate: '1.5% avg', scaledRate: '2.0% avg (premium listings)', scaleTrigger: 'Increase listing inventory to 5,000+ in core cities' },
      { channel: 'Rental Facilitation Fee', model: '5–8% of annual rental value', currentRate: '5% standard', scaledRate: '8% for managed properties', scaleTrigger: 'Launch property management integration' },
      { channel: 'Negotiation Success Fee', model: '0.5% bonus on AI-assisted closings', currentRate: 'Not active', scaledRate: '0.5% on deals using Negotiation Assistant', scaleTrigger: 'Track AI-assisted vs unassisted close rates to prove value' },
    ],
  },
  {
    name: 'Premium Intelligence',
    type: 'Recurring',
    icon: Brain,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    barColor: 'bg-primary',
    y1Est: 3.2, y2Est: 14.5, y3Est: 38,
    channels: [
      { channel: 'Insider Tier (Gold)', model: 'Rp 499K/month', currentRate: 'Target: 500 subscribers Y1', scaledRate: '2,000 subscribers Y2', scaleTrigger: 'Feature-gate ROI projections beyond 3-year horizon' },
      { channel: 'Strategist Tier (Platinum)', model: 'Rp 1.49M/month', currentRate: 'Target: 150 subscribers Y1', scaledRate: '800 subscribers Y2', scaleTrigger: 'Exclusive developer pre-launch access + institutional analytics' },
      { channel: 'Inner Circle (Diamond)', model: 'Rp 4.99M/month', currentRate: 'Target: 30 members Y1', scaledRate: '120 members Y2', scaleTrigger: 'Application-based entry + dedicated concierge + off-market deals' },
      { channel: 'Institutional API Access', model: 'Rp 25M–50M/month', currentRate: 'Not active', scaledRate: '10–20 fund clients Y3', scaleTrigger: 'Build API gateway for portfolio analytics + market intelligence feeds' },
    ],
  },
  {
    name: 'Developer Revenue',
    type: 'Project-Based',
    icon: Building2,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    barColor: 'bg-chart-4',
    y1Est: 5, y2Est: 18, y3Est: 35,
    channels: [
      { channel: 'Project Launch Campaigns', model: 'Rp 50M–200M per project', currentRate: '2–3 launches Y1', scaledRate: '10–15 launches Y2', scaleTrigger: 'Build developer partnership pipeline across 5+ cities' },
      { channel: 'Demand Analytics Reports', model: 'Rp 15M–30M per report', currentRate: 'Not active', scaledRate: '20–30 reports/year Y2', scaleTrigger: 'Package proprietary behavioral data into actionable developer briefs' },
      { channel: 'Featured Project Placement', model: 'Rp 10M–25M/month', currentRate: '1–2 active Y1', scaledRate: '5–8 active Y2', scaleTrigger: 'Homepage placement + AI recommendation integration for new projects' },
      { channel: 'Joint Venture Revenue Share', model: '3–5% of project sales via platform', currentRate: 'Not active', scaledRate: '2–3 JV projects Y3', scaleTrigger: 'Co-invest in selected developments using platform demand intelligence' },
    ],
  },
  {
    name: 'Service Ecosystem',
    type: 'Transactional',
    icon: Wrench,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    barColor: 'bg-chart-1',
    y1Est: 1.5, y2Est: 8, y3Est: 22,
    channels: [
      { channel: 'Renovation Marketplace Commission', model: '8–12% of project value', currentRate: '8% standard', scaledRate: '10% avg with premium vendor tier', scaleTrigger: 'Onboard 200+ verified vendors across 10 categories' },
      { channel: 'Legal Services Facilitation', model: '5–10% of service fee', currentRate: '5% referral', scaledRate: '8% managed service', scaleTrigger: 'Integrate end-to-end SHM/AJB processing with tracked milestones' },
      { channel: 'Property Management Packages', model: 'Rp 2M–5M/month per property', currentRate: 'Not active', scaledRate: '100–300 properties Y2', scaleTrigger: 'Partner with local property managers for rental portfolio clients' },
      { channel: 'Lifecycle Value Bundles', model: 'Rp 15M–30M per purchase', currentRate: 'Not active', scaledRate: 'Bundled at closing Y2', scaleTrigger: 'Package legal + insurance + renovation + management as post-purchase upsell' },
    ],
  },
];

/* ═══════════════════════════════════════════
   SCALE LEVERS
   ═══════════════════════════════════════════ */

const SCALE_LEVERS = [
  {
    lever: 'Transaction Volume Expansion',
    icon: TrendingUp,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    actions: [
      { action: 'Dominate listing inventory in 5 core cities', metric: '5,000+ active listings by Y2', impact: 'Doubles inquiry volume → doubles commission opportunities' },
      { action: 'Accelerate negotiation conversion with AI', metric: 'Reduce avg negotiation time from 6 weeks → 3 weeks', impact: '2x deal velocity = 2x revenue throughput at same agent capacity' },
      { action: 'Increase investor deal frequency', metric: 'Avg 1.5 transactions/investor/year → 2.5', impact: 'Portfolio-building tools + AI alerts drive repeat transactions' },
    ],
  },
  {
    lever: 'Premium Intelligence Monetization',
    icon: Crown,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    actions: [
      { action: 'Feature-gate advanced analytics progressively', metric: 'Free → Gold conversion: 8% target', impact: 'Recurring revenue with 85%+ gross margin' },
      { action: 'Build institutional API for fund managers', metric: '10–20 institutional clients by Y3', impact: 'Rp 25M–50M/month per client = high-value B2B recurring revenue' },
      { action: 'Publish prediction accuracy as marketing', metric: '94%+ AI accuracy track record', impact: 'Proven accuracy justifies premium pricing and reduces churn' },
    ],
  },
  {
    lever: 'Developer Partnership Scaling',
    icon: Building2,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    actions: [
      { action: 'Package demand intelligence as paid service', metric: '20–30 reports/year at Rp 15M–30M each', impact: 'Monetizes proprietary data directly — pure margin revenue' },
      { action: 'Scale project launch campaigns', metric: '10–15 developer launches/year by Y2', impact: 'Rp 50M–200M per launch + ongoing featured placement revenue' },
      { action: 'Co-invest via JV model on validated projects', metric: '2–3 JV projects with 3–5% revenue share', impact: 'Aligns platform incentives with developer success — highest margin potential' },
    ],
  },
  {
    lever: 'Service Ecosystem Growth',
    icon: Layers,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    actions: [
      { action: 'Bundle lifecycle services at transaction close', metric: 'Rp 15M–30M avg bundle value', impact: 'Captures post-purchase revenue that currently leaks to offline providers' },
      { action: 'Expand vendor marketplace categories', metric: '200+ verified vendors across 10+ categories', impact: '8–12% commission on every service transaction through platform' },
      { action: 'Launch managed property services', metric: '100–300 managed rental properties by Y2', impact: 'Rp 2M–5M/month recurring per property — predictable revenue base' },
    ],
  },
];

/* ═══════════════════════════════════════════
   REVENUE SIMULATOR
   ═══════════════════════════════════════════ */

interface SimInputs {
  monthlyTransactions: number;
  avgTransactionValue: number;     // in billions
  premiumSubscribers: number;
  avgSubRevenue: number;           // in millions
  developerProjects: number;
  avgProjectFee: number;           // in millions
  managedProperties: number;
  avgServiceRevenue: number;       // in millions
}

const SIM_DEFAULTS: SimInputs = {
  monthlyTransactions: 15,
  avgTransactionValue: 3,
  premiumSubscribers: 500,
  avgSubRevenue: 1.2,
  developerProjects: 8,
  avgProjectFee: 100,
  managedProperties: 150,
  avgServiceRevenue: 3.5,
};

function simulateRevenue(i: SimInputs) {
  const commissionRate = 0.018;
  const transactionRev = i.monthlyTransactions * i.avgTransactionValue * 1_000_000_000 * commissionRate * 12;
  const subscriptionRev = i.premiumSubscribers * i.avgSubRevenue * 1_000_000 * 12;
  const developerRev = i.developerProjects * i.avgProjectFee * 1_000_000;
  const serviceRev = i.managedProperties * i.avgServiceRevenue * 1_000_000 * 12;
  const totalAnnual = transactionRev + subscriptionRev + developerRev + serviceRev;
  return { transactionRev, subscriptionRev, developerRev, serviceRev, totalAnnual };
}

const formatB = (v: number) => `Rp ${(v / 1_000_000_000).toFixed(1)}B`;
const formatM = (v: number) => `Rp ${(v / 1_000_000).toFixed(0)}M`;

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function RevenueScalingPage() {
  const [activeTab, setActiveTab] = useState('streams');
  const [simInputs, setSimInputs] = useState<SimInputs>(SIM_DEFAULTS);
  const [expandedStream, setExpandedStream] = useState('Transaction Commissions');

  const simResults = useMemo(() => simulateRevenue(simInputs), [simInputs]);

  const updateSim = <K extends keyof SimInputs>(key: K, value: SimInputs[K]) =>
    setSimInputs(prev => ({ ...prev, [key]: value }));

  const totalY1 = STREAMS.reduce((s, st) => s + st.y1Est, 0);
  const totalY3 = STREAMS.reduce((s, st) => s + st.y3Est, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                </div>
                Revenue Scaling Framework
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Multi-stream monetization model targeting Rp {totalY3}B+ ARR by Year 3</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-2/20 text-chart-2">
                Y1: ~Rp {totalY1}B
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/20 text-primary">
                Y3: ~Rp {totalY3}B
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
            <TabsTrigger value="levers">Scale Levers</TabsTrigger>
            <TabsTrigger value="simulator">Revenue Simulator</TabsTrigger>
          </TabsList>

          {/* ═══ STREAMS ═══ */}
          <TabsContent value="streams" className="space-y-3">
            {/* Revenue mix overview */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">3-Year Revenue Mix (Rp Billion)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center text-[10px]">
                  {['Y1', 'Y2', 'Y3'].map((year, yi) => (
                    <div key={year}>
                      <p className="font-bold text-muted-foreground mb-2">{year}</p>
                      <div className="space-y-1">
                        {STREAMS.map((st) => {
                          const val = yi === 0 ? st.y1Est : yi === 1 ? st.y2Est : st.y3Est;
                          const total = yi === 0 ? totalY1 : yi === 1 ? STREAMS.reduce((s, x) => s + x.y2Est, 0) : totalY3;
                          const pct = total > 0 ? (val / total) * 100 : 0;
                          return (
                            <div key={st.name} className="flex items-center gap-2">
                              <div className="h-2 rounded-full bg-muted/20 flex-1 overflow-hidden">
                                <motion.div className={cn('h-full rounded-full', st.barColor)} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: yi * 0.1 }} />
                              </div>
                              <span className={cn('font-bold w-10 text-right', st.color)}>{val}B</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="font-black text-foreground mt-2">Rp {yi === 0 ? totalY1 : yi === 1 ? STREAMS.reduce((s, x) => s + x.y2Est, 0) : totalY3}B</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-3">
                  {STREAMS.map(st => (
                    <div key={st.name} className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', st.barColor)} />
                      <span className="text-[8px] text-muted-foreground">{st.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stream details */}
            {STREAMS.map((stream) => {
              const SIcon = stream.icon;
              const isExpanded = expandedStream === stream.name;
              return (
                <motion.div key={stream.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={cn('border bg-card cursor-pointer transition-all', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')} onClick={() => setExpandedStream(isExpanded ? '' : stream.name)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stream.bgColor)}>
                          <SIcon className={cn('h-5 w-5', stream.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{stream.name}</CardTitle>
                            <Badge variant="outline" className="text-[7px]">{stream.type}</Badge>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{stream.channels.length} revenue channels</p>
                        </div>
                        <div className="text-right">
                          <p className={cn('text-sm font-black', stream.color)}>Rp {stream.y3Est}B</p>
                          <p className="text-[8px] text-muted-foreground">Y3 target</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-0 space-y-2" onClick={e => e.stopPropagation()}>
                        {stream.channels.map((ch, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Zap className={cn('h-3 w-3', stream.color)} />
                              <p className="text-xs font-bold text-foreground flex-1">{ch.channel}</p>
                              <Badge variant="outline" className="text-[7px] font-mono">{ch.model}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[9px]">
                              <div className="p-1.5 rounded bg-muted/10"><span className="font-bold text-muted-foreground">Current:</span> <span className="text-foreground">{ch.currentRate}</span></div>
                              <div className="p-1.5 rounded bg-chart-2/5 border border-chart-2/10"><span className="font-bold text-chart-2">Scaled:</span> <span className="text-foreground">{ch.scaledRate}</span></div>
                              <div className="p-1.5 rounded bg-primary/5 border border-primary/10"><span className="font-bold text-primary">Trigger:</span> <span className="text-foreground">{ch.scaleTrigger}</span></div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ LEVERS ═══ */}
          <TabsContent value="levers" className="space-y-4">
            {SCALE_LEVERS.map((lever, i) => {
              const LIcon = lever.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', lever.bgColor)}>
                          <LIcon className={cn('h-5 w-5', lever.color)} />
                        </div>
                        <CardTitle className="text-sm">{lever.lever}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {lever.actions.map((a, j) => (
                        <div key={j} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                          <p className="text-[10px] font-bold text-foreground mb-1">{a.action}</p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[7px]"><Target className="h-2 w-2 mr-0.5" />{a.metric}</Badge>
                            <ArrowUpRight className={cn('h-3 w-3', lever.color)} />
                            <p className="text-[9px] text-chart-2 font-medium">{a.impact}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Scaling Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      Revenue scales when marketplace liquidity compounds: more listings attract more investors, more investors attract more agents, more agents bring more listings. Each revenue stream amplifies the others — transaction commissions fund AI improvements, better AI drives premium subscriptions, premium data attracts developers, developer projects bring new investors. The flywheel is the strategy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ SIMULATOR ═══ */}
          <TabsContent value="simulator">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Revenue Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <SimSlider label="Monthly Transactions" value={simInputs.monthlyTransactions} min={1} max={100} step={1} format={v => `${v}/mo`} icon={Activity} onChange={v => updateSim('monthlyTransactions', v)} />
                    <SimSlider label="Avg Transaction Value" value={simInputs.avgTransactionValue} min={0.5} max={20} step={0.5} format={v => `Rp ${v}B`} icon={DollarSign} onChange={v => updateSim('avgTransactionValue', v)} />
                    <Separator />
                    <SimSlider label="Premium Subscribers" value={simInputs.premiumSubscribers} min={10} max={5000} step={10} format={v => `${v}`} icon={Crown} onChange={v => updateSim('premiumSubscribers', v)} />
                    <SimSlider label="Avg Sub Revenue" value={simInputs.avgSubRevenue} min={0.5} max={10} step={0.1} format={v => `Rp ${v}M/mo`} icon={PiggyBank} onChange={v => updateSim('avgSubRevenue', v)} />
                    <Separator />
                    <SimSlider label="Developer Projects/Year" value={simInputs.developerProjects} min={0} max={30} step={1} format={v => `${v}`} icon={Building2} onChange={v => updateSim('developerProjects', v)} />
                    <SimSlider label="Avg Project Fee" value={simInputs.avgProjectFee} min={10} max={300} step={10} format={v => `Rp ${v}M`} icon={Star} onChange={v => updateSim('avgProjectFee', v)} />
                    <Separator />
                    <SimSlider label="Managed Properties" value={simInputs.managedProperties} min={0} max={500} step={5} format={v => `${v}`} icon={Wrench} onChange={v => updateSim('managedProperties', v)} />
                    <SimSlider label="Avg Service Rev/Property" value={simInputs.avgServiceRevenue} min={1} max={10} step={0.5} format={v => `Rp ${v}M/mo`} icon={Layers} onChange={v => updateSim('avgServiceRevenue', v)} />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3 space-y-4">
                {/* Total */}
                <Card className="border border-chart-2/20 bg-card">
                  <CardContent className="p-5">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Projected Annual Revenue</p>
                    <motion.p key={simResults.totalAnnual} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="text-3xl font-black text-chart-2">
                      {formatB(simResults.totalAnnual)}
                    </motion.p>
                    <p className="text-[9px] text-muted-foreground mt-1">Based on current input assumptions</p>
                  </CardContent>
                </Card>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Transactions', value: simResults.transactionRev, color: 'text-chart-2', bgColor: 'bg-chart-2/10', barColor: 'bg-chart-2', icon: DollarSign },
                    { label: 'Subscriptions', value: simResults.subscriptionRev, color: 'text-primary', bgColor: 'bg-primary/10', barColor: 'bg-primary', icon: Crown },
                    { label: 'Developer', value: simResults.developerRev, color: 'text-chart-4', bgColor: 'bg-chart-4/10', barColor: 'bg-chart-4', icon: Building2 },
                    { label: 'Services', value: simResults.serviceRev, color: 'text-chart-1', bgColor: 'bg-chart-1/10', barColor: 'bg-chart-1', icon: Wrench },
                  ].map((item) => {
                    const IIcon = item.icon;
                    const pct = simResults.totalAnnual > 0 ? (item.value / simResults.totalAnnual) * 100 : 0;
                    return (
                      <Card key={item.label} className="border border-border bg-card">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', item.bgColor)}>
                              <IIcon className={cn('h-3.5 w-3.5', item.color)} />
                            </div>
                            <p className="text-[9px] text-muted-foreground">{item.label}</p>
                          </div>
                          <motion.p key={item.value} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="text-sm font-black text-foreground">
                            {item.value >= 1_000_000_000 ? formatB(item.value) : formatM(item.value)}
                          </motion.p>
                          <div className="h-1.5 rounded-full bg-muted/20 mt-2 overflow-hidden">
                            <motion.div className={cn('h-full rounded-full', item.barColor)} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                          </div>
                          <p className="text-[8px] text-muted-foreground mt-1">{pct.toFixed(0)}% of total</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SIM SLIDER
   ═══════════════════════════════════════════ */

function SimSlider({ label, value, min, max, step, format, icon: Icon, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; icon: typeof DollarSign; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <Label className="text-[10px] text-muted-foreground">{label}</Label>
        </div>
        <motion.span key={value} initial={{ scale: 1.1, color: 'hsl(var(--primary))' }} animate={{ scale: 1, color: 'hsl(var(--foreground))' }} transition={{ duration: 0.2 }} className="text-xs font-bold">
          {format(value)}
        </motion.span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="cursor-pointer" />
    </div>
  );
}
