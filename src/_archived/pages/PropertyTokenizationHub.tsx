import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Hexagon, TrendingUp, Shield, DollarSign, BarChart3, Users,
  Building2, Target, Activity, MapPin, ChevronRight, Layers,
  FileText, ArrowUpRight, ArrowDownRight, Wallet, Gem, Zap,
  Eye, Lock, Droplets, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const totalValuation = 18500000000;
const tokenPrice = 5000000;
const totalTokens = totalValuation / tokenPrice;
const minTokens = 1;
const opportunityScore = 88;

const formatIDR = (n: number) => {
  if (n >= 1e9) return `IDR ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `IDR ${(n / 1e6).toFixed(1)}M`;
  return `IDR ${n.toLocaleString()}`;
};

const holdings = [
  { name: 'Seminyak Sunset Villas', tokens: 24, value: 132000000, yield: 8.4, trend: [88, 92, 95, 100, 105, 112, 118, 125, 130, 132], liquidity: 'High' },
  { name: 'Menteng Heritage Suites', tokens: 10, value: 58000000, yield: 6.2, trend: [50, 51, 52, 53, 54, 55, 56, 57, 57, 58], liquidity: 'Medium' },
  { name: 'Ubud Eco Retreat', tokens: 40, value: 210000000, yield: 9.1, trend: [140, 150, 155, 165, 175, 180, 190, 195, 205, 210], liquidity: 'High' },
];

const SparkLine = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 72;
  const h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`sp-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
      <polygon fill={`url(#sp-${color})`} points={`0,${h} ${pts} ${w},${h}`} />
    </svg>
  );
};

