import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Users, Zap, TrendingUp, Activity, Link2,
  Radio, Bell, MessageSquare, BarChart3, ArrowUpRight,
  Shield, Layers, Crown, Network, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const investorNodes = [
  { city: 'Jakarta', x: 68, y: 52, investors: 342, influence: 94, tier: 'Platinum' },
  { city: 'Singapore', x: 66, y: 55, investors: 218, influence: 91, tier: 'Platinum' },
  { city: 'Dubai', x: 52, y: 38, investors: 156, influence: 82, tier: 'Gold' },
  { city: 'London', x: 42, y: 24, investors: 189, influence: 78, tier: 'Gold' },
  { city: 'Sydney', x: 82, y: 72, investors: 97, influence: 68, tier: 'Silver' },
  { city: 'Hong Kong', x: 74, y: 38, investors: 264, influence: 88, tier: 'Platinum' },
  { city: 'New York', x: 24, y: 30, investors: 178, influence: 85, tier: 'Gold' },
  { city: 'Bali', x: 70, y: 57, investors: 128, influence: 76, tier: 'Gold' },
  { city: 'Tokyo', x: 80, y: 32, investors: 143, influence: 74, tier: 'Silver' },
  { city: 'Zurich', x: 44, y: 26, investors: 82, influence: 71, tier: 'Silver' },
];

const corridors = [
  { from: 1, to: 0 }, { from: 5, to: 0 }, { from: 1, to: 7 },
  { from: 6, to: 3 }, { from: 2, to: 0 }, { from: 3, to: 2 },
  { from: 5, to: 4 }, { from: 6, to: 2 }, { from: 8, to: 1 },
];

const matchingSignals = [
  { text: 'High-yield focused investors clustering in Bali segment — 128 active, 34% growth MoM', tag: 'CLUSTER', urgency: 'high' },
  { text: 'Growth-oriented investors exploring secondary urban markets — Surabaya & Bandung corridors', tag: 'EMERGING', urgency: 'medium' },
  { text: 'Institutional capital interest emerging in mixed-use developments — 3 funds in pipeline', tag: 'INSTITUTIONAL', urgency: 'high' },
  { text: 'Cross-border syndication forming for Jakarta premium commercial portfolio — Rp 45B target', tag: 'SYNDICATE', urgency: 'high' },
  { text: 'Angel investor network activating for fractional tokenized villa opportunities', tag: 'FRACTIONAL', urgency: 'medium' },
];

const collabCards = [
  { label: 'Syndication Potential', value: 84, trend: '+12%', desc: 'Co-investment readiness across matched investors' },
  { label: 'Co-Investment Compatibility', value: 72, trend: '+8%', desc: 'Strategy alignment between connected profiles' },
  { label: 'Capital Alignment Signal', value: 78, trend: '+6%', desc: 'Budget and risk tolerance matching strength' },
  { label: 'Cross-Border Momentum', value: 81, trend: '+15%', desc: 'International participation acceleration rate' },
];

const topInvestors = [
  { rank: 1, name: 'SG Capital Partners', influence: 96, deals: 24, tier: 'Platinum' },
  { rank: 2, name: 'HK Real Estate Fund', influence: 93, deals: 19, tier: 'Platinum' },
  { rank: 3, name: 'Jakarta Prime Group', influence: 91, deals: 31, tier: 'Platinum' },
  { rank: 4, name: 'Dubai Ventures RE', influence: 87, deals: 15, tier: 'Gold' },
  { rank: 5, name: 'London Asia RE Trust', influence: 84, deals: 12, tier: 'Gold' },
];

