import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Crosshair, Globe, TrendingUp, Building2, BarChart3,
  Landmark, Rocket, ChevronRight, Target, Layers,
  Users, Database, ArrowUpRight, Crown, Zap,
  Network, LineChart, Shield
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface Phase {
  id: number;
  tag: string;
  title: string;
  timeline: string;
  goal: string;
  outcome: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  executions: string[];
  kpis: { label: string; target: string }[];
}

const PHASES: Phase[] = [
  {
    id: 1, tag: 'PHASE 1', title: 'Product-Market Domination', timeline: 'Year 1–2',
    goal: 'Own one clear niche before global expansion.',
    outcome: 'Become "the smartest property intelligence platform" in one geography.',
    icon: Crosshair,
    accentClass: 'border-l-primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    executions: [
      'Dominate a single city or segment — luxury villas, investor analytics, AI property intelligence',
      'Build strong data moat → behavioral data, pricing signals, investor demand signals',
      'Achieve daily active investors, recurring listings supply, first institutional pilot partnerships',
    ],
    kpis: [
      { label: 'Active property users', target: '10,000+' },
      { label: 'Verified listings', target: '500+' },
      { label: 'AI accuracy cycles', target: 'Continuous' },
    ],
  },
  {
    id: 2, tag: 'PHASE 2', title: 'Regional Network Effect Flywheel', timeline: 'Year 2–4',
    goal: 'Create supply + demand flywheel across multiple cities.',
    outcome: 'Platform becomes transaction infrastructure — not just listing portal.',
    icon: Network,
    accentClass: 'border-l-chart-2',
    badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    executions: [
      'Launch vendor marketplace — construction, legal, financing, management',
      'Introduce AI deal matching engine → faster transaction cycles',
      'Expand into 3–5 high-liquidity cities',
    ],
    kpis: [
      { label: 'Monthly transactions / leads', target: '5,000' },
      { label: 'Vendor ecosystem', target: 'Fully active' },
      { label: 'Take-rate monetization', target: 'Stable' },
    ],
  },
  {
    id: 3, tag: 'PHASE 3', title: 'Institutional Capital Platform', timeline: 'Year 4–7',
    goal: 'Position as investment intelligence infrastructure.',
    outcome: 'Platform seen as "Bloomberg + Booking.com for property investing".',
    icon: Landmark,
    accentClass: 'border-l-chart-4',
    badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    executions: [
      'Build institutional dashboards — portfolio analytics, risk scoring',
      'Launch cross-border investor gateway',
      'Enable structured investment products — fractional / fund syndication',
    ],
    kpis: [
      { label: 'Annual deal flow visibility', target: '$1B+' },
      { label: 'Sovereign / pension pilots', target: 'Active' },
      { label: 'Institutional SaaS revenue', target: 'Recurring' },
    ],
  },
  {
    id: 4, tag: 'PHASE 4', title: 'Global Data Infrastructure', timeline: 'Year 7–12',
    goal: 'Become real estate operating layer.',
    outcome: 'Category leadership → defensible global moat.',
    icon: Globe,
    accentClass: 'border-l-chart-3',
    badgeClass: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    executions: [
      'Launch global market heatmap intelligence',
      'Predictive urban growth analytics',
      'API layer for banks / funds / developers',
    ],
    kpis: [
      { label: 'Global market presence', target: '10–20 markets' },
      { label: 'Institutional subscriptions', target: 'Dominant' },
      { label: 'Data licensing revenue', target: 'Active' },
    ],
  },
  {
    id: 5, tag: 'PHASE 5', title: 'Capital Market Expansion', timeline: 'Year 10+',
    goal: 'Public market scale platform.',
    outcome: 'Multi-billion valuation platform controlling global property intelligence flows.',
    icon: Crown,
    accentClass: 'border-l-chart-5',
    badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    executions: [
      'IPO or mega-fund creation',
      'Acquire regional proptech competitors',
      'Expand into adjacent asset intelligence verticals',
    ],
    kpis: [
      { label: 'Valuation trajectory', target: 'Multi-billion' },
      { label: 'Market positioning', target: 'Category leader' },
      { label: 'Revenue diversification', target: 'Global streams' },
    ],
  },
];

const milestones = [
  { year: 'Y1', label: 'City dominance', done: false },
  { year: 'Y2', label: 'Data moat established', done: false },
  { year: 'Y3', label: 'Multi-city flywheel', done: false },
  { year: 'Y5', label: 'Institutional capital', done: false },
  { year: 'Y7', label: 'Global infrastructure', done: false },
  { year: 'Y10', label: 'Public market scale', done: false },
];

export default function PlanetaryScaleRoadmapPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section
        initial="hidden" animate="visible" variants={stagger}
        className="border-b border-border bg-card/50"
      >
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">
                Strategic Growth Architecture
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Planetary Scale Roadmap</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-3xl">
            Five-phase execution framework from single-market dominance to global real estate intelligence infrastructure — designed for compounding strategic advantage at every stage.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6 space-y-8">
        {/* Timeline Strip */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div variants={fadeSlide} className="flex items-center gap-1 overflow-x-auto pb-2">
            {milestones.map((m, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1 min-w-[90px]">
                  <div className="h-8 w-8 rounded-full border-2 border-border bg-card flex items-center justify-center">
                    <span className="text-[10px] font-bold font-mono text-muted-foreground">{m.year}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center whitespace-nowrap">{m.label}</span>
                </div>
                {i < milestones.length - 1 && (
                  <div className="flex-1 min-w-[24px] h-px bg-border" />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* Phase Cards */}
        {PHASES.map((phase, idx) => (
          <motion.div
            key={phase.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeSlide}>
              <Card className={`border-border/50 border-l-4 ${phase.accentClass} overflow-hidden`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                        <phase.icon className="h-4.5 w-4.5 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[9px] font-mono ${phase.badgeClass}`}>{phase.tag}</Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">{phase.timeline}</span>
                        </div>
                        <CardTitle className="text-base">{phase.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Goal */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Strategic Goal</span>
                    <p className="text-sm font-medium text-foreground">{phase.goal}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Execution */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Zap className="h-3 w-3" /> Execution
                      </span>
                      {phase.executions.map((e, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground">{e}</p>
                        </div>
                      ))}
                    </div>

                    {/* KPIs */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <BarChart3 className="h-3 w-3" /> KPI Targets
                      </span>
                      {phase.kpis.map((k, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/20">
                          <span className="text-xs text-foreground">{k.label}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{k.target}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcome */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 block mb-1">Outcome</span>
                    <p className="text-sm text-foreground font-medium">{phase.outcome}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Phase connector */}
            {idx < PHASES.length - 1 && (
              <motion.div variants={fadeSlide} className="flex justify-center py-2">
                <div className="h-6 w-px bg-border" />
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Summary Card */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
        >
          <motion.div variants={fadeSlide}>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">Strategic Doctrine</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { principle: 'Dominate before expanding', detail: 'Deep niche ownership creates the data moat that funds regional scaling.' },
                    { principle: 'Intelligence before transactions', detail: 'Prediction accuracy compounds trust, which accelerates capital velocity.' },
                    { principle: 'Infrastructure before exits', detail: 'Becoming the operating layer makes the platform structurally irreplaceable.' },
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
