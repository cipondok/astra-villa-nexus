import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Globe, Plane,
  Users, Lightbulb, Download, BarChart3, Gauge, Signal,
  ArrowUpRight, ArrowDownRight, Shield, Eye, Zap, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const compositeStrength = 72;
const cycleConfidence = 81;
const demandAcceleration = 68;

const signals = [
  { label: 'Interest Rate Pressure', value: 38, direction: 'easing', icon: Landmark, detail: 'BI rate stable at 6.0% — dovish bias', color: 'text-emerald-400' },
  { label: 'Credit Liquidity', value: 74, direction: 'expanding', icon: DollarSign, detail: 'Mortgage disbursement +12% YoY', color: 'text-cyan-400' },
  { label: 'Currency Stability', value: 62, direction: 'neutral', icon: Shield, detail: 'IDR/USD within 2% band — stable', color: 'text-slate-300' },
  { label: 'Foreign Capital Inflow', value: 71, direction: 'rising', icon: Globe, detail: 'FDI property sector +8.3% QoQ', color: 'text-emerald-400' },
  { label: 'Tourism Recovery', value: 83, direction: 'accelerating', icon: Plane, detail: 'Intl arrivals at 94% pre-COVID', color: 'text-cyan-400' },
  { label: 'Urban Migration', value: 66, direction: 'rising', icon: Users, detail: 'Tier-2 city inflows accelerating', color: 'text-amber-400' },
];

const yieldCurveData = [3.8, 3.6, 3.5, 3.3, 3.4, 3.2, 3.0, 2.9, 3.1, 3.0, 2.8, 2.7];
const pricingRiskData = [12, 14, 18, 22, 20, 24, 28, 26, 30, 28, 32, 34];
const liquidityData = [85, 82, 80, 78, 76, 74, 72, 70, 71, 69, 68, 66];

const curveToPath = (data: number[], w: number, h: number, min: number, max: number) =>
  data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(' ');

