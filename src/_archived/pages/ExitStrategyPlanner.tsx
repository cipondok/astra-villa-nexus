import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, Shield, Target, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight, Download, Bell, GitCompare,
  Zap, Building2, Users, Landmark, Palmtree, ChevronRight,
  Calendar, DollarSign, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const exitConfidence = 82;

const timelineZones = [
  { label: 'Short Hold', range: '0–12 months', roi: '4–8%', risk: 'Higher', color: 'bg-amber-500', width: '25%' },
  { label: 'Optimal Window', range: '18–36 months', roi: '18–28%', risk: 'Low', color: 'bg-emerald-500', width: '40%' },
  { label: 'Extended Hold', range: '48–60+ months', roi: '30–45%', risk: 'Moderate', color: 'bg-blue-500', width: '35%' },
];

const projectionCurve = [
  { month: 'Now', value: 3.2 },
  { month: '6M', value: 3.35 },
  { month: '12M', value: 3.55 },
  { month: '18M', value: 3.85 },
  { month: '24M', value: 4.1 },
  { month: '36M', value: 4.5 },
  { month: '48M', value: 4.75 },
  { month: '60M', value: 5.1 },
];

const strategies = [
  {
    title: 'Early Flip Strategy',
    icon: Zap,
    roi: '4–8%',
    timeline: '6–12 months',
    liquidity: 'High',
    liquidityColor: 'text-emerald-600 dark:text-emerald-400',
    cycle: 'Counter-Cyclical',
    cycleColor: 'text-amber-600 dark:text-amber-400',
    description: 'Quick resale leveraging undervaluation gap. Best when buying below market in high-demand micro-zones.',
    accent: 'border-l-amber-500',
  },
  {
    title: 'Yield Harvest Strategy',
    icon: DollarSign,
    roi: '18–28%',
    timeline: '18–36 months',
    liquidity: 'Moderate',
    liquidityColor: 'text-blue-600 dark:text-blue-400',
    cycle: 'Cycle-Aligned',
    cycleColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Collect rental income then exit at peak demand. Optimal balance of yield and appreciation.',
    accent: 'border-l-emerald-500',
    recommended: true,
  },
  {
    title: 'Long-Term Appreciation',
    icon: TrendingUp,
    roi: '30–45%',
    timeline: '48–60+ months',
    liquidity: 'Lower',
    liquidityColor: 'text-amber-600 dark:text-amber-400',
    cycle: 'Full-Cycle',
    cycleColor: 'text-blue-600 dark:text-blue-400',
    description: 'Maximize capital gains through infrastructure catalysts and district maturation cycles.',
    accent: 'border-l-blue-500',
  },
];

