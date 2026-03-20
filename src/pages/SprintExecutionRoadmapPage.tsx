import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, BarChart3, Briefcase, FileCheck, Building2,
  ChevronRight, Calendar, Layers, ArrowUpRight
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface Sprint {
  id: number;
  tag: string;
  timeline: string;
  goal: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  deliverables: string[];
  progress: number;
  status: 'completed' | 'in_progress' | 'upcoming';
}

const SPRINTS: Sprint[] = [
  {
    id: 1, tag: 'SPRINT 1', timeline: 'Weeks 1–2', goal: 'Core investor decision UI',
    icon: Target, accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    deliverables: [
      'AI Opportunity Score widget',
      'Property ROI calculator panel',
      'Deal comparison table',
      'Save & watchlist flow',
      'Investor onboarding psychology screens',
    ],
    progress: 100, status: 'completed',
  },
  {
    id: 2, tag: 'SPRINT 2', timeline: 'Weeks 3–4', goal: 'Intelligence visualization',
    icon: BarChart3, accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    deliverables: [
      'Market heatmap Mapbox layer',
      'Liquidity index timeline charts',
      'Demand vs supply gauge',
      'Price trend forecasting graph',
    ],
    progress: 100, status: 'completed',
  },
  {
    id: 3, tag: 'SPRINT 3', timeline: 'Weeks 5–6', goal: 'Portfolio command center',
    icon: Briefcase, accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    deliverables: [
      'Portfolio performance dashboard',
      'Yield vs benchmark visualization',
      'Risk exposure radar chart',
      'Asset diversification pie',
    ],
    progress: 100, status: 'completed',
  },
  {
    id: 4, tag: 'SPRINT 4', timeline: 'Weeks 7–8', goal: 'Deal execution workflow',
    icon: FileCheck, accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    deliverables: [
      'Deal room messaging UI',
      'Vendor coordination tracker',
      'Offer stage lifecycle timeline',
      'Document vault panel',
    ],
    progress: 100, status: 'completed',
  },
  {
    id: 5, tag: 'SPRINT 5', timeline: 'Weeks 9–12', goal: 'Institutional power features',
    icon: Building2, accentClass: 'border-l-foreground', badgeClass: 'bg-foreground/10 text-foreground border-foreground/20',
    deliverables: [
      'Capital allocation simulator',
      'Scenario stress testing engine',
      'AI acquisition recommendation feed',
      'Multi-city opportunity ranking grid',
    ],
    progress: 100, status: 'completed',
  },
];

const statusConfig = {
  completed: { label: 'Completed', className: 'bg-chart-2/15 text-chart-2 border-chart-2/20' },
  in_progress: { label: 'In Progress', className: 'bg-primary/15 text-primary border-primary/20' },
  upcoming: { label: 'Upcoming', className: 'bg-muted text-muted-foreground border-border' },
};

const summaryMetrics = [
  { label: 'Total sprints', value: '5', sub: '12 weeks' },
  { label: 'Deliverables', value: '22', sub: 'UI components' },
  { label: 'Completed', value: '5/5', sub: '100% shipped' },
  { label: 'Velocity', value: '4.4', sub: 'items/sprint' },
];

export default function SprintExecutionRoadmapPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Engineering</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Sprint Execution Roadmap</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            12-week execution plan — from core investor decision UI to institutional-grade capital intelligence features.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Summary */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryMetrics.map((m) => (
            <motion.div key={m.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3 text-primary" />{m.sub}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-5">
            {SPRINTS.map((sprint) => {
              const sc = statusConfig[sprint.status];
              return (
                <motion.div key={sprint.id} variants={fadeSlide} className="relative md:pl-12">
                  {/* Dot */}
                  <div className={`absolute left-3 top-6 h-3 w-3 rounded-full border-2 border-background hidden md:block ${sprint.status === 'completed' ? 'bg-chart-2' : sprint.status === 'in_progress' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />

                  <Card className={`border-border/50 border-l-4 ${sprint.accentClass}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                            <sprint.icon className="h-4.5 w-4.5 text-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <Badge variant="outline" className={`text-[9px] font-mono ${sprint.badgeClass}`}>{sprint.tag}</Badge>
                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{sprint.timeline}</span>
                            </div>
                            <CardTitle className="text-base">{sprint.goal}</CardTitle>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] ${sc.className}`}>{sc.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-2">
                        {sprint.deliverables.map((d, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                            <span className="text-xs text-foreground">{d}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={sprint.progress} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-mono text-muted-foreground">{sprint.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
