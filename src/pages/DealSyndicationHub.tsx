import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, Shield, DollarSign, TrendingUp, Droplets,
  FileText, ArrowRight, Target, BarChart3, Clock, MapPin,
  ChevronRight, Briefcase, Crown, Star, Activity, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const dealValue = 28500000000;
const minTicket = 2000000000;
const targetReturn = '14–19%';
const opportunityScore = 91;

const participants = [
  { name: 'Nusantara Capital Partners', capital: 'IDR 8.5B', role: 'Lead Investor', avatar: '🏛️', percent: 29.8 },
  { name: 'Bali Growth Fund II', capital: 'IDR 6.0B', role: 'Co-Investor', avatar: '📊', percent: 21.1 },
  { name: 'Asia Pacific Property Trust', capital: 'IDR 4.2B', role: 'Strategic Partner', avatar: '🌏', percent: 14.7 },
  { name: 'PT Maju Sejahtera Group', capital: 'IDR 3.0B', role: 'Local Partner', avatar: '🏢', percent: 10.5 },
];

const committedTotal = 21700000000;
const remainingSlots = dealValue - committedTotal;

const roleColors: Record<string, string> = {
  'Lead Investor': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Co-Investor': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Strategic Partner': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Local Partner': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const formatIDR = (n: number) => {
  if (n >= 1e9) return `IDR ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `IDR ${(n / 1e6).toFixed(0)}M`;
  return `IDR ${n.toLocaleString()}`;
};

const DealSyndicationHub = () => {
  const [commitment, setCommitment] = useState([3000000000]);
  const commitAmt = commitment[0];
  const ownershipPct = (commitAmt / dealValue) * 100;
  const projectedIncome = commitAmt * 0.078;
  const filledPct = ((committedTotal + commitAmt) / dealValue) * 100;

  return (
    <div className="min-h-screen bg-[hsl(225,25%,6%)] text-slate-100">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">INSTITUTIONAL</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mt-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Institutional Deal Syndication
              </h1>
              <p className="text-sm text-slate-500 mt-1">Collaborate on high-value property opportunities with strategic partners</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 text-xs" onClick={() => toast.success('Deal documents requested')}>
                <FileText className="w-4 h-4 mr-2" /> Request Documents
              </Button>
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0 text-xs" onClick={() => toast.success('Entering Syndicate Deal Room...')}>
                <ArrowRight className="w-4 h-4 mr-2" /> Enter Deal Room
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Deal + Participation + Partners */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Deal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                <Building2 className="w-20 h-20 text-white/10" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> LIVE SYNDICATION
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-sm font-bold text-white">{opportunityScore}</span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white">The Nusa Dua Grand Residences</h2>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> Nusa Dua, Bali — Mixed-use luxury development
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  {[
                    { label: 'Deal Value', value: formatIDR(dealValue), icon: DollarSign },
                    { label: 'Min Ticket', value: formatIDR(minTicket), icon: Briefcase },
                    { label: 'Target Return', value: targetReturn, icon: TrendingUp },
                    { label: 'Hold Period', value: '36 months', icon: Clock },
                  ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <stat.icon className="w-4 h-4 text-slate-500 mx-auto mb-1.5" />
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-slate-600">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Fill Bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Syndication Progress</span>
                    <span className="text-xs font-semibold text-white">{Math.min(filledPct, 100).toFixed(1)}% filled</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(filledPct, 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-600">Committed: {formatIDR(committedTotal)}</span>
                    <span className="text-[10px] text-slate-600">Remaining: {formatIDR(Math.max(remainingSlots - commitAmt, 0))}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Capital Participation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6"
            >
              <h2 className="text-sm font-semibold text-slate-300 mb-5">Your Capital Commitment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Commitment Amount</span>
                    <span className="text-lg font-bold text-white">{formatIDR(commitAmt)}</span>
                  </div>
                  <Slider
                    value={commitment}
                    onValueChange={setCommitment}
                    min={minTicket}
                    max={remainingSlots}
                    step={500000000}
                    className="mt-2"
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-slate-600">Min: {formatIDR(minTicket)}</span>
                    <span className="text-[10px] text-slate-600">Max: {formatIDR(remainingSlots)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-2xl font-bold text-amber-400">{ownershipPct.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-600 mt-1">Ownership Share</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{formatIDR(projectedIncome)}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Est. Annual Income</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-2xl font-bold text-blue-400">7.8%</p>
                    <p className="text-[10px] text-slate-600 mt-1">Projected Yield</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0"
                onClick={() => toast.success(`Syndicate participation of ${formatIDR(commitAmt)} submitted for review`)}
              >
                <Users className="w-4 h-4 mr-2" /> Join Syndicate — {formatIDR(commitAmt)}
              </Button>
            </motion.div>

            {/* Participant List */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Syndicate Participants</h2>
              <div className="space-y-3">
                {participants.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                        {i === 0 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <Badge className={`mt-1 text-[10px] border ${roleColors[p.role]}`}>{p.role}</Badge>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">{p.capital}</p>
                      <p className="text-[10px] text-slate-500">{p.percent}% share</p>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
                      <motion.div
                        className="h-full rounded-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.percent / 30) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Deal Intelligence */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 sticky top-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">Deal Intelligence</h3>
              </div>

              {/* Risk Concentration */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Risk Concentration</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Geographic', value: 'Single Location', risk: 'Moderate', color: 'text-amber-400' },
                    { label: 'Asset Type', value: 'Mixed-use', risk: 'Low', color: 'text-emerald-400' },
                    { label: 'Capital Concentration', value: '4 partners', risk: 'Low', color: 'text-emerald-400' },
                    { label: 'Developer Risk', value: 'Tier 1 Developer', risk: 'Low', color: 'text-emerald-400' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{r.label}</span>
                      <span className={`font-medium ${r.color}`}>{r.risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liquidity Outlook */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Liquidity Outlook</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Nusa Dua luxury segment shows <span className="text-emerald-400 font-medium">strong exit liquidity</span> with average 45-day time-to-sell for comparable developments. Secondary market transfer supported.
                </p>
              </div>

              {/* Exit Strategy */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Exit Strategy Preview</h4>
                <div className="space-y-2">
                  {[
                    { strategy: 'Unit-by-unit resale', timeline: '24–36 months', probability: '78%' },
                    { strategy: 'Block sale to fund', timeline: '18–24 months', probability: '65%' },
                    { strategy: 'Hold for yield', timeline: '36+ months', probability: '92%' },
                  ].map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-400">{e.strategy}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{e.timeline}</span>
                        <span className="text-emerald-400 font-medium">{e.probability}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demand Sentiment */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <h4 className="text-xs text-amber-400/70 uppercase tracking-wider mb-2">Demand Sentiment</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">Heating</span>
                </div>
                <p className="text-xs text-amber-200/60 leading-relaxed">
                  Nusa Dua luxury demand up 22% QoQ. International buyer inflow accelerating post-tourism recovery.
                </p>
              </div>

              {/* AI Note */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider">AI Assessment</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  "This syndication offers <span className="text-white font-medium">institutional-grade diversification</span> through shared capital deployment in a prime tourism corridor. Risk-adjusted return profile aligns with balanced growth mandates."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealSyndicationHub;
