import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown, BarChart3, Clock, MapPin, Activity, AlertTriangle,
  Zap, Eye, ChevronRight, Plus, Bell, BookmarkPlus, ArrowDownRight,
  Info, Target, Gauge, LineChart, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const signals = [
  { label: 'Comparable Sales Deviation', value: '-14.2%', score: 82, icon: BarChart3, status: 'critical', tip: 'Price sits 14.2% below recent comparable transactions within 2km radius, adjusting for size and condition.' },
  { label: 'District Price Momentum', value: '+6.8% QoQ', score: 71, icon: TrendingDown, status: 'high', tip: 'District prices are trending upward at 6.8% per quarter while this listing remains static — growing divergence.' },
  { label: 'Seller Urgency Probability', value: '73%', score: 73, icon: AlertTriangle, status: 'high', tip: 'Behavioral signals (price drops, rapid relisting, description edits) suggest motivated seller with 73% confidence.' },
  { label: 'Listing Duration Inefficiency', value: '94 days', score: 65, icon: Clock, status: 'medium', tip: 'Listed 94 days vs 38-day district median. Extended duration creates negotiation leverage for buyers.' },
  { label: 'Micro-Location Desirability', value: '8.4/10', score: 88, icon: MapPin, status: 'critical', tip: 'High walkability, proximity to amenities, and infrastructure development score this location 8.4 out of 10.' },
  { label: 'Supply-Demand Imbalance', value: '0.6x ratio', score: 77, icon: Activity, status: 'high', tip: 'Only 0.6 listings per active buyer in this segment — strong demand-side pressure suggests quick price correction.' },
];

const statusColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const statusBarColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
};

const deals = [
  { title: 'Villa Canggu Harmony', location: 'Canggu, Bali', mispricing: '-21%', price: 'IDR 4.2B', confidence: 91 },
  { title: 'Townhouse Menteng Residences', location: 'South Jakarta', mispricing: '-15%', price: 'IDR 8.7B', confidence: 84 },
  { title: 'Apartment Ubud Canopy', location: 'Ubud, Bali', mispricing: '-12%', price: 'IDR 2.1B', confidence: 78 },
  { title: 'Land Plot Lombok Bay', location: 'Kuta Lombok', mispricing: '-26%', price: 'IDR 1.8B', confidence: 88 },
];

const correctionTimeline = [
  { month: '0', label: 'Now', fill: 18 },
  { month: '3', label: '3M', fill: 42 },
  { month: '6', label: '6M', fill: 68 },
  { month: '9', label: '9M', fill: 85 },
  { month: '12', label: '12M', fill: 94 },
];

