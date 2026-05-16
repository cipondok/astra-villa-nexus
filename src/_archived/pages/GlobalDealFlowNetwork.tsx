import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, TrendingUp, Zap, Target, Users, Building2,
  Activity, Radio, ChevronRight, Download, Bell, Layers,
  Lightbulb, ArrowUpRight, Network, Handshake, MapPin,
  Star, Eye, BarChart3, Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const nodes = [
  { id: 'bali', name: 'Bali', x: 63, y: 58, intensity: 96, deals: 42, color: '#22c55e' },
  { id: 'jkt', name: 'Jakarta', x: 61, y: 55, intensity: 88, deals: 35, color: '#22c55e' },
  { id: 'bdg', name: 'Bandung', x: 60.5, y: 56.5, intensity: 78, deals: 18, color: '#f59e0b' },
  { id: 'sby', name: 'Surabaya', x: 64, y: 56, intensity: 72, deals: 14, color: '#f59e0b' },
  { id: 'sgp', name: 'Singapore', x: 59.5, y: 52, intensity: 82, deals: 22, color: '#22c55e' },
  { id: 'kl', name: 'KL', x: 58.5, y: 50, intensity: 68, deals: 12, color: '#f59e0b' },
  { id: 'bkk', name: 'Bangkok', x: 57, y: 46, intensity: 74, deals: 16, color: '#f59e0b' },
  { id: 'hcm', name: 'HCMC', x: 59.5, y: 48, intensity: 80, deals: 20, color: '#22c55e' },
];

const connections = [
  { from: 'bali', to: 'sgp' }, { from: 'jkt', to: 'sgp' }, { from: 'jkt', to: 'bali' },
  { from: 'sgp', to: 'kl' }, { from: 'bkk', to: 'hcm' }, { from: 'sgp', to: 'hcm' },
  { from: 'bdg', to: 'jkt' }, { from: 'sby', to: 'bali' },
];

const signals = [
  { text: 'Luxury coastal segment demand rising in Bali', type: 'Demand', delta: '+28% MoM', time: '3m ago', urgency: 'critical' },
  { text: 'Urban rental liquidity signals strengthening in Jakarta fringe', type: 'Liquidity', delta: '+19% velocity', time: '11m ago', urgency: 'positive' },
  { text: 'Developer pre-launch opportunities increasing in Bandung corridors', type: 'Supply', delta: '+14 new leads', time: '22m ago', urgency: 'positive' },
  { text: 'Cross-border investor interest surging for Nusa Dua projects', type: 'Investor', delta: '+42% inquiries', time: '38m ago', urgency: 'critical' },
  { text: 'Yield compression emerging in Singapore-linked Bali assets', type: 'Risk', delta: '-35bps QoQ', time: '1h ago', urgency: 'warning' },
];

const partners = [
  { label: 'Developer Network', value: 84, count: '126 partners', trend: '+12 this month', icon: Building2 },
  { label: 'Investor Network', value: 91, count: '2,840 investors', trend: '+340 this quarter', icon: Users },
  { label: 'Agent Collaboration', value: 76, count: '480 agents', trend: '+28 active', icon: Handshake },
];

const opportunities = [
  { zone: 'Canggu-Seminyak Corridor', country: '🇮🇩', score: 94, velocity: '+38%', competition: 'Moderate', segment: 'Luxury Villa' },
  { zone: 'South Jakarta Urban Core', country: '🇮🇩', score: 89, velocity: '+24%', competition: 'High', segment: 'Urban Rental' },
  { zone: 'Nusa Dua Tourism Belt', country: '🇮🇩', score: 91, velocity: '+31%', competition: 'Low', segment: 'Resort' },
  { zone: 'Bandung Highland Growth', country: '🇮🇩', score: 82, velocity: '+18%', competition: 'Low', segment: 'Emerging' },
  { zone: 'District 2 HCMC', country: '🇻🇳', score: 85, velocity: '+22%', competition: 'Moderate', segment: 'Off-plan' },
  { zone: 'Phuket West Coast', country: '🇹🇭', score: 83, velocity: '+20%', competition: 'Moderate', segment: 'Resort Villa' },
];

