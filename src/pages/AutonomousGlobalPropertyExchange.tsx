import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Zap, TrendingUp, Activity, Users, Shield,
  ArrowUpRight, Bell, DoorOpen, Eye, Layers, BarChart3,
  Radio, Wallet, Building2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const marketNodes = [
  { city: 'Jakarta', x: 68, y: 52, intensity: 92, flow: 'High' },
  { city: 'Singapore', x: 66, y: 54, intensity: 88, flow: 'High' },
  { city: 'Dubai', x: 52, y: 38, intensity: 76, flow: 'Medium' },
  { city: 'London', x: 42, y: 24, intensity: 71, flow: 'Medium' },
  { city: 'Sydney', x: 82, y: 72, intensity: 68, flow: 'Medium' },
  { city: 'Tokyo', x: 80, y: 32, intensity: 64, flow: 'Low' },
  { city: 'New York', x: 24, y: 30, intensity: 82, flow: 'High' },
  { city: 'Bali', x: 70, y: 56, intensity: 95, flow: 'High' },
  { city: 'Miami', x: 22, y: 40, intensity: 73, flow: 'Medium' },
  { city: 'Hong Kong', x: 74, y: 38, intensity: 79, flow: 'High' },
];

const flowLines = [
  { from: 'Singapore', to: 'Bali' }, { from: 'Hong Kong', to: 'Jakarta' },
  { from: 'Dubai', to: 'London' }, { from: 'New York', to: 'Miami' },
  { from: 'Tokyo', to: 'Sydney' }, { from: 'London', to: 'Dubai' },
  { from: 'Singapore', to: 'Sydney' },
];

const dealSignals = [
  { text: 'High-yield coastal villas gaining investor traction — Bali demand +34% MoM', tag: 'HOT', urgency: 'high' },
  { text: 'Urban rental liquidity strengthening in secondary cities — Surabaya, Bandung clusters', tag: 'RISING', urgency: 'medium' },
  { text: 'Developer pre-launch demand rising in Jakarta growth corridors — 2.8x oversubscription', tag: 'PRE-LAUNCH', urgency: 'high' },
  { text: 'Cross-border capital inflow accelerating from Singapore into Indonesian luxury segment', tag: 'FLOW', urgency: 'medium' },
  { text: 'Dubai commercial yields compressing — capital rotation toward SEA residential detected', tag: 'ROTATION', urgency: 'low' },
];

const matchScore = 87;
const capitalSuitability = 74;
const crossBorderDemand = 81;

