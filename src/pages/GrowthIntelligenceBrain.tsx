import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Zap, Target, BarChart3, Users, Building2,
  Eye, Activity, Rocket, Globe, ArrowUpRight, Radio, Layers,
  ToggleLeft, ToggleRight, Download, Send, Megaphone, Lightbulb,
  ChevronRight, Flame, Gauge, LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const momentumScore = 78;
const dominanceProbability = 34;

const recommendations = [
  { signal: 'Increase luxury villa supply in Bandung corridor', impact: 'High', type: 'Supply', delta: '+18% demand gap', icon: Building2, urgency: 'critical' },
  { signal: 'Investor engagement rising after price-drop alerts', impact: 'Medium', type: 'Engagement', delta: '+31% open rate', icon: Users, urgency: 'positive' },
  { signal: 'Urban rental segment showing strongest liquidity signals', impact: 'High', type: 'Liquidity', delta: '+24% velocity', icon: Activity, urgency: 'positive' },
  { signal: 'Agent onboarding velocity declining in Surabaya', impact: 'Medium', type: 'Operations', delta: '-12% MoM', icon: TrendingUp, urgency: 'warning' },
  { signal: 'Off-plan project inquiries surging in Greater Jakarta', impact: 'High', type: 'Demand', delta: '+42% WoW', icon: Rocket, urgency: 'critical' },
];

