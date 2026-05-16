import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Shield, DollarSign, BarChart3, Users,
  Building2, Target, Activity, MapPin, ChevronRight, Download,
  Mail, Bell, Landmark, Scale, BadgeCheck, ArrowUpRight,
  Banknote, Wallet, FileText, Lock, Zap, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CountryData {
  code: string;
  name: string;
  flag: string;
  ownership: { score: number; label: string };
  yield: number;
  liquidity: number;
  currencyStability: number;
  demandGrowth: number;
  legalNote: string;
  structureNote: string;
  entryCapital: Record<string, number>;
}

const countries: CountryData[] = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', ownership: { score: 72, label: 'Leasehold / Nominee' }, yield: 88, liquidity: 76, currencyStability: 65, demandGrowth: 91, legalNote: 'Foreign investors may hold property via long-term leasehold (HGB) or PT PMA structures with BKPM approval.', structureNote: 'Leasehold 25+20+20yr or PT PMA freehold for commercial', entryCapital: { USD: 75000, SGD: 100000, IDR: 1200000000, EUR: 70000 } },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', ownership: { score: 80, label: 'Freehold Available' }, yield: 72, liquidity: 70, currencyStability: 72, demandGrowth: 68, legalNote: 'Foreigners can own freehold above minimum price thresholds (RM1M in most states). MM2H visa enhances access.', structureNote: 'Direct freehold above state minimum price', entryCapital: { USD: 220000, SGD: 295000, IDR: 3400000000, EUR: 205000 } },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', ownership: { score: 65, label: 'Condo Freehold Only' }, yield: 75, liquidity: 72, currencyStability: 70, demandGrowth: 74, legalNote: 'Foreigners can own condominiums freehold (up to 49% of building). Land ownership requires Thai company structure.', structureNote: 'Condo freehold or 30yr leasehold for land', entryCapital: { USD: 120000, SGD: 160000, IDR: 1850000000, EUR: 112000 } },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', ownership: { score: 58, label: '50yr Leasehold' }, yield: 82, liquidity: 62, currencyStability: 60, demandGrowth: 88, legalNote: 'Foreign ownership limited to 50-year leasehold for residential (max 30% of units in a building). Expanding reforms underway.', structureNote: '50yr leasehold, max 30% foreign quota per building', entryCapital: { USD: 90000, SGD: 120000, IDR: 1400000000, EUR: 84000 } },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', ownership: { score: 70, label: 'Condo Freehold' }, yield: 78, liquidity: 65, currencyStability: 62, demandGrowth: 80, legalNote: 'Foreigners can own condo units freehold (up to 40% of project). Land ownership restricted to Filipino nationals.', structureNote: 'Condo freehold, land via 60/40 corporation', entryCapital: { USD: 85000, SGD: 114000, IDR: 1320000000, EUR: 80000 } },
];

const currencies = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
];

const deals = [
  { name: 'Canggu Beachfront Residences', location: 'Bali, Indonesia', score: 92, ticket: { USD: 75000, SGD: 100000, IDR: 1200000000, EUR: 70000 }, popularity: 340, yield: '8.4%', type: 'Luxury Villa' },
  { name: 'Kuala Lumpur City Suites', location: 'KL, Malaysia', score: 85, ticket: { USD: 220000, SGD: 295000, IDR: 3400000000, EUR: 205000 }, popularity: 185, yield: '5.5%', type: 'Urban Apartment' },
  { name: 'Phuket Ocean View Villas', location: 'Phuket, Thailand', score: 88, ticket: { USD: 150000, SGD: 200000, IDR: 2300000000, EUR: 140000 }, popularity: 260, yield: '6.8%', type: 'Resort Villa' },
  { name: 'Ho Chi Minh Growth District', location: 'HCMC, Vietnam', score: 90, ticket: { USD: 90000, SGD: 120000, IDR: 1400000000, EUR: 84000 }, popularity: 210, yield: '7.8%', type: 'Off-plan' },
];

