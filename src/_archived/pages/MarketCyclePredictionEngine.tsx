import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, BarChart3, Users, Building2,
  Target, Zap, Globe, ArrowUpRight, ArrowDownRight, Download,
  Bell, Layers, Lightbulb, Gauge, CreditCard, Plane, Package,
  DollarSign, LineChart, Clock, ChevronRight, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const phases = [
  { name: 'Early Recovery', angle: -126, color: '#22d3ee', desc: 'Sentiment bottoms, early signals emerge' },
  { name: 'Expansion', angle: -54, color: '#22c55e', desc: 'Demand accelerates, prices rise steadily' },
  { name: 'Peak', angle: 18, color: '#f59e0b', desc: 'Maximum activity, yield compression' },
  { name: 'Correction', angle: 90, color: '#ef4444', desc: 'Momentum slows, price resistance builds' },
  { name: 'Stabilization', angle: 162, color: '#8b5cf6', desc: 'Market finds floor, volume contracts' },
];

const currentPhaseIdx = 1;
const currentConfidence = 82;
const cycleProgress = 0.35;

const macroSignals = [
  { label: 'Investor Demand Momentum', value: '+24%', trend: 'up', icon: Users, detail: 'QoQ inquiry velocity', spark: [40, 45, 52, 58, 62, 70, 78, 85, 90, 96] },
  { label: 'Credit Environment', value: 'Easing', trend: 'up', icon: CreditCard, detail: 'BI rate stable at 6.0%', spark: [80, 78, 75, 72, 70, 68, 66, 64, 62, 60] },
  { label: 'Tourism & Migration Flow', value: '+31%', trend: 'up', icon: Plane, detail: 'International arrivals YoY', spark: [30, 38, 45, 50, 58, 62, 70, 78, 85, 92] },
  { label: 'New Supply Pipeline', value: 'Moderate', trend: 'neutral', icon: Package, detail: '12,400 units in pipeline', spark: [60, 62, 64, 65, 66, 65, 64, 66, 67, 68] },
  { label: 'Pricing Acceleration', value: '+8.2%', trend: 'up', icon: DollarSign, detail: 'Annualized price growth', spark: [20, 28, 35, 40, 48, 55, 60, 68, 74, 82] },
];

const trendColors: Record<string, string> = { up: 'text-emerald-400', down: 'text-rose-400', neutral: 'text-amber-400' };

const SparkLine = ({ data, color = '#22d3ee' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-70">
      <defs>
        <linearGradient id={`sl-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#sl-${color.replace('#', '')})`} points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>
  );
};

