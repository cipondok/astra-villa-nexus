import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Activity, TrendingUp, BarChart3, Shield, Zap, MapPin, Users,
  Clock, AlertTriangle, ArrowRight, Bell, GitCompare, Sparkles,
  Building, ChevronRight, DollarSign, Gauge, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ---------------------------------------------------------------- */

const EXIT_CONFIDENCE = 78;
const TIMELINE_MARKERS = [
  { months: 3, probability: 42, label: '3 mo' },
  { months: 6, probability: 68, label: '6 mo' },
  { months: 12, probability: 91, label: '12 mo' },
];

const SIGNALS = [
  { icon: Users, label: 'Buyer Demand Momentum', value: 82, status: 'strong' as const, desc: 'Active buyer inquiries up 18% MoM' },
  { icon: Activity, label: 'Transaction Velocity', value: 71, status: 'moderate' as const, desc: 'Avg 4.2 transactions/month in district' },
  { icon: DollarSign, label: 'Price Competitiveness', value: 88, status: 'strong' as const, desc: 'Listed 7% below comparable median' },
  { icon: BarChart3, label: 'Supply Pressure', value: 45, status: 'caution' as const, desc: '23 new listings in last 30 days' },
  { icon: MapPin, label: 'Infrastructure Signal', value: 76, status: 'moderate' as const, desc: 'New toll road access within 2 km' },
  { icon: TrendingUp, label: 'Sentiment Trend', value: 84, status: 'strong' as const, desc: 'Positive investor sentiment rising' },
];

const COMPARABLES = [
  { title: 'Villa Seminyak #12', sold: '47 days', price: 'Rp 7.8B', delta: '-3%', year: '2025' },
  { title: 'Berawa Beachfront', sold: '28 days', price: 'Rp 9.1B', delta: '+5%', year: '2025' },
  { title: 'Canggu Modern Villa', sold: '63 days', price: 'Rp 6.5B', delta: '-8%', year: '2024' },
  { title: 'Pererenan Retreat', sold: '35 days', price: 'Rp 8.4B', delta: '+2%', year: '2025' },
];

function getStatusColor(status: 'strong' | 'moderate' | 'caution') {
  if (status === 'strong') return 'text-chart-1';
  if (status === 'moderate') return 'text-chart-4';
  return 'text-destructive';
}

function getStatusBg(status: 'strong' | 'moderate' | 'caution') {
  if (status === 'strong') return 'bg-chart-1/10';
  if (status === 'moderate') return 'bg-chart-4/10';
  return 'bg-destructive/10';
}

