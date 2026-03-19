import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, TrendingUp, Shield, Droplets, Target, BarChart3,
  Download, GitCompare, Zap, Lightbulb, ArrowUpRight, Building2,
  Home, Palmtree, HardHat, DollarSign, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

type Preset = 'conservative' | 'balanced' | 'aggressive';

const presets: { key: Preset; label: string; desc: string; allocations: number[] }[] = [
  { key: 'conservative', label: 'Conservative Income', desc: 'Maximize rental yield, minimize risk', allocations: [15, 25, 45, 15] },
  { key: 'balanced', label: 'Balanced Growth', desc: 'Blend yield with appreciation upside', allocations: [30, 25, 25, 20] },
  { key: 'aggressive', label: 'Aggressive Alpha', desc: 'High growth, emerging market exposure', allocations: [35, 15, 15, 35] },
];

const segmentMeta = [
  { name: 'Luxury Villas', icon: Palmtree, color: 'hsl(270,65%,55%)', tailwind: 'text-violet-500' },
  { name: 'Urban Houses', icon: Home, color: 'hsl(210,70%,55%)', tailwind: 'text-blue-500' },
  { name: 'Rental Apartments', icon: Building2, color: 'hsl(160,65%,45%)', tailwind: 'text-emerald-500' },
  { name: 'Off-plan Projects', icon: HardHat, color: 'hsl(35,85%,55%)', tailwind: 'text-amber-500' },
];

const opportunities = [
  { name: 'Canggu Beachfront Villa', segment: 0, score: 92, yield: '8.2–9.6%', liquidity: 'High', diversification: 'Location hedge', price: 'IDR 4.2B' },
  { name: 'South Jakarta Townhouse', segment: 1, score: 78, yield: '5.4–6.8%', liquidity: 'Medium', diversification: 'Urban exposure', price: 'IDR 5.8B' },
  { name: 'Surabaya Serviced Apt', segment: 2, score: 85, yield: '9.1–10.4%', liquidity: 'High', diversification: 'Cash flow anchor', price: 'IDR 1.9B' },
  { name: 'Lombok Bay Off-plan', segment: 3, score: 88, yield: '—', liquidity: 'Low', diversification: 'Growth catalyst', price: 'IDR 2.4B' },
];

const liquidityColors: Record<string, string> = { High: 'text-emerald-600 dark:text-emerald-400', Medium: 'text-blue-600 dark:text-blue-400', Low: 'text-amber-600 dark:text-amber-400' };