const RealEstateMacroRadar = () => {
  const [followingAlerts, setFollowingAlerts] = useState(false);

  return (
    <div className="min-h-screen bg-[hsl(225,30%,4%)] text-slate-100 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_20%,hsl(210,40%,8%,0.7),transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/5">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase tracking-widest">
                    Macro Intelligence
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-cyan-200 to-slate-300 bg-clip-text text-transparent">
                  Macro Economic Property Radar
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Tracking economic forces shaping real estate investment opportunities</p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-slate-500">Q1 2026</span>
                <Button variant="outline" className="border-white/10 text-slate-400 hover:bg-white/5 text-[10px] h-7 px-3" onClick={() => toast.success('Macro Intelligence Brief exported')}>
                  <Download className="w-3 h-3 mr-1.5" /> EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Macro Signal Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Composite Macro Strength', value: compositeStrength, sub: 'Economy supportive for property', color: 'from-cyan-500 to-blue-500' },
              { label: 'Market Cycle Confidence', value: cycleConfidence, sub: 'Expansion phase — high conviction', color: 'from-emerald-500 to-teal-500' },
              { label: 'Demand Acceleration', value: demandAcceleration, sub: 'Moderate acceleration probability', color: 'from-amber-500 to-orange-500' },
            ].map((g, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">{g.label}</p>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl font-bold text-white">{g.value}</span>
                  <span className="text-[10px] text-slate-500 pb-1">/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${g.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${g.value}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{g.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Global Economic Signal Grid */}
          <div>
            <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Global Economic Signals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {signals.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className="w-3.5 h-3.5 text-slate-500" />
                    {s.direction === 'accelerating' || s.direction === 'rising' || s.direction === 'expanding' ? (
                      <ArrowUpRight className={`w-3 h-3 ${s.color}`} />
                    ) : s.direction === 'easing' ? (
                      <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Activity className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] font-medium text-slate-300 mt-1">{s.label}</p>
                  <p className="text-[8px] text-slate-600 mt-0.5">{s.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Impact Analysis */}
            <div className="lg:col-span-2 space-y-5">
              {/* Yield / Pricing / Liquidity Curves */}
              {[
                { label: 'Yield Compression Expectation', data: yieldCurveData, min: 2.5, max: 4, suffix: '%', color: 'hsl(190,80%,50%)', fill: 'hsl(190,80%,50%)', desc: 'Net rental yields trending lower — asset price appreciation phase' },
                { label: 'Pricing Acceleration Risk Band', data: pricingRiskData, min: 10, max: 36, suffix: '%', color: 'hsl(35,90%,55%)', fill: 'hsl(35,90%,55%)', desc: 'Pricing momentum building — watch for overheating in premium corridors' },
                { label: 'Liquidity Tightening Timeline', data: liquidityData, min: 60, max: 90, suffix: '', color: 'hsl(160,60%,45%)', fill: 'hsl(160,60%,45%)', desc: 'Market liquidity gradually contracting — favor liquid asset classes' },
              ].map((chart, ci) => (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + ci * 0.1 }}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-widest">{chart.label}</h4>
                    <span className="text-[9px] text-slate-600">12-month trend</span>
                  </div>
                  <div className="flex justify-center">
                    <svg width="100%" height="70" viewBox="0 0 300 70" preserveAspectRatio="none">
                      {[0, 1, 2, 3, 4].map(g => (
                        <line key={g} x1="0" y1={g * 17.5} x2="300" y2={g * 17.5} stroke="hsl(210,20%,12%)" strokeWidth="0.5" />
                      ))}
                      <defs>
                        <linearGradient id={`fill-${ci}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={chart.fill} stopOpacity="0.12" />
                          <stop offset="100%" stopColor={chart.fill} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon fill={`url(#fill-${ci})`} points={`0,70 ${curveToPath(chart.data, 300, 65, chart.min, chart.max)} 300,70`} />
                      <motion.polyline
                        fill="none" stroke={chart.color} strokeWidth="2"
                        points={curveToPath(chart.data, 300, 65, chart.min, chart.max)}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 0.6 + ci * 0.15 }}
                      />
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">{chart.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Right: AI Narrative + Actions */}
            <div className="space-y-5">
              {/* AI Macro Narrative */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">AI Macro Narrative</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Improving <span className="text-cyan-300 font-medium">tourism recovery signals</span> may strengthen
                    coastal rental investment demand in the next cycle. International arrivals at
                    <span className="text-white font-medium"> 94% of pre-COVID</span> levels."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Credit liquidity expansion of <span className="text-emerald-400 font-medium">+12% YoY</span> in mortgage
                    disbursement supports sustained demand.
                    <span className="text-amber-300 font-medium"> Monitor yield compression</span> as net rentals approach
                    sub-3% in premium corridors."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "BI rate stability provides a <span className="text-cyan-300 font-medium">favorable window</span> for
                    leveraged property acquisition strategies through Q2 2026."
                  </p>
                </div>
              </motion.div>

              {/* Cycle Phase */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Cycle Phase Assessment</h4>
                <div className="space-y-2.5">
                  {[
                    { phase: 'Recovery', pct: 100, active: false },
                    { phase: 'Expansion', pct: 65, active: true },
                    { phase: 'Peak', pct: 0, active: false },
                    { phase: 'Correction', pct: 0, active: false },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-[9px] w-16 ${p.active ? 'text-cyan-400 font-semibold' : 'text-slate-600'}`}>{p.phase}</span>
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${p.active ? 'bg-cyan-500' : 'bg-slate-600'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                        />
                      </div>
                      {p.active && <span className="text-[8px] text-cyan-400">CURRENT</span>}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2.5"
              >
                <Button
                  className={`w-full text-[10px] uppercase tracking-widest font-medium ${
                    followingAlerts
                      ? 'bg-emerald-600/80 hover:bg-emerald-500'
                      : 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500'
                  } text-white border-0`}
                  onClick={() => { setFollowingAlerts(!followingAlerts); toast.success(followingAlerts ? 'Macro alerts paused' : 'Following macro alerts'); }}
                >
                  <Eye className="w-3.5 h-3.5 mr-2" /> {followingAlerts ? 'Following Alerts ✓' : 'Follow Macro Alerts'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Portfolio strategy aligned to macro signals')}
                >
                  <Zap className="w-3.5 h-3.5 mr-2" /> Align Portfolio Strategy
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Macro Intelligence Brief downloaded')}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Download Brief
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateMacroRadar;
