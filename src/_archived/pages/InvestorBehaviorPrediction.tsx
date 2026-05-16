import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Eye, Target, TrendingUp, Heart, MapPin, DollarSign,
  Clock, Lightbulb, Download, Zap, BarChart3, Users,
  ArrowUpRight, Activity, Search, Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const engagementProb = 76;
const conversionReady = 64;
const momentumData = [30, 35, 42, 38, 48, 55, 52, 60, 58, 65, 72, 76];

const signals = [
  { label: 'Interaction Frequency', value: 82, detail: 'Avg 14 listings viewed/session', icon: Eye, trend: '+18%' },
  { label: 'Watchlist Clustering', value: 71, detail: 'Strong Bali coastal concentration', icon: Heart, trend: '+9%' },
  { label: 'Price Sensitivity', value: 45, detail: 'Low — premium segment tolerance', icon: DollarSign, trend: '-4%' },
  { label: 'Location Affinity', value: 88, detail: 'South Bali + South Jakarta dominant', icon: MapPin, trend: '+22%' },
  { label: 'Yield vs Growth Bias', value: 63, detail: 'Growth-leaning with yield floor', icon: TrendingUp, trend: '+5%' },
  { label: 'Negotiation Timing', value: 57, detail: 'Pre-negotiation signals emerging', icon: Clock, trend: '+12%' },
];

const segments = [
  { name: 'Passive Observers', pct: 32, count: 1240, color: 'bg-slate-400', desc: 'Browse-only, low engagement depth', conversion: '4%' },
  { name: 'Strategic Evaluators', pct: 38, count: 1480, color: 'bg-sky-500', desc: 'Deep analysis, watchlist-heavy', conversion: '18%' },
  { name: 'Active Negotiators', pct: 22, count: 860, color: 'bg-amber-500', desc: 'Inquiry-active, price-comparing', conversion: '42%' },
  { name: 'Immediate Closers', pct: 8, count: 310, color: 'bg-emerald-500', desc: 'High intent, transaction-ready', conversion: '78%' },
];

const curveToPath = (data: number[], w: number, h: number) => {
  const max = Math.max(...data);
  return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
};

