import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Rocket, TrendingUp, Landmark, Crown, Shield,
  ChevronRight, Target, Zap, BarChart3, ArrowUpRight,
  Clock, Users
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface Stage {
  id: number;
  tag: string;
  title: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  raise: string;
  focus: string;
  narrative: string;
  tractionGate: string[];
  investorProfile: string;
  valuationRange: string;
}

const STAGES: Stage[] = [
  {
    id: 1, tag: 'STAGE 1', title: 'Angel / Seed', icon: Rocket,
    accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    raise: '$500K – $2M', focus: 'Raise small strategic capital. Focus on traction proof — not valuation hype.',
    narrative: '"Early marketplace with differentiated AI intelligence layer and founder-market fit."',
    tractionGate: ['Working product with real listings', 'First investor users engaging daily', 'Initial behavioral data collection active'],
    investorProfile: 'Angels, micro-VCs, strategic operators', valuationRange: '$5M – $15M pre-money',
  },
  {
    id: 2, tag: 'STAGE 2', title: 'Series A', icon: TrendingUp,
    accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    raise: '$5M – $15M', focus: 'Raise once marketplace liquidity flywheel is visible.',
    narrative: '"Transaction intelligence platform with AI matching advantage."',
    tractionGate: ['Measurable deal velocity acceleration', 'Vendor ecosystem generating revenue', 'AI recommendation accuracy improving quarter-over-quarter'],
    investorProfile: 'Tier-1 VCs, proptech specialists', valuationRange: '$40M – $80M pre-money',
  },
  {
    id: 3, tag: 'STAGE 3', title: 'Growth Round', icon: Landmark,
    accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    raise: '$30M – $80M', focus: 'Raise when institutional users onboard.',
    narrative: '"Global real estate data infrastructure."',
    tractionGate: ['Institutional dashboards in active use', 'Cross-border capital flow visibility', 'Recurring SaaS revenue from fund managers'],
    investorProfile: 'Growth equity, crossover funds, sovereign co-invest', valuationRange: '$300M – $800M pre-money',
  },
  {
    id: 4, tag: 'STAGE 4', title: 'Pre-IPO', icon: Crown,
    accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    raise: '$100M – $300M', focus: 'Raise from sovereign / mega funds.',
    narrative: '"Category leader with global network effects."',
    tractionGate: ['$1B+ annual deal flow on platform', 'Presence in 10+ global markets', 'Proven operating leverage and margin expansion'],
    investorProfile: 'Sovereign wealth funds, mega-cap PE, strategic anchors', valuationRange: '$1.5B – $4B+ pre-money',
  },
];

export default function FundraisingArchitecturePage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Capital Strategy</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Fundraising Architecture</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-3xl">
            Staged capital raise strategy anchored to traction milestones — each round unlocked by measurable execution, not narrative alone.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6 space-y-6">
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
                          <span className="text-[10px] font-mono text-muted-foreground">{stage.raise}</span>
                        </div>
                        <CardTitle className="text-base">{stage.title}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">{stage.valuationRange}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">{stage.focus}</p>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Narrative */}
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 block mb-1">Investor Narrative</span>
                      <p className="text-sm text-foreground font-medium italic">{stage.narrative}</p>
                    </div>

                    {/* Traction Gate */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2"><Target className="h-3 w-3" /> Traction Gate</span>
                      {stage.tractionGate.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5">
                          <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground">{t}</p>
                        </div>
                      ))}
                    </div>

                    {/* Investor Profile */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2"><Users className="h-3 w-3" /> Target Investors</span>
                      <p className="text-sm text-foreground">{stage.investorProfile}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {idx < STAGES.length - 1 && (
              <motion.div variants={fadeSlide} className="flex justify-center py-2">
                <div className="h-6 w-px bg-border" />
              </motion.div>
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
                  <span className="text-sm font-bold text-foreground">Capital Doctrine</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { principle: 'Traction before narrative', detail: 'Every round is unlocked by measurable execution milestones — not pitch deck storytelling.' },
                    { principle: 'Narrative evolves with stage', detail: 'Seed = product. Series A = intelligence. Growth = infrastructure. Pre-IPO = category leadership.' },
                    { principle: 'Capital follows compounding proof', detail: 'Each raise validates the previous thesis and funds the next level of structural advantage.' },
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
