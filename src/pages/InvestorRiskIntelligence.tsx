import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Brain, Target, TrendingUp, Droplets, BarChart3,
  Clock, Zap, Activity, Settings, ArrowRight, RefreshCw,
  Lightbulb, ChevronRight, Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const riskProfiles = ['Conservative', 'Strategic', 'Opportunistic'] as const;
const activeProfile = 1; // Strategic
const riskScore = 62;
const confidence = 84;

const signals = [
  { label: 'Budget Volatility', value: 'Low-Medium', score: 38, icon: BarChart3, insight: 'Your budget range has remained within 15% variance across last 8 searches — indicating disciplined financial planning.', color: 'from-blue-500 to-cyan-500' },
  { label: 'Yield vs Appreciation', value: 'Yield-Leaning', score: 72, icon: TrendingUp, insight: 'You favor 7%+ yield properties 3:1 over capital appreciation plays. Consistent rental income preference detected.', color: 'from-emerald-500 to-teal-500' },
  { label: 'Watchlist Diversification', value: 'Moderate', score: 55, icon: Target, insight: 'Your watchlist spans 3 distinct locations and 2 property types — moderate diversification tendency.', color: 'from-violet-500 to-purple-500' },
  { label: 'Negotiation Aggressiveness', value: 'Assertive', score: 78, icon: Zap, insight: 'You initiate deal room conversations within 24hrs and counter-offer 82% of the time — assertive negotiator profile.', color: 'from-amber-500 to-orange-500' },
  { label: 'Holding Horizon', value: '3-5 Years', score: 65, icon: Clock, insight: 'Interaction patterns suggest medium-term hold strategy. You engage more with 3-5 year projection data.', color: 'from-rose-500 to-pink-500' },
  { label: 'Liquidity Comfort', value: 'Moderate', score: 52, icon: Droplets, insight: 'You consistently check exit probability data before saving deals — indicating moderate liquidity sensitivity.', color: 'from-sky-500 to-blue-500' },
];

