import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Flame, TrendingUp, Sparkles, ArrowUpRight, Layers,
  ChevronRight
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface Tier {
  title: string;
  priority: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  features: string[];
  drivers: string[];
  driverLabel: string;
}

const tiers: Tier[] = [
  {
    title: 'High Valuation Impact', priority: 'BUILD FIRST',
    icon: Flame, accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    features: [
      'AI deal scoring engine',
      'Transaction escrow system',
      'Vendor marketplace liquidity routing',
      'Investor portfolio analytics',
      'Market heatmap intelligence',
    ],
    driverLabel: 'Valuation Drivers',
    drivers: ['Revenue multiple expansion', 'Investor excitement signal', 'Competitive defensibility'],
  },
  {
    title: 'Medium Impact', priority: 'GROWTH MULTIPLIER',
    icon: TrendingUp, accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    features: [
      'Referral incentive engine',
      'Vendor performance leaderboard',
      'Smart alert notifications',
      'Automated valuation model',
      'Developer project dashboards',
    ],
    driverLabel: 'Growth Drivers',
    drivers: ['User acquisition velocity', 'Retention improvement', 'Network effect amplification'],
  },
  {
    title: 'Lower Impact', priority: 'LATER STAGE',
    icon: Sparkles, accentClass: 'border-l-muted-foreground', badgeClass: 'bg-muted text-muted-foreground border-border',
    features: [
      'Social feed features',
      'Community chat',
      'Property lifestyle content hub',
      'Cosmetic UI enhancements',
      'Non-core integrations',
    ],
    driverLabel: 'Brand Drivers',
    drivers: ['Brand perception', 'Engagement depth', 'Not valuation-critical early'],
  },
];

const summary = [
  { label: 'Tiers', value: '3', sub: 'Priority levels' },
  { label: 'Features', value: '15', sub: 'Mapped' },
  { label: 'Build first', value: '5', sub: 'High impact' },
  { label: 'Principle', value: 'Revenue', sub: 'Before polish' },
];

export default function FeatureImpactMatrixPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Prioritization</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Feature Impact Matrix</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Three-tier prioritization framework — build features that drive valuation and defensibility first, growth multipliers second, polish last.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.map((c) => (
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

        {tiers.map((tier, idx) => (
          <motion.div key={tier.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeSlide} style={{ transitionDelay: `${idx * 60}ms` }}>
            <Card className={`border-border/50 border-l-4 ${tier.accentClass}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <tier.icon className="h-4.5 w-4.5 text-foreground" />
                  </div>
                  <div>
                    <Badge variant="outline" className={`text-[9px] font-mono mb-0.5 ${tier.badgeClass}`}>{tier.priority}</Badge>
                    <CardTitle className="text-base">{tier.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="md:col-span-3 space-y-2">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{tier.driverLabel}</span>
                    {tier.drivers.map((d, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs text-foreground">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Prioritization Doctrine</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { p: 'Revenue before engagement', d: 'Features that directly generate or protect revenue always ship before features that improve brand or engagement metrics.' },
                  { p: 'Defensibility before polish', d: 'AI scoring, data moats, and transaction infrastructure create barriers competitors cannot replicate with UI improvements.' },
                  { p: 'Growth multipliers unlock scale', d: 'Referrals, leaderboards, and smart alerts amplify existing traction — but only after the core value loop is proven.' },
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
