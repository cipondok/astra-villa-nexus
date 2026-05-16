import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Flame, TrendingUp, TrendingDown, Eye, Bell, Target,
  Search, MessageSquare, Bookmark, Zap, BarChart3, Building2,
  Home, Palmtree, HardHat, ArrowUpRight, ArrowDownRight, Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const sentimentLevels = ['Cooling', 'Stable', 'Heating', 'Surge'] as const;
const activeSentiment = 2; // Heating
const confidence = 79;

const liveSignals = [
  { id: 1, text: 'High inquiry surge for Bali villas', type: 'surge', location: 'Bali', time: 'Just now', delta: '+42%' },
  { id: 2, text: 'Urban rental units gaining investor traction', type: 'heating', location: 'Jakarta', time: '2 min ago', delta: '+18%' },
  { id: 3, text: 'Bandung hillside luxury segment accelerating', type: 'heating', location: 'Bandung', time: '5 min ago', delta: '+24%' },
  { id: 4, text: 'Price resistance emerging in Jakarta core', type: 'cooling', location: 'Jakarta', time: '8 min ago', delta: '-6%' },
  { id: 5, text: 'Off-plan interest spike in Lombok beachfront', type: 'surge', location: 'Lombok', time: '12 min ago', delta: '+38%' },
  { id: 6, text: 'Steady demand for Ubud co-living spaces', type: 'stable', location: 'Ubud', time: '15 min ago', delta: '+3%' },
  { id: 7, text: 'Seminyak villa watchlist additions accelerating', type: 'heating', location: 'Seminyak', time: '18 min ago', delta: '+27%' },
];

const typeStyles: Record<string, { color: string; bg: string; icon: typeof Flame }> = {
  surge: { color: 'text-red-400', bg: 'bg-red-500/10', icon: Flame },
  heating: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: TrendingUp },
  stable: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Activity },
  cooling: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: TrendingDown },
};

const segments = [
  { name: 'Luxury Villas', score: 87, trend: 'up', change: '+12%', icon: Palmtree, sentiment: 'Surge', sentimentColor: 'text-red-400' },
  { name: 'Urban Houses', score: 64, trend: 'up', change: '+6%', icon: Home, sentiment: 'Heating', sentimentColor: 'text-amber-400' },
  { name: 'Rental Apartments', score: 72, trend: 'up', change: '+9%', icon: Building2, sentiment: 'Heating', sentimentColor: 'text-amber-400' },
  { name: 'Off-plan Projects', score: 58, trend: 'down', change: '-2%', icon: HardHat, sentiment: 'Stable', sentimentColor: 'text-blue-400' },
];

const trendKeywords = [
  { keyword: 'villa bali ocean view', spike: '+340%', hot: true },
  { keyword: 'rental yield jakarta', spike: '+180%', hot: true },
  { keyword: 'investment bandung', spike: '+95%', hot: false },
  { keyword: 'off-plan lombok', spike: '+210%', hot: true },
  { keyword: 'co-living ubud', spike: '+72%', hot: false },
];

const trendMetrics = [
  { label: 'Watchlist Additions', value: '284', delta: '+34% vs last week', icon: Bookmark },
  { label: 'Deal Room Opens', value: '47', delta: '+18% velocity', icon: MessageSquare },
  { label: 'Search Volume', value: '2.1K', delta: '+22% this week', icon: Search },
];