const growthLevers = [
  { label: 'Listing Supply Velocity', value: '127', unit: '/week', trend: '+14%', icon: Building2, spark: [30, 45, 42, 58, 65, 72, 80, 95, 110, 127] },
  { label: 'Investor Acquisition', value: '84', unit: 'new/mo', trend: '+22%', icon: Users, spark: [20, 28, 35, 40, 48, 55, 62, 70, 78, 84] },
  { label: 'Watchlist Conversion', value: '6.8', unit: '%', trend: '+1.2pp', icon: Eye, spark: [3.2, 3.8, 4.1, 4.5, 5.0, 5.3, 5.8, 6.1, 6.5, 6.8] },
  { label: 'Deal Room Activation', value: '23', unit: 'active', trend: '+8', icon: Target, spark: [5, 8, 10, 12, 14, 16, 18, 19, 21, 23] },
  { label: 'Regional Expansion', value: '12', unit: 'cities', trend: '+3', icon: Globe, spark: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { label: 'QIA Score', value: '1,847', unit: 'points', trend: '+340', icon: Zap, spark: [400, 600, 750, 900, 1050, 1200, 1400, 1550, 1700, 1847] },
];

const urgencyColors: Record<string, string> = {
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const SparkLine = ({ data, color = '#22d3ee' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
};

const GrowthIntelligenceBrain = () => {
  const [autoGrowth, setAutoGrowth] = useState(true);
  const [aggressiveMode, setAggressiveMode] = useState(false);
  const [narrativeAlerts, setNarrativeAlerts] = useState(true);

  const gaugeAngle = (momentumScore / 100) * 180 - 90;

  return (
    <div className="min-h-screen bg-[hsl(225,28%,5%)] text-slate-100">
      {/* Neural net background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              left: `${15 + i * 12}%`,
              top: `${10 + i * 8}%`,
              background: `radial-gradient(circle, hsl(${190 + i * 15}, 80%, 50%, 0.03) 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
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
                    animate={{ boxShadow: ['0 0 15px hsl(190,80%,50%,0.1)', '0 0 25px hsl(190,80%,50%,0.2)', '0 0 15px hsl(190,80%,50%,0.1)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> FOUNDER ACCESS
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                  Autonomous Growth Intelligence
                </h1>
                <p className="text-sm text-slate-500 mt-1">AI-driven strategic insights guiding marketplace expansion</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10 text-xs" onClick={() => toast.success('Strategic report exported')}>
                  <Download className="w-4 h-4 mr-2" /> Export Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* Top strategic signals row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Momentum Gauge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-6"
            >
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">Platform Momentum</h3>
              <div className="flex items-center justify-center">
                <svg width="160" height="90" viewBox="0 0 160 90">
                  <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="hsl(190,20%,15%)" strokeWidth="8" strokeLinecap="round" />
                  <motion.path
                    d="M 15 80 A 65 65 0 0 1 145 80"
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: momentumScore / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(190,80%,50%)" />
                      <stop offset="100%" stopColor="hsl(270,80%,60%)" />
                    </linearGradient>
                  </defs>
                  <motion.line
                    x1="80" y1="80" x2="80" y2="25"
                    stroke="hsl(190,80%,60%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ transformOrigin: '80px 80px' }}
                    initial={{ rotate: -90 }}
                    animate={{ rotate: gaugeAngle }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                  <circle cx="80" cy="80" r="4" fill="hsl(190,80%,50%)" />
                </svg>
              </div>
              <div className="text-center mt-2">
                <span className="text-3xl font-bold text-white">{momentumScore}</span>
                <span className="text-sm text-slate-500 ml-1">/100</span>
              </div>
              <p className="text-[10px] text-cyan-500/60 text-center mt-1">Accelerating — above 90d average</p>
            </motion.div>

            {/* Growth Trajectory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-6"
            >
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">Growth Trajectory</h3>
              <svg width="100%" height="100" viewBox="0 0 200 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trajFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(190,80%,50%)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(190,80%,50%)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M0,70 Q25,65 50,55 T100,35 T150,20 T200,8"
                  fill="none"
                  stroke="hsl(190,80%,50%)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
                <path d="M0,70 Q25,65 50,55 T100,35 T150,20 T200,8 V80 H0 Z" fill="url(#trajFill)" />
              </svg>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-600">6 months ago</span>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +156% QIA growth
                </div>
                <span className="text-[10px] text-slate-600">Now</span>
              </div>
            </motion.div>

            {/* Dominance Probability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-500/[0.04] to-transparent p-6"
            >
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">Market Dominance Probability</h3>
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(270,20%,15%)" strokeWidth="6" />
                    <motion.circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="hsl(270,80%,60%)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 50}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - dominanceProbability / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{dominanceProbability}%</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-violet-400/60 text-center">Indonesian proptech market share target</p>
              <div className="flex justify-center gap-3 mt-2">
                {['Jakarta', 'Bali', 'Bandung'].map((c) => (
                  <Badge key={c} className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px]">{c}</Badge>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Recommendations + Growth Levers */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Recommendation Stream */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AI Recommendation Stream</h2>
                  <motion.span
                    className="w-2 h-2 rounded-full bg-cyan-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div className="space-y-3">
                  {recommendations.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <r.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{r.signal}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-[9px] border ${urgencyColors[r.urgency]}`}>{r.type}</Badge>
                          <span className="text-[10px] text-slate-500">Impact: {r.impact}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-semibold ${r.urgency === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.delta}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Growth Lever Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Growth Lever Analytics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {growthLevers.map((lever, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="p-4 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-1.5 rounded-lg bg-white/5">
                          <lever.icon className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">{lever.trend}</span>
                      </div>
                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-2xl font-bold text-white">{lever.value}</span>
                        <span className="text-xs text-slate-500 mb-1">{lever.unit}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{lever.label}</p>
                      <SparkLine data={lever.spark} color={i % 2 === 0 ? '#22d3ee' : '#a78bfa'} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Controls + Actions */}
            <div className="space-y-6">
              {/* Automation Controls */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300">Automation Controls</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Autonomous Growth Suggestions', desc: 'AI generates proactive expansion actions', state: autoGrowth, setter: setAutoGrowth },
                    { label: 'Aggressive Expansion Mode', desc: 'Prioritize growth velocity over efficiency', state: aggressiveMode, setter: setAggressiveMode },
                    { label: 'Market Narrative Alerts', desc: 'Real-time strategic briefing notifications', state: narrativeAlerts, setter: setNarrativeAlerts },
                  ].map((toggle, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-xs font-medium text-white">{toggle.label}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{toggle.desc}</p>
                      </div>
                      <Switch
                        checked={toggle.state}
                        onCheckedChange={(v) => {
                          toggle.setter(v);
                          toast.success(`${toggle.label} ${v ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Founder Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-500/[0.04] to-transparent p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <Rocket className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300">Founder Actions</h3>
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border-0 text-xs"
                    onClick={() => toast.success('Supply campaign initiated for 3 target regions')}
                  >
                    <Megaphone className="w-4 h-4 mr-2" /> Launch Supply Campaign
                  </Button>
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-500 hover:to-purple-500 text-white border-0 text-xs"
                    onClick={() => toast.success('Investor outreach wave triggered — 2,400 targets')}
                  >
                    <Send className="w-4 h-4 mr-2" /> Trigger Investor Outreach
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                    onClick={() => toast.success('Strategic intelligence report exported')}
                  >
                    <Download className="w-4 h-4 mr-2" /> Export Intelligence Report
                  </Button>
                </div>
              </motion.div>

              {/* AI Narrative */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider">AI Strategic Brief</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  "Platform momentum is <span className="text-cyan-300 font-medium">accelerating</span>. Investor acquisition shows
                  strongest velocity in urban rental segments. Recommend <span className="text-white font-medium">doubling supply
                  onboarding</span> in Bandung and Surabaya corridors while activating dormant watchlist users through
                  targeted price-movement alerts. Current trajectory projects <span className="text-violet-300 font-medium">34%
                  market share</span> within 18 months."
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthIntelligenceBrain;
