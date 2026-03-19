import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Shield, BarChart3, Lightbulb, ArrowUpRight,
  PieChart, Activity, Clock, Zap, Download, CalendarCheck,
  CheckCircle2, Wallet, LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const portfolioGrowth = [4.2, 4.8, 5.1, 5.6, 5.9, 6.3, 6.8, 7.2, 7.0, 7.5, 8.1, 8.6];
const forecastBase = [8.6, 9.2, 9.8, 10.5, 11.2, 11.8, 12.5, 13.1, 13.8, 14.5, 15.2, 15.9, 16.5, 17.2, 17.8, 18.5, 19.2, 19.8, 20.5, 21.0, 21.6, 22.2, 22.8, 23.4, 24.0, 24.6, 25.2, 25.8, 26.4, 27.0, 27.6, 28.2, 28.8, 29.4, 30.0, 30.6, 31.2];
const forecastHigh = forecastBase.map(v => v * 1.15);
const forecastLow = forecastBase.map(v => v * 0.88);
const riskScore = 34;
const incomeConfidence = 82;

const recommendations = [
  { text: 'Consider reallocating 15% into higher-yield rental assets in South Jakarta — projected +2.1% annual yield improvement', priority: 'high', tag: 'Rebalance' },
  { text: 'Emerging growth zones in Tangerang Selatan showing 8-12% appreciation potential over 24 months', priority: 'medium', tag: 'Opportunity' },
  { text: 'Liquidity signals suggest partial exit timing opportunity for Bali commercial holdings', priority: 'high', tag: 'Exit Signal' },
  { text: 'Portfolio income concentration risk — consider geographic diversification into Surabaya market', priority: 'medium', tag: 'Risk Mgmt' },
];

const optimizationCards = [
  { label: 'Diversification Strength', value: 72, trend: '+5%', desc: 'Geographic and asset-type spread analysis' },
  { label: 'Yield Consistency', value: 78, trend: '+3%', desc: 'Monthly rental income stability over 12 months' },
  { label: 'Appreciation Signal', value: 81, trend: '+9%', desc: 'Capital growth momentum across portfolio' },
  { label: 'Exit Timing Alignment', value: 64, trend: '+2%', desc: 'Market cycle position vs optimal selling window' },
  { label: 'Capital Efficiency', value: 69, trend: '+7%', desc: 'Deployed capital ROI vs idle allocation ratio' },
];

const curvePts = (data: number[], w: number, h: number) => {
  const max = Math.max(...data, ...forecastHigh) * 1.05;
  const min = Math.min(...data, ...forecastLow) * 0.95;
  return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(' ');
};

const priorityStyle = (p: string) =>
  p === 'high' ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200/60 bg-white';
const tagStyle = (p: string) =>
  p === 'high' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200';

