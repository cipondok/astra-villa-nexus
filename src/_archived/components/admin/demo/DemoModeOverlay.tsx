import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDemoMode, DEMO_SCENES } from '@/contexts/DemoModeContext';
import {
  TrendingUp, Zap, MapPin, BarChart3, Brain,
} from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ── Mini visualizations for each scene ──

function OpportunityScoreRing() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="52" fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - 0.92) }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-primary"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            92
          </motion.span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-foreground">Villa Canggu Premium</p>
        <p className="text-[10px] text-chart-1">23% below market value</p>
      </div>
    </div>
  );
}

function HeatMapPulse() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {[80, 60, 40].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${size}%`,
            height: `${size}%`,
            background: `radial-gradient(circle, hsl(var(--chart-1) / ${0.3 - i * 0.08}), transparent)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}
      <MapPin className="h-6 w-6 text-chart-1 relative z-10" />
    </div>
  );
}

function PredictionChart() {
  const data = useMemo(() => [
    { m: 0, v: 100 }, { m: 2, v: 103 }, { m: 4, v: 106 },
    { m: 6, v: 109 }, { m: 8, v: 113 }, { m: 10, v: 116 }, { m: 12, v: 118.5 },
  ], []);
  return (
    <div className="w-48 h-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#predGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-center text-chart-1 font-bold mt-1">+18.5% projected growth</p>
    </div>
  );
}

function PortfolioGrowth() {
  const data = useMemo(() => [
    { m: 'Q1', roi: 8 }, { m: 'Q2', roi: 11 }, { m: 'Q3', roi: 14.2 }, { m: 'Q4', roi: 17.3 },
  ], []);
  return (
    <div className="w-48 h-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="roi" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--chart-1))' }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-center text-chart-1 font-bold mt-1">Portfolio IRR: 12% → 17.3%</p>
    </div>
  );
}

function AdvisorRadar() {
  const data = useMemo(() => [
    { s: 'Value', v: 92 }, { s: 'Growth', v: 85 }, { s: 'Yield', v: 78 },
    { s: 'Risk', v: 88 }, { s: 'Timing', v: 94 },
  ], []);
  return (
    <div className="w-40 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border) / 0.3)" />
          <PolarAngleAxis dataKey="s" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} />
          <Radar dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-center text-primary font-bold">Confidence: 94%</p>
    </div>
  );
}

const SCENE_VISUALS: Record<string, { icon: React.ElementType; visual: React.ReactNode; color: string }> = {
  opportunity: { icon: Zap, visual: <OpportunityScoreRing />, color: 'text-primary' },
  heatmap: { icon: MapPin, visual: <HeatMapPulse />, color: 'text-chart-1' },
  prediction: { icon: TrendingUp, visual: <PredictionChart />, color: 'text-primary' },
  portfolio: { icon: BarChart3, visual: <PortfolioGrowth />, color: 'text-chart-1' },
  advisor: { icon: Brain, visual: <AdvisorRadar />, color: 'text-primary' },
};

/**
 * Floating overlay that shows scene-specific AI visualizations
 * during demo mode. Positioned top-right, doesn't block main content.
 */
const DemoModeOverlay: React.FC = () => {
  const { isActive, currentScene } = useDemoMode();

  if (!isActive) return null;

  const scene = DEMO_SCENES[currentScene];
  const visual = SCENE_VISUALS[scene.id];
  if (!visual) return null;

  const Icon = visual.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, x: 30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-20 right-4 z-[9980] w-56"
      >
        <div className="rounded-2xl border border-primary/20 bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-primary via-chart-1 to-chart-4" />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn('h-4 w-4', visual.color)} />
              <span className="text-[10px] font-bold text-foreground">{scene.title}</span>
            </div>
            <div className="flex items-center justify-center">
              {visual.visual}
            </div>
            <p className="text-[8px] text-muted-foreground text-center mt-3">{scene.description}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(DemoModeOverlay);
