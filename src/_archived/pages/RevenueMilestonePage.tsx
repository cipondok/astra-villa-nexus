import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Target, ChevronRight, TrendingUp, Zap,
  Users, Layers, Award, Flame, FlaskConical, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { modelRevenue, RevenueModelOutput } from '@/lib/revenueMilestone';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  ACHIEVED: { color: 'hsl(var(--chart-1))', label: 'Target Achieved 🎉' },
  ON_TRACK: { color: 'hsl(var(--chart-2))', label: 'On Track' },
  AT_RISK: { color: 'hsl(var(--chart-4))', label: 'At Risk' },
  BEHIND: { color: 'hsl(var(--destructive))', label: 'Behind Target' },
};

const STREAM_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const ROADMAP = [
  { phase: 'Month 1 — Foundation', items: ['Activate first 5 transaction commissions from high-value district deals', 'Onboard 10 investor subscribers via free Pro trial conversion', 'Sell 5 premium listing slots to top-performing agents'], target: 'Rp 150M' },
  { phase: 'Month 2 — Acceleration', items: ['Scale deals to 8-10/month targeting avg Rp 3B+ properties', 'Launch vendor Growth packages — target 20 vendor subscribers', 'Run first pricing experiment: commission 1.5% vs 2%'], target: 'Rp 350M' },
  { phase: 'Month 3 — Milestone', items: ['Push transaction volume to 12+ deals with agent bonus incentives', 'Activate data intelligence upsell for institutional investors', 'Bundle premium slots + vendor subscription at package price'], target: 'Rp 500M+' },
];

const SCALING = [
  { signal: 'Revenue > Rp 500M/month for 2 consecutive months', readiness: 'Ready for city #2 expansion' },
  { signal: 'Subscription revenue > 30% of total', readiness: 'Revenue diversification validated' },
  { signal: 'LTV/CAC ratio > 5x across all segments', readiness: 'Unit economics proven for investor pitch' },
  { signal: 'Transaction commission growing > 15% MoM', readiness: 'Marketplace flywheel accelerating' },
  { signal: 'Premium slot utilization > 70%', readiness: 'Supply monetization capacity validated' },
];

