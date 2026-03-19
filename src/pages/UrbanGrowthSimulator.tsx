import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, Building2, MapPin, Users, Palmtree,
  ArrowUpRight, Download, Lightbulb, Eye, Zap, BarChart3,
  Globe, Layers, Compass, Signal, ChevronRight, Briefcase,
  Landmark, Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const mapNodes = [
  { id: 'bali', label: 'South Bali', x: 62, y: 38, prob: 87, growth: 'accelerating', size: 28 },
  { id: 'jakarta-s', label: 'South Jakarta', x: 28, y: 52, prob: 78, growth: 'steady', size: 22 },
  { id: 'bandung', label: 'Bandung Corridor', x: 35, y: 68, prob: 71, growth: 'emerging', size: 18 },
  { id: 'surabaya', label: 'East Surabaya', x: 72, y: 62, prob: 65, growth: 'early', size: 16 },
  { id: 'jogja', label: 'Jogjakarta', x: 48, y: 75, prob: 58, growth: 'emerging', size: 14 },
  { id: 'lombok', label: 'Lombok South', x: 78, y: 48, prob: 82, growth: 'accelerating', size: 20 },
];

const connections = [
  [0, 1], [0, 5], [1, 2], [1, 3], [2, 4], [3, 5],
];

const growthSignals = [
  { label: 'Infrastructure Pipeline', value: 87, signal: 'New toll road + transit links', icon: Landmark, trend: '+12%' },
  { label: 'Population Migration', value: 74, signal: 'Urban-to-suburban shift active', icon: Users, trend: '+8%' },
  { label: 'Lifestyle Demand Drivers', value: 91, signal: 'Remote work corridor forming', icon: Palmtree, trend: '+18%' },
  { label: 'Commercial Expansion', value: 68, signal: 'Retail + co-work pipeline', icon: Building2, trend: '+6%' },
  { label: 'Tourism Attractiveness', value: 82, signal: 'International arrivals rising', icon: Plane, trend: '+22%' },
  { label: 'Supply Saturation', value: 42, signal: 'Low — room for growth', icon: Layers, trend: '-3%' },
];

interface Scenario {
  name: string;
  appreciation: string;
  demandCurve: number[];
  liquidityTimeline: string;
  color: string;
  accent: string;
  border: string;
}

const scenarios: Scenario[] = [
  { name: 'Conservative Growth', appreciation: '+4.2–6.8%', demandCurve: [20, 25, 30, 35, 40, 45, 50, 55], liquidityTimeline: '18–24 months', color: 'from-teal-500/10 to-teal-500/5', accent: 'text-teal-500', border: 'border-teal-500/20' },
  { name: 'Accelerated Boom', appreciation: '+12–18%', demandCurve: [20, 35, 55, 70, 80, 85, 90, 92], liquidityTimeline: '6–12 months', color: 'from-amber-500/10 to-amber-500/5', accent: 'text-amber-500', border: 'border-amber-500/20' },
  { name: 'Delayed Development', appreciation: '+2.1–3.9%', demandCurve: [20, 22, 24, 25, 28, 32, 38, 42], liquidityTimeline: '24–36 months', color: 'from-violet-500/10 to-violet-500/5', accent: 'text-violet-500', border: 'border-violet-500/20' },
];

const opportunityZones = [
  { zone: 'Canggu-Pererenan', score: 92, velocity: 'Very High', competition: 'Moderate' },
  { zone: 'Tangerang South', score: 84, velocity: 'High', competition: 'Low' },
  { zone: 'Bandung East', score: 78, velocity: 'Moderate', competition: 'Low' },
  { zone: 'Kuta Selatan', score: 88, velocity: 'Very High', competition: 'High' },
  { zone: 'Surabaya West', score: 71, velocity: 'Moderate', competition: 'Very Low' },
];

