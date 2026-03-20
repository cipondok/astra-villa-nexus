import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, Users, Store, FileCheck, ArrowUpRight,
  BarChart3, Target, DollarSign, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

// Linear interpolation helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Generate 12-month projection data
function generateProjection() {
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const t = (m - 1) / 11;
    const listings = Math.round(lerp(80, 1200, t));
    const investors = Math.round(lerp(120, 4500, t));
    const vendors = Math.round(lerp(40, 420, t));
    const deals = Math.round(lerp(4, 55, t));

    const proInvestorRev = Math.round(investors * 0.08 * 299000);
    const eliteInvestorRev = Math.round(investors * 0.02 * 1250000);
    const investorSubRev = proInvestorRev + eliteInvestorRev;

    const growthVendorRev = Math.round(vendors * 0.25 * 490000);
    const proVendorRev = Math.round(vendors * 0.10 * 1500000);
    const domVendorRev = Math.round(vendors * 0.03 * 5000000);
    const vendorSubRev = growthVendorRev + proVendorRev + domVendorRev;

    const txnRev = Math.round(deals * 1800000000 * 0.011);
    const totalRev = investorSubRev + vendorSubRev + txnRev;

    months.push({
      month: `M${m}`,
      monthLabel: `Month ${m}`,
      listings, investors, vendors, deals,
      investorSub: investorSubRev,
      vendorSub: vendorSubRev,
      transaction: txnRev,
      total: totalRev,
      // For display
      investorSubM: +(investorSubRev / 1e6).toFixed(1),
      vendorSubM: +(vendorSubRev / 1e6).toFixed(1),
      transactionM: +(txnRev / 1e6).toFixed(1),
      totalM: +(totalRev / 1e6).toFixed(1),
    });
  }
  return months;
}

const data = generateProjection();
const m6 = data[5];
const m12 = data[11];

const fmtIDR = (v: number) => {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${(v / 1e3).toFixed(0)}K`;
};

const m12Mix = [
  { name: 'Transaction Fees', value: m12.transaction, color: 'hsl(var(--primary))' },
  { name: 'Vendor SaaS', value: m12.vendorSub, color: 'hsl(var(--chart-2))' },
  { name: 'Investor Subs', value: m12.investorSub, color: 'hsl(var(--chart-4))' },
];

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '11px',
  },
  labelStyle: { color: 'hsl(var(--popover-foreground))' },
};

const summaryCards = [
  { label: 'Month 6 Revenue', value: fmtIDR(m6.total), sub: `${m6.deals} deals/mo`, icon: BarChart3 },
  { label: 'Month 12 Revenue', value: fmtIDR(m12.total), sub: `${m12.deals} deals/mo`, icon: TrendingUp },
  { label: 'ARR Run Rate', value: fmtIDR(m12.total * 12), sub: 'Series-A ready', icon: Target },
  { label: 'Active Investors M12', value: m12.investors.toLocaleString(), sub: `${m12.listings} listings`, icon: Users },
];

export default function RevenueProjectionModelPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Financial Model</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">12-Month Revenue Projection</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Realistic Indonesia early-scale model — from Rp0 to Rp18B+ ARR run rate across investor subscriptions, vendor SaaS, and transaction fees.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Summary KPIs */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((c) => (
            <motion.div key={c.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</span>
                  <div className="text-lg font-bold font-mono text-foreground">{c.value}</div>
                  <span className="text-[10px] text-primary flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{c.sub}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Tabs defaultValue="revenue" className="w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide} className="flex justify-center mb-4">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
              <TabsTrigger value="growth" className="text-xs">Growth</TabsTrigger>
              <TabsTrigger value="mix" className="text-xs">Mix</TabsTrigger>
              <TabsTrigger value="assumptions" className="text-xs">Assumptions</TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Revenue Stacked Area */}
          <TabsContent value="revenue">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Monthly Revenue by Stream (Rp Millions)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="gTxn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                          <linearGradient id="gVendor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} /></linearGradient>
                          <linearGradient id="gInvestor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(v: number) => `${v}`} />
                        <Tooltip {...tooltipStyle} formatter={(v: number) => [`Rp ${v}M`, '']} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="transactionM" name="Transaction" stackId="1" stroke="hsl(var(--primary))" fill="url(#gTxn)" strokeWidth={2} />
                        <Area type="monotone" dataKey="vendorSubM" name="Vendor SaaS" stackId="1" stroke="hsl(var(--chart-2))" fill="url(#gVendor)" strokeWidth={2} />
                        <Area type="monotone" dataKey="investorSubM" name="Investor Subs" stackId="1" stroke="hsl(var(--chart-4))" fill="url(#gInvestor)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Growth Metrics */}
          <TabsContent value="growth">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Marketplace Growth Trajectory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Tooltip {...tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="investors" name="Investors" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="listings" name="Listings" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="vendors" name="Vendors" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="deals" name="Deals" fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Revenue Mix Pie */}
          <TabsContent value="mix">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Month 12 Revenue Mix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="h-[280px] w-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={m12Mix} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value" stroke="hsl(var(--background))" strokeWidth={3}>
                            {m12Mix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip {...tooltipStyle} formatter={(v: number) => [fmtIDR(v), '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 flex-1">
                      {m12Mix.map((item) => {
                        const pct = Math.round((item.value / m12.total) * 100);
                        return (
                          <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <div className="flex-1">
                              <span className="text-xs font-medium text-foreground">{item.name}</span>
                              <p className="text-[10px] text-muted-foreground">{fmtIDR(item.value)}/mo</p>
                            </div>
                            <span className="text-sm font-bold font-mono text-foreground">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Assumptions */}
          <TabsContent value="assumptions">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Investor Subscriptions', icon: Users,
                  items: ['8% convert to Pro (Rp 299K/mo)', '2% convert to Elite (Rp 1.25M/mo)', 'M1: 120 investors → M12: 4,500'],
                },
                {
                  title: 'Vendor Subscriptions', icon: Store,
                  items: ['25% Growth plan (Rp 490K/mo)', '10% Pro vendor (Rp 1.5M/mo)', '3% Dominance slot (Rp 5M avg/mo)', 'M1: 40 vendors → M12: 420'],
                },
                {
                  title: 'Transaction Fees', icon: FileCheck,
                  items: ['Avg property price: Rp 1.8B', 'Platform fee: 1.1% avg', 'Revenue per deal: ~Rp 19.8M', 'M1: 4 deals → M12: 55 deals'],
                },
                {
                  title: 'Growth Trajectory', icon: TrendingUp,
                  items: ['Linear ramp (conservative)', 'M6 total: ~Rp 505M/mo', 'M12 total: ~Rp 1.54B/mo', 'ARR run rate: Rp 18B+'],
                },
              ].map((section) => (
                <motion.div key={section.title} variants={fadeSlide}>
                  <Card className="border-border/50 h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/20">
                          <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                          <span className="text-xs text-foreground">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Bottom doctrine */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Projection Doctrine</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { p: 'Conservative linear ramp', d: 'No hockey-stick assumptions — growth follows supply seeding and city expansion execution.' },
                  { p: 'Transaction fees dominate early', d: 'Deal success fees drive ~70% of M12 revenue, shifting toward SaaS as scale increases.' },
                  { p: 'Rp 18B+ ARR = Series-A signal', d: 'Strong unit economics with diversified revenue streams demonstrate marketplace-infrastructure transition.' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs font-semibold text-foreground mb-1">{item.p}</p>
                    <p className="text-[11px] text-muted-foreground">{item.d}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