const PropertyTokenizationHub = () => {
  const [tokenQty, setTokenQty] = useState([10]);
  const qty = tokenQty[0];
  const investmentAmount = qty * tokenPrice;
  const ownershipPct = (qty / totalTokens) * 100;
  const estYield = investmentAmount * 0.084;

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      {/* Accent gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(190,90%,60%,0.06),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(270,80%,60%,0.04),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-100">
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/20">
                    <Hexagon className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-cyan-50 text-cyan-600 border-cyan-200 text-[10px] gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> TOKENIZED ASSETS
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Fractional Property Investment
                </h1>
                <p className="text-sm text-slate-500 mt-1">Access premium real estate opportunities through smart capital participation</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs" onClick={() => toast.success('Performance tracker opened')}>
                  <BarChart3 className="w-4 h-4 mr-2" /> Track Performance
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Featured + Investment + Holdings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Tokenized Property */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
              >
                <div className="h-52 bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950 flex items-center justify-center relative">
                  <Building2 className="w-24 h-24 text-white/[0.06]" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-500 text-white border-0 text-[10px] gap-1.5 shadow-lg shadow-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> NOW TOKENIZING
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <Target className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-sm font-bold text-white">{opportunityScore}</span>
                  </div>
                  {/* Neon accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Canggu Beachfront Residences</h2>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> Canggu, Bali — Premium beachfront development
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Asset Valuation', value: formatIDR(totalValuation), icon: DollarSign, accent: 'text-slate-900' },
                      { label: 'Token Price', value: formatIDR(tokenPrice), icon: Hexagon, accent: 'text-cyan-600' },
                      { label: 'Min Investment', value: formatIDR(tokenPrice), icon: Wallet, accent: 'text-violet-600' },
                      { label: 'Expected Yield', value: '8.4% p.a.', icon: TrendingUp, accent: 'text-emerald-600' },
                    ].map((stat, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <stat.icon className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                        <p className={`text-base font-bold ${stat.accent}`}>{stat.value}</p>
                        <p className="text-[10px] text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Investment Participation */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-lg bg-cyan-50">
                    <Layers className="w-4 h-4 text-cyan-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Investment Participation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Token Quantity</span>
                      <span className="text-lg font-bold text-slate-900">{qty} tokens</span>
                    </div>
                    <Slider
                      value={tokenQty}
                      onValueChange={setTokenQty}
                      min={minTokens}
                      max={200}
                      step={1}
                      className="mt-3"
                    />
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">1 token</span>
                      <span className="text-[10px] text-slate-400">200 tokens</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      Investment: <span className="font-semibold text-slate-900">{formatIDR(investmentAmount)}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-100 text-center">
                      <p className="text-2xl font-bold text-cyan-700">{ownershipPct.toFixed(3)}%</p>
                      <p className="text-[10px] text-cyan-600/70 mt-1">Ownership</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 text-center">
                      <p className="text-2xl font-bold text-emerald-700">{formatIDR(estYield)}</p>
                      <p className="text-[10px] text-emerald-600/70 mt-1">Est. Annual</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 text-center">
                      <p className="text-2xl font-bold text-violet-700">Monthly</p>
                      <p className="text-[10px] text-violet-600/70 mt-1">Distribution</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white border-0 shadow-lg shadow-cyan-500/20"
                    onClick={() => toast.success(`Investment of ${formatIDR(investmentAmount)} for ${qty} tokens submitted`)}
                  >
                    <Gem className="w-4 h-4 mr-2" /> Invest in Property Tokens
                  </Button>
                  <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs" onClick={() => toast.info('Legal structure summary available')}>
                    <FileText className="w-4 h-4 mr-2" /> Legal Summary
                  </Button>
                </div>
              </motion.div>

              {/* Portfolio Token Holdings */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-violet-500" />
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Your Token Holdings</h2>
                </div>
                <div className="space-y-3">
                  {holdings.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                      className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-50 to-violet-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                        <Hexagon className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800">{h.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[9px]">{h.tokens} tokens</Badge>
                          <span className="text-[10px] text-emerald-600 font-medium">{h.yield}% yield</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <SparkLine data={h.trend} color={h.liquidity === 'High' ? '#06b6d4' : '#8b5cf6'} />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900">{formatIDR(h.value)}</p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <Droplets className="w-3 h-3 text-cyan-500" />
                          <span className={`text-[10px] font-medium ${h.liquidity === 'High' ? 'text-emerald-600' : 'text-amber-600'}`}>{h.liquidity}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition-colors flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Risk & Structure */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 sticky top-6 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-50">
                    <Shield className="w-4 h-4 text-violet-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Risk & Structure Insight</h3>
                </div>

                {/* Asset-Backed Confidence */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Asset-Backed Confidence</h4>
                  <div className="flex items-center justify-center mb-3">
                    <div className="relative">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(210,20%,92%)" strokeWidth="6" />
                        <motion.circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke="url(#confGrad)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 40 * 0.08 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          transform="rotate(-90 50 50)"
                        />
                        <defs>
                          <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(190,80%,50%)" />
                            <stop offset="100%" stopColor="hsl(270,70%,55%)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-slate-900">92%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">Fully collateralized with verified land titles and building permits</p>
                </div>

                {/* Market Demand */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Market Demand Signal</h4>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Inquiry Volume', value: 'Surging', icon: TrendingUp, color: 'text-emerald-600' },
                      { label: 'Investor Waitlist', value: '340 investors', icon: Users, color: 'text-cyan-600' },
                      { label: 'Demand Heat', value: '94/100', icon: Activity, color: 'text-rose-500' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <m.icon className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">{m.label}</span>
                        </div>
                        <span className={`font-semibold ${m.color}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Liquidity */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Exit Liquidity Forecast</h4>
                  <div className="space-y-2">
                    {[
                      { method: 'Secondary market sale', timeline: 'Anytime', confidence: '85%' },
                      { method: 'Full asset exit event', timeline: '24–36 months', confidence: '72%' },
                      { method: 'Buyback program', timeline: '12 months', confidence: '90%' },
                    ].map((e, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white border border-slate-100">
                        <span className="text-slate-600">{e.method}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{e.timeline}</span>
                          <span className="text-emerald-600 font-medium">{e.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token Structure */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-violet-50 border border-cyan-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3.5 h-3.5 text-cyan-600" />
                    <h4 className="text-xs text-cyan-700 font-medium uppercase tracking-wider">Token Structure</h4>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-cyan-600/70">Total Supply</span>
                      <span className="font-medium text-slate-800">{totalTokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-600/70">Lock-up Period</span>
                      <span className="font-medium text-slate-800">6 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-600/70">Distribution</span>
                      <span className="font-medium text-slate-800">Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-600/70">Management Fee</span>
                      <span className="font-medium text-slate-800">1.5% annually</span>
                    </div>
                  </div>
                </div>

                {/* AI Note */}
                <div className="p-4 rounded-xl bg-white border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-wider">AI Assessment</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    "This tokenized asset offers <span className="text-slate-800 font-medium">strong risk-adjusted returns</span> with
                    verified collateral and high demand. The Canggu corridor's tourism growth supports
                    <span className="text-cyan-600 font-medium"> 8.4% projected yield</span> with multiple exit pathways available."
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTokenizationHub;
