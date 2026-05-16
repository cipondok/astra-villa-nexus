import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Activity, Zap, TrendingUp, Globe, Users,
  BarChart3, Layers, Shield, Settings, Download,
  Rocket, FileText, Eye, Target, Radio, Cpu,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const systemStatus = [
  { label: 'Valuation Engine', value: 'Active', health: 97, icon: Brain, color: 'text-cyan-400' },
  { label: 'Demand Sentiment', value: 'Strong', health: 84, icon: Activity, color: 'text-emerald-400' },
  { label: 'Liquidity Intelligence', value: 'Calibrated', health: 91, icon: Layers, color: 'text-violet-400' },
  { label: 'Marketplace Momentum', value: '82/100', health: 82, icon: TrendingUp, color: 'text-amber-400' },
];

const modules = [
  { name: 'Opportunity Scoring', desc: 'Composite investment attractiveness ranking', status: 'Running', throughput: '2.4k/hr', icon: Target, path: '/opportunities' },
  { name: 'Pricing Inefficiency', desc: 'FMV gap detection and correction signals', status: 'Running', throughput: '1.8k/hr', icon: Zap, path: '/valuation-core' },
  { name: 'Deal Matching', desc: 'Investor-property intelligent pairing', status: 'Running', throughput: '960/hr', icon: Users, path: '/global-exchange' },
  { name: 'Macro Economic Radar', desc: 'Global economic force tracking', status: 'Running', throughput: '120/hr', icon: Globe, path: '/macro-radar' },
  { name: 'Behavior Prediction', desc: 'Investor action likelihood modeling', status: 'Running', throughput: '3.1k/hr', icon: Eye, path: '/investor-behavior-prediction' },
  { name: 'Operations Brain', desc: 'Autonomous marketplace optimization', status: 'Running', throughput: '480/hr', icon: Cpu, path: '/operations-brain' },
];

const dataFlowNodes = [
  { id: 'val', label: 'Valuation', x: 15, y: 25 },
  { id: 'opp', label: 'Opportunity', x: 50, y: 12 },
  { id: 'demand', label: 'Demand', x: 85, y: 25 },
  { id: 'match', label: 'Matching', x: 85, y: 65 },
  { id: 'macro', label: 'Macro', x: 50, y: 78 },
  { id: 'behavior', label: 'Behavior', x: 15, y: 65 },
  { id: 'core', label: 'AI Core', x: 50, y: 45 },
];

const dataFlowEdges = [
  { from: 'val', to: 'core' }, { from: 'opp', to: 'core' }, { from: 'demand', to: 'core' },
  { from: 'match', to: 'core' }, { from: 'macro', to: 'core' }, { from: 'behavior', to: 'core' },
  { from: 'core', to: 'val' }, { from: 'core', to: 'opp' }, { from: 'core', to: 'demand' },
  { from: 'core', to: 'match' }, { from: 'core', to: 'behavior' },
  { from: 'val', to: 'opp' }, { from: 'demand', to: 'match' }, { from: 'behavior', to: 'match' },
  { from: 'macro', to: 'val' },
];

