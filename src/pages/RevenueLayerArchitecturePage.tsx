import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign, Store, Brain, Landmark, TrendingUp,
  ChevronRight, Shield, Layers, Zap, ArrowUpRight,
  BarChart3, Building2, Crown
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface RevenueLayer {
  level: number;
  title: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  maturity: number;
  revenueType: string;
  streams: { name: string; model: string }[];
}

const LAYERS: RevenueLayer[] = [
  {
    level: 1, title: 'Marketplace Transaction Revenue', icon: DollarSign,
    accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    maturity: 72, revenueType: 'Transactional',
    streams: [
      { name: 'Success fee from closed deals', model: '0.5% – 2% of transaction value' },
      { name: 'Escrow facilitation fee', model: 'Fixed fee per transaction' },
      { name: 'Mortgage referral commission', model: 'Bank partnership rev-share' },
      { name: 'Legal / due diligence margin', model: 'Service markup + routing fee' },
    ],
  },
  {
    level: 2, title: 'Vendor Monetization Engine', icon: Store,
    accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    maturity: 54, revenueType: 'Recurring + Usage',
    streams: [
      { name: 'Featured vendor subscription', model: 'Monthly SaaS tier' },
      { name: 'Priority lead routing credits', model: 'Credit-based pay-per-action' },
      { name: 'District spotlight advertising', model: 'CPM / impression slots' },
      { name: 'Performance-based pay-per-lead', model: 'Qualified lead pricing' },
    ],
  },
  {
    level: 3, title: 'Investor Intelligence SaaS', icon: Brain,
    accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    maturity: 31, revenueType: 'Subscription',
    streams: [
      { name: 'Premium investor dashboard', model: 'Tiered monthly subscription' },
      { name: 'AI deal alerts pro plan', model: 'Per-seat SaaS pricing' },
      { name: 'Portfolio analytics subscription', model: 'Annual enterprise license' },
      { name: 'Cross-border investment concierge', model: 'Advisory retainer + success fee' },
    ],
  },
  {
    level: 4, title: 'Institutional Data Infrastructure', icon: Landmark,
    accentClass: 'border-l-chart-3', badgeClass: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    maturity: 12, revenueType: 'Enterprise License',
    streams: [
      { name: 'Market intelligence API licensing', model: 'Usage-based API pricing' },
      { name: 'Fund analytics dashboard SaaS', model: 'Enterprise annual contract' },
      { name: 'Predictive urban growth data', model: 'Data subscription tiers' },
      { name: 'White-label intelligence platform', model: 'Platform licensing + rev-share' },
    ],
  },
  {
    level: 5, title: 'Capital Markets Monetization', icon: Crown,
    accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    maturity: 5, revenueType: 'Infrastructure Fee',
    streams: [
      { name: 'Investment syndication fee', model: '1–2% structuring + placement' },
      { name: 'Tokenized asset management', model: 'AUM-based management fee' },
      { name: 'Fund management carry', model: '15–20% carried interest' },
      { name: 'REIT structuring advisory', model: 'Advisory + ongoing platform fee' },
    ],
  },
];

const summaryMetrics = [
  { label: 'Active revenue layers', value: '3 / 5', trend: 'Expanding' },
  { label: 'Recurring revenue mix', value: '34%', trend: 'Target 60%+' },
  { label: 'Highest margin layer', value: 'L3 – Intelligence', trend: '~85% GM' },
  { label: 'Long-term revenue ceiling', value: 'Uncapped', trend: 'Infrastructure scale' },
];

export default function RevenueLayerArchitecturePage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Monetization Strategy</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Revenue Layer Architecture</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-3xl">
            Five stacked monetization layers — from marketplace transactions to capital markets infrastructure — each compounding on the intelligence and capital access of the layer below.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6 space-y-6">
        {/* Summary Strip */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryMetrics.map((m) => (
              <Card key={m.label} className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                  <span className="text-[10px] text-primary flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{m.trend}</span>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </motion.div>

        {/* Core Principle */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div variants={fadeSlide}>
            <Card className="border-border/50 bg-primary/5 border-primary/10">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-foreground">You are NOT monetizing listings.</p>
                <p className="text-sm text-foreground mt-1">You are monetizing <span className="font-bold text-primary">intelligence</span> + <span className="font-bold text-primary">transaction flow</span> + <span className="font-bold text-primary">capital access</span>.</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Layer Cards */}
        {LAYERS.map((layer, idx) => (
          <motion.div key={layer.level} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeSlide}>
              <Card className={`border-border/50 border-l-4 ${layer.accentClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                        <layer.icon className="h-4.5 w-4.5 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[9px] font-mono ${layer.badgeClass}`}>LAYER {layer.level}</Badge>
                          <Badge variant="outline" className="text-[9px] font-mono">{layer.revenueType}</Badge>
                        </div>
                        <CardTitle className="text-base">{layer.title}</CardTitle>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Maturity</span>
                      <span className="text-lg font-bold font-mono text-foreground">{layer.maturity}<span className="text-xs text-muted-foreground">%</span></span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={layer.maturity} className="h-1.5" />
                  <div className="grid sm:grid-cols-2 gap-2">
                    {layer.streams.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border/20">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{s.model}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {idx < LAYERS.length - 1 && (
              <motion.div variants={fadeSlide} className="flex justify-center py-2"><div className="h-6 w-px bg-border" /></motion.div>
            )}
          </motion.div>
        ))}

        {/* Doctrine */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div variants={fadeSlide}>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">Revenue Doctrine</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { principle: 'Stack, don\'t replace', detail: 'Each new layer compounds on the data and relationships from layers below — never cannibalizing existing revenue.' },
                    { principle: 'Shift mix toward recurring', detail: 'Transaction revenue bootstraps the platform; intelligence subscriptions and infrastructure licensing build durable value.' },
                    { principle: 'Ultimate model = financial infrastructure', detail: 'The platform becomes an operating layer for global real estate capital — monetizing flow, not just listings.' },
                  ].map((d, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-xs font-semibold text-foreground mb-1">{d.principle}</p>
                      <p className="text-[11px] text-muted-foreground">{d.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
