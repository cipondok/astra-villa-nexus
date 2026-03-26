import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Database, Eye, Building2, LineChart, Brain, Shield,
  Lock, Clock, ChevronRight, Layers, BarChart3,
  TrendingUp, Zap, ArrowUpRight
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface MoatLevel {
  level: number;
  title: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  depth: number;
  replicationYears: string;
  signals: { label: string; strength: number; dataPoints: string }[];
}

const LEVELS: MoatLevel[] = [
  {
    level: 1, title: 'Behavioral Data', icon: Eye,
    accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    depth: 62, replicationYears: '2–3 years',
    signals: [
      { label: 'Investor search patterns', strength: 71, dataPoints: '4.2M events' },
      { label: 'Deal negotiation timelines', strength: 58, dataPoints: '18K sequences' },
      { label: 'Price sensitivity signals', strength: 64, dataPoints: '890K data points' },
    ],
  },
  {
    level: 2, title: 'Supply Intelligence', icon: Building2,
    accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    depth: 47, replicationYears: '3–5 years',
    signals: [
      { label: 'Developer launch cycles', strength: 53, dataPoints: '1.4K cycles tracked' },
      { label: 'Vendor service performance', strength: 41, dataPoints: '320K reviews' },
      { label: 'Construction cost trends', strength: 48, dataPoints: '2.1M data points' },
    ],
  },
  {
    level: 3, title: 'Market Prediction Layer', icon: LineChart,
    accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    depth: 38, replicationYears: '4–7 years',
    signals: [
      { label: 'Liquidity heatmaps', strength: 44, dataPoints: '67 districts' },
      { label: 'Demand surge early signals', strength: 36, dataPoints: '1.8K triggers' },
      { label: 'Absorption rate forecasting', strength: 31, dataPoints: '42 markets' },
    ],
  },
  {
    level: 4, title: 'Proprietary AI Models', icon: Brain,
    accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    depth: 24, replicationYears: '5–10+ years',
    signals: [
      { label: 'Opportunity score engine', strength: 29, dataPoints: '12K calibrations' },
      { label: 'Dynamic pricing inefficiency', strength: 21, dataPoints: '340K comparisons' },
      { label: 'Investor risk profiling', strength: 18, dataPoints: '8.7K profiles' },
    ],
  },
];

const compoundingMetrics = [
  { label: 'Total proprietary data points', value: '8.4M+', trend: '+42% YoY' },
  { label: 'Unique behavioral sequences', value: '1.2M', trend: '+67% YoY' },
  { label: 'AI model recalibration cycles', value: '4,380', trend: 'Every 6h' },
  { label: 'Replication cost estimate', value: '$47M+', trend: 'Growing' },
];

export default function DataMoatIntelligencePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-7xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">
                Competitive Defensibility
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Moat Intelligence</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-3xl">
            Four layers of compounding intelligence that deepen with every transaction, search, and market signal — creating structural barriers no competitor can replicate through UI alone.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-7xl py-6 space-y-8">
        {/* Compounding Metrics Strip */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.div variants={fadeSlide} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {compoundingMetrics.map((m) => (
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

        {/* Moat Layers */}
        {LEVELS.map((level, idx) => (
          <motion.div
            key={level.level}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
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
                          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1"><Clock className="h-3 w-3" /> {level.replicationYears} to replicate</span>
                        </div>
                        <CardTitle className="text-base">{level.title}</CardTitle>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Moat Depth</span>
                      <span className="text-lg font-bold font-mono text-foreground">{level.depth}<span className="text-xs text-muted-foreground">%</span></span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {level.signals.map((s, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground font-medium">{s.label}</span>
                        <Badge variant="outline" className="text-[9px] font-mono">{s.dataPoints}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={s.strength} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{s.strength}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {idx < LEVELS.length - 1 && (
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
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">Moat Doctrine</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { icon: Lock, principle: 'Competitors can copy UI', detail: 'They cannot copy years of behavioral intelligence, calibration cycles, and institutional trust signals embedded in the data.' },
                    { icon: Clock, principle: 'Real moat = time + data compounding', detail: 'Every transaction, search, and negotiation deepens prediction accuracy — creating an exponentially widening gap.' },
                    { icon: Layers, principle: 'Depth compounds across layers', detail: 'Behavioral data feeds supply intelligence, which feeds market prediction, which feeds proprietary AI — each layer strengthens the others.' },
                  ].map((d, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <d.icon className="h-3.5 w-3.5 text-primary" />
                        <p className="text-xs font-semibold text-foreground">{d.principle}</p>
                      </div>
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