const RealEstateIntelligenceOS = () => {
  const [autoMode, setAutoMode] = useState(true);
  const [insightMode, setInsightMode] = useState(true);
  const [humanOverride, setHumanOverride] = useState(false);

  const getNode = (id: string) => dataFlowNodes.find(n => n.id === id)!;

  return (
    <div className="min-h-screen bg-[hsl(225,30%,4%)] text-slate-100 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_20%,hsl(250,40%,8%,0.5),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_25%_70%,hsl(190,40%,6%,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_30%_at_80%_60%,hsl(160,30%,6%,0.3),transparent)]" />
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-violet-500/20"
            style={{ left: `${10 + (i * 11) % 80}%`, top: `${15 + (i * 13) % 65}%` }}
            animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 2, 1] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
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
                    <Brain className="w-4 h-4 text-violet-400" />
                  </div>
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px] uppercase tracking-widest">
                    Intelligence OS
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-widest">
                    ALL SYSTEMS LIVE
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-violet-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  Real Estate Intelligence OS
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Unified AI infrastructure powering intelligent property investment decisions</p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <motion.span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-slate-400"
                  animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <Radio className="w-3 h-3 text-emerald-400" /> 6 ENGINES · 9.7k SIGNALS/HR
                </motion.span>
                <Button variant="outline" className="border-white/10 text-slate-400 hover:bg-white/5 text-[10px] h-7 px-3"
                  onClick={() => toast.success('System Intelligence Report exported')}>
                  <Download className="w-3 h-3 mr-1.5" /> EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Core System Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {systemStatus.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <motion.span className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                </div>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-[9px] text-slate-500 mb-2">{s.label}</p>
                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    initial={{ width: 0 }} animate={{ width: `${s.health}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.1 }} />
                </div>
                <p className="text-[8px] text-slate-600 mt-1">Health: {s.health}%</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Modules + Data Flow */}
            <div className="lg:col-span-2 space-y-5">
              {/* Intelligence Module Grid */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Intelligence Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modules.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      onClick={() => toast.info(`Navigate to ${m.name}`)}>
                      <div className="flex items-center justify-between mb-2">
                        <m.icon className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[7px]">{m.status}</Badge>
                          <ArrowRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white mb-0.5">{m.name}</p>
                      <p className="text-[9px] text-slate-500 mb-2">{m.desc}</p>
                      <div className="flex items-center gap-1.5 text-[8px] text-slate-600">
                        <Activity className="w-2.5 h-2.5" />
                        <span>Throughput: {m.throughput}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Data Flow Visualization */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Signal Exchange Network</h3>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="rounded-xl border border-white/5 bg-white/[0.015] p-4">
                  <svg width="100%" viewBox="0 0 100 90" className="aspect-[10/9]">
                    {/* Edges */}
                    {dataFlowEdges.map((e, i) => {
                      const from = getNode(e.from);
                      const to = getNode(e.to);
                      return (
                        <motion.line key={i}
                          x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                          stroke="hsl(260,40%,35%)" strokeWidth="0.15" strokeOpacity="0.4"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.5, delay: 0.6 + i * 0.05 }}
                        />
                      );
                    })}

                    {/* Animated signal pulses on edges */}
                    {dataFlowEdges.slice(0, 6).map((e, i) => {
                      const from = getNode(e.from);
                      const to = getNode(e.to);
                      return (
                        <motion.circle key={`pulse-${i}`} r="0.6"
                          fill="hsl(190,60%,50%)" opacity="0.7"
                          animate={{
                            cx: [from.x, to.x],
                            cy: [from.y, to.y],
                            opacity: [0.8, 0]
                          }}
                          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.5 + 1 }}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {dataFlowNodes.map((node, i) => (
                      <g key={i}>
                        <motion.circle cx={node.x} cy={node.y}
                          r={node.id === 'core' ? 5 : 3.5}
                          fill={node.id === 'core' ? 'hsl(260,40%,18%)' : 'hsl(225,25%,10%)'}
                          stroke={node.id === 'core' ? 'hsl(260,50%,45%)' : 'hsl(210,20%,25%)'}
                          strokeWidth="0.3"
                          animate={node.id === 'core' ? { r: [5, 5.5, 5], strokeOpacity: [0.5, 1, 0.5] } : {}}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <text x={node.x} y={node.y + (node.id === 'core' ? 0.5 : 0.5)}
                          textAnchor="middle" dominantBaseline="middle"
                          fill={node.id === 'core' ? 'hsl(260,60%,75%)' : 'hsl(210,20%,65%)'}
                          fontSize={node.id === 'core' ? '2.2' : '1.8'} fontWeight={node.id === 'core' ? '600' : '500'}>
                          {node.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                  <div className="flex items-center justify-center gap-4 mt-2 text-[8px] text-slate-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500/40" /> Intelligence Module</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600" /> AI Core</span>
                    <span className="flex items-center gap-1"><motion.span className="w-2 h-2 rounded-full bg-cyan-500"
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} /> Signal Flow</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Autonomy Controls */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-3.5 h-3.5 text-violet-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">Autonomy Controls</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Full Autonomous Optimization', desc: 'AI independently optimizes all subsystems', active: autoMode, toggle: setAutoMode },
                    { label: 'Strategic Insight Mode', desc: 'Generate recommendations without auto-execution', active: insightMode, toggle: setInsightMode },
                    { label: 'Human Override Governance', desc: 'Require manual approval for strategic changes', active: humanOverride, toggle: setHumanOverride },
                  ].map((ctrl, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Switch checked={ctrl.active} onCheckedChange={(v) => { ctrl.toggle(v); toast.success(`${ctrl.label} ${v ? 'enabled' : 'disabled'}`); }} className="mt-0.5" />
                      <div>
                        <p className={`text-[11px] font-medium ${ctrl.active ? 'text-white' : 'text-slate-500'}`}>{ctrl.label}</p>
                        <p className="text-[9px] text-slate-600">{ctrl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* System Intelligence Brief */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                className="rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-3.5 h-3.5 text-violet-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">System Brief</h4>
                </div>
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "All 6 intelligence engines operating within <span className="text-emerald-400 font-medium">healthy thresholds</span>. Combined throughput at <span className="text-white font-medium">9,740 signals/hour</span>."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Self-learning loop completed <span className="text-cyan-300 font-medium">model recalibration v3.7.2</span> — pricing accuracy improved by 0.4% MAE. Next cycle in ~4 hours."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Strategic priority: <span className="text-amber-300 font-medium">scale deal matching throughput</span> — investor conversion funnel showing capacity headroom."
                  </p>
                </div>
              </motion.div>

              {/* Performance Summary */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Performance</h4>
                <div className="space-y-2">
                  {[
                    { metric: 'Prediction Accuracy', value: '94.2%' },
                    { metric: 'Avg Latency', value: '118ms' },
                    { metric: 'Cache Hit Rate', value: '97.1%' },
                    { metric: 'Model Drift', value: '1.2%' },
                    { metric: 'Learning Cycles (24h)', value: '4' },
                    { metric: 'Active Data Points', value: '12.8M' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{m.metric}</span>
                      <span className="text-white font-medium">{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                className="space-y-2.5">
                <Button className="w-full bg-gradient-to-r from-violet-600/80 to-cyan-600/80 hover:from-violet-500 hover:to-cyan-500 text-white border-0 text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Intelligence Scenario Simulation launched')}>
                  <Rocket className="w-3.5 h-3.5 mr-2" /> Launch Simulation
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Strategic growth priority adjusted')}>
                  <Target className="w-3.5 h-3.5 mr-2" /> Adjust Priority
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('System Intelligence Report exported')}>
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

export default RealEstateIntelligenceOS;