const DemandSentimentAnalyzer = () => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulsePhase(p => (p + 1) % 4), 1500);
    return () => clearInterval(interval);
  }, []);

  const gaugePercent = ((activeSentiment + 0.6) / sentimentLevels.length) * 100;

  return (
    <div className="min-h-screen bg-[hsl(225,25%,6%)] text-slate-100">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Activity className="w-5 h-5 text-amber-400" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-lg bg-amber-500/20"
                  />
                </div>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> LIVE FEED
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mt-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Real-time Demand Sentiment
              </h1>
              <p className="text-sm text-slate-500 mt-1">Tracking investor attention, inquiry intensity, and deal momentum</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 text-xs" onClick={() => toast.success('Sentiment alerts activated')}>
                <Bell className="w-4 h-4 mr-2" /> Activate Alerts
              </Button>
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0 text-xs" onClick={() => toast.success('Viewing opportunity matches...')}>
                <Target className="w-4 h-4 mr-2" /> Opportunity Matches
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Gauge + Signals + Segments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Sentiment Gauge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-300">Market Pulse Indicator</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Confidence:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">{confidence}%</Badge>
                </div>
              </div>

              {/* Spectrum Bar */}
              <div className="relative">
                <div className="flex rounded-xl overflow-hidden h-12 bg-white/[0.02]">
                  {sentimentLevels.map((level, i) => {
                    const colors = ['from-cyan-600 to-blue-600', 'from-blue-500 to-indigo-500', 'from-amber-500 to-orange-500', 'from-orange-500 to-red-500'];
                    return (
                      <div
                        key={level}
                        className={`flex-1 flex items-center justify-center relative bg-gradient-to-r ${colors[i]} ${
                          i === activeSentiment ? 'opacity-100' : 'opacity-30'
                        } transition-opacity`}
                      >
                        <span className={`text-xs font-semibold text-white ${i === activeSentiment ? '' : 'opacity-60'}`}>
                          {level}
                        </span>
                        {i === activeSentiment && (
                          <motion.div
                            className="absolute inset-0 border-2 border-white/30 rounded-none"
                            animate={{ borderColor: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)'] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Needle */}
                <motion.div
                  className="absolute top-0 w-0.5 h-12 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  initial={{ left: '0%' }}
                  animate={{ left: `${gaugePercent}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-slate-600">← Bearish</span>
                <motion.p
                  className="text-sm font-bold text-amber-400"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Market Heating — Investor Momentum Building
                </motion.p>
                <span className="text-[10px] text-slate-600">Bullish →</span>
              </div>
            </motion.div>

            {/* Live Signal Stream */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Signal Stream</h2>
                <Badge variant="outline" className="border-white/10 text-slate-500 text-[10px] gap-1">
                  <Radio className="w-3 h-3" /> Updating
                </Badge>
              </div>
              <div className="space-y-3">
                {liveSignals.map((signal, i) => {
                  const style = typeStyles[signal.type];
                  const Icon = style.icon;
                  const isPositive = !signal.delta.startsWith('-');
                  return (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${style.bg} flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200">{signal.text}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-500">{signal.location}</span>
                            <span className="text-[10px] text-slate-600">{signal.time}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {signal.delta}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Segment Sentiment Grid */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Segment Sentiment</h2>
              <div className="grid grid-cols-2 gap-4">
                {segments.map((seg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white/5">
                          <seg.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200">{seg.name}</h3>
                      </div>
                      <span className={`text-xs font-semibold ${seg.sentimentColor}`}>{seg.sentiment}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{seg.score}</p>
                        <p className="text-[10px] text-slate-600">Sentiment Score</p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${seg.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {seg.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {seg.change}
                      </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: seg.score >= 80 ? 'hsl(0,70%,55%)' : seg.score >= 65 ? 'hsl(35,90%,55%)' : 'hsl(210,70%,55%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${seg.score}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5" onClick={() => toast.success('Following market segment')}>
                <Eye className="w-4 h-4 mr-2" /> Follow Market Segment
              </Button>
            </div>
          </div>

          {/* Right: Trend Panel */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 sticky top-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">Trend Intelligence</h3>
              </div>

              {/* Keyword Spikes */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Search Keyword Spikes</h4>
                <div className="space-y-2.5">
                  {trendKeywords.map((kw, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {kw.hot && <Flame className="w-3 h-3 text-red-400 flex-shrink-0" />}
                        <span className="text-xs text-slate-400 truncate">{kw.keyword}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 flex-shrink-0">{kw.spike}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Metrics */}
              <div className="space-y-3">
                {trendMetrics.map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5">
                        <metric.icon className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{metric.value}</p>
                        <p className="text-[10px] text-slate-500">{metric.label}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">{metric.delta}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Summary */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <h4 className="text-xs text-amber-400/70 uppercase tracking-wider mb-2">AI Summary</h4>
                <p className="text-sm text-amber-200/80 leading-relaxed">
                  Investor sentiment is heating across Bali villa and urban rental segments. Early movers in Lombok beachfront are capturing pre-surge positioning. Jakarta core showing price ceiling resistance — proceed with caution.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandSentimentAnalyzer;
