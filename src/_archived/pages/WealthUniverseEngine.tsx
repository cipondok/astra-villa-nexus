import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, Shield, BarChart3, Layers,
  Activity, Download, Orbit, LineChart, FileText,
  Zap, Globe, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const assetClusters = [
  { name: 'Luxury Villas', x: 28, y: 30, size: 4.5, value: 'Rp 12.4B', yield: '8.2%', color: 'hsl(45,70%,55%)' },
  { name: 'Urban Rental', x: 65, y: 25, size: 5, value: 'Rp 14.8B', yield: '11.4%', color: 'hsl(190,60%,50%)' },
  { name: 'Growth Corridor', x: 72, y: 62, size: 3.8, value: 'Rp 8.6B', yield: '14.1%', color: 'hsl(160,55%,45%)' },
  { name: 'Fractional Assets', x: 30, y: 65, size: 3, value: 'Rp 4.2B', yield: '9.8%', color: 'hsl(270,50%,60%)' },
];

const flowArcs = [
  { from: 0, to: 2, label: 'Growth shift' },
  { from: 1, to: 3, label: 'Diversification' },
  { from: 0, to: 1, label: 'Yield rotation' },
  { from: 3, to: 2, label: 'Scaling' },
];

const curve5y = [40, 44, 49, 55, 58, 64, 68, 72, 78, 82, 88, 94, 98, 105, 110, 118, 124, 130, 138, 145, 152];
const curve10y = [40, 44, 49, 55, 60, 66, 72, 78, 85, 92, 100, 108, 117, 126, 136, 146, 157, 169, 182, 196, 210, 225, 240, 258, 275, 294, 312, 332, 354, 376, 400, 424, 450, 478, 506, 536, 568, 600, 634, 670, 708];
const bandOffset = 0.12;

const strategyCards = [
  { label: 'Appreciation Acceleration', value: 82, trend: '+12%', desc: 'Growth momentum across portfolio assets', icon: TrendingUp },
  { label: 'Yield Sustainability', value: 76, trend: '+4%', desc: 'Income stream durability confidence', icon: BarChart3 },
  { label: 'Risk Diversification', value: 71, trend: '+8%', desc: 'Cross-asset class spread contribution', icon: Shield },
  { label: 'Market Cycle Sensitivity', value: 38, trend: '-5%', desc: 'Exposure to cyclical downside risk', icon: Activity, inverted: true },
];

const curvePts = (data: number[], w: number, h: number) => {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(' ');
};

const bandPts = (data: number[], w: number, h: number, offset: number) => {
  const max = Math.max(...data.map(v => v * (1 + offset))) * 1.1;
  const min = Math.min(...data.map(v => v * (1 - offset))) * 0.9;
  const upper = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v * (1 + offset) - min) / (max - min)) * h}`);
  const lower = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v * (1 - offset) - min) / (max - min)) * h}`).reverse();
  return [...upper, ...lower].join(' ');
};