const UrbanGrowthSimulator = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  const [followedZones, setFollowedZones] = useState<string[]>([]);

  const toggleFollow = (zone: string) => {
    setFollowedZones(prev =>
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
    toast.success(followedZones.includes(zone) ? `Unfollowed ${zone}` : `Following ${zone}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-foreground">
      {/* Ambient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,hsl(190,40%,95%,0.5),transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-200/60 bg-white/60 backdrop-blur-sm">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-100">
                    <Compass className="w-4 h-4 text-teal-600" />
                  </div>
                  <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[9px] uppercase tracking-widest font-medium">
                    Urban Simulator
                  </Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                  Predictive Urban Growth Intelligence
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Model future demand clusters and infrastructure-driven appreciation signals
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE MODEL
                </span>
                <Button
                  variant="outline"
                  className="text-[10px] h-7 px-3 border-slate-200"
                  onClick={() => toast.success('Urban Intelligence Brief exported')}
                >
                  <Download className="w-3 h-3 mr-1.5" /> EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Simulation Map + Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Simulation Map — Growth Zones</h3>
                <Badge variant="outline" className="text-[8px] border-slate-200 text-muted-foreground">6 ZONES ACTIVE</Badge>
              </div>
              <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-lg border border-slate-100 overflow-hidden">
                {/* Grid */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {Array.from({ length: 10 }, (_, i) => (
                    <g key={i}>
                      <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="hsl(210,20%,90%)" strokeWidth="0.2" />
                      <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="hsl(210,20%,90%)" strokeWidth="0.2" />
                    </g>
                  ))}
                  {/* Connections */}
                  {connections.map(([a, b], i) => (
                    <motion.line
                      key={i}
                      x1={mapNodes[a].x} y1={mapNodes[a].y}
                      x2={mapNodes[b].x} y2={mapNodes[b].y}
                      stroke="hsl(190,50%,75%)" strokeWidth="0.3" strokeDasharray="1,1"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    />
                  ))}
                </svg>

                {/* Growth zone rings */}
                {mapNodes.map((node, i) => (
                  <motion.div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.12, type: 'spring' }}
                  >
                    {/* Outer ring */}
                    <motion.div
                      className="absolute rounded-full border border-teal-300/30"
                      style={{
                        width: node.size * 2.5,
                        height: node.size * 2.5,
                        left: -(node.size * 2.5) / 2,
                        top: -(node.size * 2.5) / 2,
                        background: `radial-gradient(circle, hsl(190,60%,50%,${node.prob / 500}) 0%, transparent 70%)`,
                      }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    />
                    {/* Core dot */}
                    <div
                      className="rounded-full bg-teal-500 border-2 border-white shadow-sm"
                      style={{ width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
                    />
                    {/* Label */}
                    <div className="absolute left-3 top-[-6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/95 border border-slate-200 rounded px-2 py-1 shadow-sm">
                        <p className="text-[9px] font-semibold text-slate-800">{node.label}</p>
                        <p className="text-[8px] text-teal-600">{node.prob}% expansion probability</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                <span className="text-[8px] text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500" /> Growth Zone
                </span>
                <span className="text-[8px] text-muted-foreground flex items-center gap-1">
                  <span className="w-4 h-px bg-teal-300 inline-block" style={{ borderTop: '1px dashed' }} /> Flow Path
                </span>
                <span className="text-[8px] text-muted-foreground">Ring size = Expansion probability</span>
              </div>
            </motion.div>

            {/* Opportunity Pipeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur p-5"
            >
              <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Top Opportunity Zones</h3>
              <div className="space-y-2">
                {opportunityZones.map((z, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-teal-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-teal-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate">{z.zone}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                        <span>Velocity: <span className="text-slate-700 font-medium">{z.velocity}</span></span>
                        <span>Competition: <span className="text-slate-700">{z.competition}</span></span>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <span className="text-sm font-bold text-teal-600">{z.score}</span>
                      <p className="text-[8px] text-muted-foreground">SCORE</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Growth Signal Analytics Grid */}
          <div>
            <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Growth Signal Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {growthSignals.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur"
                >
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className="w-3.5 h-3.5 text-teal-500" />
                    <span className={`text-[9px] font-semibold ${s.value >= 70 ? 'text-emerald-600' : s.value >= 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {s.trend}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                  <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden mt-1.5 mb-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.08 }}
                    />
                  </div>
                  <p className="text-[9px] font-medium text-slate-700">{s.label}</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">{s.signal}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scenario Projections + AI Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Scenarios */}
            <div className="lg:col-span-2">
              <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Scenario Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {scenarios.map((s, i) => {
                  const isActive = activeScenario === i;
                  const maxVal = 100;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.08 }}
                      onClick={() => { setActiveScenario(i); toast.success(`${s.name} scenario selected`); }}
                      className={`p-4 rounded-xl border text-left transition-all ${isActive ? `${s.border} bg-gradient-to-b ${s.color}` : 'border-slate-200/80 bg-white/60 hover:bg-white/90'}`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${isActive ? s.accent : 'text-slate-700'}`}>{s.name}</p>

                      {/* Mini curve */}
                      <svg width="100%" height="40" viewBox="0 0 160 40" className="my-2">
                        <polyline
                          fill="none"
                          stroke={isActive ? 'currentColor' : '#94A3B8'}
                          strokeWidth="1.5"
                          className={isActive ? s.accent : ''}
                          points={s.demandCurve.map((v, idx) => `${(idx / 7) * 155 + 2.5},${38 - (v / maxVal) * 36}`).join(' ')}
                        />
                      </svg>

                      <div className="space-y-1.5 text-[9px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Appreciation</span>
                          <span className={`font-semibold ${isActive ? s.accent : 'text-slate-600'}`}>{s.appreciation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Liquidity</span>
                          <span className="text-slate-600">{s.liquidityTimeline}</span>
                        </div>
                      </div>
                      {isActive && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/50">
                          <Badge className={`text-[7px] border ${s.border} ${s.accent} bg-transparent`}>ACTIVE MODEL</Badge>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* AI Narrative + Actions */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-xl border border-teal-200/50 bg-teal-50/30 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-3.5 h-3.5 text-teal-600" />
                  <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">AI Urban Narrative</h4>
                </div>
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    "Transit-linked suburban clusters show <span className="text-teal-700 font-medium">rising mid-term appreciation probability</span> due to affordability shifts and remote work migration patterns."
                  </p>
                  <div className="h-px bg-teal-200/30" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    "Infrastructure pipeline in <span className="text-slate-800 font-medium">Bandung growth corridors</span> signals
                    <span className="text-emerald-600 font-medium"> 12–18 month lead time</span> before mainstream investor activity."
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="space-y-2"
              >
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white text-[10px] uppercase tracking-widest font-medium"
                  onClick={() => toast.success('Growth zone added to watchlist')}
                >
                  <Eye className="w-3.5 h-3.5 mr-2" /> Follow Growth Zone
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Investment strategy aligned to urban model')}
                >
                  <Zap className="w-3.5 h-3.5 mr-2" /> Align Strategy
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] uppercase tracking-widest"
                  onClick={() => toast.success('Urban Intelligence Brief exported')}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Export Brief
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrbanGrowthSimulator;