export default function LiquidityForecastEngine() {
  const [activeTimeline, setActiveTimeline] = useState(1);

  const gaugeRotation = (EXIT_CONFIDENCE / 100) * 180 - 90;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-chart-1/[0.02] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-4 px-3 py-1 text-[10px] border-primary/20 text-primary bg-primary/5">
              <Gauge className="w-3 h-3 mr-1.5" />Predictive Analytics
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              AI Liquidity
              <span className="block text-primary">Forecast</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg text-base">
              Predicting resale velocity and exit confidence using behavioral and market signals.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left — Main panels */}
          <div className="space-y-6">
            {/* Forecast Panel — Gauge + Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="grid sm:grid-cols-2 gap-8 items-center">
                {/* Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-28 overflow-hidden">
                    {/* Background arc */}
                    <svg viewBox="0 0 200 110" className="w-full h-full">
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="hsl(var(--secondary))"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Colored arc */}
                      <motion.path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray="251"
                        initial={{ strokeDashoffset: 251 }}
                        animate={{ strokeDashoffset: 251 - (251 * EXIT_CONFIDENCE) / 100 }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                      />
                    </svg>
                    {/* Needle */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 origin-bottom"
                      style={{ width: 2, height: 60 }}
                      initial={{ rotate: -90 }}
                      animate={{ rotate: gaugeRotation }}
                      transition={{ duration: 1, delay: 0.4, type: 'spring' }}
                    >
                      <div className="w-full h-full bg-primary rounded-full" />
                    </motion.div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30" />
                  </div>
                  <motion.div
                    className="text-center mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="text-3xl font-bold text-foreground">{EXIT_CONFIDENCE}%</div>
                    <div className="text-xs text-muted-foreground">Exit Confidence Score</div>
                  </motion.div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Time-to-Sell Projection
                  </h3>
                  <div className="space-y-3">
                    {TIMELINE_MARKERS.map((t, i) => (
                      <motion.button
                        key={t.months}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        onClick={() => setActiveTimeline(i)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                          activeTimeline === i
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-border bg-accent/20 hover:border-border'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold',
                          t.probability >= 80 ? 'bg-chart-1/15 text-chart-1'
                            : t.probability >= 50 ? 'bg-chart-4/15 text-chart-4'
                            : 'bg-destructive/15 text-destructive'
                        )}>
                          {t.probability}%
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground">{t.label} window</div>
                          <div className="text-[10px] text-muted-foreground">
                            {t.probability >= 80 ? 'High' : t.probability >= 50 ? 'Moderate' : 'Low'} sell probability
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Confidence band */}
                  <div className="mt-4 flex items-center gap-1">
                    <div className="flex-1 h-2 rounded-full bg-chart-1/60" />
                    <div className="flex-1 h-2 rounded-full bg-chart-4/60" />
                    <div className="w-1/4 h-2 rounded-full bg-destructive/40" />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>High Liquidity</span>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Signal Breakdown Grid */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-primary" />Signal Breakdown
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SIGNALS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="bg-accent/30 border border-border/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', getStatusBg(s.status))}>
                        <s.icon className={cn('w-4 h-4', getStatusColor(s.status))} />
                      </div>
                      <span className={cn('text-lg font-bold', getStatusColor(s.status))}>{s.value}</span>
                    </div>
                    <div className="text-xs font-medium text-foreground mb-1">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</div>
                    {/* Mini bar */}
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full', s.status === 'strong' ? 'bg-chart-1' : s.status === 'moderate' ? 'bg-chart-4' : 'bg-destructive')}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Comparable Resale Cases */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
                <Building className="w-4 h-4 text-primary" />Comparable Resale Cases
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {COMPARABLES.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="min-w-[200px] bg-accent/30 border border-border/50 rounded-xl p-4 shrink-0"
                  >
                    <div className="text-xs font-medium text-foreground mb-1">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground mb-3">{c.year}</div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Sold in</span>
                      <span className="text-xs font-semibold text-foreground">{c.sold}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Price</span>
                      <span className="text-xs font-mono text-foreground">{c.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">vs. Ask</span>
                      <span className={cn(
                        'text-xs font-semibold',
                        c.delta.startsWith('+') ? 'text-chart-1' : 'text-destructive'
                      )}>{c.delta}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={() => toast.success('Liquidity alert activated')}>
                <Bell className="w-4 h-4" />Add Liquidity Alert
              </Button>
              <Button variant="outline" className="gap-2">
                <GitCompare className="w-4 h-4" />Compare Exit Scenarios
              </Button>
            </div>
          </div>

          {/* Right — Insight Panel */}
          <div className="space-y-5">
            {/* AI Insight */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />AI Liquidity Insight
              </h3>
              <p className="text-sm text-foreground/85 leading-relaxed mb-4">
                Properties in this micro-market are seeing faster resale cycles due to rising investor inflow.
                Demand from Jakarta-based buyers has increased 22% QoQ, compressing average days-on-market from 74 to 41.
              </p>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Current supply-demand ratio favors sellers. Exit within 6 months carries moderate-to-high confidence
                if priced within 5% of comparable median.
              </p>
            </motion.div>

            {/* Liquidity Risk */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-chart-4" />Risk Assessment
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-4/5 border border-chart-4/10">
                  <AlertTriangle className="w-4 h-4 text-chart-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-foreground">Supply Surge Warning</div>
                    <div className="text-[10px] text-muted-foreground">23 new listings may increase competition in 60–90 days</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-1/5 border border-chart-1/10">
                  <TrendingUp className="w-4 h-4 text-chart-1 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-foreground">Demand Acceleration</div>
                    <div className="text-[10px] text-muted-foreground">Buyer inquiries trending 18% above 90-day average</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">District Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Avg. Days on Market', value: '41 days' },
                  { label: 'Sell-Through Rate', value: '73%' },
                  { label: 'Price Negotiation Gap', value: '-4.2%' },
                  { label: 'Active Buyer Pool', value: '318' },
                  { label: 'Absorption Rate', value: '6.2 mo' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold text-foreground font-mono">{m.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Market Cycle */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-primary/5 border border-primary/10 rounded-xl p-5 text-center"
            >
              <Eye className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xs font-semibold text-primary mb-1">Market Cycle Phase</div>
              <div className="text-lg font-bold text-foreground">Expansion</div>
              <div className="text-[10px] text-muted-foreground mt-1">Favorable exit window — act within 6 months</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