const urgencyStyles: Record<string, string> = {
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const compColors: Record<string, string> = { Low: 'text-emerald-400', Moderate: 'text-amber-400', High: 'text-rose-400' };

const GlobalDealFlowNetwork = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNode = (id: string) => nodes.find(n => n.id === id)!;

  return (
    <div className="min-h-screen bg-[hsl(225,28%,5%)] text-slate-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_35%,hsl(220,50%,8%,0.6),transparent)]" />
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
                    animate={{ boxShadow: ['0 0 12px hsl(190,80%,50%,0.08)', '0 0 22px hsl(190,80%,50%,0.15)', '0 0 12px hsl(190,80%,50%,0.08)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Network className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] gap-1.5">
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    GLOBAL NETWORK
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                  Global Deal Flow Intelligence
                </h1>
                <p className="text-sm text-slate-500 mt-1">Tracking high-opportunity property signals across strategic markets</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 text-xs" onClick={() => toast.success('Network intelligence report generated')}>
                  <Download className="w-4 h-4 mr-2" /> Generate Report
                </Button>
                <Button className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white border-0 text-xs" onClick={() => toast.success('Global deal alerts activated')}>
                  <Bell className="w-4 h-4 mr-2" /> Activate Alerts
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* Map + Partner Network */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Global Signal Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.03] to-transparent p-6 min-h-[400px] relative overflow-hidden"
            >
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">Global Opportunity Signal Map</h3>
              <div className="relative w-full h-[340px]">
                {/* Grid lines */}
                <svg viewBox="0 0 100 80" className="w-full h-full absolute inset-0 opacity-[0.04]" preserveAspectRatio="xMidYMid meet">
                  {[...Array(9)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="hsl(190,40%,50%)" strokeWidth="0.15" />)}
                  {[...Array(11)].map((_, i) => <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="80" stroke="hsl(190,40%,50%)" strokeWidth="0.15" />)}
                </svg>

                {/* Connection lines */}
                <svg viewBox="0 0 100 80" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid meet">
                  {connections.map((c, i) => {
                    const from = getNode(c.from);
                    const to = getNode(c.to);
                    return (
                      <motion.line
                        key={i}
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke="hsl(190,60%,40%)"
                        strokeWidth="0.15"
                        strokeDasharray="0.5,0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.15, 0.35, 0.15] }}
                        transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => (
                  <motion.button
                    key={node.id}
                    className="absolute group"
                    style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => toast.info(`${node.name}: ${node.deals} active deals, intensity ${node.intensity}/100`)}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: node.color, width: 32, height: 32, margin: '-10px' }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0, 0.15] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{
                        backgroundColor: node.color,
                        borderColor: hoveredNode === node.id ? 'white' : 'transparent',
                        boxShadow: `0 0 ${hoveredNode === node.id ? 14 : 8}px ${node.color}80`,
                      }}
                    />
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity ${hoveredNode === node.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[9px] text-white border border-white/10">
                        {node.name} · {node.deals} deals · {node.intensity}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-500">High Intensity</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] text-slate-500">Emerging</span></div>
              </div>
              <div className="absolute bottom-6 right-6 text-[10px] text-slate-600">
                {nodes.reduce((s, n) => s + n.deals, 0)} active deals across {nodes.length} markets
              </div>
            </motion.div>

            {/* Partner Network */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-xs text-slate-500 uppercase tracking-wider">Partner Network</h3>
              {partners.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-4 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10">
                      <p.icon className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-xs font-medium text-white">{p.label}</span>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold text-white">{p.value}<span className="text-sm text-slate-500">/100</span></span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.value}%` }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.15 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">{p.count}</span>
                    <span className="text-emerald-400">{p.trend}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Activity Stream + Opportunity Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deal Flow Activity */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Deal Flow Stream</h2>
                <motion.span className="w-2 h-2 rounded-full bg-cyan-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </div>
              <div className="space-y-3">
                {signals.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <p className="text-xs text-white font-medium leading-relaxed">{s.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] border ${urgencyStyles[s.urgency]}`}>{s.type}</Badge>
                        <span className="text-[10px] text-slate-600">{s.time}</span>
                      </div>
                      <span className={`text-[10px] font-semibold ${s.urgency === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{s.delta}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Brief */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-5 p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.04]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">AI Network Brief</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  "Network intelligence shows <span className="text-cyan-300 font-medium">strongest deal flow concentration</span> in
                  Bali-Singapore corridor. Cross-border investor activity is
                  <span className="text-white font-medium"> 42% above quarterly average</span> — recommend expanding
                  developer partnerships in emerging Bandung highland zone."
                </p>
              </motion.div>
            </div>

            {/* Opportunity Pipeline */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Opportunity Pipeline</h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-6 gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
                  <span className="col-span-2">Zone</span>
                  <span className="text-center">Score</span>
                  <span className="text-center">Velocity</span>
                  <span className="text-center">Competition</span>
                  <span className="text-center">Segment</span>
                </div>
                {opportunities.map((opp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.06 }}
                    className="grid grid-cols-6 gap-2 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer items-center"
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-sm">{opp.country}</span>
                      <div>
                        <p className="text-xs font-medium text-white">{opp.zone}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-white">{opp.score}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-semibold text-emerald-400">{opp.velocity}</span>
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-medium ${compColors[opp.competition]}`}>{opp.competition}</span>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-white/5 text-slate-400 border-white/10 text-[9px]">{opp.segment}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action row */}
              <div className="flex gap-3 mt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-600/80 to-violet-600/80 hover:from-cyan-500 hover:to-violet-500 text-white border-0 text-xs"
                  onClick={() => toast.success('Strategic markets followed — alerts active')}
                >
                  <Star className="w-4 h-4 mr-2" /> Follow Strategic Markets
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                  onClick={() => toast.success('Network report exported')}
                >
                  <Download className="w-4 h-4 mr-2" /> Export Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDealFlowNetwork;