const AIWealthAdvisor = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/20 text-slate-900 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/60">
                  <Wallet className="w-4 h-4 text-amber-700" />
                </div>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] uppercase tracking-widest hover:bg-amber-50">
                  Wealth Advisor
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] uppercase tracking-widest hover:bg-emerald-50">
                  AI-Guided
                </Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                AI Property Wealth Advisor
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Strategic guidance to grow and protect your real estate investment portfolio</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Advisory Active
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-7">
        {/* Wealth Health Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Growth Trajectory */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-slate-200/60 bg-white p-5">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2 font-medium">Portfolio Growth Trajectory</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-900">Rp 8.6B</span>
              <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium"><ArrowUpRight className="w-3 h-3" /> +14.2%</span>
            </div>
            <svg width="100%" height="50" viewBox="0 0 220 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wealth-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(160,50%,45%)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="hsl(160,50%,45%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon fill="url(#wealth-fill)" points={`0,50 ${curvePts(portfolioGrowth, 220, 45)} 220,50`} />
              <motion.polyline fill="none" stroke="hsl(160,50%,45%)" strokeWidth="2" points={curvePts(portfolioGrowth, 220, 45)} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
            </svg>
            <p className="text-[9px] text-slate-400 mt-1">12-month portfolio value · Rp Billions</p>
          </motion.div>

          {/* Risk Exposure */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl border border-slate-200/60 bg-white p-5">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Risk Exposure Balance</p>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="hsl(40,10%,92%)" strokeWidth="4" />
                  <motion.circle cx="32" cy="32" r="27" fill="none" stroke="hsl(160,50%,45%)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 27}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - (100 - riskScore) / 100) }}
                    transition={{ duration: 1.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">{riskScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Conservative</p>
                <p className="text-[10px] text-slate-500">Risk score within target band</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[9px]">
              <div className="flex justify-between"><span className="text-slate-400">Geographic risk</span><span className="text-slate-600">Low</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Concentration risk</span><span className="text-amber-600">Moderate</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Market cycle risk</span><span className="text-slate-600">Low</span></div>
            </div>
          </motion.div>

          {/* Income Stability */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-xl border border-slate-200/60 bg-white p-5">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Income Stability Confidence</p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-900">{incomeConfidence}</span>
              <span className="text-slate-400 text-sm pb-1">/100</span>
            </div>
            <Progress value={incomeConfidence} className="h-1.5 mb-2" />
            <p className="text-[10px] text-emerald-600 font-medium mb-1">High Confidence</p>
            <p className="text-[9px] text-slate-500">Rental income streams stable · 94% occupancy across holdings</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recommendations + Optimization + Forecast */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strategic Recommendations */}
            <div>
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Strategic Advisory</h3>
              <div className="space-y-2.5">
                {recommendations.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${priorityStyle(r.priority)}`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-700 leading-relaxed flex-1">{r.text}</p>
                    <Badge className={`text-[7px] ${tagStyle(r.priority)} flex-shrink-0 hover:bg-transparent`}>{r.tag}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Portfolio Optimization Grid */}
            <div>
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Portfolio Optimization Signals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {optimizationCards.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
                    className="p-4 rounded-xl border border-slate-200/60 bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-emerald-600 font-semibold">{c.trend}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-xl font-bold text-slate-900">{c.value}</span>
                      <span className="text-[9px] text-slate-400">/100</span>
                    </div>
                    <p className="text-[10px] text-slate-800 font-medium mb-0.5">{c.label}</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed">{c.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Future Projection */}
            <div>
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">3-Year Portfolio Forecast</h3>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="rounded-xl border border-slate-200/60 bg-white p-5"
              >
                <div className="flex items-center gap-4 mb-3 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded bg-emerald-500 inline-block" /> Optimistic</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded bg-blue-500 inline-block" /> Base Case</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded bg-slate-300 inline-block" /> Conservative</span>
                </div>
                <svg width="100%" height="100" viewBox="0 0 360 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="forecast-band" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(210,60%,55%)" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="hsl(210,60%,55%)" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Confidence band */}
                  <polygon fill="url(#forecast-band)" points={`${curvePts(forecastHigh, 360, 90)} ${curvePts(forecastLow, 360, 90).split(' ').reverse().join(' ')}`} />
                  <motion.polyline fill="none" stroke="hsl(160,50%,45%)" strokeWidth="1.5" strokeDasharray="4 2" points={curvePts(forecastHigh, 360, 90)} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
                  <motion.polyline fill="none" stroke="hsl(210,60%,55%)" strokeWidth="2" points={curvePts(forecastBase, 360, 90)} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
                  <motion.polyline fill="none" stroke="hsl(220,10%,75%)" strokeWidth="1.5" strokeDasharray="4 2" points={curvePts(forecastLow, 360, 90)} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
                </svg>
                <div className="flex justify-between mt-2 text-[9px] text-slate-400">
                  <span>Today</span><span>Year 1</span><span>Year 2</span><span>Year 3</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">Rp 31.2B</p>
                    <p className="text-[8px] text-slate-400">Optimistic</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-600">Rp 27.0B</p>
                    <p className="text-[8px] text-slate-400">Base Case</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-500">Rp 23.8B</p>
                    <p className="text-[8px] text-slate-400">Conservative</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* AI Narrative */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="rounded-xl border border-amber-200/40 bg-amber-50/30 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <h4 className="text-[9px] text-amber-700 uppercase tracking-widest font-medium">Advisor Insight</h4>
              </div>
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "Your portfolio is <span className="text-slate-900 font-semibold">well-positioned</span> for the current expansion phase. Income stability is strong with <span className="text-emerald-600 font-medium">94% occupancy</span>."
                </p>
                <div className="h-px bg-amber-200/30" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "Primary recommendation: <span className="text-amber-700 font-medium">diversify into emerging rental corridors</span> to reduce concentration risk and capture next-cycle appreciation."
                </p>
              </div>
            </motion.div>

            {/* Income Distribution */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="rounded-xl border border-slate-200/60 bg-white p-5"
            >
              <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Income Distribution</h4>
              <div className="space-y-2.5">
                {[
                  { source: 'Rental Income', pct: 62, color: 'bg-emerald-500' },
                  { source: 'Capital Appreciation', pct: 28, color: 'bg-blue-500' },
                  { source: 'Dividend Returns', pct: 10, color: 'bg-amber-500' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-600">{s.source}</span>
                      <span className="text-slate-900 font-medium">{s.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div className={`h-full rounded-full ${s.color}`} initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1, delay: 0.6 + i * 0.1 }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Liquidity Resilience */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
              className="rounded-xl border border-slate-200/60 bg-white p-5"
            >
              <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-medium">Liquidity Resilience</h4>
              <div className="space-y-2">
                {[
                  { metric: 'Portfolio Liquidity Score', value: '71/100', status: 'Good' },
                  { metric: 'Avg Time to Exit', value: '~45 days', status: 'Healthy' },
                  { metric: 'Cash Reserve Ratio', value: '18%', status: 'Adequate' },
                  { metric: 'Debt Service Coverage', value: '2.4x', status: 'Strong' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{m.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-medium">{m.value}</span>
                      <span className="text-emerald-600 text-[8px]">{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
              className="space-y-2.5"
            >
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase tracking-widest font-medium"
                onClick={() => toast.success('Advisory strategy applied to portfolio')}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Apply Advisory Strategy
              </Button>
              <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] uppercase tracking-widest"
                onClick={() => toast.success('Wealth Plan Report generated')}
              >
                <Download className="w-3.5 h-3.5 mr-2" /> Generate Wealth Report
              </Button>
              <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 text-[10px] uppercase tracking-widest"
                onClick={() => toast.success('Strategic review reminder scheduled')}
              >
                <CalendarCheck className="w-3.5 h-3.5 mr-2" /> Schedule Review
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWealthAdvisor;