const PricingInefficiencyDetector = () => {
  const [hoveredSignal, setHoveredSignal] = useState<number | null>(null);
  const mispricingPct = 18;
  const confidence = 87;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[hsl(225,25%,6%)] text-slate-100">
        {/* Header */}
        <div className="border-b border-white/5">
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Target className="w-5 h-5 text-red-400" />
              </div>
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">ALPHA SIGNAL</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AI Pricing Inefficiency Signals
            </h1>
            <p className="text-sm text-slate-500 mt-1">Detecting undervalued real estate opportunities before market correction</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Main Panel + Grid */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Signal Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Mispricing Gauge */}
                  <div className="flex flex-col items-center text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Mispricing Signal</p>
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(225,15%,12%)" strokeWidth="8" />
                        <motion.circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${(mispricingPct / 30) * 327} 327`}
                          initial={{ strokeDasharray: '0 327' }}
                          animate={{ strokeDasharray: `${(mispricingPct / 30) * 327} 327` }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(0,85%,60%)" />
                            <stop offset="100%" stopColor="hsl(35,95%,55%)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                          className="text-3xl font-bold text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {mispricingPct}%
                        </motion.span>
                        <span className="text-[10px] text-slate-500">Below Market</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-red-400">
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="text-sm font-semibold">Underpriced</span>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Confidence Score</p>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="w-28 h-28 rounded-full border-2 border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center justify-center"
                    >
                      <span className="text-3xl font-bold text-emerald-400">{confidence}%</span>
                      <span className="text-[10px] text-emerald-500/70">Probability</span>
                    </motion.div>
                    <Badge className="mt-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                      High Conviction
                    </Badge>
                  </div>

                  {/* Correction Timeline */}
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4 text-center">Correction Timeline</p>
                    <div className="flex-1 flex items-end gap-2 px-2">
                      {correctionTimeline.map((pt, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">{pt.fill}%</span>
                          <motion.div
                            className="w-full rounded-t-md"
                            style={{
                              background: `linear-gradient(to top, hsl(${pt.fill > 70 ? 140 : pt.fill > 40 ? 35 : 0}, 80%, 50%), transparent)`,
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${pt.fill}px` }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                          />
                          <span className="text-[10px] text-slate-400 font-medium">{pt.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600 text-center mt-2">Expected price convergence probability</p>
                  </div>
                </div>
              </motion.div>

              {/* Signal Breakdown Grid */}
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Inefficiency Signal Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {signals.map((signal, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.06 }}
                          onMouseEnter={() => setHoveredSignal(i)}
                          onMouseLeave={() => setHoveredSignal(null)}
                          className={`p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-help ${
                            hoveredSignal === i ? 'border-white/10 shadow-lg shadow-black/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg border ${statusColors[signal.status]}`}>
                                <signal.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-200">{signal.label}</p>
                                <p className="text-lg font-bold text-white mt-0.5">{signal.value}</p>
                              </div>
                            </div>
                            <Info className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${statusBarColors[signal.status]}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${signal.score}%` }}
                              transition={{ delay: 0.4 + i * 0.08, duration: 1 }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1.5">Signal strength: {signal.score}/100</p>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-slate-800 border-slate-700 text-slate-200 text-xs">
                        {signal.tip}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Similar Deals */}
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Similar Undervalued Opportunities</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {deals.map((deal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="min-w-[240px] p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">{deal.mispricing}</Badge>
                        <span className="text-[10px] text-emerald-400">{deal.confidence}% conf.</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{deal.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {deal.location}
                      </p>
                      <p className="text-sm font-bold text-slate-300 mt-2">{deal.price}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                        View analysis <ChevronRight className="w-3 h-3" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border-0"
                  onClick={() => toast.success('Price movement tracking activated')}
                >
                  <LineChart className="w-4 h-4 mr-2" /> Track Price Movement
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:bg-white/5"
                  onClick={() => toast.success('Added to Opportunity Watchlist')}
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" /> Add to Opportunity Watchlist
                </Button>
              </div>
            </div>

            {/* Right: AI Narrative Panel */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 sticky top-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300">AI Analysis Narrative</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      "This asset appears <span className="text-red-400 font-semibold">undervalued by 18%</span> due to slow seller response in a high-demand micro-market. Comparable transactions within a 2km radius closed at significantly higher price-per-sqm over the last 90 days."
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Key Drivers</h4>
                    <ul className="space-y-2">
                      {[
                        'Seller listed 94 days ago — 2.5x district median',
                        'Zero price adjustments despite declining views',
                        'District absorption rate accelerating (+12% QoQ)',
                        'New infrastructure project announced within 3km',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <div className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-xs text-emerald-500/70 uppercase tracking-wider mb-2">AI Recommendation</h4>
                    <p className="text-sm text-emerald-300">
                      Strong buy signal. Initiate negotiation with an opening offer at current list price — high probability of acceptance given seller urgency indicators.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Risk Factors</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Title clarity', risk: 'Low', color: 'text-emerald-400' },
                        { label: 'Zoning restriction', risk: 'None', color: 'text-emerald-400' },
                        { label: 'Liquidity depth', risk: 'Moderate', color: 'text-amber-400' },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{r.label}</span>
                          <span className={`font-medium ${r.color}`}>{r.risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Model Info</h4>
                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex justify-between"><span>Last computed</span><span className="text-slate-400">2 min ago</span></div>
                      <div className="flex justify-between"><span>Data sources</span><span className="text-slate-400">14 signals</span></div>
                      <div className="flex justify-between"><span>Model version</span><span className="text-slate-400">v3.2.1</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PricingInefficiencyDetector;
