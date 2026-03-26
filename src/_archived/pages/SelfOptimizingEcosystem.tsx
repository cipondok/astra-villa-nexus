import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, TrendingUp, Zap, Globe, BarChart3, Users, ArrowRight,
  CircleDot, Layers, Target, Shield, Gauge, Radio, Eye, Settings, FileText,
  RefreshCw, ChevronRight, Cpu, Network, Workflow
} from 'lucide-react';
import Shell from '@/components/Shell';

/* ── live ticker ── */
function useTick(ms = 2000) {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT(p => p + 1), ms); return () => clearInterval(i); }, [ms]);
  return t;
}

/* ── neural bg ── */
const NeuralBg = () => {
  const nodes = React.useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, r: 1 + Math.random() * 2,
  })), []);
  const edges = React.useMemo(() => {
    const e: { x1: number; y1: number; x2: number; y2: number }[] = [];
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 18) e.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      });
    });
    return e;
  }, [nodes]);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="hsl(var(--primary))" strokeWidth="0.15">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodes.map(n => (
        <circle key={n.id} cx={n.x} cy={n.y} r={n.r * 0.3} fill="hsl(var(--primary))">
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + (n.id % 3)}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
};

/* ── gauge arc ── */
const StabilityGauge = ({ value }: { value: number }) => {
  const r = 70, cx = 85, cy = 85;
  const arc = Math.PI * 1.5;
  const circumference = r * arc;
  const offset = circumference * (1 - value / 100);
  return (
    <svg viewBox="0 0 170 140" className="w-full max-w-[220px]">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none" stroke="hsl(var(--border))" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-1000" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }} />
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-foreground text-2xl font-bold">{value}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted-foreground text-[8px] uppercase tracking-widest">Stability</text>
    </svg>
  );
};