export default function RevenueMilestonePage() {
  const [dealValue, setDealValue] = useState(2_500_000_000);
  const [commRate, setCommRate] = useState(2);
  const [dealsClosed, setDealsClosed] = useState(6);
  const [invSubs, setInvSubs] = useState(25);
  const [invArpu, setInvArpu] = useState(500_000);
  const [vendSubs, setVendSubs] = useState(15);
  const [vendArpu, setVendArpu] = useState(750_000);
  const [slots, setSlots] = useState(12);
  const [slotPrice, setSlotPrice] = useState(1_500_000);
  const [target, setTarget] = useState(800_000_000);

  const result: RevenueModelOutput = useMemo(() => modelRevenue({
    avg_deal_value: dealValue, commission_rate_pct: commRate, deals_closed_month: dealsClosed,
    investor_subscribers: invSubs, investor_arpu: invArpu, vendor_subscribers: vendSubs, vendor_arpu: vendArpu,
    premium_slots_sold: slots, slot_price: slotPrice, monthly_revenue_target: target,
  }), [dealValue, commRate, dealsClosed, invSubs, invArpu, vendSubs, vendArpu, slots, slotPrice, target]);

  const statusCfg = STATUS_CONFIG[result.status];
  const pieData = result.streams.map((s, i) => ({ name: s.name, value: s.revenue, fill: STREAM_COLORS[i] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div variants={FADE} initial="hidden" animate="show" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><Target className="h-7 w-7 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">First Revenue Milestone</h1>
            <p className="text-sm text-muted-foreground">Strategy engine for early financial validation</p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.06 }}>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black tabular-nums text-foreground">{fmt(result.total_monthly_revenue)}</p>
                  <p className="text-xs text-muted-foreground">of {fmt(result.target)} target</p>
                </div>
                <Badge style={{ background: statusCfg.color, color: '#fff' }} className="text-sm">{statusCfg.label}</Badge>
              </div>
              <Progress value={Math.min(100, result.progress_pct)} className="h-3" />
              <p className="text-xs text-muted-foreground tabular-nums">{result.progress_pct}% achieved{result.gap.shortfall > 0 && ` — gap: ${fmt(result.gap.shortfall)}`}</p>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="model" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="model">Revenue Model</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="scaling">Scaling</TabsTrigger>
          </TabsList>

          {/* ── Revenue Model ── */}
          <TabsContent value="model" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3"><CardTitle className="text-base">Revenue Inputs</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Transaction</p>
                  {[
                    { label: 'Avg Deal Value', value: dealValue, set: setDealValue, min: 500_000_000, max: 15_000_000_000, step: 100_000_000, isCurrency: true },
                    { label: 'Deals Closed/Month', value: dealsClosed, set: setDealsClosed, min: 0, max: 25, step: 1 },
                  ].map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between"><Label className="text-xs">{s.label}</Label><span className="text-xs font-medium tabular-nums text-primary">{(s as any).isCurrency ? fmt(s.value) : s.value}</span></div>
                      <Slider value={[s.value]} onValueChange={v => s.set(v[0])} min={s.min} max={s.max} step={s.step} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <div className="flex justify-between"><Label className="text-xs">Commission Rate</Label><span className="text-xs font-medium tabular-nums text-primary">{commRate}%</span></div>
                    <Slider value={[commRate * 10]} onValueChange={v => setCommRate(v[0] / 10)} min={5} max={30} step={1} />
                  </div>

                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold pt-2">Subscriptions</p>
                  {[
                    { label: 'Investor Subscribers', value: invSubs, set: setInvSubs, min: 0, max: 100 },
                    { label: 'Investor ARPU', value: invArpu, set: setInvArpu, min: 100_000, max: 2_000_000, step: 50_000, isCurrency: true },
                    { label: 'Vendor Subscribers', value: vendSubs, set: setVendSubs, min: 0, max: 100 },
                    { label: 'Vendor ARPU', value: vendArpu, set: setVendArpu, min: 100_000, max: 3_000_000, step: 50_000, isCurrency: true },
                  ].map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between"><Label className="text-xs">{s.label}</Label><span className="text-xs font-medium tabular-nums text-primary">{(s as any).isCurrency ? fmt(s.value) : s.value}</span></div>
                      <Slider value={[s.value]} onValueChange={v => s.set(v[0])} min={s.min} max={s.max} step={(s as any).step || 1} />
                    </div>
                  ))}

                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold pt-2">Premium Listings</p>
                  {[
                    { label: 'Slots Sold', value: slots, set: setSlots, min: 0, max: 50 },
                    { label: 'Slot Price', value: slotPrice, set: setSlotPrice, min: 500_000, max: 5_000_000, step: 100_000, isCurrency: true },
                  ].map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between"><Label className="text-xs">{s.label}</Label><span className="text-xs font-medium tabular-nums text-primary">{(s as any).isCurrency ? fmt(s.value) : s.value}</span></div>
                      <Slider value={[s.value]} onValueChange={v => s.set(v[0])} min={s.min} max={s.max} step={(s as any).step || 1} />
                    </div>
                  ))}

                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold pt-2">Target</p>
                  <div className="space-y-1">
                    <div className="flex justify-between"><Label className="text-xs">Monthly Target</Label><span className="text-xs font-medium tabular-nums text-primary">{fmt(target)}</span></div>
                    <Slider value={[target]} onValueChange={v => setTarget(v[0])} min={100_000_000} max={2_000_000_000} step={50_000_000} />
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-5">
                {/* Stream Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.streams.map((s, i) => (
                    <Card key={s.name}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: STREAM_COLORS[i] }} />
                          <p className="text-xs text-muted-foreground">{s.name}</p>
                        </div>
                        <p className="text-lg font-bold tabular-nums text-foreground">{fmt(s.revenue)}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[10px] tabular-nums">{s.pct_of_total}% of total</Badge>
                          <Badge variant="outline" className="text-[10px] tabular-nums">{s.pct_of_target}% of target</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pie + Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Mix</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                              {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => fmt(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Gap Analysis</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {result.gap.shortfall > 0 ? (
                        <>
                          <p className="text-sm text-foreground">Shortfall: <span className="font-bold text-destructive tabular-nums">{fmt(result.gap.shortfall)}</span></p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Via deals alone</span><span className="font-semibold tabular-nums">{result.gap.deals_needed} deals</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Via subs alone</span><span className="font-semibold tabular-nums">{result.gap.subs_needed} subscribers</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Via slots alone</span><span className="font-semibold tabular-nums">{result.gap.slots_needed} slots</span></div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-primary font-semibold">🎉 Target achieved — no gap remaining</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Actions + Experiments ── */}
          <TabsContent value="actions" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Priority Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  {result.priority_actions.length > 0 ? result.priority_actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /><span className="text-foreground">{a}</span></div>
                  )) : <p className="text-sm text-muted-foreground">Target achieved — maintain momentum.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" />Monetization Experiments</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  {result.experiments.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground">{e}</span></div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Roadmap ── */}
          <TabsContent value="roadmap" className="space-y-5">
            {ROADMAP.map((phase, i) => (
              <motion.div key={phase.phase} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">{phase.phase}<Badge variant="outline" className="text-xs tabular-nums">Target: {phase.target}</Badge></CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {phase.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground">{item}</span></div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Scaling Readiness ── */}
          <TabsContent value="scaling" className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Scaling Readiness Signals</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {SCALING.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <ArrowUpRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{s.signal}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.readiness}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
