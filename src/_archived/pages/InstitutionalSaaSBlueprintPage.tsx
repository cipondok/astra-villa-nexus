import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain, BarChart3, LineChart, Handshake, Globe,
  ChevronRight, Shield, ArrowUpRight, Users, Layers,
  Building2, TrendingUp, Zap, Crown, Target
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface ProductModule {
  id: number;
  title: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  capabilities: string[];
}

const MODULES: ProductModule[] = [
  {
    id: 1, title: 'Opportunity Intelligence', icon: Brain,
    accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    capabilities: ['AI-scored deal pipeline with confidence ratings', 'District liquidity heatmap — real-time absorption signals', 'Pricing inefficiency detection across micro-markets'],
  },
  {
    id: 2, title: 'Portfolio Command Center', icon: BarChart3,
    accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    capabilities: ['Real-time asset performance tracking', 'Yield vs market benchmark comparison', 'Geographic risk exposure mapping'],
  },
  {
    id: 3, title: 'Capital Allocation Simulator', icon: LineChart,
    accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    capabilities: ['Scenario modeling — bull / crisis / rate hike', 'Projected IRR distribution curves', 'Liquidity stress testing'],
  },
  {
    id: 4, title: 'Acquisition Execution Layer', icon: Handshake,
    accentClass: 'border-l-chart-3', badgeClass: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    capabilities: ['Direct deal room workflow', 'Automated vendor coordination', 'Cross-border transaction facilitation'],
  },
  {
    id: 5, title: 'Strategic Market Intelligence', icon: Globe,
    accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    capabilities: ['Urban growth predictions', 'Infrastructure impact forecasting', 'Demographic demand shift analysis'],
  },
];

const targetUsers = [
  { segment: 'Family Offices', ticket: '$5K–$10K/mo', priority: 'Primary' },
  { segment: 'Property Funds', ticket: '$5K–$8K/mo', priority: 'Primary' },
  { segment: 'Private Banks', ticket: '$8K–$10K/mo', priority: 'Strategic' },
  { segment: 'Sovereign / Pension', ticket: 'Enterprise custom', priority: 'Anchor' },
];

const metrics = [
  { label: 'Target clients', value: '50–200', trend: 'Year 1–3' },
  { label: 'Per-client MRR', value: '$2K–$10K', trend: 'SaaS pricing' },
  { label: 'Gross margin', value: '~85%', trend: 'Software-scale' },
  { label: 'Positioning', value: 'Bloomberg for RE', trend: 'Category creator' },
];

export default function InstitutionalSaaSBlueprintPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Institutional Product</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Institutional SaaS Blueprint</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-3xl">
            "Bloomberg Terminal for Real Estate Capital Allocation" — a five-module intelligence platform purpose-built for family offices, property funds, private banks, and sovereign allocators.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6 space-y-6">
        {/* Metrics */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
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

        {/* Target Users */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div variants={fadeSlide}>
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Target Institutional Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {targetUsers.map((u, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1.5">
                      <p className="text-sm font-medium text-foreground">{u.segment}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground">{u.ticket}</span>
                        <Badge variant="outline" className="text-[9px]">{u.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Product Modules */}
        {MODULES.map((mod, idx) => (
          <motion.div key={mod.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeSlide}>
              <Card className={`border-border/50 border-l-4 ${mod.accentClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                      <mod.icon className="h-4.5 w-4.5 text-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className={`text-[9px] font-mono ${mod.badgeClass}`}>MODULE {mod.id}</Badge>
                      </div>
                      <CardTitle className="text-base">{mod.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {mod.capabilities.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border/20">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{c}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {idx < MODULES.length - 1 && (
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
                  <span className="text-sm font-bold text-foreground">Institutional Product Doctrine</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { principle: 'Intelligence, not listings', detail: 'Institutions pay for predictive signals, risk models, and execution speed — not property search.' },
                    { principle: 'Workflow integration depth', detail: 'Embedding into capital allocation processes creates switching costs that compound over time.' },
                    { principle: 'Pricing power from scarcity', detail: '$2K–$10K/mo SaaS is defensible when no competitor offers equivalent intelligence depth at this granularity.' },
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