const AutonomousGlobalPropertyExchange = () => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const getNodeByCity = (city: string) => marketNodes.find(n => n.city === city);

  return (
    <div className="min-h-screen bg-[hsl(225,30%,4%)] text-slate-100 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,hsl(210,50%,7%,0.6),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_80%_60%,hsl(170,40%,6%,0.4),transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/5 bg-white/[0.01] backdrop-blur-sm">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] uppercase tracking-widest">
                    Global Exchange
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-widest">
                    LIVE
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-cyan-300 via-emerald-300 to-slate-300 bg-clip-text text-transparent">
                  Global Property Exchange
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">AI-driven real estate opportunity matching across international markets</p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <motion.span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-slate-400"
                  animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <Radio className="w-3 h-3 text-emerald-400" /> 10 MARKETS · 847 LIVE DEALS
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-5">
          {/* Global Exchange Map */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-white/5 bg-white/[0.015] p-4 md:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Global Opportunity Map</h3>
              <div className="flex items-center gap-3 text-[8px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> High Flow</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> Low</span>
              </div>
            </div>
            <div className="relative w-full aspect-[2.4/1] bg-[hsl(225,25%,6%)] rounded-lg overflow-hidden">
              {/* Simplified world outline */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
                {/* Continent silhouettes */}
                <ellipse cx="30" cy="32" rx="14" ry="10" fill="hsl(225,20%,10%)" />
                <ellipse cx="45" cy="30" rx="10" ry="14" fill="hsl(225,20%,10%)" />
                <ellipse cx="55" cy="42" rx="6" ry="8" fill="hsl(225,20%,10%)" />
                <ellipse cx="70" cy="50" rx="8" ry="6" fill="hsl(225,20%,10%)" />
                <ellipse cx="80" cy="65" rx="6" ry="5" fill="hsl(225,20%,10%)" />
                <ellipse cx="78" cy="34" rx="5" ry="7" fill="hsl(225,20%,10%)" />

                {/* Flow lines */}
                {flowLines.map((fl, i) => {
                  const from = getNodeByCity(fl.from);
                  const to = getNodeByCity(fl.to);
                  if (!from || !to) return null;
                  return (
                    <motion.line key={i}
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="hsl(190,60%,40%)" strokeWidth="0.15" strokeOpacity="0.3"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5 + i * 0.15 }}
                    />
                  );
                })}

                {/* Opportunity nodes */}
                {marketNodes.map((node, i) => (
                  <g key={i} onClick={() => setSelectedNode(i)} className="cursor-pointer">
                    <motion.circle cx={node.x} cy={node.y} r="1.8"
                      fill={node.intensity > 80 ? 'hsl(160,60%,45%)' : node.intensity > 65 ? 'hsl(190,60%,50%)' : 'hsl(220,20%,50%)'}
                      animate={{ r: [1.5, 2.2, 1.5], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                    />
                    <text x={node.x} y={node.y - 3} textAnchor="middle" fill="hsl(210,20%,60%)" fontSize="2" fontWeight="500">
                      {node.city}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Selected node detail */}
              {selectedNode !== null && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 right-3 p-3 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] min-w-[160px]">
                  <p className="text-white font-semibold mb-1">{marketNodes[selectedNode].city}</p>
                  <div className="space-y-1 text-slate-400">
                    <div className="flex justify-between"><span>Intensity</span><span className="text-white">{marketNodes[selectedNode].intensity}/100</span></div>
                    <div className="flex justify-between"><span>Capital Flow</span><span className="text-cyan-400">{marketNodes[selectedNode].flow}</span></div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Deal Flow + Matching + Transaction */}
            <div className="lg:col-span-2 space-y-5">
              {/* Live Deal Flow */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Live Deal Flow</h3>
                <div className="space-y-2">
                  {dealSignals.map((d, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        d.urgency === 'high' ? 'border-emerald-500/15 bg-emerald-500/[0.03]' :
                        d.urgency === 'medium' ? 'border-cyan-500/15 bg-cyan-500/[0.03]' :
                        'border-white/5 bg-white/[0.02]'
                      }`}>
                      <Activity className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-slate-300 leading-relaxed flex-1">{d.text}</p>
                      <Badge className={`text-[7px] flex-shrink-0 ${
                        d.urgency === 'high' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        d.urgency === 'medium' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        'bg-white/5 text-slate-500 border-white/10'
                      }`}>{d.tag}</Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Matching Engine + Transaction Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matching Engine */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest mb-4 font-medium">Matching Engine</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-slate-400">AI Match Confidence</span>
                        <span className="text-white font-bold">{matchScore}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                          initial={{ width: 0 }} animate={{ width: `${matchScore}%` }} transition={{ duration: 1 }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-slate-400">Capital Suitability</span>
                        <span className="text-white font-bold">{capitalSuitability}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                          initial={{ width: 0 }} animate={{ width: `${capitalSuitability}%` }} transition={{ duration: 1, delay: 0.1 }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-slate-400">Cross-Border Demand</span>
                        <span className="text-white font-bold">{crossBorderDemand}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                          initial={{ width: 0 }} animate={{ width: `${crossBorderDemand}%` }} transition={{ duration: 1, delay: 0.2 }} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Transaction Access */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest mb-4 font-medium">Transaction Access</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Entry Ticket', value: 'From Rp 500M', icon: Wallet, sub: 'Fractional available from Rp 50M' },
                      { label: 'Ownership Structure', value: 'Freehold / Leasehold', icon: Building2, sub: 'PT PMA structure for foreign buyers' },
                      { label: 'Liquidity Exit', value: '~30-90 days', icon: Clock, sub: 'Secondary market access enabled' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="p-1.5 rounded-md bg-white/[0.03] border border-white/5">
                          <t.icon className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{t.label}</span>
                          </div>
                          <p className="text-[11px] text-white font-medium">{t.value}</p>
                          <p className="text-[9px] text-slate-500">{t.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Market Pulse */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Exchange Pulse</h4>
                <div className="space-y-2.5">
                  {[
                    { metric: 'Active Markets', value: '10', change: '+2' },
                    { metric: 'Live Opportunities', value: '847', change: '+63' },
                    { metric: 'Deal Volume (30d)', value: 'Rp 2.4T', change: '+18%' },
                    { metric: 'Avg Match Score', value: '74/100', change: '+4' },
                    { metric: 'Cross-Border Deals', value: '124', change: '+31%' },
                    { metric: 'Investor Sessions', value: '3,291', change: '+22%' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{s.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{s.value}</span>
                        <span className="text-emerald-400 text-[8px]">{s.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* AI Intelligence Brief */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">Exchange Intelligence</h4>
                </div>
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Capital rotation from <span className="text-white font-medium">Middle East commercial</span> toward
                    <span className="text-emerald-400 font-medium"> Southeast Asian residential</span> is accelerating — Bali and Jakarta receiving highest inflow signals."
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Cross-border matching engine detecting <span className="text-cyan-300 font-medium">3.2x higher conversion</span> on pre-launch opportunities vs secondary market listings."
                  </p>
                </div>
              </motion.div>

              {/* Top Opportunity */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[7px] uppercase mb-2">
                  Top Opportunity
                </Badge>
                <p className="text-sm font-semibold text-white mb-1">Bali Coastal Villa Portfolio</p>
                <p className="text-[10px] text-slate-400 mb-3">Curated 5-unit beachfront collection · Pre-launch pricing</p>
                <div className="space-y-1.5 text-[9px]">
                  <div className="flex justify-between"><span className="text-slate-500">Projected Yield</span><span className="text-emerald-400 font-medium">14.2%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">AI Score</span><span className="text-white font-medium">94/100</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Demand Signal</span><span className="text-cyan-400 font-medium">Very High</span></div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                className="space-y-2.5">
                <Button className="w-full bg-gradient-to-r from-cyan-600/80 to-emerald-600/80 hover:from-cyan-500 hover:to-emerald-500 text-white border-0 text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Entering Global Deal Room')}>
                  <DoorOpen className="w-3.5 h-3.5 mr-2" /> Enter Deal Room
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Market follow activated')}>
                  <Eye className="w-3.5 h-3.5 mr-2" /> Follow Market
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Autonomous deal alerts activated')}>
                  <Bell className="w-3.5 h-3.5 mr-2" /> Activate Deal Alerts
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousGlobalPropertyExchange;
