import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, TrendingUp, Zap, Brain, Shield, Globe,
  ArrowRight, DollarSign, BarChart3, Target, Activity, CheckCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line
} from 'recharts';

/* ─── Evolution Phases ─── */
interface Phase {
  id: number; label: string; subtitle: string;
  modules: { name: string; icon: React.ElementType; status: 'active' | 'building' | 'planned' | 'vision'; desc: string }[];
  metrics: { label: string; value: string; delta: string }[];
  color: string;
}

const PHASES: Phase[] = [
  {
    id: 0, label: 'Marketplace Phase', subtitle: 'Property discovery & transaction facilitation',
    color: 'chart-2',
    modules: [
      { name: 'Listing Intelligence', icon: BarChart3, status: 'active', desc: 'AI-scored property discovery' },
      { name: 'Vendor Network', icon: Globe, status: 'active', desc: 'Multi-city agent coordination' },
      { name: 'Transaction Engine', icon: Zap, status: 'active', desc: 'Offer-to-close pipeline' },
      { name: 'Buyer Matching', icon: Target, status: 'active', desc: 'Preference-based recommendations' },
    ],
    metrics: [
      { label: 'GMV', value: 'Rp 2.4T', delta: '+45%' },
      { label: 'Vendors', value: '613', delta: '+28%' },
      { label: 'Markets', value: '8', delta: '+3' },
      { label: 'Deal Velocity', value: '18 days', delta: '-4 days' },
    ],
  },
  {
    id: 1, label: 'Intelligence Platform', subtitle: 'Data-driven market intelligence & prediction',
    color: 'chart-1',
    modules: [
      { name: 'Predictive Pricing Engine', icon: Brain, status: 'building', desc: 'AI price forecasting with 94% accuracy' },
      { name: 'Liquidity Intelligence', icon: Activity, status: 'building', desc: 'Real-time supply-demand scoring' },
      { name: 'Capital Flow Analytics', icon: DollarSign, status: 'building', desc: 'Cross-border investment tracking' },
      { name: 'Market Anomaly Detection', icon: Shield, status: 'planned', desc: 'Automated risk signal identification' },
    ],
    metrics: [
      { label: 'Data Points', value: '24M+', delta: '+180%' },
      { label: 'Prediction Accuracy', value: '94%', delta: '+12%' },
      { label: 'Intelligence Products', value: '8', delta: '+5' },
      { label: 'API Clients', value: '42', delta: '+28' },
    ],
  },
  {
    id: 2, label: 'Infrastructure Coordination', subtitle: 'Autonomous economic coordination layer',
    color: 'chart-3',
    modules: [
      { name: 'Autonomous Pricing Governance', icon: Brain, status: 'planned', desc: 'Self-adjusting market pricing models' },
      { name: 'Liquidity Stabilization Engine', icon: Activity, status: 'planned', desc: 'Supply-demand equilibrium automation' },
      { name: 'Capital Allocation Intelligence', icon: DollarSign, status: 'planned', desc: 'Optimal investment routing algorithms' },
      { name: 'Cross-border Protocol Layer', icon: Globe, status: 'vision', desc: 'Standardized transaction protocols' },
    ],
    metrics: [
      { label: 'Markets Coordinated', value: '24+', delta: '+16' },
      { label: 'Automation Rate', value: '78%', delta: '+42%' },
      { label: 'Friction Reduction', value: '-62%', delta: 'vs. baseline' },
      { label: 'Institutional Partners', value: '120+', delta: '+85' },
    ],
  },
  {
    id: 3, label: 'Global Economic Integration', subtitle: 'Planetary-scale property economy infrastructure',
    color: 'primary',
    modules: [
      { name: 'Global Settlement Protocol', icon: Globe, status: 'vision', desc: 'Universal real estate transaction standard' },
      { name: 'Sovereign Integration Layer', icon: Shield, status: 'vision', desc: 'Government-grade regulatory compliance' },
      { name: 'Economic Stability Engine', icon: Layers, status: 'vision', desc: 'Market-level volatility dampening' },
      { name: 'Civilization Coordination OS', icon: Brain, status: 'vision', desc: 'Autonomous global property economy management' },
    ],
    metrics: [
      { label: 'Economies Connected', value: '50+', delta: 'global' },
      { label: 'Capital Coordinated', value: '$120B+', delta: '+2,400%' },
      { label: 'Market Efficiency', value: '+85%', delta: 'vs. fragmented' },
      { label: 'Transaction Latency', value: '<4h', delta: '-95%' },
    ],
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-chart-1/15', text: 'text-chart-1', label: 'ACTIVE' },
  building: { bg: 'bg-chart-2/15', text: 'text-chart-2', label: 'BUILDING' },
  planned: { bg: 'bg-chart-3/15', text: 'text-chart-3', label: 'PLANNED' },
  vision: { bg: 'bg-primary/10', text: 'text-primary', label: 'VISION' },
};

/* ─── Outcome Projections ─── */
const OUTCOME_DATA = Array.from({ length: 20 }, (_, i) => ({
  year: `Y${i + 1}`,
  friction: Math.max(8, 85 - i * 4.2 + Math.random() * 3),
  liquidity: Math.min(95, 25 + i * 3.8 + Math.random() * 4),
  efficiency: Math.min(92, 18 + i * 4 + Math.random() * 3),
}));

const PostMarketplaceEvolution = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [timelineSlider, setTimelineSlider] = useState([0]);

  const currentPhase = PHASES[activePhase];

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Post-Marketplace Infrastructure Evolution</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-primary border-primary/20">STRATEGIC</Badge>
        </div>
      </div>

      {/* Phase Timeline */}
      <Card className="border-border/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-1">
            {PHASES.map((phase, i) => (
              <React.Fragment key={phase.id}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActivePhase(i)}
                  className={cn(
                    "flex-1 rounded-lg border transition-all p-2 text-left",
                    activePhase === i ? `border-${phase.color}/40 bg-${phase.color}/5 ring-1 ring-${phase.color}/20` : "border-border/20 bg-card/50 hover:border-border/40"
                  )}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", `bg-${phase.color}`)} />
                    <span className="text-[7px] font-medium text-foreground truncate">{phase.label}</span>
                  </div>
                  <p className="text-[6px] text-muted-foreground leading-tight truncate">{phase.subtitle}</p>
                </motion.button>
                {i < PHASES.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/20 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* LEFT */}
        <div className="space-y-3">
          {/* Phase Modules */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Layers className="h-3 w-3 text-primary" />{currentPhase.label} — Platform Modules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
              <AnimatePresence mode="wait">
                {currentPhase.modules.map((mod, i) => {
                  const status = STATUS_STYLES[mod.status];
                  return (
                    <motion.div key={`${activePhase}-${i}`}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 px-2.5 py-2 rounded-lg border border-border/20 bg-card/50"
                    >
                      <mod.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[9px] font-medium text-foreground">{mod.name}</p>
                          <Badge className={cn("text-[5px] h-3 px-1", status.bg, status.text)}>{status.label}</Badge>
                        </div>
                        <p className="text-[7px] text-muted-foreground mt-0.5">{mod.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Projected Outcome Curves */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold">Projected Outcome Trajectories</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={OUTCOME_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Line type="monotone" dataKey="friction" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={false} name="Transaction Friction %" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="liquidity" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Asset Liquidity %" />
                  <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Market Efficiency %" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-1">
                {[
                  { label: 'Friction ↓', color: 'bg-destructive' },
                  { label: 'Liquidity ↑', color: 'bg-chart-1' },
                  { label: 'Efficiency ↑', color: 'bg-primary' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <span className={cn("h-1.5 w-3 rounded-sm", l.color)} />
                    <span className="text-[7px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          {/* Phase Metrics */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-2" />{currentPhase.label} Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-2">
              <AnimatePresence mode="wait">
                {currentPhase.metrics.map((metric, i) => (
                  <motion.div key={`${activePhase}-${i}`}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg border border-border/15 bg-card/30"
                  >
                    <span className="text-[8px] text-muted-foreground">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-foreground tabular-nums">{metric.value}</span>
                      <span className="text-[7px] text-chart-1 tabular-nums">{metric.delta}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Evolution Progress */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />Evolution Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-2">
              {PHASES.map((phase, i) => {
                const progress = i === 0 ? 85 : i === 1 ? 42 : i === 2 ? 12 : 3;
                return (
                  <div key={phase.id} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-foreground">{phase.label}</span>
                      <span className="text-[7px] tabular-nums text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: i * 0.15, duration: 0.8 }}
                        className={cn("h-full rounded-full", `bg-${phase.color}`)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Narrative Shift */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-chart-3" />Narrative Evolution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {[
                { from: 'Property Listings', to: 'Market Intelligence', phase: 1 },
                { from: 'Transaction Platform', to: 'Economic Coordination', phase: 2 },
                { from: 'Regional Player', to: 'Global Infrastructure', phase: 3 },
                { from: 'Tech Startup', to: 'Economic Institution', phase: 3 },
              ].map((shift, i) => (
                <div key={i} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/15", activePhase >= shift.phase ? "bg-primary/5" : "bg-card/30")}>
                  <span className="text-[7px] text-muted-foreground w-24 truncate">{shift.from}</span>
                  <ArrowRight className={cn("h-2.5 w-2.5 shrink-0", activePhase >= shift.phase ? "text-chart-1" : "text-muted-foreground/30")} />
                  <span className={cn("text-[7px] font-medium w-28 truncate", activePhase >= shift.phase ? "text-foreground" : "text-muted-foreground/50")}>{shift.to}</span>
                  {activePhase >= shift.phase && <CheckCircle className="h-2.5 w-2.5 text-chart-1 shrink-0 ml-auto" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostMarketplaceEvolution;