const WealthUniverseEngine = () => {
  const [horizon, setHorizon] = useState<'5y' | '10y'>('5y');
  const activeData = horizon === '5y' ? curve5y : curve10y;
  const finalValue = horizon === '5y' ? 'Rp 15.2B' : 'Rp 70.8B';
  const growth = horizon === '5y' ? '+280%' : '+1,670%';

  return (
    <div className="min-h-screen bg-[hsl(230,35%,4%)] text-slate-100 font-sans">
      {/* Cosmic ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_30%,hsl(260,50%,8%,0.6),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_20%_70%,hsl(200,40%,6%,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_25%_at_80%_55%,hsl(170,35%,5%,0.35),transparent)]" />
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white/10"
            style={{ width: Math.random() * 2 + 0.5, height: Math.random() * 2 + 0.5, left: `${Math.random() * 95}%`, top: `${Math.random() * 90}%` }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/5">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/15">
                    <Orbit className="w-4 h-4 text-violet-400" />
                  </div>
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px] uppercase tracking-widest">Wealth Universe</Badge>
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase tracking-widest">Predictive</Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-amber-200 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                  Predictive Wealth Universe
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Simulating long-term capital growth across intelligent property investment strategies</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-400" /> 4 ASSET CLASSES · Rp 40B PORTFOLIO
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Wealth Constellation Map */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-white/5 bg-white/[0.015] p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Wealth Constellation</h3>
              <div className="flex items-center gap-3 text-[8px] text-slate-500">
                {assetClusters.map((c, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative w-full aspect-[2.4/1] bg-[hsl(230,30%,5%)] rounded-lg overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
                {/* Flow arcs */}
                {flowArcs.map((arc, i) => {
                  const from = assetClusters[arc.from];
                  const to = assetClusters[arc.to];
                  const mx = (from.x + to.x) / 2;
                  const my = (from.y + to.y) / 2 - 8;
                  return (
                    <motion.path key={i}
                      d={`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`}
                      fill="none" stroke="hsl(260,30%,30%)" strokeWidth="0.12" strokeDasharray="1 0.5" strokeOpacity="0.5"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5 + i * 0.2 }}
                    />
                  );
                })}

                {/* Signal pulses */}
                {flowArcs.map((arc, i) => {
                  const from = assetClusters[arc.from];
                  const to = assetClusters[arc.to];
                  return (
                    <motion.circle key={`p-${i}`} r="0.5" fill="hsl(45,60%,55%)" opacity="0.6"
                      animate={{ cx: [from.x, to.x], cy: [from.y, to.y], opacity: [0.7, 0] }}
                      transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: 1 + i * 0.6 }}
                    />
                  );
                })}

                {/* Asset clusters */}
                {assetClusters.map((c, i) => (
                  <g key={i}>
                    {/* Glow ring */}
                    <motion.circle cx={c.x} cy={c.y} r={c.size + 2} fill="none" stroke={c.color} strokeWidth="0.1"
                      animate={{ r: [c.size + 1.5, c.size + 3, c.size + 1.5], opacity: [0.15, 0.3, 0.15] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                    />
                    <motion.circle cx={c.x} cy={c.y} r={c.size} fill={c.color} fillOpacity="0.15"
                      stroke={c.color} strokeWidth="0.2" strokeOpacity="0.5"
                      animate={{ r: [c.size - 0.3, c.size + 0.3, c.size - 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                    />
                    <text x={c.x} y={c.y - 0.3} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="2" fontWeight="600">{c.value}</text>
                    <text x={c.x} y={c.y + 2.2} textAnchor="middle" fill="hsl(210,20%,55%)" fontSize="1.6">{c.name}</text>
                    <text x={c.x} y={c.y + 4.2} textAnchor="middle" fill="hsl(160,50%,50%)" fontSize="1.4">Yield {c.yield}</text>
                  </g>
                ))}
              </svg>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Projection + Strategy Grid */}
            <div className="lg:col-span-2 space-y-5">
              {/* Future Projection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Wealth Projection</h3>
                  <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg border border-white/5 p-0.5">
                    {(['5y', '10y'] as const).map(h => (
                      <button key={h} onClick={() => setHorizon(h)}
                        className={`px-3 py-1 rounded-md text-[9px] font-medium transition-all ${horizon === h ? 'bg-violet-500/20 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}>
                        {h === '5y' ? '5 Year' : '10 Year'}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.div key={horizon} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <p className="text-2xl font-bold text-white">{finalValue}</p>
                      <p className="text-[10px] text-emerald-400 font-medium">{growth} projected growth</p>
                    </div>
                  </div>
                  <svg width="100%" height="110" viewBox="0 0 360 110" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="wu-band" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(260,50%,55%)" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="hsl(260,50%,55%)" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <polygon fill="url(#wu-band)" points={bandPts(activeData, 360, 100, bandOffset)} />
                    <motion.polyline fill="none" stroke="hsl(260,50%,60%)" strokeWidth="2"
                      points={curvePts(activeData, 360, 100)}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
                    />
                    <motion.polyline fill="none" stroke="hsl(160,50%,45%)" strokeWidth="1" strokeDasharray="4 2"
                      points={curvePts(activeData.map(v => v * (1 + bandOffset)), 360, 100)}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
                    />
                    <motion.polyline fill="none" stroke="hsl(220,15%,50%)" strokeWidth="1" strokeDasharray="4 2"
                      points={curvePts(activeData.map(v => v * (1 - bandOffset)), 360, 100)}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
                    />
                  </svg>
                  <div className="flex justify-between mt-2 text-[8px] text-slate-500">
                    <span>Today</span>
                    {horizon === '5y' ? <><span>Year 2</span><span>Year 5</span></> : <><span>Year 3</span><span>Year 7</span><span>Year 10</span></>}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[8px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-500 rounded inline-block" /> Base</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" /> Optimistic</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-500 rounded inline-block" /> Conservative</span>
                  </div>
                </motion.div>
              </div>

              {/* Strategic Asset Class Grid */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Strategic Asset Intelligence</h3>
                <div className="grid grid-cols-2 gap-3">
                  {strategyCards.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.06 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-2">
                        <c.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span className={`text-[9px] font-semibold ${c.inverted ? 'text-emerald-400' : 'text-emerald-400'}`}>{c.trend}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-xl font-bold text-white">{c.value}</span>
                        <span className="text-[9px] text-slate-500">/100</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium mb-0.5">{c.label}</p>
                      <p className="text-[9px] text-slate-500 leading-relaxed">{c.desc}</p>
                      {c.inverted && <p className="text-[8px] text-cyan-400 mt-1">Lower = better resilience</p>}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* AI Wealth Narrative */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">Wealth Intelligence</h4>
                </div>
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Balanced allocation between <span className="text-white font-medium">yield-focused urban assets</span> and <span className="text-emerald-400 font-medium">emerging growth zones</span> may enhance long-term wealth stability."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Fractional tokenized assets showing <span className="text-violet-300 font-medium">strongest risk-adjusted returns</span> — consider increasing allocation from 10% to 15% of portfolio."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Market cycle sensitivity at <span className="text-cyan-300 font-medium">38/100</span> indicates strong defensive positioning against cyclical downturns."
                  </p>
                </div>
              </motion.div>

              {/* Allocation Summary */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Allocation Mix</h4>
                <div className="space-y-2.5">
                  {assetClusters.map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400">{c.name}</span>
                        <span className="text-white font-medium">{c.value}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: c.color }}
                          initial={{ width: 0 }} animate={{ width: `${parseFloat(c.value.replace(/[^\d.]/g, '')) / 40 * 100}%` }}
                          transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Resilience Metrics */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Resilience Metrics</h4>
                <div className="space-y-2">
                  {[
                    { metric: 'Income Stability', value: '87%', status: 'Strong' },
                    { metric: 'Liquidity Resilience', value: '74/100', status: 'Good' },
                    { metric: 'Drawdown Protection', value: '-8% max', status: 'Healthy' },
                    { metric: 'Recovery Speed', value: '~6 months', status: 'Fast' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{m.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{m.value}</span>
                        <span className="text-emerald-400 text-[8px]">{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                className="space-y-2.5">
                <Button className="w-full bg-gradient-to-r from-amber-600/70 to-violet-600/70 hover:from-amber-500 hover:to-violet-500 text-white border-0 text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Wealth scenario simulation launched')}>
                  <Orbit className="w-3.5 h-3.5 mr-2" /> Simulate Scenario
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Multi-asset strategy optimization initiated')}>
                  <Layers className="w-3.5 h-3.5 mr-2" /> Optimize Strategy
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Future Wealth Intelligence Report generated')}>
                  <FileText className="w-3.5 h-3.5 mr-2" /> Export Report
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WealthUniverseEngine;