const formatCurrency = (amount: number, currency: string) => {
  const sym = currencies.find(c => c.code === currency)?.symbol || '';
  if (currency === 'IDR') {
    if (amount >= 1e9) return `${sym}${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `${sym}${(amount / 1e6).toFixed(0)}M`;
  }
  if (amount >= 1000) return `${sym}${(amount / 1000).toFixed(0)}K`;
  return `${sym}${amount}`;
};

const ScoreBar = ({ value, gradient }: { value: number; gradient: string }) => (
  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
    <motion.div
      className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </div>
);

const CrossBorderInvestorGateway = () => {
  const [selectedCountry, setSelectedCountry] = useState('ID');
  const [currency, setCurrency] = useState('USD');

  const country = countries.find(c => c.code === selectedCountry)!;

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle gradient accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[radial-gradient(circle,hsl(220,70%,55%,0.04),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(220,70%,55%,0.03),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="max-w-[1440px] mx-auto px-6 py-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                    <Globe className="w-6 h-6 text-blue-300" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/20 text-[10px] gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> GLOBAL ACCESS
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Global Investor Access</h1>
                <p className="text-sm text-blue-200/60 mt-1">Explore intelligent real estate opportunities across emerging markets</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs" onClick={() => toast.success('Briefing request submitted')}>
                  <Mail className="w-4 h-4 mr-2" /> Request Briefing
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-400 text-white border-0 text-xs shadow-lg shadow-blue-500/30" onClick={() => toast.success('Joined international deal flow')}>
                  <ArrowUpRight className="w-4 h-4 mr-2" /> Join Deal Flow
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* Global Access Controls */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Target Market</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Investment Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} — {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1.5">Suggested Entry Capital</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <span className="text-lg font-bold text-blue-700">
                    {formatCurrency(country.entryCapital[currency] || 0, currency)}
                  </span>
                  <span className="text-[10px] text-blue-500/70">recommended minimum</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Market Insight + Deals */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Entry Insight */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCountry}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{country.name} Market Intelligence</h3>
                      <p className="text-xs text-slate-500">Real-time investment environment analysis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Foreign Ownership Feasibility', value: country.ownership.score, detail: country.ownership.label, icon: Landmark, gradient: 'from-blue-500 to-indigo-500' },
                      { label: 'Yield Attractiveness', value: country.yield, detail: `${(country.yield / 10).toFixed(1)}% avg yield`, icon: TrendingUp, gradient: 'from-emerald-500 to-green-500' },
                      { label: 'Market Liquidity Strength', value: country.liquidity, detail: country.liquidity > 70 ? 'Strong exit environment' : 'Moderate liquidity', icon: Activity, gradient: 'from-cyan-500 to-blue-500' },
                      { label: 'Currency Stability', value: country.currencyStability, detail: country.currencyStability > 70 ? 'Stable corridor' : 'Moderate volatility', icon: Banknote, gradient: country.currencyStability > 70 ? 'from-emerald-500 to-green-500' : 'from-amber-500 to-orange-500' },
                      { label: 'Demand Growth Signal', value: country.demandGrowth, detail: country.demandGrowth > 80 ? 'Strong acceleration' : 'Steady growth', icon: BarChart3, gradient: 'from-violet-500 to-purple-500' },
                    ].map((metric, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <metric.icon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-600">{metric.label}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{metric.value}/100</span>
                        </div>
                        <ScoreBar value={metric.value} gradient={metric.gradient} />
                        <p className="text-[10px] text-slate-400 mt-1.5">{metric.detail}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Featured Cross-Border Deals */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Featured Cross-Border Deals</h2>
                </div>
                <div className="space-y-3">
                  {deals.map((deal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800">{deal.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {deal.location}
                          </span>
                          <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[9px]">{deal.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-center">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-100">
                            <Target className="w-3 h-3 text-blue-500" />
                            <span className="text-xs font-bold text-blue-700">{deal.score}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(deal.ticket[currency as keyof typeof deal.ticket] || 0, currency)}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">{deal.yield} yield</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Users className="w-3 h-3" />
                          <span>{deal.popularity}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Trust & Structure + Actions */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 sticky top-6 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Trust & Structure</h3>
                </div>

                {/* Legal Framework */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-3.5 h-3.5 text-blue-500" />
                    <h4 className="text-xs text-slate-600 font-medium">Legal Framework — {country.flag} {country.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{country.legalNote}</p>
                </div>

                {/* Ownership Structure */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    <h4 className="text-xs text-slate-600 font-medium">Ownership Structure</h4>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-1">{country.ownership.label}</p>
                  <p className="text-[11px] text-slate-500">{country.structureNote}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-medium">Structure verified by legal partners</span>
                  </div>
                </div>

                {/* Risk Transparency */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs text-slate-600 font-medium mb-3">Risk Transparency</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Currency Risk', level: country.currencyStability > 70 ? 'Low' : 'Moderate', color: country.currencyStability > 70 ? 'text-emerald-600' : 'text-amber-600' },
                      { label: 'Regulatory Risk', level: country.ownership.score > 70 ? 'Low' : 'Moderate', color: country.ownership.score > 70 ? 'text-emerald-600' : 'text-amber-600' },
                      { label: 'Liquidity Risk', level: country.liquidity > 70 ? 'Low' : 'Moderate', color: country.liquidity > 70 ? 'text-emerald-600' : 'text-amber-600' },
                      { label: 'Market Timing', level: country.demandGrowth > 80 ? 'Favorable' : 'Neutral', color: country.demandGrowth > 80 ? 'text-emerald-600' : 'text-slate-500' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{r.label}</span>
                        <span className={`font-medium ${r.color}`}>{r.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insight */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    <h4 className="text-[10px] text-blue-600/70 uppercase tracking-wider font-medium">AI Assessment</h4>
                  </div>
                  <p className="text-[11px] text-blue-800/70 leading-relaxed">
                    "{country.name} presents{' '}
                    {country.demandGrowth > 85 ? (
                      <span className="text-blue-700 font-medium">strong entry signals</span>
                    ) : (
                      <span className="text-blue-700 font-medium">steady growth potential</span>
                    )}{' '}
                    for cross-border investors. {country.yield > 80 ? 'Above-average yield profiles' : 'Competitive yields'} combined with{' '}
                    {country.ownership.score > 70 ? 'accessible ownership structures' : 'structured ownership pathways'} support confident capital deployment."
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-1">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 text-xs shadow-lg shadow-blue-500/20"
                    onClick={() => toast.success('Global investor briefing requested')}
                  >
                    <Mail className="w-4 h-4 mr-2" /> Request Investor Briefing
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                    onClick={() => toast.success('Currency risk alerts activated')}
                  >
                    <Bell className="w-4 h-4 mr-2" /> Activate Currency Alerts
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossBorderInvestorGateway;