/* ── feedback loop ── */
const loopStages = ['Market Signals', 'AI Analysis', 'Strategic Adjustment', 'Performance Learning'];
const FeedbackLoop = () => {
  const tick = useTick(2500);
  const active = tick % 4;
  const r = 90, cx = 110, cy = 110;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 220" className="w-full max-w-[260px]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="2" opacity="0.2" />
        {loopStages.map((s, i) => {
          const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isActive = i === active;
          return (
            <g key={s}>
              <circle cx={x} cy={y} r={isActive ? 18 : 14} fill={isActive ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--muted) / 0.3)'}
                stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'} strokeWidth={isActive ? 2 : 1}
                className="transition-all duration-500" />
              {isActive && <circle cx={x} cy={y} r={22} fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
              </circle>}
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                className={`text-[6px] font-medium ${isActive ? 'fill-primary' : 'fill-muted-foreground'}`}>
                {i + 1}
              </text>
            </g>
          );
        })}
        {/* arrows */}
        {[0, 1, 2, 3].map(i => {
          const a1 = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / 4) * Math.PI * 2 - Math.PI / 2;
          const mid = (a1 + a2) / 2;
          const mx = cx + (r - 2) * Math.cos(mid);
          const my = cy + (r - 2) * Math.sin(mid);
          return (
            <circle key={i} cx={mx} cy={my} r="2" fill={i === active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={i === active ? 1 : 0.3}>
              {i === active && <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
            </circle>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        {loopStages.map((s, i) => (
          <span key={s} className={`text-xs px-2 py-1 rounded-full border transition-all duration-500 ${i === active
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-border/30 bg-muted/20 text-muted-foreground'}`}>
            {i + 1}. {s}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── main ── */
const optimizationCards = [
  { icon: TrendingUp, title: 'Supply Acquisition', subtitle: 'Self-tuning signal', value: 87, delta: '+4.2%', status: 'Accelerating' },
  { icon: Users, title: 'Investor Engagement', subtitle: 'Reinforcement indicator', value: 74, delta: '+6.8%', status: 'Strengthening' },
  { icon: Zap, title: 'Deal Conversion', subtitle: 'Efficiency evolution', value: 68, delta: '+2.1%', status: 'Optimizing' },
  { icon: Radio, title: 'Market Narrative', subtitle: 'Influence strength', value: 81, delta: '+3.5%', status: 'Expanding' },
  { icon: Layers, title: 'Capital Allocation', subtitle: 'Optimization feedback', value: 79, delta: '+1.9%', status: 'Balancing' },
  { icon: Globe, title: 'Regional Expansion', subtitle: 'Readiness index', value: 62, delta: '+5.3%', status: 'Emerging' },
];

const autonomyToggles = [
  { label: 'Full Ecosystem Self-Optimization', icon: Cpu, default: true },
  { label: 'Growth Acceleration Override', icon: TrendingUp, default: false },
  { label: 'Risk Stabilization Mode', icon: Shield, default: true },
];

export default function SelfOptimizingEcosystem() {
  const tick = useTick(3000);
  const [toggles, setToggles] = useState(autonomyToggles.map(t => t.default));
  const stabilityBase = 92;
  const stability = stabilityBase + (tick % 3) - 1;

  const liquidityPoints = React.useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({ x: i, y: 40 + Math.sin(i * 0.5) * 25 + Math.random() * 10 })), []);

  const growthCurve = React.useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({ x: i, y: 15 + i * 3.2 + Math.sin(i * 0.4) * 8 })), []);

  return (
    <Shell>
      <div className="relative min-h-screen">
        <NeuralBg />
        <div className="relative z-10 space-y-6 max-w-7xl mx-auto">

          {/* header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs mb-2">
              <Workflow className="w-3 h-3" /> Autonomous System Active
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Autonomous Investment Ecosystem</h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              AI continuously optimizing real estate marketplace performance and opportunity flow
            </p>
          </motion.div>

          {/* ecosystem health core */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* stability gauge */}
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 flex flex-col items-center gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ecosystem Stability</h3>
              <StabilityGauge value={stability} />
              <span className="text-xs text-primary font-medium">● Adaptive Equilibrium</span>
            </div>

            {/* liquidity loop */}
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Liquidity Circulation</h3>
              <svg viewBox="0 0 200 100" className="w-full h-24">
                <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5"
                  points={liquidityPoints.map(p => `${p.x * 10},${p.y}`).join(' ')}
                  style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
                <polyline fill="url(#liqGrad)" stroke="none"
                  points={`0,95 ${liquidityPoints.map(p => `${p.x * 10},${p.y}`).join(' ')} 190,95`} />
                <defs>
                  <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted-foreground">Flow Rate</span>
                <span className="text-primary font-medium">$4.2M / cycle</span>
              </div>
            </div>

            {/* growth curve */}
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Growth Acceleration</h3>
              <svg viewBox="0 0 240 100" className="w-full h-24">
                <polyline fill="none" stroke="hsl(var(--chart-2, var(--primary)))" strokeWidth="1.5"
                  points={growthCurve.map(p => `${p.x * 10},${100 - p.y}`).join(' ')}
                  style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.3))' }} />
                <polyline fill="url(#growGrad)" stroke="none"
                  points={`0,100 ${growthCurve.map(p => `${p.x * 10},${100 - p.y}`).join(' ')} 230,100`} />
                <defs>
                  <linearGradient id="growGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted-foreground">24-mo trajectory</span>
                <span className="text-emerald-500 font-medium">+312% projected</span>
              </div>
            </div>
          </motion.div>

          {/* optimization grid */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" /> Adaptive Optimization Grid
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {optimizationCards.map((card, i) => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 hover:border-primary/30 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <card.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{card.title}</p>
                        <p className="text-[10px] text-muted-foreground">{card.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-500 font-medium">{card.delta}</span>
                  </div>
                  {/* bar */}
                  <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${card.value}%` }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.06 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                      style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.3)' }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px]">
                    <span className="text-muted-foreground">{card.status}</span>
                    <span className="text-foreground font-medium">{card.value}/100</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* feedback loop + autonomy controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" /> Autonomous Feedback Loop
              </h3>
              <FeedbackLoop />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> Strategic Autonomy Controls
              </h3>
              <div className="flex flex-col gap-3 flex-1 justify-center">
                {autonomyToggles.map((t, i) => (
                  <button key={t.label} onClick={() => setToggles(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <t.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{t.label}</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${toggles[i] ? 'bg-primary' : 'bg-muted/40'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${toggles[i] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                ))}
              </div>
              {/* AI narrative */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-auto">
                <p className="text-xs text-primary/90 flex items-start gap-2">
                  <Brain className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Ecosystem self-optimization is active. Supply acquisition reinforcement loop has improved listing velocity by 18% this cycle. Risk stabilization is dampening volatility in emerging corridors.</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* action controls */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            className="flex flex-wrap gap-3 justify-center pb-8">
            {[
              { label: 'Observe Intelligence Simulation', icon: Eye },
              { label: 'Adjust Ecosystem Priorities', icon: Target },
              { label: 'Generate Autonomous Strategy Report', icon: FileText },
            ].map(a => (
              <button key={a.label}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 hover:border-primary/50 transition-all">
                <a.icon className="w-4 h-4" /> {a.label} <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </Shell>
  );
}
