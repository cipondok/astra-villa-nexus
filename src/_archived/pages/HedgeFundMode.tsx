import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, Shield, Zap, BarChart3, Target,
  Layers, ArrowUpRight, ArrowDownRight, Download, Lightbulb,
  Crosshair, Gauge, LineChart, DollarSign, Globe, Eye,
  Flame, Droplets, BarChart, PieChart, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const alphaValue = 4.2;
const sharpeRatio = 1.84;
const maxDrawdown = -3.1;

const positioning = [
  { label: 'Undervalued Accumulation', value: 82, signal: '14 assets flagged', icon: Target, color: 'from-cyan-500 to-blue-500' },
  { label: 'Yield Compression Zones', value: 71, signal: '3 corridors active', icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
  { label: 'Liquidity Rotation', value: 88, signal: 'Strong exit flow', icon: Droplets, color: 'from-emerald-500 to-green-500' },
  { label: 'Macro Cycle Position', value: 76, signal: 'Expansion phase', icon: Activity, color: 'from-violet-500 to-purple-500' },
  { label: 'Geographic Diversification', value: 65, signal: '4 markets active', icon: Globe, color: 'from-blue-500 to-indigo-500' },
  { label: 'Sentiment Momentum', value: 91, signal: 'Bullish acceleration', icon: Flame, color: 'from-rose-500 to-pink-500' },
];

interface Strategy {
  name: string;
  desc: string;
  returnBand: string;
  volatility: string;
  volLevel: 'Low' | 'Medium' | 'High';
  liquidity: number;
  icon: typeof Zap;
  color: string;
  accent: string;
}

const strategies: Strategy[] = [
  { name: 'Income Yield Dominance', desc: 'Maximize stable cash flow from rental-producing assets', returnBand: '6.8–9.2%', volatility: '±1.4%', volLevel: 'Low', liquidity: 85, icon: DollarSign, color: 'border-emerald-500/20', accent: 'text-emerald-400' },
  { name: 'Growth Alpha Capture', desc: 'Target capital appreciation in high-momentum corridors', returnBand: '12–18%', volatility: '±4.8%', volLevel: 'Medium', liquidity: 68, icon: TrendingUp, color: 'border-cyan-500/20', accent: 'text-cyan-400' },
  { name: 'Opportunistic Distressed', desc: 'Acquire undervalued assets during market dislocations', returnBand: '18–28%', volatility: '±8.2%', volLevel: 'High', liquidity: 42, icon: Crosshair, color: 'border-amber-500/20', accent: 'text-amber-400' },
];

const volColors = { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-rose-400' };

const returnCurve = [0, 0.8, 1.2, 0.9, 1.8, 2.4, 2.1, 2.8, 3.2, 3.0, 3.6, 4.2];
const benchmarkCurve = [0, 0.4, 0.7, 0.5, 1.0, 1.3, 1.1, 1.5, 1.7, 1.6, 1.9, 2.1];

const HedgeFundMode = () => {
  const [activeStrategy, setActiveStrategy] = useState(1);

  const curveToPath = (data: number[], w: number, h: number, maxVal: number) => {
    return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / maxVal) * h}`).join(' ');
  };

  const w = 320;
  const h = 100;
  const maxVal = 5;

  return (
    <div className="min-h-screen bg-[hsl(225,30%,4%)] text-slate-100 font-mono">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,hsl(190,40%,6%,0.6),transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-cyan-500/8">
          <div className="max-w-[1440px] mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
                    <BarChart className="w-5 h-5 text-cyan-400" />
                  </div>
                  <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] uppercase tracking-widest">
                    HEDGE FUND MODE
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-slate-300 bg-clip-text text-transparent">
                  AI Property Alpha Command
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 tracking-wide">Institutional-grade intelligence for generating real estate investment alpha</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </div>
                <span>MKT: EXPANSION</span>
                <span>VOL: LOW</span>
                <Button variant="outline" className="border-white/10 text-slate-400 hover:bg-white/5 text-[10px] h-7 px-3" onClick={() => toast.success('Alpha report exported')}>
                  <Download className="w-3 h-3 mr-1.5" /> EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-6">
          {/* Top Alpha Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            {[
              { label: 'PORTFOLIO α', value: `+${alphaValue}%`, color: 'text-emerald-400' },
              { label: 'SHARPE', value: sharpeRatio.toFixed(2), color: 'text-cyan-400' },
              { label: 'MAX DD', value: `${maxDrawdown}%`, color: 'text-rose-400' },
              { label: 'SORTINO', value: '2.41', color: 'text-cyan-400' },
              { label: 'WIN RATE', value: '74%', color: 'text-emerald-400' },
              { label: 'AVG HOLD', value: '8.2mo', color: 'text-slate-300' },
              { label: 'EXPOSURE', value: '82%', color: 'text-amber-400' },
              { label: 'BETA', value: '0.62', color: 'text-violet-400' },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-3 rounded-lg border border-white/5 bg-white/[0.02] text-center"
              >
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[8px] text-slate-600 uppercase tracking-widest mt-0.5">{m.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Alpha Chart + Positioning */}
            <div className="lg:col-span-2 space-y-6">
              {/* Alpha Performance */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] text-slate-500 uppercase tracking-widest">Risk-Adjusted Return Curve</h3>
                  <div className="flex items-center gap-4 text-[9px]">
                    <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-cyan-400 inline-block" /> Portfolio</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-slate-600 inline-block" /> Benchmark</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`}>
                    {/* Grid */}
                    {[0, 1, 2, 3, 4, 5].map(v => (
                      <g key={v}>
                        <line x1="0" y1={h - (v / maxVal) * h} x2={w} y2={h - (v / maxVal) * h} stroke="hsl(210,20%,12%)" strokeWidth="0.5" />
                        <text x={w + 4} y={h - (v / maxVal) * h + 3} fill="hsl(210,15%,35%)" fontSize="7" fontFamily="monospace">{v}%</text>
                      </g>
                    ))}
                    {/* Benchmark */}
                    <polyline fill="none" stroke="hsl(210,15%,30%)" strokeWidth="1" strokeDasharray="3,3" points={curveToPath(benchmarkCurve, w, h, maxVal)} />
                    {/* Alpha fill */}
                    <defs>
                      <linearGradient id="alphaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(190,80%,50%)" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="hsl(190,80%,50%)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon fill="url(#alphaFill)" points={`0,${h} ${curveToPath(returnCurve, w, h, maxVal)} ${w},${h}`} />
                    {/* Portfolio */}
                    <motion.polyline
                      fill="none" stroke="hsl(190,80%,50%)" strokeWidth="2"
                      points={curveToPath(returnCurve, w, h, maxVal)}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                    {/* Current dot */}
                    <circle cx={w} cy={h - (alphaValue / maxVal) * h} r="3" fill="hsl(190,80%,50%)" />
                    <circle cx={w} cy={h - (alphaValue / maxVal) * h} r="6" fill="hsl(190,80%,50%)" opacity="0.2" />
                    {/* Months */}
                    {returnCurve.map((_, i) => (
                      i % 3 === 0 && <text key={i} x={(i / (returnCurve.length - 1)) * w} y={h + 14} fill="hsl(210,15%,30%)" fontSize="7" fontFamily="monospace" textAnchor="middle">M{i + 1}</text>
                    ))}
                  </svg>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-[9px] text-slate-600">Alpha vs benchmark: <span className="text-emerald-400 font-medium">+{(alphaValue - 2.1).toFixed(1)}%</span></span>
                  <span className="text-[9px] text-slate-600">Information Ratio: <span className="text-cyan-400 font-medium">1.62</span></span>
                </div>
              </motion.div>

              {/* Strategic Positioning Grid */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Strategic Positioning Signals</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {positioning.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="p-3.5 rounded-lg border border-white/5 bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <p.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-sm font-bold text-white">{p.value}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden mb-2">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.value}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium">{p.label}</p>
                      <p className="text-[8px] text-slate-600 mt-0.5">{p.signal}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Strategy Modes */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Active Strategy Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {strategies.map((s, i) => {
                    const isActive = activeStrategy === i;
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        onClick={() => { setActiveStrategy(i); toast.success(`${s.name} strategy activated`); }}
                        className={`p-4 rounded-xl border text-left transition-all ${isActive ? `${s.color} bg-white/[0.04]` : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <s.icon className={`w-4 h-4 ${isActive ? s.accent : 'text-slate-500'}`} />
                          <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>{s.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mb-3">{s.desc}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-slate-600">Return Band</span>
                            <span className={`font-medium ${s.accent}`}>{s.returnBand}</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-slate-600">Volatility</span>
                            <span className={`font-medium ${volColors[s.volLevel]}`}>{s.volatility}</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-slate-600">Liquidity</span>
                            <span className="font-medium text-white">{s.liquidity}/100</span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="mt-3 pt-2 border-t border-white/5">
                            <Badge className={`text-[8px] border ${s.color} ${s.accent} bg-transparent`}>ACTIVE</Badge>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Quant Narrative + Controls */}
            <div className="space-y-5">
              {/* Concentration Heat */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Opportunity Concentration</h4>
                <div className="grid grid-cols-4 gap-1">
                  {[92, 78, 85, 60, 74, 88, 45, 82, 70, 90, 55, 68, 80, 72, 86, 50].map((v, i) => (
                    <motion.div
                      key={i}
                      className="aspect-square rounded"
                      style={{
                        backgroundColor: `hsl(190, ${v}%, ${20 + v * 0.3}%, ${v / 100})`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.03 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[8px] text-slate-600">
                  <span>Low</span><span>Concentration</span><span>High</span>
                </div>
              </motion.div>

              {/* AI Quant Narrative */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">AI Quant Narrative</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Allocating toward <span className="text-cyan-300 font-medium">emerging rental corridors</span> may
                    enhance portfolio alpha during early expansion cycles. Current positioning shows
                    <span className="text-white font-medium"> +4.2% alpha generation</span> with a Sharpe of 1.84."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Sentiment momentum at <span className="text-emerald-400 font-medium">91/100</span> supports
                    continued overweight in Bali luxury and Jakarta urban rental.
                    <span className="text-amber-300 font-medium"> Reduce exposure</span> to yield-compressed
                    Singapore-linked assets."
                  </p>
                </div>
              </motion.div>

              {/* Risk Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Risk Dashboard</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Value at Risk (95%)', value: '-2.8%', color: 'text-rose-400' },
                    { label: 'Expected Shortfall', value: '-4.1%', color: 'text-rose-400' },
                    { label: 'Correlation to Market', value: '0.38', color: 'text-cyan-400' },
                    { label: 'Tracking Error', value: '1.9%', color: 'text-amber-400' },
                    { label: 'Active Share', value: '72%', color: 'text-emerald-400' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{r.label}</span>
                      <span className={`font-semibold ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2.5"
              >
                <Button
                  className="w-full bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border-0 text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success(`${strategies[activeStrategy].name} strategy applied to portfolio`)}
                >
                  <Zap className="w-3.5 h-3.5 mr-2" /> Apply Strategy
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Scenario simulation launched')}
                >
                  <Activity className="w-3.5 h-3.5 mr-2" /> Run Simulation
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Alpha report exported')}
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

export default HedgeFundMode;
