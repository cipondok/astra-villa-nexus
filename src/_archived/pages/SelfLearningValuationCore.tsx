import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Activity, BarChart3, Eye, Layers,
  MapPin, Download, GitCompare, LineChart, FileText, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const estimatedValue = 2_845_000_000;
const confidence = 78;
const recalibrationHistory = [2.62, 2.68, 2.71, 2.65, 2.74, 2.80, 2.78, 2.82, 2.85, 2.84, 2.845];
const confidenceBands = { low: 2.52, mid: 2.845, high: 3.18 };

const signals = [
  { label: 'Comparable Transaction Signal', value: 82, trend: '+6%', desc: 'Learning from 47 recent comps within 2km radius', icon: BarChart3 },
  { label: 'Inquiry Pressure Indicator', value: 71, trend: '+14%', desc: 'Rising buyer interest compressing time-on-market', icon: Activity },
  { label: 'Watchlist Demand Clustering', value: 64, trend: '+9%', desc: '3.2x avg saves in this micro-zone vs baseline', icon: Eye },
  { label: 'Pricing Inefficiency Correction', value: -3.2, trend: 'Correcting', desc: 'Model detected 3.2% underpricing vs predicted FMV', icon: Zap, isCorrection: true },
  { label: 'Liquidity Velocity Feedback', value: 68, trend: '+5%', desc: 'Absorption rate improving — 18 day avg cycle', icon: Layers },
  { label: 'Micro-Location Desirability', value: 76, trend: '+11%', desc: 'Amenity score + transit access trending upward', icon: MapPin },
];

const fmt = (n: number) => `Rp ${(n / 1e9).toFixed(2)}B`;
const curvePts = (data: number[], w: number, h: number) => {
  const max = Math.max(...data) * 1.05;
  const min = Math.min(...data) * 0.95;
  return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(' ');
};

const SelfLearningValuationCore = () => {
  return (
    <div className="min-h-screen bg-[hsl(225,30%,4%)] text-slate-100 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_20%,hsl(200,50%,8%,0.5),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_30%_70%,hsl(260,40%,7%,0.4),transparent)]" />
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-cyan-500/25"
            style={{ left: `${8 + (i * 9) % 84}%`, top: `${12 + (i * 13) % 72}%` }}
            animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.8, 1] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.25 }}
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
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
                    <Brain className="w-4 h-4 text-cyan-400" />
                  </div>
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px] uppercase tracking-widest">
                    Valuation Core
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-widest">
                    Self-Learning
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-cyan-300 via-violet-300 to-slate-300 bg-clip-text text-transparent">
                  AI Property Valuation Intelligence
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Adaptive valuation engine learning from market activity in real time</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] text-slate-400"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> MODEL ACTIVE
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Core Valuation Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Estimated Value */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Estimated Market Value</p>
              <motion.div
                className="text-3xl md:text-4xl font-bold text-white mb-1"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              >
                {fmt(estimatedValue)}
              </motion.div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">+2.3% from last recalibration</span>
              </div>
              <div className="text-[9px] text-slate-500">
                Last updated: 4 hours ago · Next recalibration: ~2 hours
              </div>
            </motion.div>

            {/* Confidence Band */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Confidence Band</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="27" fill="none" stroke="hsl(225,20%,12%)" strokeWidth="4" />
                    <motion.circle
                      cx="32" cy="32" r="27" fill="none"
                      stroke="hsl(190,70%,50%)" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 27}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - confidence / 100) }}
                      transition={{ duration: 1.2 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{confidence}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">High Confidence</p>
                  <p className="text-[9px] text-slate-500">Strong data coverage</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-500">Low band</span><span className="text-slate-400">{fmt(confidenceBands.low * 1e9)}</span></div>
                <div className="flex justify-between"><span className="text-cyan-400 font-medium">Mid estimate</span><span className="text-white font-medium">{fmt(confidenceBands.mid * 1e9)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">High band</span><span className="text-slate-400">{fmt(confidenceBands.high * 1e9)}</span></div>
              </div>
            </motion.div>

            {/* Recalibration Trend */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Recalibration History</p>
              <p className="text-xs text-slate-400 mb-2">11 model iterations tracked</p>
              <svg width="100%" height="60" viewBox="0 0 240 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="val-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(190,60%,50%)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="hsl(190,60%,50%)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#val-fill)" points={`0,60 ${curvePts(recalibrationHistory, 240, 55)} 240,60`} />
                <motion.polyline
                  fill="none" stroke="hsl(190,60%,50%)" strokeWidth="2"
                  points={curvePts(recalibrationHistory, 240, 55)}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <p className="text-[9px] text-slate-500 mt-1">Values in Rp Billions · Trend: Upward</p>
            </motion.div>
          </div>

          {/* Model Adaptation Status */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.03]"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-[11px] text-cyan-300/80">
              Valuation model recalibrating based on latest deal interactions · <span className="text-slate-500">Accuracy: 94.2% MAE within 3.8%</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Learning Signal Grid */}
            <div className="lg:col-span-2">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Learning Signal Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {signals.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className={`text-[9px] font-semibold ${s.isCorrection ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {s.trend}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-lg font-bold text-white">
                        {s.isCorrection ? `${s.value}%` : s.value}
                      </span>
                      {!s.isCorrection && <span className="text-[9px] text-slate-500">/100</span>}
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium mb-0.5">{s.label}</p>
                    <p className="text-[9px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* AI Narrative */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                className="rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-3.5 h-3.5 text-violet-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">AI Valuation Narrative</h4>
                </div>
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Recent inquiry intensity and comparable price adjustments suggest <span className="text-cyan-300 font-medium">upward valuation pressure</span> in this micro-market."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Model has absorbed <span className="text-white font-medium">47 new comparables</span> and <span className="text-emerald-400 font-medium">312 behavioral signals</span> since last recalibration — confidence band narrowing."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Pricing inefficiency of <span className="text-amber-300 font-medium">-3.2%</span> detected — listing may be undervalued relative to predicted fair market value."
                  </p>
                </div>
              </motion.div>

              {/* Model Performance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Model Performance</h4>
                <div className="space-y-2.5">
                  {[
                    { metric: 'Prediction Accuracy (R²)', value: '0.94', status: 'Excellent' },
                    { metric: 'Mean Absolute Error', value: '3.8%', status: 'Within target' },
                    { metric: 'Feature Weight Drift', value: '1.2%', status: 'Stable' },
                    { metric: 'Training Samples', value: '12,847', status: 'Growing' },
                    { metric: 'Model Version', value: 'v3.7.2', status: 'Current' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{m.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{m.value}</span>
                        <span className="text-emerald-400/70 text-[8px]">{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                className="space-y-2.5"
              >
                <Button
                  className="w-full bg-gradient-to-r from-cyan-600/80 to-violet-600/80 hover:from-cyan-500 hover:to-violet-500 text-white border-0 text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Valuation scenario comparison initiated')}
                >
                  <GitCompare className="w-3.5 h-3.5 mr-2" /> Compare Scenarios
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Value movement tracker activated')}
                >
                  <LineChart className="w-3.5 h-3.5 mr-2" /> Track Movement
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Valuation Intelligence Report exported')}
                >
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

export default SelfLearningValuationCore;
