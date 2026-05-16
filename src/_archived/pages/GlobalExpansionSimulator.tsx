import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Shield, Zap, BarChart3, Users, Building2,
  Target, Activity, MapPin, ChevronRight, Download, Save,
  GitCompare, Lightbulb, Layers, ArrowUpRight, Radio, Crown,
  Scale, Landmark, Wifi, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MarketData {
  id: string;
  name: string;
  country: string;
  flag: string;
  potential: 'high' | 'emerging' | 'risky';
  investorDemand: number;
  digitalAdoption: number;
  competition: number;
  liquidity: number;
  regulatory: number;
  population: string;
  avgYield: string;
  gdpGrowth: string;
  coords: { x: number; y: number };
}

const markets: MarketData[] = [
  { id: 'jkt', name: 'Jakarta', country: 'Indonesia', flag: '🇮🇩', potential: 'high', investorDemand: 92, digitalAdoption: 78, competition: 65, liquidity: 85, regulatory: 72, population: '11.2M', avgYield: '7.2%', gdpGrowth: '5.1%', coords: { x: 62.5, y: 58 } },
  { id: 'bali', name: 'Bali', country: 'Indonesia', flag: '🇮🇩', potential: 'high', investorDemand: 96, digitalAdoption: 70, competition: 58, liquidity: 90, regulatory: 74, population: '4.4M', avgYield: '9.8%', gdpGrowth: '6.2%', coords: { x: 64, y: 60 } },
  { id: 'sgp', name: 'Singapore', country: 'Singapore', flag: '🇸🇬', potential: 'emerging', investorDemand: 88, digitalAdoption: 95, competition: 82, liquidity: 92, regulatory: 90, population: '5.9M', avgYield: '3.8%', gdpGrowth: '3.4%', coords: { x: 61, y: 54 } },
  { id: 'kl', name: 'Kuala Lumpur', country: 'Malaysia', flag: '🇲🇾', potential: 'emerging', investorDemand: 74, digitalAdoption: 72, competition: 55, liquidity: 70, regulatory: 68, population: '8.4M', avgYield: '5.5%', gdpGrowth: '4.7%', coords: { x: 60, y: 52 } },
  { id: 'bkk', name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', potential: 'emerging', investorDemand: 80, digitalAdoption: 68, competition: 60, liquidity: 75, regulatory: 62, population: '10.7M', avgYield: '6.1%', gdpGrowth: '3.8%', coords: { x: 58, y: 48 } },
  { id: 'hcm', name: 'Ho Chi Minh', country: 'Vietnam', flag: '🇻🇳', potential: 'high', investorDemand: 85, digitalAdoption: 62, competition: 42, liquidity: 65, regulatory: 55, population: '9.3M', avgYield: '7.8%', gdpGrowth: '6.8%', coords: { x: 60.5, y: 50 } },
  { id: 'mnl', name: 'Manila', country: 'Philippines', flag: '🇵🇭', potential: 'emerging', investorDemand: 70, digitalAdoption: 58, competition: 48, liquidity: 60, regulatory: 52, population: '14.4M', avgYield: '6.5%', gdpGrowth: '5.6%', coords: { x: 67, y: 48 } },
  { id: 'dub', name: 'Dubai', country: 'UAE', flag: '🇦🇪', potential: 'risky', investorDemand: 90, digitalAdoption: 88, competition: 92, liquidity: 88, regulatory: 82, population: '3.6M', avgYield: '5.2%', gdpGrowth: '3.1%', coords: { x: 42, y: 40 } },
  { id: 'syd', name: 'Sydney', country: 'Australia', flag: '🇦🇺', potential: 'risky', investorDemand: 82, digitalAdoption: 90, competition: 88, liquidity: 85, regulatory: 92, population: '5.4M', avgYield: '3.4%', gdpGrowth: '2.1%', coords: { x: 80, y: 72 } },
  { id: 'tky', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', potential: 'risky', investorDemand: 78, digitalAdoption: 85, competition: 90, liquidity: 80, regulatory: 88, population: '14.0M', avgYield: '3.1%', gdpGrowth: '1.2%', coords: { x: 76, y: 36 } },
];

const scenarios = [
  {
    name: 'Marketplace Launch',
    desc: 'Full marketplace with buyer & seller acquisition simultaneously',
    icon: Globe,
    timeline: '12–18 months',
    capitalEfficiency: 72,
    dominanceProb: 28,
    color: 'cyan',
  },
  {
    name: 'Developer Supply First',
    desc: 'Onboard premium developers to build listing inventory before demand',
    icon: Building2,
    timeline: '8–14 months',
    capitalEfficiency: 85,
    dominanceProb: 35,
    color: 'violet',
  },
  {
    name: 'Investor Network First',
    desc: 'Build demand-side network to attract supply through proven demand signals',
    icon: Users,
    timeline: '10–16 months',
    capitalEfficiency: 78,
    dominanceProb: 42,
    color: 'amber',
  },
];

const potentialColors = { high: '#22c55e', emerging: '#f59e0b', risky: '#ef4444' };
const potentialLabels = { high: 'High Potential', emerging: 'Emerging', risky: 'High Competition' };

const MetricBar = ({ value, color = 'cyan' }: { value: number; color?: string }) => {
  const gradients: Record<string, string> = {
    cyan: 'from-cyan-500 to-blue-500',
    emerald: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-red-500',
    violet: 'from-violet-500 to-purple-500',
  };
  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${gradients[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};

const GlobalExpansionSimulator = () => {
  const [selectedMarket, setSelectedMarket] = useState<MarketData>(markets[0]);

  return (
    <div className="min-h-screen bg-[hsl(225,28%,5%)] text-slate-100">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_40%,hsl(190,60%,8%,0.5),transparent)]" />
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
                    animate={{ boxShadow: ['0 0 12px hsl(190,80%,50%,0.08)', '0 0 24px hsl(190,80%,50%,0.15)', '0 0 12px hsl(190,80%,50%,0.08)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> STRATEGIC PLANNING
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                  AI Global Expansion Strategy
                </h1>
                <p className="text-sm text-slate-500 mt-1">Simulate market entry scenarios and growth potential across regions</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 text-xs" onClick={() => toast.success('Scenarios compared — report generated')}>
                  <GitCompare className="w-4 h-4 mr-2" /> Compare Entries
                </Button>
                <Button className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white border-0 text-xs" onClick={() => toast.success('Simulation report exported')}>
                  <Download className="w-4 h-4 mr-2" /> Export Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* World Map + Market Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.03] to-transparent p-6 min-h-[420px] relative overflow-hidden"
            >
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">Regional Expansion Map</h3>
              {/* Simplified world outline */}
              <div className="relative w-full h-[340px]">
                <svg viewBox="0 0 100 80" className="w-full h-full opacity-[0.06]" preserveAspectRatio="xMidYMid meet">
                  <path d="M5,25 Q15,20 25,22 T45,18 Q55,15 65,20 T85,22 Q90,25 95,28 M10,35 Q20,30 30,32 T50,28 Q60,30 70,32 T90,35 M15,45 Q25,40 35,42 T55,38 Q65,40 75,42 T90,45 M20,55 Q30,50 40,52 T60,48 Q70,55 80,58 T92,60 M25,65 Q35,60 45,62 T65,58 Q75,65 82,68" fill="none" stroke="hsl(190,40%,40%)" strokeWidth="0.3" />
                  <ellipse cx="50" cy="40" rx="42" ry="32" fill="none" stroke="hsl(190,30%,25%)" strokeWidth="0.2" strokeDasharray="1,1" />
                </svg>

                {/* Market dots */}
                {markets.map((m) => (
                  <motion.button
                    key={m.id}
                    className="absolute group"
                    style={{ left: `${m.coords.x}%`, top: `${m.coords.y}%`, transform: 'translate(-50%, -50%)' }}
                    onClick={() => setSelectedMarket(m)}
                    whileHover={{ scale: 1.3 }}
                  >
                    <motion.div
                      className="w-3.5 h-3.5 rounded-full border-2 relative"
                      style={{
                        backgroundColor: potentialColors[m.potential],
                        borderColor: selectedMarket.id === m.id ? 'white' : 'transparent',
                        boxShadow: `0 0 ${selectedMarket.id === m.id ? 12 : 6}px ${potentialColors[m.potential]}80`,
                      }}
                      animate={selectedMarket.id === m.id ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] text-white bg-black/60 px-1.5 py-0.5 rounded">{m.flag} {m.name}</span>
                    </div>
                    {selectedMarket.id === m.id && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: `1px solid ${potentialColors[m.potential]}` }}
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                {Object.entries(potentialLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: potentialColors[key as keyof typeof potentialColors] }} />
                    <span className="text-[10px] text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Market Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMarket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{selectedMarket.flag}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedMarket.name}</h3>
                      <p className="text-xs text-slate-500">{selectedMarket.country}</p>
                    </div>
                    <Badge
                      className="ml-auto text-[10px] border"
                      style={{
                        backgroundColor: `${potentialColors[selectedMarket.potential]}15`,
                        color: potentialColors[selectedMarket.potential],
                        borderColor: `${potentialColors[selectedMarket.potential]}30`,
                      }}
                    >
                      {potentialLabels[selectedMarket.potential]}
                    </Badge>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Population', value: selectedMarket.population },
                      { label: 'Avg Yield', value: selectedMarket.avgYield },
                      { label: 'GDP Growth', value: selectedMarket.gdpGrowth },
                    ].map((s, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                        <p className="text-sm font-bold text-white">{s.value}</p>
                        <p className="text-[9px] text-slate-600">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    {[
                      { label: 'Investor Demand', value: selectedMarket.investorDemand, icon: Users, color: 'cyan' },
                      { label: 'Digital Adoption', value: selectedMarket.digitalAdoption, icon: Wifi, color: 'violet' },
                      { label: 'Competitive Intensity', value: selectedMarket.competition, icon: Target, color: selectedMarket.competition > 75 ? 'rose' : 'amber' },
                      { label: 'Liquidity Environment', value: selectedMarket.liquidity, icon: Activity, color: 'emerald' },
                      { label: 'Regulatory Friendliness', value: selectedMarket.regulatory, icon: ShieldCheck, color: selectedMarket.regulatory > 70 ? 'emerald' : 'amber' },
                    ].map((metric, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <metric.icon className="w-3 h-3 text-slate-500" />
                            <span className="text-xs text-slate-400">{metric.label}</span>
                          </div>
                          <span className="text-xs font-semibold text-white">{metric.value}/100</span>
                        </div>
                        <MetricBar value={metric.value} color={metric.color} />
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-5 border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                    onClick={() => toast.success(`${selectedMarket.name} expansion scenario saved`)}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Expansion Scenario
                  </Button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Scenario Simulation + AI Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Scenarios */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Scenario Simulation — {selectedMarket.name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {scenarios.map((s, i) => {
                  const colorMap: Record<string, { bg: string; border: string; text: string; grad: string }> = {
                    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', grad: 'from-cyan-600 to-blue-600' },
                    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', grad: 'from-violet-600 to-purple-600' },
                    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', grad: 'from-amber-600 to-orange-600' },
                  };
                  const c = colorMap[s.color];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`rounded-2xl border ${c.border} bg-gradient-to-br from-white/[0.02] to-transparent p-5`}
                    >
                      <div className={`p-2.5 rounded-xl ${c.bg} w-fit mb-4`}>
                        <s.icon className={`w-5 h-5 ${c.text}`} />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{s.name}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-5">{s.desc}</p>

                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] text-slate-600 mb-1">Traction Timeline</p>
                          <p className="text-sm font-bold text-white">{s.timeline}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] text-slate-600">Capital Efficiency</p>
                            <p className="text-xs font-semibold text-white">{s.capitalEfficiency}%</p>
                          </div>
                          <MetricBar value={s.capitalEfficiency} color={s.color === 'cyan' ? 'cyan' : s.color === 'violet' ? 'violet' : 'amber'} />
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-slate-600">Dominance Probability</p>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold ${c.text}`}>{s.dominanceProb}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* AI Strategy Narrative */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-5"
            >
              <div className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider">AI Strategy Narrative</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    "Secondary tourism-driven markets show <span className="text-cyan-300 font-medium">faster initial traction</span> due
                    to cross-border investor interest. <span className="text-white font-medium">{selectedMarket.name}</span> presents
                    {selectedMarket.potential === 'high'
                      ? ' a strong entry window with rising demand signals and moderate competition.'
                      : selectedMarket.potential === 'emerging'
                      ? ' an emerging opportunity — early mover advantage is available but digital adoption needs acceleration.'
                      : ' a mature market with high barriers. Consider partnership-led entry to reduce capital risk.'}
                  </p>
                  <div className="h-px bg-white/5" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    "Investor network-first strategy yields <span className="text-amber-300 font-medium">highest dominance probability</span> in
                    ASEAN markets where proven demand signals attract developer supply organically."
                  </p>
                </div>
              </div>

              {/* Market Selector */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick Market Select</h4>
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                  {markets.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMarket(m)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-colors text-xs ${
                        selectedMarket.id === m.id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <span>{m.flag}</span>
                      <span className="text-white font-medium flex-1">{m.name}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: potentialColors[m.potential] }} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalExpansionSimulator;
