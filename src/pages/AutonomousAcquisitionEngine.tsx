import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radar, TrendingUp, Zap, Target, BarChart3, Users, Building2,
  Eye, Activity, Rocket, ChevronRight, Layers, Download,
  Radio, Check, Send, ArrowRight, Shield, Search, Crosshair,
  Package, Lightbulb, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const signals = [
  { signal: 'New undervalued developer inventory detected', location: 'Canggu, Bali', type: 'Supply', impact: '+32 units', urgency: 'critical', time: '2m ago', icon: Building2 },
  { signal: 'Off-market villa opportunity flagged', location: 'Ubud, Bali', type: 'Off-Market', impact: 'IDR 4.2B', urgency: 'critical', time: '8m ago', icon: Eye },
  { signal: 'High-demand rental zone supply shortage', location: 'Menteng, Jakarta', type: 'Gap', impact: '18% deficit', urgency: 'warning', time: '14m ago', icon: AlertTriangle },
  { signal: 'Developer distress pricing opportunity', location: 'Nusa Dua, Bali', type: 'Distress', impact: '-22% below FMV', urgency: 'critical', time: '21m ago', icon: Target },
  { signal: 'Emerging corridor early-stage listing wave', location: 'Bandung Hillside', type: 'Emerging', impact: '+14 leads', urgency: 'positive', time: '35m ago', icon: TrendingUp },
];

const priorities = [
  { label: 'Opportunity Score Forecast', value: 91, desc: 'AI predicts high investor conversion', color: 'from-cyan-500 to-blue-500' },
  { label: 'Investor Demand Strength', value: 87, desc: 'Strong pre-existing search activity', color: 'from-emerald-500 to-green-500' },
  { label: 'Strategic Supply Importance', value: 94, desc: 'Fills critical inventory gap', color: 'from-violet-500 to-purple-500' },
  { label: 'Negotiation Leverage', value: 72, desc: 'Moderate seller urgency detected', color: 'from-amber-500 to-orange-500' },
];

const funnel = [
  { stage: 'Leads Identified', count: 284, color: 'hsl(190,80%,50%)', width: '100%' },
  { stage: 'Contact Initiated', count: 142, color: 'hsl(220,70%,55%)', width: '72%' },
  { stage: 'Listings Secured', count: 48, color: 'hsl(270,70%,55%)', width: '44%' },
  { stage: 'Live Deals', count: 23, color: 'hsl(150,70%,45%)', width: '28%' },
];