const marketSignals = [
  { label: 'District Appreciation', value: '+8.4% YoY', score: 78, icon: BarChart3, status: 'Accelerating', statusColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Buyer Demand Cycle', value: 'Peak Phase', score: 85, icon: Users, status: 'Strong', statusColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Supply Pipeline', value: '12 new projects', score: 42, icon: Building2, status: 'Watch', statusColor: 'text-amber-600 dark:text-amber-400' },
  { label: 'Interest Rate Sensitivity', value: 'Low Impact', score: 71, icon: Landmark, status: 'Favorable', statusColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Lifestyle Demand Signal', value: 'High', score: 88, icon: Palmtree, status: 'Rising', statusColor: 'text-emerald-600 dark:text-emerald-400' },
];

const ExitStrategyPlanner = () => {
  const [activeStrategy, setActiveStrategy] = useState(1);
  const maxVal = Math.max(...projectionCurve.map(p => p.value));
  const minVal = Math.min(...projectionCurve.map(p => p.value));
  const range = maxVal - minVal || 1;

  const points = projectionCurve.map((p, i) => ({
    x: (i / (projectionCurve.length - 1)) * 100,
    y: 100 - ((p.value - minVal) / range) * 75 - 12,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-[10px]">STRATEGIC AI</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-2">AI Exit Strategy Planner</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Model future resale timing and maximize investment returns</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        {/* Main Projection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline + Curve */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6"
          >
            {/* Exit Timeline */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Exit Timing Zones</h2>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Target className="w-3 h-3" /> Optimal: 18–36 months
                </Badge>
              </div>
              <div className="flex rounded-xl overflow-hidden h-10">
                {timelineZones.map((zone, i) => (
                  <motion.div
                    key={zone.label}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                    style={{ width: zone.width, transformOrigin: 'left' }}
                    className={`${zone.color} flex items-center justify-center relative group cursor-pointer`}
                  >
                    <span className="text-[11px] font-semibold text-white">{zone.label}</span>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded-lg p-2 shadow-lg z-10 whitespace-nowrap">
                      <p className="text-[10px] text-muted-foreground">{zone.range} • ROI: {zone.roi} • Risk: {zone.risk}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">0 months</span>
                <span className="text-[10px] text-muted-foreground">60+ months</span>
              </div>
            </div>

            {/* Resale Value Projection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Estimated Resale Value Projection</h2>
                <span className="text-xs text-muted-foreground">IDR Billions</span>
              </div>
              <div className="relative h-48">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="exitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />
                  ))}
                  {/* Optimal zone highlight */}
                  <rect x="25" y="0" width="30" height="100" fill="hsl(var(--primary))" fillOpacity="0.04" />
                  <motion.path d={areaPath} fill="url(#exitFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
                  <motion.path
                    d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeOut' }}
                  />
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="hsl(var(--primary))" />
                  ))}
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                  {projectionCurve.map((p, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground">{p.month}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Purchase: <strong className="text-foreground">IDR 3.2B</strong></span>
                <span className="text-xs text-muted-foreground">Projected Peak: <strong className="text-foreground">IDR 5.1B</strong></span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +59% max projected return
                </span>
              </div>
            </div>
          </motion.div>

          {/* Confidence + AI Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6 space-y-5"
          >
            {/* Confidence Badge */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Exit Confidence</p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-28 h-28 rounded-full border-2 border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center justify-center mx-auto"
              >
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{exitConfidence}%</span>
                <span className="text-[10px] text-muted-foreground">Probability</span>
              </motion.div>
              <Badge className="mt-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-xs">
                Strong Exit Window
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">AI Insight</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Market conditions favor a <strong className="text-foreground">yield harvest exit</strong> at the 24–36 month window. District appreciation is accelerating and buyer demand remains strong.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Assumptions</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Appreciation rate</span><span className="text-foreground font-medium">8.4% YoY</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Holding cost</span><span className="text-foreground font-medium">~2.1% p.a.</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Transaction fees</span><span className="text-foreground font-medium">~5%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Demand trend</span><span className="text-emerald-600 dark:text-emerald-400 font-medium">Rising</span></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Strategy Scenario Cards */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Exit Strategy Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.map((strategy, i) => {
              const Icon = strategy.icon;
              const isActive = activeStrategy === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => setActiveStrategy(i)}
                  className={`relative p-5 rounded-2xl border bg-card cursor-pointer transition-all border-l-4 ${strategy.accent} ${
                    isActive ? 'border-primary/30 shadow-lg ring-1 ring-primary/10' : 'border-border hover:shadow-md'
                  }`}
                >
                  {strategy.recommended && (
                    <Badge className="absolute top-3 right-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-[10px]">
                      AI RECOMMENDED
                    </Badge>
                  )}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{strategy.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{strategy.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Est. ROI</span>
                      <span className="font-bold text-foreground">{strategy.roi}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Timeline</span>
                      <span className="font-medium text-foreground">{strategy.timeline}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Liquidity Risk</span>
                      <span className={`font-medium ${strategy.liquidityColor}`}>{strategy.liquidity}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Market Cycle</span>
                      <span className={`font-medium ${strategy.cycleColor}`}>{strategy.cycle}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Market Signal Grid */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Market Signal Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {marketSignals.map((signal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <signal.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{signal.label}</p>
                </div>
                <p className="text-base font-bold text-foreground">{signal.value}</p>
                <p className={`text-xs font-medium mt-1 ${signal.statusColor}`}>{signal.status}</p>
                <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${signal.score}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap pb-6">
          <Button onClick={() => toast.success('Comparing exit scenarios...')}>
            <GitCompare className="w-4 h-4 mr-2" /> Compare Exit Scenarios
          </Button>
          <Button variant="outline" onClick={() => toast.success('Exit alert configured')}>
            <Bell className="w-4 h-4 mr-2" /> Set Exit Alert
          </Button>
          <Button variant="outline" onClick={() => toast.success('Downloading strategic report...')}>
            <Download className="w-4 h-4 mr-2" /> Download Strategic Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExitStrategyPlanner;
