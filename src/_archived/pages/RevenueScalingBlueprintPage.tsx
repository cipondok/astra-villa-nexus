import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Rocket, TrendingUp, Database, Globe, Shield,
  ChevronRight, ArrowUpRight, Zap, BarChart3, Target,
  DollarSign
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface RevenueStage {
  id: number;
  tag: string;
  range: string;
  timeline: string;
  focus: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  actions: string[];
  revenueMix: { source: string; pct: number }[];
  outcome?: string;
}

const STAGES: RevenueStage[] = [
  {
    id: 1, tag: 'STAGE 1', range: '$0 → $1M ARR', timeline: 'Year 1',
    focus: 'Marketplace activation.',
    icon: Rocket, accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    actions: ['Seed elite listings in primary market', 'Onboard 100+ verified vendors', 'Close first 50 transactions', 'Launch investor premium plan'],
    revenueMix: [{ source: 'Transaction fees', pct: 60 }, { source: 'Vendor subscriptions', pct: 40 }],
  },
  {
    id: 2, tag: 'STAGE 2', range: '$1M → $10M ARR', timeline: 'Year 2–3',
    focus: 'Network effect expansion.',
    icon: TrendingUp, accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    actions: ['Expand to 5 major cities', 'Activate institutional pilot clients', 'Introduce vendor performance monetization', 'Launch premium deal intelligence tier'],
    revenueMix: [{ source: 'Transaction', pct: 40 }, { source: 'Vendor', pct: 30 }, { source: 'Investor SaaS', pct: 30 }],
  },
  {
    id: 3, tag: 'STAGE 3', range: '$10M → $30M ARR', timeline: 'Year 3–5',
    focus: 'Data platform transition.',
    icon: Database, accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    actions: ['Build institutional dashboard suite', 'API licensing to banks & funds', 'Cross-border investment module', 'Structured deal syndication fees'],
    revenueMix: [{ source: 'SaaS institutional', pct: 35 }, { source: 'Marketplace', pct: 30 }, { source: 'Vendor', pct: 20 }, { source: 'Capital services', pct: 15 }],
  },
  {
    id: 4, tag: 'STAGE 4', range: '$30M → $100M ARR', timeline: 'Year 5–8',
    focus: 'Infrastructure dominance.',
    icon: Globe, accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    actions: ['Expand globally across 10+ markets', 'Predictive intelligence licensing', 'Launch fund layer / REIT products', 'Large enterprise vendor contracts'],
    revenueMix: [{ source: 'Institutional SaaS', pct: 40 }, { source: 'Capital services', pct: 25 }, { source: 'Marketplace', pct: 20 }, { source: 'Vendor + licensing', pct: 15 }],
    outcome: 'Platform becomes category leader with IPO pathway.',
  },
];

const summaryMetrics = [
  { label: 'Revenue stages', value: '4', trend: '$0 → $100M' },
  { label: 'Timeline to $100M', value: '5–8 years', trend: 'Execution-gated' },
  { label: 'Revenue mix shift', value: 'Txn → SaaS', trend: 'Margin expansion' },
  { label: 'End state', value: 'IPO-ready', trend: 'Category leader' },
];

export default function RevenueScalingBlueprintPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Revenue Strategy</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Revenue Scaling Blueprint</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-3xl">
            Four-stage path from marketplace activation to $100M ARR — with revenue mix evolving from transaction fees to institutional SaaS and capital infrastructure.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6 space-y-6">
        {/* Metrics */}
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

        {/* Stages */}
        {STAGES.map((stage, idx) => (
          <motion.div key={stage.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeSlide}>
              <Card className={`border-border/50 border-l-4 ${stage.accentClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                        <stage.icon className="h-4.5 w-4.5 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[9px] font-mono ${stage.badgeClass}`}>{stage.tag}</Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">{stage.timeline}</span>
                        </div>
                        <CardTitle className="text-base">{stage.range}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Focus</span>
                    <p className="text-sm font-medium text-foreground mt-0.5">{stage.focus}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Actions */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" /> Actions</span>
                      {stage.actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground">{a}</p>
                        </div>
                      ))}
                    </div>

                    {/* Revenue Mix */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Revenue Mix</span>
                      {stage.revenueMix.map((r, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">{r.source}</span>
                            <span className="text-xs font-bold font-mono text-foreground">{r.pct}%</span>
                          </div>
                          <Progress value={r.pct} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {stage.outcome && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 block mb-1">Outcome</span>
                      <p className="text-sm text-foreground font-medium">{stage.outcome}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            {idx < STAGES.length - 1 && (
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
                  <span className="text-sm font-bold text-foreground">Scaling Doctrine</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { principle: 'Transaction bootstraps, SaaS scales', detail: 'Early transaction fees fund growth. Institutional SaaS and data licensing create the durable margin expansion.' },
                    { principle: 'Revenue mix is the valuation signal', detail: 'Shifting from 60% transaction to 40% institutional SaaS drives multiple expansion at every stage.' },
                    { principle: 'Each stage unlocks the next', detail: 'Marketplace liquidity funds network expansion, which funds institutional product, which funds global infrastructure.' },
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