const urgencyStyles: Record<string, string> = {
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const AutonomousAcquisitionEngine = () => {
  const [passiveScan, setPassiveScan] = useState(true);
  const [aggressiveMode, setAggressiveMode] = useState(false);
  const [devOutreach, setDevOutreach] = useState(true);

  return (
    <div className="min-h-screen bg-[hsl(225,28%,5%)] text-slate-100">
      {/* Neural net ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 250 + i * 120,
              height: 250 + i * 120,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 10}%`,
              background: `radial-gradient(circle, hsl(${190 + i * 20}, 70%, 45%, 0.03) 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 7 + i * 1.2, repeat: Infinity, ease: 'easeInOut' }}
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
                    animate={{ boxShadow: ['0 0 12px hsl(190,80%,50%,0.08)', '0 0 24px hsl(190,80%,50%,0.16)', '0 0 12px hsl(190,80%,50%,0.08)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Radar className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] gap-1.5">
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    AUTONOMOUS ENGINE
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-white to-rose-300 bg-clip-text text-transparent">
                  Autonomous Deal Acquisition
                </h1>
                <p className="text-sm text-slate-500 mt-1">AI continuously sourcing high-potential investment properties</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 text-xs" onClick={() => toast.success('Supply intelligence report exported')}>
                  <Download className="w-4 h-4 mr-2" /> Export Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Signals + Priority + Funnel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Acquisition Signals */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Acquisition Signals</h2>
                  <motion.span className="w-2 h-2 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                </div>
                <div className="space-y-3">
                  {signals.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <s.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{s.signal}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500">{s.location}</span>
                          <Badge className={`text-[9px] border ${urgencyStyles[s.urgency]}`}>{s.type}</Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-semibold ${s.urgency === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{s.impact}</span>
                        <p className="text-[10px] text-slate-600 mt-0.5">{s.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Acquisition Priority Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Crosshair className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Acquisition Priority Indicators</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {priorities.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="p-4 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400">{p.label}</span>
                        <span className="text-lg font-bold text-white">{p.value}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.value}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + i * 0.1 }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-600">{p.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Supply Pipeline Funnel */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Supply Pipeline</h3>
                </div>
                <div className="space-y-4">
                  {funnel.map((stage, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-36 text-right flex-shrink-0">
                        <p className="text-xs text-slate-400">{stage.stage}</p>
                      </div>
                      <div className="flex-1 relative">
                        <div className="w-full h-8 rounded-lg bg-white/[0.03] overflow-hidden">
                          <motion.div
                            className="h-full rounded-lg flex items-center justify-end pr-3"
                            style={{ background: `linear-gradient(90deg, ${stage.color}20, ${stage.color}40)`, borderLeft: `3px solid ${stage.color}` }}
                            initial={{ width: 0 }}
                            animate={{ width: stage.width }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.7 + i * 0.15 }}
                          >
                            <span className="text-xs font-bold text-white">{stage.count}</span>
                          </motion.div>
                        </div>
                      </div>
                      {i < funnel.length - 1 && (
                        <div className="flex-shrink-0 w-5 flex justify-center">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      )}
                      {i === funnel.length - 1 && <div className="w-5 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">Pipeline conversion rate</span>
                  <span className="text-sm font-bold text-emerald-400">8.1%</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Controls + Actions */}
            <div className="space-y-6">
              {/* Automation Controls */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
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
                    { label: 'Passive Deal Scanning', desc: 'Continuously monitors new listings and market shifts', state: passiveScan, setter: setPassiveScan },
                    { label: 'Aggressive Supply Capture', desc: 'Prioritize speed over selectivity for inventory growth', state: aggressiveMode, setter: setAggressiveMode },
                    { label: 'Developer Outreach Automation', desc: 'Auto-generate partnership proposals for new developers', state: devOutreach, setter: setDevOutreach },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-xs font-medium text-white">{t.label}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{t.desc}</p>
                      </div>
                      <Switch
                        checked={t.state}
                        onCheckedChange={(v) => { t.setter(v); toast.success(`${t.label} ${v ? 'enabled' : 'disabled'}`); }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Founder Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
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
                    onClick={() => toast.success('Top 5 acquisition targets approved for outreach')}
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve Acquisition Targets
                  </Button>
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-500 hover:to-purple-500 text-white border-0 text-xs"
                    onClick={() => toast.success('Agent outreach sequence launched — 48 targets')}
                  >
                    <Send className="w-4 h-4 mr-2" /> Launch Agent Outreach
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                    onClick={() => toast.success('Supply intelligence report exported')}
                  >
                    <Download className="w-4 h-4 mr-2" /> Export Intelligence Report
                  </Button>
                </div>
              </motion.div>

              {/* AI Brief */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider">AI Acquisition Brief</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  "Engine has identified <span className="text-cyan-300 font-medium">284 acquisition leads</span> this cycle.
                  Priority signal: <span className="text-white font-medium">Canggu developer inventory</span> at 22% below
                  fair market value represents the strongest capture opportunity. Recommend
                  <span className="text-emerald-300 font-medium"> immediate agent deployment</span> before competitor
                  platform detection."
                </p>
              </motion.div>

              {/* Engine Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              >
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Engine Performance</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Scan Cycle', value: '6min' },
                    { label: 'Sources Monitored', value: '14' },
                    { label: 'Avg Lead Quality', value: '78/100' },
                    { label: 'Conversion Rate', value: '8.1%' },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-sm font-bold text-white">{s.value}</p>
                      <p className="text-[9px] text-slate-600">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousAcquisitionEngine;