const MarketCyclePredictionEngine = () => {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(225,28%,5%)] text-slate-100">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_30%,hsl(190,50%,8%,0.5),transparent)]" />
        <motion.div
          className="absolute top-[20%] left-[30%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(190,70%,40%,0.04) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-cyan-500/10">
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                    animate={{ boxShadow: ['0 0 12px hsl(190,80%,50%,0.08)', '0 0 22px hsl(190,80%,50%,0.15)', '0 0 12px hsl(190,80%,50%,0.08)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Compass className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> MACRO INTELLIGENCE
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                  AI Market Cycle Intelligence
                </h1>
                <p className="text-sm text-slate-500 mt-1">Forecasting property demand phases and investment timing windows</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 text-xs" onClick={() => toast.success('Cycle alerts activated')}>
                  <Bell className="w-4 h-4 mr-2" /> Follow Alerts
                </Button>
                <Button className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white border-0 text-xs" onClick={() => toast.success('Macro report downloaded')}>
                  <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* Cycle Visualization + Current Position */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Cycle Wheel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.03] to-transparent p-6"
            >
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-6">Property Market Cycle Position</h3>
              <div className="flex items-center justify-center">
                <div className="relative" style={{ width: 340, height: 340 }}>
                  {/* Background ring */}
                  <svg width="340" height="340" viewBox="0 0 340 340" className="absolute inset-0">
                    <circle cx="170" cy="170" r="130" fill="none" stroke="hsl(210,20%,12%)" strokeWidth="18" />
                    {/* Phase arcs */}
                    {phases.map((phase, i) => {
                      const startAngle = -162 + i * 72;
                      const endAngle = startAngle + 72;
                      const r = 130;
                      const toRad = (d: number) => (d * Math.PI) / 180;
                      const x1 = 170 + r * Math.cos(toRad(startAngle));
                      const y1 = 170 + r * Math.sin(toRad(startAngle));
                      const x2 = 170 + r * Math.cos(toRad(endAngle));
                      const y2 = 170 + r * Math.sin(toRad(endAngle));
                      const isActive = i === currentPhaseIdx;
                      const isHovered = hoveredPhase === i;
                      return (
                        <g key={i}
                          onMouseEnter={() => setHoveredPhase(i)}
                          onMouseLeave={() => setHoveredPhase(null)}
                          className="cursor-pointer"
                        >
                          <path
                            d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                            fill="none"
                            stroke={phase.color}
                            strokeWidth={isActive || isHovered ? 20 : 16}
                            opacity={isActive ? 1 : isHovered ? 0.7 : 0.25}
                            strokeLinecap="round"
                            style={{ transition: 'all 0.3s ease' }}
                          />
                        </g>
                      );
                    })}
                    {/* Current position dot */}
                    {(() => {
                      const posAngle = -162 + currentPhaseIdx * 72 + cycleProgress * 72;
                      const r = 130;
                      const rad = (posAngle * Math.PI) / 180;
                      const cx = 170 + r * Math.cos(rad);
                      const cy = 170 + r * Math.sin(rad);
                      return (
                        <>
                          <motion.circle
                            cx={cx} cy={cy} r="14"
                            fill={phases[currentPhaseIdx].color}
                            opacity={0.2}
                            animate={{ r: [14, 20, 14] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <circle cx={cx} cy={cy} r="8" fill={phases[currentPhaseIdx].color} stroke="hsl(225,28%,5%)" strokeWidth="3" />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Phase labels */}
                  {phases.map((phase, i) => {
                    const midAngle = -162 + i * 72 + 36;
                    const r = 165;
                    const rad = (midAngle * Math.PI) / 180;
                    const x = 170 + r * Math.cos(rad);
                    const y = 170 + r * Math.sin(rad);
                    const isActive = i === currentPhaseIdx;
                    return (
                      <div
                        key={i}
                        className="absolute text-center pointer-events-none"
                        style={{
                          left: x,
                          top: y,
                          transform: 'translate(-50%, -50%)',
                          width: 90,
                        }}
                      >
                        <p className={`text-[10px] font-semibold ${isActive ? 'text-white' : 'text-slate-500'}`} style={isActive ? { color: phase.color } : {}}>
                          {phase.name}
                        </p>
                      </div>
                    );
                  })}

                  {/* Center info */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Phase</p>
                      <p className="text-lg font-bold" style={{ color: phases[currentPhaseIdx].color }}>
                        {phases[currentPhaseIdx].name}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-white">{currentConfidence}%</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">confidence</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase detail on hover */}
              <div className="mt-4 h-10 flex items-center justify-center">
                {hoveredPhase !== null && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-slate-400 text-center"
                  >
                    <span className="font-medium" style={{ color: phases[hoveredPhase].color }}>{phases[hoveredPhase].name}:</span>{' '}
                    {phases[hoveredPhase].desc}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Current Position Detail + Projections */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Phase Detail */}
              <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.04] to-transparent p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-300">Expansion Phase Active</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Demand is accelerating across key segments. Prices are rising steadily with strong absorption rates.
                  This phase typically lasts 18–30 months in Indonesian markets.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Phase Duration', value: '~24mo' },
                    { label: 'Time in Phase', value: '8 months' },
                    { label: 'Phase Progress', value: '35%' },
                    { label: 'Next Phase', value: 'Peak' },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-sm font-bold text-white">{s.value}</p>
                      <p className="text-[9px] text-slate-600">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Future Scenario Projections */}
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6">
                <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">12-Month Projections</h3>
                <div className="space-y-4">
                  {/* Demand Outlook */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400">Demand Outlook</span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Accelerating
                      </span>
                    </div>
                    <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="demFill" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(160,70%,45%)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="hsl(160,70%,45%)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d="M0,35 Q30,30 60,26 T120,18 T200,6"
                        fill="none" stroke="hsl(160,70%,45%)" strokeWidth="2"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                      <path d="M0,35 Q30,30 60,26 T120,18 T200,6 V40 H0 Z" fill="url(#demFill)" />
                      {/* Confidence band */}
                      <path d="M0,38 Q30,34 60,30 T120,24 T200,14 L200,0 Q160,10 120,12 T60,22 T0,32 Z" fill="hsl(160,70%,45%)" opacity="0.06" />
                    </svg>
                  </div>

                  {/* Yield Compression */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400">Yield Compression</span>
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> -40bps expected
                      </span>
                    </div>
                    <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="yldFill" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(45,90%,50%)" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="hsl(45,90%,50%)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d="M0,10 Q40,12 80,16 T160,26 T200,32"
                        fill="none" stroke="hsl(45,90%,50%)" strokeWidth="2"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                      />
                      <path d="M0,10 Q40,12 80,16 T160,26 T200,32 V40 H0 Z" fill="url(#yldFill)" />
                    </svg>
                  </div>

                  {/* Liquidity Cycle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400">Liquidity Cycle</span>
                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Peak in ~6mo
                      </span>
                    </div>
                    <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="liqFill" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(190,80%,50%)" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="hsl(190,80%,50%)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d="M0,30 Q40,18 80,10 T140,8 Q170,10 200,22"
                        fill="none" stroke="hsl(190,80%,50%)" strokeWidth="2"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                      />
                      <path d="M0,30 Q40,18 80,10 T140,8 Q170,10 200,22 V40 H0 Z" fill="url(#liqFill)" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Macro Signal Grid + AI Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Signal Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Macro Signal Analytics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {macroSignals.map((signal, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="p-4 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-1.5 rounded-lg bg-white/5">
                        <signal.icon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className={`text-xs font-semibold ${trendColors[signal.trend]}`}>
                        {signal.value}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white mb-0.5">{signal.label}</p>
                    <p className="text-[10px] text-slate-500 mb-3">{signal.detail}</p>
                    <SparkLine
                      data={signal.spark}
                      color={signal.trend === 'up' ? '#22c55e' : signal.trend === 'down' ? '#ef4444' : '#f59e0b'}
                    />
                  </motion.div>
                ))}

                {/* Summary card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-4 rounded-xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.05] to-transparent flex flex-col justify-center"
                >
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Composite Macro Score</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">74</p>
                    <p className="text-[10px] text-slate-600 mt-1">out of 100 — Favorable</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] mt-2">EXPANSION ALIGNED</Badge>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* AI Narrative + Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-5"
            >
              {/* AI Narrative */}
              <div className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider">AI Macro Narrative</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    "Urban rental segments are entering <span className="text-emerald-400 font-medium">early expansion phase</span> with
                    improving investor sentiment. Credit conditions remain accommodative with BI rate
                    holding steady."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    "Bali tourism corridors show <span className="text-cyan-300 font-medium">strongest momentum</span> — 
                    recommend increasing exposure before yield compression narrows the entry window.
                    <span className="text-amber-300 font-medium"> Peak phase expected in 14–18 months.</span>"
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    "New supply pipeline remains moderate, reducing oversupply risk and supporting
                    <span className="text-white font-medium"> sustained pricing acceleration</span> through mid-2027."
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-1">Strategic Actions</h3>
                <Button
                  className="w-full justify-start bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 hover:from-cyan-500 hover:to-emerald-500 text-white border-0 text-xs"
                  onClick={() => toast.success('Portfolio strategy aligned to expansion phase')}
                >
                  <Target className="w-4 h-4 mr-2" /> Align Portfolio Strategy
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                  onClick={() => toast.success('Cycle alerts activated for all segments')}
                >
                  <Bell className="w-4 h-4 mr-2" /> Follow Cycle Alerts
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                  onClick={() => toast.success('Macro intelligence report exported')}
                >
                  <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCyclePredictionEngine;