const InvestorBehaviorPrediction = () => {
  const [activeSegment, setActiveSegment] = useState(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle neural ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_60%_20%,hsl(210,60%,96%,0.6),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_25%_at_30%_70%,hsl(190,50%,96%,0.4),transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                    <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <Badge className="bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 text-[9px] uppercase tracking-widest font-medium">
                    Prediction Engine
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                  Investor Behavior Intelligence
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Predicting deal engagement patterns using behavioral signals
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE MODEL
                </span>
                <span className="px-2.5 py-1 rounded-full border border-border text-muted-foreground">3,890 investors tracked</span>
                <Button variant="outline" className="text-[10px] h-7 px-3" onClick={() => toast.success('Behavior report exported')}>
                  <Download className="w-3 h-3 mr-1.5" /> EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Prediction Score Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engagement Probability */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">Engagement Probability</p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                    <motion.circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="hsl(270,60%,55%)" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - engagementProb / 100) }}
                      transition={{ duration: 1.2 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{engagementProb}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">High Engagement</p>
                  <p className="text-[10px] text-muted-foreground">Investors likely to act within 7 days</p>
                </div>
              </div>
            </motion.div>

            {/* Conversion Readiness */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">Conversion Readiness</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold">{conversionReady}</span>
                <span className="text-muted-foreground text-sm pb-1">/100</span>
              </div>
              <Progress value={conversionReady} className="h-1.5 mb-2" />
              <p className="text-[10px] text-muted-foreground">Moderate — needs 1–2 more engagement touchpoints</p>
            </motion.div>

            {/* Behavioral Momentum */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">Behavioral Momentum</p>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-600">Accelerating</span>
              </div>
              <svg width="100%" height="45" viewBox="0 0 200 45" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="momentum-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(270,60%,55%)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(270,60%,55%)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#momentum-fill)" points={`0,45 ${curveToPath(momentumData, 200, 40)} 200,45`} />
                <motion.polyline
                  fill="none" stroke="hsl(270,60%,55%)" strokeWidth="2"
                  points={curveToPath(momentumData, 200, 40)}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <p className="text-[9px] text-muted-foreground mt-1">12-week engagement trend</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Signal Grid + Segments */}
            <div className="lg:col-span-2 space-y-5">
              {/* Signal Analytics Grid */}
              <div>
                <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Behavioral Signal Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {signals.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="p-3.5 rounded-xl border border-border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className={`text-[9px] font-semibold ${
                          s.trend.startsWith('+') ? 'text-emerald-600' : s.trend.startsWith('-') ? 'text-rose-500' : 'text-muted-foreground'
                        }`}>
                          {s.trend}
                        </span>
                      </div>
                      <p className="text-lg font-bold">{s.value}</p>
                      <div className="w-full h-1 rounded-full bg-muted overflow-hidden mt-1.5 mb-2">
                        <motion.div
                          className="h-full rounded-full bg-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${s.value}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                        />
                      </div>
                      <p className="text-[9px] font-medium">{s.label}</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{s.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Segment Insight Panel */}
              <div>
                <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Predicted Behavior Segments</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {segments.map((seg, i) => {
                    const isActive = activeSegment === i;
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                        onClick={() => setActiveSegment(i)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isActive ? 'border-violet-300 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-500/5' : 'border-border bg-card hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                          <span className="text-[10px] font-semibold">{seg.name}</span>
                        </div>
                        <p className="text-2xl font-bold mb-0.5">{seg.pct}%</p>
                        <p className="text-[9px] text-muted-foreground mb-1.5">{seg.count.toLocaleString()} investors</p>
                        <p className="text-[8px] text-muted-foreground">{seg.desc}</p>
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="flex justify-between text-[8px]">
                            <span className="text-muted-foreground">Conversion</span>
                            <span className="font-semibold">{seg.conversion}</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Segment distribution bar */}
                <div className="mt-3 flex rounded-full overflow-hidden h-2">
                  {segments.map((seg, i) => (
                    <motion.div
                      key={i}
                      className={`${seg.color} h-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${seg.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {segments.map((seg, i) => (
                    <span key={i} className="text-[7px] text-muted-foreground flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${seg.color} inline-block`} /> {seg.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Narrative + Actions */}
            <div className="space-y-5">
              {/* AI Behavior Narrative */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-violet-200 dark:border-violet-500/15 bg-violet-50/30 dark:bg-violet-500/[0.03] p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">AI Behavior Narrative</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    "Users showing repeated engagement with <span className="text-foreground font-medium">rental yield listings</span> have
                    <span className="text-violet-700 dark:text-violet-400 font-medium"> 3.2x higher probability</span> of short-term inquiry action."
                  </p>
                  <div className="h-px bg-border" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    "Strategic Evaluators who save <span className="text-foreground font-medium">3+ properties in one session</span> convert to
                    Active Negotiators within <span className="text-emerald-600 font-medium">12 days on average</span>."
                  </p>
                  <div className="h-px bg-border" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    "Price sensitivity drops <span className="text-amber-600 font-medium">28%</span> once an investor views
                    detailed ROI projections — suggesting analytics exposure accelerates conversion."
                  </p>
                </div>
              </motion.div>

              {/* Prediction Accuracy */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Model Performance</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Engagement Prediction Accuracy', value: '84%' },
                    { label: 'Conversion Forecast Precision', value: '72%' },
                    { label: 'Segment Classification F1', value: '0.89' },
                    { label: 'Avg Lead Time Prediction', value: '±3.2 days' },
                    { label: 'Model Last Retrained', value: '6 hours ago' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-semibold">{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <Button
                  className="w-full text-[10px] uppercase tracking-widest font-medium bg-violet-600 hover:bg-violet-500 text-white"
                  onClick={() => toast.success('Personalized deal alerts triggered for high-intent investors')}
                >
                  <Zap className="w-3.5 h-3.5 mr-2" /> Trigger Deal Alerts
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Matching strategy optimized based on behavior signals')}
                >
                  <Crosshair className="w-3.5 h-3.5 mr-2" /> Optimize Matching
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Behavior Intelligence Report exported')}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Export Report
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorBehaviorPrediction;