const CapitalAllocationOptimizer = () => {
  const [budget, setBudget] = useState('10000000000');
  const [activePreset, setActivePreset] = useState<Preset>('balanced');
  const [allocations, setAllocations] = useState([30, 25, 25, 20]);

  const budgetNum = parseInt(budget) || 0;
  const formatIDR = (n: number) => `IDR ${(n / 1e9).toFixed(1)}B`;
  const total = allocations.reduce((a, b) => a + b, 0);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset);
    const p = presets.find(pr => pr.key === preset);
    if (p) setAllocations([...p.allocations]);
  };

  const updateAllocation = (index: number, value: number[]) => {
    const newAlloc = [...allocations];
    const diff = value[0] - newAlloc[index];
    newAlloc[index] = value[0];
    // Redistribute remainder proportionally across other segments
    const others = newAlloc.filter((_, i) => i !== index);
    const othersSum = others.reduce((a, b) => a + b, 0);
    if (othersSum > 0) {
      let remaining = diff;
      for (let i = 0; i < newAlloc.length; i++) {
        if (i !== index) {
          const share = (newAlloc[i] / othersSum) * remaining;
          newAlloc[i] = Math.max(0, Math.round(newAlloc[i] - share));
        }
      }
    }
    setAllocations(newAlloc);
    setActivePreset(undefined as any);
  };

  // Donut chart calculations
  const radius = 70;
  const cx = 90;
  const cy = 90;
  let cumulativePercent = 0;

  const projectedYield = (allocations[0] * 8.9 + allocations[1] * 6.1 + allocations[2] * 9.7 + allocations[3] * 3.2) / total;
  const appreciationForecast = (allocations[0] * 12 + allocations[1] * 7 + allocations[2] * 5 + allocations[3] * 18) / total;
  const liquidityScore = (allocations[0] * 75 + allocations[1] * 60 + allocations[2] * 85 + allocations[3] * 35) / total;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-[10px]">PORTFOLIO AI</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-2">AI Capital Allocation Strategy</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Optimize investment distribution across yield, growth, and liquidity opportunities</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        {/* Budget + Presets */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Total Investment Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={budget}
                  onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
                  className="pl-9 text-lg font-bold"
                  placeholder="Enter budget in IDR"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{formatIDR(budgetNum)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Strategy Presets</label>
              <div className="flex gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.key}
                    onClick={() => applyPreset(preset.key)}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                      activePreset === preset.key
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <p className="text-xs font-semibold text-foreground">{preset.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Donut + Sliders */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="text-sm font-semibold text-foreground mb-5">Portfolio Allocation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Donut Chart */}
                <div className="flex justify-center">
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    {allocations.map((pct, i) => {
                      const percent = pct / total;
                      const startAngle = cumulativePercent * 360;
                      const endAngle = (cumulativePercent + percent) * 360;
                      cumulativePercent += percent;

                      const startRad = ((startAngle - 90) * Math.PI) / 180;
                      const endRad = ((endAngle - 90) * Math.PI) / 180;
                      const largeArc = percent > 0.5 ? 1 : 0;
                      const x1 = cx + radius * Math.cos(startRad);
                      const y1 = cy + radius * Math.sin(startRad);
                      const x2 = cx + radius * Math.cos(endRad);
                      const y2 = cy + radius * Math.sin(endRad);

                      if (pct <= 0) return null;

                      return (
                        <motion.path
                          key={i}
                          d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={segmentMeta[i].color}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                    <circle cx={cx} cy={cy} r="42" fill="hsl(var(--card))" />
                    <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="16">{formatIDR(budgetNum)}</text>
                    <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted-foreground" fontSize="8">Total Budget</text>
                  </svg>
                </div>

                {/* Allocation Sliders */}
                <div className="space-y-5">
                  {segmentMeta.map((seg, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ background: seg.color }} />
                          <span className="text-xs font-medium text-foreground">{seg.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">{allocations[i]}%</span>
                          <span className="text-[10px] text-muted-foreground ml-2">{formatIDR(budgetNum * allocations[i] / 100)}</span>
                        </div>
                      </div>
                      <Slider
                        value={[allocations[i]]}
                        onValueChange={v => updateAllocation(i, v)}
                        min={0} max={80} step={5}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Opportunity Grid */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-4">Recommended Allocation Targets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.map((opp, i) => {
                  const seg = segmentMeta[opp.segment];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md" style={{ background: `${seg.color}15` }}>
                            <seg.icon className="w-3.5 h-3.5" style={{ color: seg.color }} />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">{opp.name}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-xs font-bold text-primary">{opp.score}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Expected Yield</span>
                          <span className="font-medium text-foreground">{opp.yield}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Liquidity</span>
                          <span className={`font-medium ${liquidityColors[opp.liquidity]}`}>{opp.liquidity}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-medium text-foreground">{opp.price}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mt-3 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {opp.diversification}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap pb-6">
              <Button onClick={() => toast.success('Allocation strategy applied to your portfolio')}>
                <Zap className="w-4 h-4 mr-2" /> Apply Allocation Strategy
              </Button>
              <Button variant="outline" onClick={() => toast.success('Simulating alternative scenario...')}>
                <GitCompare className="w-4 h-4 mr-2" /> Simulate Alternative
              </Button>
              <Button variant="outline" onClick={() => toast.success('Exporting allocation report...')}>
                <Download className="w-4 h-4 mr-2" /> Export Report
              </Button>
            </div>
          </div>

          {/* Right: Risk-Return + AI Narrative */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-6 sticky top-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Risk-Return Balance</h3>
              </div>

              {/* Projected Metrics */}
              <div className="space-y-4">
                {[
                  { label: 'Projected Portfolio Yield', value: `${projectedYield.toFixed(1)}%`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bar: projectedYield * 10 },
                  { label: 'Appreciation Forecast', value: `+${appreciationForecast.toFixed(1)}% p.a.`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bar: appreciationForecast * 5 },
                  { label: 'Liquidity Comfort', value: `${liquidityScore.toFixed(0)}/100`, icon: Droplets, color: 'text-violet-600 dark:text-violet-400', bar: liquidityScore },
                ].map((metric, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </div>
                    <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
                    <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(metric.bar, 100)}%` }}
                        transition={{ delay: 0.5 + i * 0.15, duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Narrative */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">AI Strategy Narrative</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Allocating <strong className="text-foreground">{allocations[2]}%</strong> into rental apartments improves cash flow stability while preserving growth upside through <strong className="text-foreground">{allocations[0]}%</strong> villa exposure. Your current mix targets a <strong className="text-foreground">{projectedYield.toFixed(1)}%</strong> blended yield with moderate liquidity comfort."
                </p>
              </div>

              {/* Diversification Score */}
              <div className="p-4 rounded-xl border border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Portfolio Health</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Diversification', value: Math.min(100, allocations.filter(a => a > 10).length * 25), status: allocations.filter(a => a > 10).length >= 3 ? 'Good' : 'Low' },
                    { label: 'Risk Balance', value: Math.round(100 - Math.abs(allocations[3] - 25) * 2), status: allocations[3] <= 35 ? 'Healthy' : 'Aggressive' },
                    { label: 'Income Stability', value: Math.round(allocations[2] * 1.5 + allocations[1] * 0.8), status: allocations[2] >= 20 ? 'Stable' : 'Low' },
                  ].map((h, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{h.label}</span>
                        <span className="text-foreground font-medium">{h.status}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(h.value, 100)}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
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

export default CapitalAllocationOptimizer;
