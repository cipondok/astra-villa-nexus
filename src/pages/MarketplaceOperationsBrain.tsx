import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Zap, TrendingUp, Users, BarChart3, Target,
  Lightbulb, Download, Eye, Settings, ArrowUpRight,
  Layers, Handshake, Globe, Flame, ShieldCheck, Cpu,
  ToggleLeft, ToggleRight, Rocket, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const opMomentum = 84;
const liquidityScore = 71;
const growthCurve = [22, 28, 35, 40, 38, 46, 52, 58, 55, 62, 70, 78];

const recommendations = [
  { text: 'Increase apartment supply in emerging commuter districts — demand outpacing listings by 2.4x', urgency: 'high', category: 'Supply' },
  { text: 'Investor watchlist activity rising 38% after pricing alerts — amplify notification cadence', urgency: 'medium', category: 'Engagement' },
  { text: 'Deal room activation strongest in mid-budget segment (Rp 800M–1.5B) — prioritize inventory', urgency: 'high', category: 'Deal Flow' },
  { text: 'Agent response SLA dipping in Surabaya region — trigger performance nudge sequence', urgency: 'medium', category: 'Operations' },
  { text: 'Organic traffic conversion up 12% on SEO landing pages — scale content pipeline', urgency: 'low', category: 'Growth' },
];

const opsMetrics = [
  { label: 'Listing Supply Velocity', value: 142, unit: '/week', trend: '+18%', icon: Layers },
  { label: 'Investor Acquisition', value: 89, unit: 'efficiency', trend: '+7%', icon: Users },
  { label: 'Conversion Funnel', value: 4.2, unit: '% rate', trend: '+0.8%', icon: Target },
  { label: 'Negotiation Intensity', value: 67, unit: 'active', trend: '+24%', icon: Handshake },
  { label: 'Regional Balance', value: 73, unit: '/100', trend: '+5%', icon: Globe },
  { label: 'Retention Signal', value: 81, unit: '/100', trend: '+11%', icon: Flame },
];

const curveToPath = (data: number[], w: number, h: number) => {
  const max = Math.max(...data) * 1.1;
  return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
};

const urgencyBorder = (u: string) =>
  u === 'high' ? 'border-rose-500/20 bg-rose-500/[0.04]' :
  u === 'medium' ? 'border-amber-500/20 bg-amber-500/[0.04]' :
  'border-white/5 bg-white/[0.02]';

const urgencyBadge = (u: string) =>
  u === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
  u === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

