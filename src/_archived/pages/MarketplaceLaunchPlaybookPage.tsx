import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Handshake, Megaphone, Flame, Share2, Lock,
  ChevronRight, ArrowUpRight, Calendar, Layers
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
  timeline: string;
  goal: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  actions: string[];
  signal: string;
}

const PHASES: Phase[] = [
  {
    id: 1, tag: 'PHASE 1', timeline: 'Month 1', goal: 'Supply Seeding',
    icon: Handshake, accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    actions: [
      'Personally onboard top 50 vendors',
      'Offer 3-month premium free trial',
      'Create "Founding Vendor Badge"',
      'Highlight them on social proof pages',
    ],
    signal: 'Build initial supply credibility before demand arrives',
  },
  {
    id: 2, tag: 'PHASE 2', timeline: 'Month 2', goal: 'Demand Pull',
    icon: Megaphone, accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    actions: [
      'Run TikTok luxury property tours',
      'Publish AI market insights posts',
      'Investor webinar funnel',
      'Lead magnets: "Top 10 investment districts"',
    ],
    signal: 'Generate investor attention to activate vendor value',
  },
  {
    id: 3, tag: 'PHASE 3', timeline: 'Month 3–4', goal: 'Liquidity Flywheel',
    icon: Flame, accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    actions: [
      'Launch AI lead routing urgency notifications',
      'Show vendors lost-lead analytics → trigger upgrade',
      'Introduce hotspot district sponsored slots',
      'Leaderboard gamification dashboard',
    ],
    signal: 'Supply meets demand → transaction velocity increases',
  },
  {
    id: 4, tag: 'PHASE 4', timeline: 'Month 5–6', goal: 'Network Effect Acceleration',
    icon: Share2, accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    actions: [
      'Referral commission for vendors',
      'District dominance competition campaigns',
      'Performance ranking public visibility',
      'Vendor success case study videos',
    ],
    signal: 'Growth becomes self-reinforcing through vendor advocacy',
  },
  {
    id: 5, tag: 'PHASE 5', timeline: 'Month 7+', goal: 'Marketplace Lock-in',
    icon: Lock, accentClass: 'border-l-foreground', badgeClass: 'bg-foreground/10 text-foreground border-foreground/20',
    actions: [
      'Vendor CRM tools inside platform',
      'Automated quotation system',
      'Deal pipeline analytics dependence',
      'Exclusive large developer partnerships',
    ],
    signal: 'Switching cost makes platform indispensable',
  },
];

const metrics = [
  { label: 'Phases', value: '5', sub: '7+ months' },
  { label: 'Tactics', value: '20', sub: 'Growth actions' },
  { label: 'End state', value: 'Lock-in', sub: 'High switching cost' },
  { label: 'Flywheel', value: 'Active', sub: 'Self-reinforcing' },
];

export default function MarketplaceLaunchPlaybookPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Go-to-Market</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Marketplace Launch Playbook</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Five-phase execution sequence — from supply seeding to marketplace lock-in with self-reinforcing network effects.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Metrics */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
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

        {/* Phases */}
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="space-y-5">
            {PHASES.map((phase) => (
              <motion.div key={phase.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="relative md:pl-12">
                <div className="absolute left-3 top-6 h-3 w-3 rounded-full border-2 border-background bg-primary hidden md:block" />
                <motion.div variants={fadeSlide}>
                  <Card className={`border-border/50 border-l-4 ${phase.accentClass}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                          <phase.icon className="h-4.5 w-4.5 text-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <Badge variant="outline" className={`text-[9px] font-mono ${phase.badgeClass}`}>{phase.tag}</Badge>
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{phase.timeline}</span>
                          </div>
                          <CardTitle className="text-base">{phase.goal}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-2">
                        {phase.actions.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                            <span className="text-xs text-foreground">{a}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">Signal</span>
                        <p className="text-xs text-foreground mt-0.5">{phase.signal}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