const InvestorRiskIntelligence = () => {
  const [expandedSignal, setExpandedSignal] = useState<number | null>(null);
  const needleAngle = -90 + (riskScore / 100) * 180;

  return (
    <div className="min-h-screen bg-[hsl(225,25%,6%)] text-slate-100">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">BEHAVIORAL AI</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AI Risk Intelligence Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">Behavioral and financial signals shaping your investment strategy</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Gauge + Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Risk Score Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Gauge */}
                <div className="flex flex-col items-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Risk Tolerance Score</p>
                  <div className="relative w-52 h-28 overflow-hidden">
                    <svg viewBox="0 0 200 110" className="w-full h-full">
                      <defs>
                        <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(210,80%,55%)" />
                          <stop offset="50%" stopColor="hsl(270,70%,55%)" />
                          <stop offset="100%" stopColor="hsl(350,80%,55%)" />
                        </linearGradient>
                      </defs>
                      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(225,15%,12%)" strokeWidth="12" strokeLinecap="round" />
                      <motion.path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none" stroke="url(#riskGrad)" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray="251"
                        initial={{ strokeDashoffset: 251 }}
                        animate={{ strokeDashoffset: 251 - (riskScore / 100) * 251 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                      {/* Needle */}
                      <motion.g
                        initial={{ rotate: -90 }}
                        animate={{ rotate: needleAngle }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{ transformOrigin: '100px 100px' }}
                      >
                        <line x1="100" y1="100" x2="100" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="5" fill="white" />
                      </motion.g>
                    </svg>
                  </div>
                  <motion.p
                    className="text-2xl font-bold text-white mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {riskScore}/100
                  </motion.p>
                </div>

                {/* Spectrum + Confidence */}
                <div className="space-y-6">
                  {/* Risk Spectrum */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Risk Spectrum Position</p>
                    <div className="flex gap-2">
                      {riskProfiles.map((profile, i) => (
                        <motion.div
                          key={profile}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className={`flex-1 p-3 rounded-xl text-center transition-all ${
                            i === activeProfile
                              ? 'bg-violet-500/15 border border-violet-500/30 ring-1 ring-violet-500/20'
                              : 'bg-white/[0.02] border border-white/5'
                          }`}
                        >
                          <p className={`text-xs font-semibold ${i === activeProfile ? 'text-violet-300' : 'text-slate-500'}`}>
                            {profile}
                          </p>
                          {i === activeProfile && (
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-violet-400 mx-auto mt-2"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-500">Profile Confidence</p>
                      <span className="text-sm font-bold text-emerald-400">{confidence}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ delay: 0.5, duration: 1.2 }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5">Based on 47 behavioral interactions analyzed</p>
                  </div>

                  {/* Adaptive Learning */}
                  <motion.div
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10"
                    animate={{ borderColor: ['hsla(270,70%,55%,0.1)', 'hsla(270,70%,55%,0.25)', 'hsla(270,70%,55%,0.1)'] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}>
                      <RefreshCw className="w-4 h-4 text-violet-400" />
                    </motion.div>
                    <p className="text-xs text-violet-300">Profile evolving based on your deal interactions</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Behavioral Signal Grid */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Behavioral Signal Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map((signal, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    onClick={() => setExpandedSignal(expandedSignal === i ? null : i)}
                    className={`p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer ${
                      expandedSignal === i ? 'border-white/10 shadow-lg shadow-black/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${signal.color} bg-opacity-10`} style={{ background: `linear-gradient(135deg, hsla(0,0%,100%,0.08), hsla(0,0%,100%,0.02))` }}>
                          <signal.icon className="w-4 h-4 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{signal.label}</p>
                          <p className="text-base font-bold text-white mt-0.5">{signal.value}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${expandedSignal === i ? 'rotate-90' : ''}`} />
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${signal.color.includes('blue') ? '#3b82f6' : signal.color.includes('emerald') ? '#10b981' : signal.color.includes('violet') ? '#8b5cf6' : signal.color.includes('amber') ? '#f59e0b' : signal.color.includes('rose') ? '#f43f5e' : '#0ea5e9'}, transparent)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${signal.score}%` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 1 }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5">Signal strength: {signal.score}/100</p>

                    {expandedSignal === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-white/5"
                      >
                        <p className="text-xs text-slate-400 leading-relaxed">{signal.insight}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
                onClick={() => toast.success('Deal matching optimized based on your risk profile')}
              >
                <Target className="w-4 h-4 mr-2" /> Optimize Deal Matching
              </Button>
              <Button
                variant="outline"
                className="border-white/10 text-slate-300 hover:bg-white/5"
                onClick={() => toast.success('Loading recommended strategy...')}
              >
                <Lightbulb className="w-4 h-4 mr-2" /> View Recommended Strategy
              </Button>
              <Button
                variant="outline"
                className="border-white/10 text-slate-300 hover:bg-white/5"
                onClick={() => toast.info('Risk preference editor opened')}
              >
                <Settings className="w-4 h-4 mr-2" /> Adjust Risk Preference
              </Button>
            </div>
          </div>

          {/* Right: AI Narrative */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 sticky top-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Brain className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">AI Investor Profile</h3>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed">
                  "You demonstrate a <span className="text-violet-300 font-semibold">strategic growth orientation</span> with moderate liquidity sensitivity. Your behavioral patterns suggest comfort with medium-term holds (3-5 years) and a clear preference for <span className="text-emerald-300 font-semibold">yield-generating assets</span> over pure capital appreciation plays."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Profile Summary</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Investment Style', value: 'Strategic Growth' },
                    { label: 'Primary Motivation', value: 'Yield + Appreciation' },
                    { label: 'Risk Appetite', value: 'Balanced (62/100)' },
                    { label: 'Decision Speed', value: 'Moderate-Fast' },
                    { label: 'Portfolio Maturity', value: 'Growth Phase' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-300 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <h4 className="text-xs text-violet-400/70 uppercase tracking-wider mb-2">AI Recommendation</h4>
                <p className="text-sm text-violet-200 leading-relaxed">
                  Based on your profile, we recommend focusing on high-yield urban apartments in Jakarta and Surabaya, with 20-30% allocation to emerging Bali villa markets for appreciation upside.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Peer Comparison</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Risk tolerance', you: 62, avg: 54 },
                    { label: 'Diversification', you: 55, avg: 48 },
                    { label: 'Decision speed', you: 71, avg: 45 },
                  ].map((cmp, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">{cmp.label}</span>
                        <span className="text-slate-400">You: <strong className="text-white">{cmp.you}</strong> | Avg: {cmp.avg}</span>
                      </div>
                      <div className="relative w-full h-1.5 rounded-full bg-white/5">
                        <motion.div
                          className="absolute h-full rounded-full bg-slate-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${cmp.avg}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                        />
                        <motion.div
                          className="absolute h-full rounded-full bg-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${cmp.you}%` }}
                          transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Model Info</h4>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between"><span>Interactions analyzed</span><span className="text-slate-400">47</span></div>
                  <div className="flex justify-between"><span>Profile accuracy</span><span className="text-slate-400">84%</span></div>
                  <div className="flex justify-between"><span>Last updated</span><span className="text-slate-400">Just now</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorRiskIntelligence;
