import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, BarChart3, DollarSign, Share2, Calculator, Brain,
  ArrowUpRight, Layers
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface KPICategory {
  title: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  metrics: { name: string; example: string }[];
}

const categories: KPICategory[] = [
  {
    title: 'Liquidity Metrics', icon: TrendingUp,
    accentClass: 'border-t-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    metrics: [
      { name: 'Monthly Transaction Volume (GMV)', example: 'Rp 32.4B' },
      { name: 'Days-on-Market Median', example: '47 days' },
      { name: 'Deal Conversion Rate', example: '12.8%' },
      { name: 'Offer-to-Close Ratio', example: '3.2:1' },
    ],
  },
  {
    title: 'Marketplace Depth', icon: BarChart3,
    accentClass: 'border-t-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    metrics: [
      { name: 'Active Listings Growth %', example: '+18.4% MoM' },
      { name: 'Vendor Supply Density / District', example: '6.2 avg' },
      { name: 'Investor Demand Velocity Index', example: '74/100' },
      { name: 'Repeat Investor Rate', example: '34.6%' },
    ],
  },
  {
    title: 'Revenue Health', icon: DollarSign,
    accentClass: 'border-t-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    metrics: [
      { name: 'Monthly Recurring Revenue (MRR)', example: 'Rp 312M' },
      { name: 'Transaction Take-Rate %', example: '1.1%' },
      { name: 'ARPU Investor', example: 'Rp 148K' },
      { name: 'ARPU Vendor', example: 'Rp 890K' },
    ],
  },
  {
    title: 'Network Effect Strength', icon: Share2,
    accentClass: 'border-t-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    metrics: [
      { name: 'Listings per Active Investor Ratio', example: '0.27' },
      { name: 'Vendor Competition Index', example: '2.8x' },
      { name: 'Lead Routing Success %', example: '68.3%' },
      { name: 'Referral-Driven Signup %', example: '22.1%' },
    ],
  },
  {
    title: 'Unit Economics', icon: Calculator,
    accentClass: 'border-t-accent', badgeClass: 'bg-accent/10 text-accent-foreground border-accent/20',
    metrics: [
      { name: 'Customer Acquisition Cost (CAC)', example: 'Rp 185K' },
      { name: 'Payback Period', example: '3.2 months' },
      { name: 'LTV / CAC Ratio', example: '4.7x' },
      { name: 'Contribution Margin / Deal', example: 'Rp 14.2M' },
    ],
  },
  {
    title: 'AI Intelligence Advantage', icon: Brain,
    accentClass: 'border-t-foreground', badgeClass: 'bg-foreground/10 text-foreground border-foreground/20',
    metrics: [
      { name: 'AI-Scored Deals Usage %', example: '61.4%' },
      { name: 'Predictive Insight Engagement Rate', example: '43.7%' },
      { name: 'Premium Plan Intelligence Adoption %', example: '28.9%' },
      { name: 'Automated Deal Matching Accuracy %', example: '78.2%' },
    ],
  },
];

const summaryCards = [
  { label: 'KPI categories', value: '6', sub: '24 metrics' },
  { label: 'Signal type', value: 'Real-time', sub: 'Live tracking' },
  { label: 'Audience', value: 'Institutional', sub: 'Investor-grade' },
  { label: 'Moat signal', value: 'AI data', sub: 'Compounding' },
];

export default function InvestorKPIFrameworkPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Investor Relations</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Core Investor KPI Framework</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            24 institutional-grade metrics across six dimensions — liquidity, depth, revenue, network effects, unit economics, and AI intelligence advantage.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Summary */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((c) => (
            <motion.div key={c.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{c.value}</div>
                  <span className="text-[10px] text-primary flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{c.sub}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* KPI Categories */}
        <div className="grid md:grid-cols-2 gap-5">
          {categories.map((cat, idx) => (
            <motion.div key={cat.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeSlide} style={{ transitionDelay: `${idx * 60}ms` }}>
              <Card className={`border-border/50 border-t-4 ${cat.accentClass} h-full`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                      <cat.icon className="h-4 w-4 text-foreground" />
                    </div>
                    <CardTitle className="text-sm">{cat.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cat.metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/20">
                      <span className="text-xs text-foreground">{m.name}</span>
                      <span className="text-xs font-bold font-mono text-foreground shrink-0 ml-3">{m.example}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Doctrine */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">KPI Doctrine</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { p: 'Liquidity proves marketplace', d: 'GMV, days-on-market, and conversion rate are the primary signals that the platform creates real transaction value.' },
                  { p: 'Unit economics prove scalability', d: 'LTV/CAC > 3x and payback under 6 months demonstrate capital-efficient growth ready for institutional funding.' },
                  { p: 'AI adoption proves the moat', d: 'Intelligence engagement and matching accuracy compound over time — competitors cannot replicate historical data advantage.' },
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
