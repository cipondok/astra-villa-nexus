import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, TrendingUp, Handshake, Crown, Building2,
  ChevronRight, Shield, ArrowUpRight, Zap, BarChart3,
  Layers, DollarSign
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface PyramidLevel {
  level: number;
  title: string;
  goal: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  revenueType: string;
  margin: string;
  offerings: string[];
}

const LEVELS: PyramidLevel[] = [
  {
    level: 1, title: 'Entry — Free Acquisition', goal: 'Build supply liquidity.',
    icon: Users, accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    revenueType: 'Free', margin: '0%',
    offerings: ['Free listing of services', 'Free profile exposure', 'AI lead routing basic access'],
  },
  {
    level: 2, title: 'Growth Subscription', goal: 'Predictable MRR.',
    icon: TrendingUp, accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    revenueType: '~$30–$150/mo', margin: '~80%',
    offerings: ['Featured ranking boost', 'Enhanced analytics dashboard', 'Higher match priority', 'Response performance scoring'],
  },
  {
    level: 3, title: 'Performance Revenue Share', goal: 'Align incentives.',
    icon: Handshake, accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    revenueType: 'Usage-based', margin: '~60%',
    offerings: ['Pay-per-qualified lead', '% commission on closed service contracts', 'Dynamic pricing for hotspot districts'],
  },
  {
    level: 4, title: 'Premium Territory Control', goal: 'Scarcity monetization.',
    icon: Crown, accentClass: 'border-l-chart-3', badgeClass: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    revenueType: 'High-margin', margin: '~90%',
    offerings: ['District category exclusivity slots', 'Sponsored search dominance', 'Guaranteed monthly lead volume packages'],
  },
  {
    level: 5, title: 'Enterprise Vendor Partnerships', goal: 'Large predictable contracts.',
    icon: Building2, accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    revenueType: 'Enterprise', margin: '~70%',
    offerings: ['Developer framework agreements', 'Construction consortium integrations', 'Nationwide service network contracts'],
  },
];

const summaryMetrics = [
  { label: 'Pyramid levels', value: '5', trend: 'Stacked' },
  { label: 'Recurring revenue layers', value: '3 / 5', trend: 'L2 + L4 + L5' },
  { label: 'Highest margin tier', value: 'L4 Territory', trend: '~90% GM' },
  { label: 'Revenue model', value: 'Cash flow engine', trend: 'Compounding' },
];

export default function VendorMonetizationPyramidPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Vendor Economics</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Monetization Pyramid</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-3xl">
            Five-tier monetization architecture that converts free vendor supply into a recurring cash flow engine — from acquisition through enterprise partnerships.
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

        {/* Pyramid Levels */}
        {LEVELS.map((level, idx) => (
          <motion.div key={level.level} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeSlide}>
              <Card className={`border-border/50 border-l-4 ${level.accentClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                        <level.icon className="h-4.5 w-4.5 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[9px] font-mono ${level.badgeClass}`}>LEVEL {level.level}</Badge>
                          <Badge variant="outline" className="text-[9px] font-mono">{level.revenueType}</Badge>
                        </div>
                        <CardTitle className="text-base">{level.title}</CardTitle>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Margin</span>
                      <span className="text-lg font-bold font-mono text-foreground">{level.margin}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Goal</span>
                    <p className="text-sm font-medium text-foreground mt-0.5">{level.goal}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {level.offerings.map((o, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{o}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {idx < LEVELS.length - 1 && (
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
                  <span className="text-sm font-bold text-foreground">Vendor Revenue Doctrine</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { principle: 'Free acquires, paid retains', detail: 'Entry-level access builds supply liquidity. Subscription and performance tiers convert vendors into recurring revenue.' },
                    { principle: 'Scarcity drives premium', detail: 'Territory exclusivity and guaranteed lead packages create high-margin revenue from competitive vendor demand.' },
                    { principle: 'Enterprise locks in scale', detail: 'Framework agreements with developers and construction consortiums generate large, predictable contract revenue.' },
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