const MarketplaceOperationsBrain = () => {
  const [autoSupply, setAutoSupply] = useState(true);
  const [autoEngagement, setAutoEngagement] = useState(true);
  const [autoDealFlow, setAutoDealFlow] = useState(false);

  return (
    <div className="min-h-screen bg-[hsl(225,30%,4%)] text-slate-100 font-sans">
      {/* Ambient neural layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_40%_25%,hsl(260,40%,8%,0.5),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_70%_70%,hsl(190,40%,6%,0.4),transparent)]" />
        {/* Floating neural dots */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-500/20"
            style={{ left: `${10 + (i * 7.5) % 85}%`, top: `${15 + (i * 11) % 70}%` }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
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
                    <Cpu className="w-4 h-4 text-violet-400" />
                  </div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] uppercase tracking-widest">
                    Operations Brain
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-widest">
                    AUTONOMOUS
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-violet-300 via-cyan-300 to-slate-300 bg-clip-text text-transparent">
                  Autonomous Operations Intelligence
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">AI co-pilot managing marketplace growth, liquidity, and engagement</p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ALL SYSTEMS LIVE
                </span>
                <Button variant="outline" className="border-white/10 text-slate-400 hover:bg-white/5 text-[10px] h-7 px-3" onClick={() => toast.success('Operations report exported')}>
                  <Download className="w-3 h-3 mr-1.5" /> EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Platform Health Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Operational Momentum Gauge */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Operational Momentum</p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(225,20%,12%)" strokeWidth="5" />
                    <motion.circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="hsl(280,70%,60%)" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - opMomentum / 100) }}
                      transition={{ duration: 1.2 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{opMomentum}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Strong</p>
                  <p className="text-[10px] text-slate-500">All engines performing above threshold</p>
                </div>
              </div>
            </motion.div>

            {/* Liquidity Score */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Marketplace Liquidity</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-white">{liquidityScore}</span>
                <span className="text-slate-500 text-sm pb-1">/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${liquidityScore}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-[10px] text-slate-500">Supply-demand ratio healthy · Deal velocity improving</p>
            </motion.div>

            {/* Growth Trajectory */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Growth Trajectory</p>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Accelerating</span>
              </div>
              <svg width="100%" height="50" viewBox="0 0 220 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growth-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(160,60%,45%)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(160,60%,45%)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#growth-fill)" points={`0,50 ${curveToPath(growthCurve, 220, 45)} 220,50`} />
                <motion.polyline
                  fill="none" stroke="hsl(160,60%,45%)" strokeWidth="2"
                  points={curveToPath(growthCurve, 220, 45)}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <p className="text-[9px] text-slate-500 mt-1">12-month marketplace growth index</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Recommendations + Ops Grid */}
            <div className="lg:col-span-2 space-y-5">
              {/* AI Strategic Recommendations */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">AI Strategic Recommendations</h3>
                <div className="space-y-2">
                  {recommendations.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${urgencyBorder(r.urgency)}`}
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-300 leading-relaxed">{r.text}</p>
                      </div>
                      <Badge className={`text-[7px] ${urgencyBadge(r.urgency)} flex-shrink-0`}>
                        {r.category.toUpperCase()}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Operations Analytics Grid */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Operations Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {opsMetrics.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <m.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[9px] font-semibold text-emerald-400">{m.trend}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white">{m.value}</span>
                        <span className="text-[9px] text-slate-500">{m.unit}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">{m.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Autonomy Controls + Actions */}
            <div className="space-y-5">
              {/* Autonomy Control Module */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-3.5 h-3.5 text-violet-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">Autonomy Controls</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Automated Supply Optimization', desc: 'AI adjusts listing distribution by demand signals', active: autoSupply, toggle: setAutoSupply },
                    { label: 'Investor Engagement Automation', desc: 'Smart alerts, nudges, and retention sequences', active: autoEngagement, toggle: setAutoEngagement },
                    { label: 'Deal Flow Acceleration', desc: 'Auto-prioritize high-conversion deal rooms', active: autoDealFlow, toggle: setAutoDealFlow },
                  ].map((ctrl, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Switch
                        checked={ctrl.active}
                        onCheckedChange={(v) => { ctrl.toggle(v); toast.success(`${ctrl.label} ${v ? 'activated' : 'paused'}`); }}
                        className="mt-0.5"
                      />
                      <div>
                        <p className={`text-[11px] font-medium ${ctrl.active ? 'text-white' : 'text-slate-500'}`}>{ctrl.label}</p>
                        <p className="text-[9px] text-slate-600">{ctrl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* AI Operations Narrative */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">AI Operations Brief</h4>
                </div>
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Marketplace momentum at <span className="text-white font-medium">84/100</span> — supply velocity and investor
                    acquisition both trending above seasonal norms. <span className="text-emerald-400 font-medium">Conversion funnel health improving</span>."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Priority action: <span className="text-amber-300 font-medium">accelerate mid-budget inventory</span> in
                    commuter corridors — deal room activation 2.1x higher than luxury segment this quarter."
                  </p>
                </div>
              </motion.div>

              {/* System Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">System Status</h4>
                <div className="space-y-2">
                  {[
                    { system: 'Opportunity Engine', status: 'Healthy', color: 'bg-emerald-400' },
                    { system: 'Price Intelligence', status: 'Healthy', color: 'bg-emerald-400' },
                    { system: 'Market Heat Engine', status: 'Healthy', color: 'bg-emerald-400' },
                    { system: 'Deal Hunter', status: 'Warning', color: 'bg-amber-400' },
                    { system: 'Behavioral Tracker', status: 'Healthy', color: 'bg-emerald-400' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{s.system}</span>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                        <span className={s.status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}>{s.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2.5"
              >
                <Button
                  className="w-full bg-gradient-to-r from-violet-600/80 to-cyan-600/80 hover:from-violet-500 hover:to-cyan-500 text-white border-0 text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Strategic adjustment approved — AI applying changes')}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Approve Adjustment
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Targeted growth campaign launched')}
                >
                  <Rocket className="w-3.5 h-3.5 mr-2" /> Launch Campaign
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Operations Intelligence Report generated')}
                >
                  <FileText className="w-3.5 h-3.5 mr-2" /> Generate Report
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceOperationsBrain;