const GlobalInvestorNetworkAI = () => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const tierColor = (t: string) =>
    t === 'Platinum' ? 'text-cyan-400' : t === 'Gold' ? 'text-amber-400' : 'text-slate-400';
  const tierBg = (t: string) =>
    t === 'Platinum' ? 'bg-cyan-500/10 border-cyan-500/20' : t === 'Gold' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10';

  return (
    <div className="min-h-screen bg-[hsl(225,30%,4%)] text-slate-100 font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_45%_25%,hsl(210,45%,8%,0.5),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_30%_at_75%_65%,hsl(260,40%,7%,0.4),transparent)]" />
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-cyan-500/15"
            style={{ left: `${8 + (i * 8) % 85}%`, top: `${12 + (i * 11) % 70}%` }}
            animate={{ opacity: [0.05, 0.35, 0.05], scale: [1, 1.8, 1] }}
            transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: i * 0.25 }}
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
                    <Network className="w-4 h-4 text-cyan-400" />
                  </div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] uppercase tracking-widest">Investor Network</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-widest">AI-Orchestrated</Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-200 bg-clip-text text-transparent">
                  Autonomous Investor Network
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">AI-driven connection intelligence across global real estate investors</p>
              </div>
              <motion.span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] text-slate-400"
                animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <Radio className="w-3 h-3 text-emerald-400" /> 1,797 INVESTORS · 10 MARKETS
              </motion.span>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-5">
          {/* Global Network Map */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-white/5 bg-white/[0.015] p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Global Investor Network</h3>
              <div className="flex items-center gap-3 text-[8px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Platinum</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Gold</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> Silver</span>
              </div>
            </div>
            <div className="relative w-full aspect-[2.4/1] bg-[hsl(225,25%,5.5%)] rounded-lg overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
                <ellipse cx="30" cy="32" rx="14" ry="10" fill="hsl(225,20%,9%)" />
                <ellipse cx="45" cy="30" rx="10" ry="14" fill="hsl(225,20%,9%)" />
                <ellipse cx="55" cy="42" rx="6" ry="8" fill="hsl(225,20%,9%)" />
                <ellipse cx="70" cy="50" rx="8" ry="6" fill="hsl(225,20%,9%)" />
                <ellipse cx="80" cy="65" rx="6" ry="5" fill="hsl(225,20%,9%)" />
                <ellipse cx="78" cy="34" rx="5" ry="7" fill="hsl(225,20%,9%)" />

                {corridors.map((c, i) => {
                  const from = investorNodes[c.from];
                  const to = investorNodes[c.to];
                  return (
                    <g key={i}>
                      <motion.line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke="hsl(200,40%,30%)" strokeWidth="0.12" strokeOpacity="0.4"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 0.4 + i * 0.1 }}
                      />
                      <motion.circle r="0.5" fill="hsl(190,60%,50%)" opacity="0.6"
                        animate={{ cx: [from.x, to.x], cy: [from.y, to.y], opacity: [0.6, 0] }}
                        transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: 1 + i * 0.4 }}
                      />
                    </g>
                  );
                })}

                {investorNodes.map((node, i) => {
                  const color = node.tier === 'Platinum' ? 'hsl(190,60%,50%)' : node.tier === 'Gold' ? 'hsl(40,70%,55%)' : 'hsl(220,15%,50%)';
                  return (
                    <g key={i} onClick={() => setSelectedNode(i)} className="cursor-pointer">
                      <motion.circle cx={node.x} cy={node.y} r="2.2" fill={color} fillOpacity="0.12"
                        stroke={color} strokeWidth="0.2" strokeOpacity="0.5"
                        animate={{ r: [1.8, 2.5, 1.8], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                      />
                      <text x={node.x} y={node.y - 3.5} textAnchor="middle" fill="hsl(210,20%,60%)" fontSize="1.8" fontWeight="500">{node.city}</text>
                      <text x={node.x} y={node.y + 0.5} textAnchor="middle" fill="white" fontSize="1.5" fontWeight="600">{node.investors}</text>
                    </g>
                  );
                })}
              </svg>

              {selectedNode !== null && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 right-3 p-3 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] min-w-[170px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-white font-semibold">{investorNodes[selectedNode].city}</p>
                    <Badge className={`text-[7px] ${tierBg(investorNodes[selectedNode].tier)} ${tierColor(investorNodes[selectedNode].tier)}`}>
                      {investorNodes[selectedNode].tier}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div className="flex justify-between"><span>Investors</span><span className="text-white">{investorNodes[selectedNode].investors}</span></div>
                    <div className="flex justify-between"><span>Influence</span><span className="text-cyan-400">{investorNodes[selectedNode].influence}/100</span></div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Network Matching */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Network Intelligence Signals</h3>
                <div className="space-y-2">
                  {matchingSignals.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        s.urgency === 'high' ? 'border-cyan-500/15 bg-cyan-500/[0.03]' : 'border-white/5 bg-white/[0.02]'
                      }`}>
                      <Users className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-slate-300 leading-relaxed flex-1">{s.text}</p>
                      <Badge className={`text-[7px] flex-shrink-0 ${
                        s.urgency === 'high' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/5 text-slate-500 border-white/10'
                      }`}>{s.tag}</Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Collaboration Signal Grid */}
              <div>
                <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Collaboration Signals</h3>
                <div className="grid grid-cols-2 gap-3">
                  {collabCards.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] text-emerald-400 font-semibold">{c.trend}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-xl font-bold text-white">{c.value}</span>
                        <span className="text-[9px] text-slate-500">/100</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium mb-0.5">{c.label}</p>
                      <p className="text-[9px] text-slate-500 leading-relaxed">{c.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Relationship Intelligence */}
            <div className="space-y-5">
              {/* Top Investors */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">Influence Ranking</h4>
                </div>
                <div className="space-y-2.5">
                  {topInvestors.map((inv, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-600 w-4 font-mono">#{inv.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white font-medium truncate">{inv.name}</p>
                        <p className="text-[8px] text-slate-500">{inv.deals} deals · <span className={tierColor(inv.tier)}>{inv.tier}</span></p>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-bold">{inv.influence}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pipeline & Velocity */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-medium">Network Metrics</h4>
                <div className="space-y-2">
                  {[
                    { metric: 'Active Collaborations', value: '34' },
                    { metric: 'Syndicate Pipelines', value: '8' },
                    { metric: 'Expansion Velocity', value: '+22%/mo' },
                    { metric: 'Avg Connection Score', value: '76/100' },
                    { metric: 'Cross-Border Links', value: '156' },
                    { metric: 'Network Value', value: 'Rp 124B' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{m.metric}</span>
                      <span className="text-white font-medium">{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* AI Brief */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                className="rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-widest">Network Intelligence</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  "Singapore-Jakarta capital corridor showing <span className="text-cyan-300 font-medium">strongest connection density</span> — 3 active syndication pipelines forming around premium residential assets."
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                className="space-y-2.5">
                <Button className="w-full bg-gradient-to-r from-cyan-600/80 to-violet-600/80 hover:from-cyan-500 hover:to-violet-500 text-white border-0 text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Strategic connection initiated')}>
                  <Link2 className="w-3.5 h-3.5 mr-2" /> Initiate Connection
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Joined investment syndicate channel')}>
                  <MessageSquare className="w-3.5 h-3.5 mr-2" /> Join Syndicate
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Network intelligence alerts activated')}>
                  <Bell className="w-3.5 h-3.5 mr-2" /> Activate Alerts
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalInvestorNetworkAI;
