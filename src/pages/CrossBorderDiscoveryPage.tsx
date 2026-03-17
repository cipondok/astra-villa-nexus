import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SEOHead } from '@/components/SEOHead';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGlobalMarketIntelligence, type GlobalMarket } from '@/hooks/useGlobalMarketIntelligence';
import { useGlobalRegions } from '@/hooks/useGlobalIntelligence';
import {
  Globe, TrendingUp, Building2, Shield, MapPin, DollarSign, ArrowUpRight,
  ArrowDownRight, Minus, Scale, FileText, Phone, Landmark, Users, Sparkles,
  ChevronRight, BarChart3, Target, CheckCircle2, AlertTriangle, Search,
  Plane, Briefcase, HeartHandshake, BookOpen, Send,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from 'recharts';
import { toast } from 'sonner';

const CHART_TOOLTIP = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 10,
    fontSize: 11,
    color: 'hsl(var(--popover-foreground))',
  },
};

const COUNTRIES = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Southeast Asia' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Southeast Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Southeast Asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Southeast Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'East Asia' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'Middle East' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas' },
];

const LEGAL_GUIDES: Record<string, { foreignOwnership: string; visaProgram: string; taxRate: string; process: string[]; financing: string }> = {
  ID: { foreignOwnership: 'Right of Use (Hak Pakai) — 80-year leasehold', visaProgram: 'Second Home Visa / KITAS', taxRate: '2.5% transfer + 10% luxury tax', process: ['Select property', 'Notary verification (PPAT)', 'Hak Pakai title registration', 'Tax payment & BPN transfer'], financing: 'Limited — cash purchase recommended' },
  TH: { foreignOwnership: 'Condo freehold (max 49% foreign quota)', visaProgram: 'Thailand Elite Visa', taxRate: '1-3% transfer fee + stamp duty', process: ['Reserve with deposit', 'Due diligence & title search', 'Sale agreement at Land Office', 'Transfer registration'], financing: 'Some banks offer to foreigners at 4-6%' },
  MY: { foreignOwnership: 'Freehold above MM2H threshold', visaProgram: 'MM2H (Malaysia My 2nd Home)', taxRate: '1-4% stamp duty + RPGT', process: ['State authority consent', 'Sale & purchase agreement', 'Stamp duty payment', 'Title transfer'], financing: 'Up to 70% LTV for foreigners' },
  VN: { foreignOwnership: '50-year leasehold for foreigners', visaProgram: 'Business Visa / Investment Certificate', taxRate: '2% registration + 0.5% stamp duty', process: ['Verify developer license', 'Sign purchase contract', 'Notarize at local office', 'Certificate of ownership'], financing: 'Very limited for foreigners' },
  PH: { foreignOwnership: 'Condo only (max 40% foreign)', visaProgram: 'SRRV (Special Resident Visa)', taxRate: '1.5% transfer tax + 6% capital gains', process: ['Letter of intent', 'Contract to sell', 'Deed of absolute sale', 'Title transfer at Registry'], financing: 'Available at 5-8% for qualified buyers' },
  SG: { foreignOwnership: 'Condo freehold (20% ABSD for foreigners)', visaProgram: 'Employment Pass / Investor Visa', taxRate: '20% ABSD + 1-4% BSD', process: ['Option to Purchase', 'Exercise option (14 days)', 'Completion (8-12 weeks)', 'Stamp duty payment'], financing: 'Up to 75% LTV from local banks' },
  AU: { foreignOwnership: 'New property only (FIRB approval)', visaProgram: 'Investor Visa (subclass 188)', taxRate: 'Stamp duty varies by state + surcharge', process: ['FIRB application', 'Contract exchange', 'Settlement (6-12 weeks)', 'Title registration'], financing: 'Limited to 60-70% LTV' },
  JP: { foreignOwnership: 'Freehold — no restrictions', visaProgram: 'Business Manager Visa', taxRate: '3% acquisition + 1.4% annual', process: ['Property search & offer', 'Sign purchase agreement', 'Pay at settlement', 'Register at Legal Affairs Bureau'], financing: 'Available at 1-3% with residency' },
  AE: { foreignOwnership: 'Freehold in designated zones', visaProgram: 'Golden Visa (AED 2M+)', taxRate: '4% DLD registration fee', process: ['Select freehold property', 'Sign MOU & deposit', 'NOC from developer', 'DLD transfer'], financing: 'Up to 75% LTV at 3-5%' },
  PT: { foreignOwnership: 'Freehold — no restrictions', visaProgram: 'Golden Visa (fund investment)', taxRate: '6-8% IMT + 0.8% stamp duty', process: ['Obtain NIF tax number', 'Sign promissory contract', 'Due diligence & deed', 'Land registry'], financing: 'Up to 70% LTV at 3-5%' },
  ES: { foreignOwnership: 'Freehold — no restrictions', visaProgram: 'Golden Visa (€500K+)', taxRate: '6-10% transfer tax + 1.5% stamp', process: ['Obtain NIE number', 'Reservation agreement', 'Notarized purchase deed', 'Land registry filing'], financing: 'Up to 70% LTV at 2-4%' },
  US: { foreignOwnership: 'Freehold — no restrictions', visaProgram: 'EB-5 Investor Visa', taxRate: 'Varies by state — 0.5-5% closing costs', process: ['Make offer', 'Inspection & appraisal', 'Escrow & title insurance', 'Closing & deed transfer'], financing: 'Available at 6-8% for foreign nationals' },
};

/* synthetic yield/growth data per country for comparison charts */
const MARKET_METRICS: Record<string, { yield: number; growth: number; entry: number; risk: number; demand: number; liquidity: number }> = {
  ID: { yield: 7.2, growth: 8.5, entry: 85, risk: 35, demand: 78, liquidity: 55 },
  TH: { yield: 5.8, growth: 6.2, entry: 70, risk: 30, demand: 72, liquidity: 65 },
  MY: { yield: 5.1, growth: 4.8, entry: 65, risk: 25, demand: 60, liquidity: 70 },
  VN: { yield: 6.5, growth: 9.1, entry: 90, risk: 45, demand: 80, liquidity: 40 },
  PH: { yield: 6.8, growth: 7.3, entry: 80, risk: 40, demand: 75, liquidity: 50 },
  SG: { yield: 3.2, growth: 3.5, entry: 20, risk: 10, demand: 85, liquidity: 95 },
  AU: { yield: 3.8, growth: 4.2, entry: 30, risk: 15, demand: 70, liquidity: 90 },
  JP: { yield: 4.5, growth: 3.0, entry: 40, risk: 12, demand: 65, liquidity: 88 },
  AE: { yield: 6.0, growth: 7.8, entry: 50, risk: 20, demand: 82, liquidity: 80 },
  PT: { yield: 4.8, growth: 5.5, entry: 45, risk: 18, demand: 68, liquidity: 75 },
  ES: { yield: 4.2, growth: 5.0, entry: 42, risk: 16, demand: 66, liquidity: 78 },
  US: { yield: 4.0, growth: 4.5, entry: 35, risk: 14, demand: 72, liquidity: 92 },
};

const riskColor = (r: number) => r >= 40 ? 'text-red-500' : r >= 25 ? 'text-amber-500' : 'text-emerald-500';
const riskLabel = (r: number) => r >= 40 ? 'High' : r >= 25 ? 'Moderate' : 'Low';

const GrowthArrow = ({ v }: { v: number }) =>
  v > 5 ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> :
  v > 0 ? <TrendingUp className="h-4 w-4 text-blue-500" /> :
  <ArrowDownRight className="h-4 w-4 text-red-500" />;

/* ── Region Comparison Card ── */
const CountryCard = ({ c, selected, onSelect }: { c: typeof COUNTRIES[0]; selected: boolean; onSelect: () => void }) => {
  const m = MARKET_METRICS[c.code];
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer transition-all border-2 ${selected ? 'border-primary shadow-lg shadow-primary/10' : 'border-transparent hover:border-primary/30'}`}
        onClick={onSelect}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{c.flag}</span>
              <div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.region}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">{riskLabel(m.risk)}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Yield</p>
              <p className="text-sm font-bold text-primary">{m.yield}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Growth</p>
              <div className="flex items-center justify-center gap-0.5">
                <p className="text-sm font-bold">{m.growth}%</p>
                <GrowthArrow v={m.growth} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Demand</p>
              <p className="text-sm font-bold">{m.demand}</p>
            </div>
          </div>
          <Progress value={m.liquidity} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground text-right">Liquidity: {m.liquidity}/100</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ── Radar Comparison ── */
const ComparisonRadar = ({ countries }: { countries: string[] }) => {
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
  const axes = ['Yield', 'Growth', 'Entry Ease', 'Low Risk', 'Demand', 'Liquidity'];
  const data = axes.map((axis, i) => {
    const row: any = { axis };
    countries.forEach((code) => {
      const m = MARKET_METRICS[code];
      const vals = [m.yield * 10, m.growth * 10, 100 - m.entry, 100 - m.risk, m.demand, m.liquidity];
      row[code] = vals[i];
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        {countries.map((code, i) => (
          <Radar key={code} name={code} dataKey={code} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
        ))}
        <Tooltip {...CHART_TOOLTIP} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

/* ── Yield Comparison Bar Chart ── */
const YieldComparisonChart = ({ countries }: { countries: string[] }) => {
  const data = countries.map(code => {
    const c = COUNTRIES.find(x => x.code === code)!;
    const m = MARKET_METRICS[code];
    return { name: `${c.flag} ${c.code}`, yield: m.yield, growth: m.growth };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip {...CHART_TOOLTIP} />
        <Bar dataKey="yield" name="Rental Yield %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="growth" name="Price Growth %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ── Legal Guide Panel ── */
const LegalGuidePanel = ({ code }: { code: string }) => {
  const guide = LEGAL_GUIDES[code];
  const country = COUNTRIES.find(c => c.code === code)!;
  if (!guide) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{country.flag}</span>
        <div>
          <h3 className="text-lg font-bold">{country.name} — Investment Guide</h3>
          <p className="text-sm text-muted-foreground">{country.region}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Foreign Ownership</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{guide.foreignOwnership}</p></CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Plane className="h-4 w-4 text-primary" /> Visa Program</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{guide.visaProgram}</p></CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Tax & Duties</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{guide.taxRate}</p></CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Financing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{guide.financing}</p>
            <Badge variant={guide.financing.toLowerCase().includes('limited') ? 'destructive' : 'default'} className="mt-2 text-xs">
              {guide.financing.toLowerCase().includes('limited') ? 'Limited' : 'Available'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Purchase Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {guide.process.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                <p className="text-sm pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ── Assistance Request Form ── */
const AssistanceRequestForm = ({ selectedCountry }: { selectedCountry: string }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Assistance request submitted! Our cross-border team will contact you within 24 hours.');
      setName(''); setEmail(''); setMessage('');
      setSending(false);
    }, 1200);
  };

  const country = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" />
          Remote Purchase Assistance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get personalized guidance for investing in {country?.name || 'your chosen market'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          <Input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Textarea placeholder="Tell us about your investment goals, budget, and timeline..." value={message} onChange={e => setMessage(e.target.value)} rows={3} required />
          <Button type="submit" className="w-full" disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Submitting...' : 'Request Assistance'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

/* ── Trust Summary Panel ── */
const TrustSummaryPanel = ({ code }: { code: string }) => {
  const m = MARKET_METRICS[code];
  const country = COUNTRIES.find(c => c.code === code)!;
  const score = Math.round((m.yield * 8 + m.growth * 6 + (100 - m.risk) * 0.4 + m.demand * 0.3 + m.liquidity * 0.3) / 3);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{country.flag}</span>
            <h3 className="font-bold">{country.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Investment Score</p>
            <p className="text-2xl font-black text-primary">{Math.min(score, 98)}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Rental Yield: <strong>{m.yield}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span>Price Growth: <strong>{m.growth}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${riskColor(m.risk)}`} />
            <span>Risk: <strong className={riskColor(m.risk)}>{riskLabel(m.risk)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>Foreign Demand: <strong>{m.demand}/100</strong></span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Market Liquidity</span>
            <span>{m.liquidity}%</span>
          </div>
          <Progress value={m.liquidity} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */
const CrossBorderDiscoveryPage = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['ID', 'TH']);
  const [activeTab, setActiveTab] = useState('explore');
  const [focusCountry, setFocusCountry] = useState('ID');
  const [regionFilter, setRegionFilter] = useState('all');

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code);
      if (prev.length >= 3) { toast.info('Compare up to 3 countries'); return prev; }
      return [...prev, code];
    });
    setFocusCountry(code);
  };

  const filteredCountries = regionFilter === 'all'
    ? COUNTRIES
    : COUNTRIES.filter(c => c.region === regionFilter);

  const regions = [...new Set(COUNTRIES.map(c => c.region))];

  return (
    <>
      <SEOHead
        title="Cross-Border Property Discovery | ASTRA Villa"
        description="Explore international property investment opportunities across 12+ countries with yield comparisons, legal guides, and remote purchase assistance."
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs border-primary/30">
                <Globe className="h-3.5 w-3.5 text-primary" /> Cross-Border Intelligence
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Invest <span className="text-primary">Globally</span>, Decide Locally
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Compare rental yields, legal frameworks, and growth potential across 12 international markets — all from one intelligent platform.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 h-10">
              <TabsTrigger value="explore" className="text-xs gap-1"><Globe className="h-3.5 w-3.5" /> Explore</TabsTrigger>
              <TabsTrigger value="compare" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> Compare</TabsTrigger>
              <TabsTrigger value="legal" className="text-xs gap-1"><Scale className="h-3.5 w-3.5" /> Legal</TabsTrigger>
              <TabsTrigger value="assist" className="text-xs gap-1"><Briefcase className="h-3.5 w-3.5" /> Assist</TabsTrigger>
            </TabsList>

            {/* ── EXPLORE TAB ── */}
            <TabsContent value="explore" className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={regionFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setRegionFilter('all')}>All Regions</Badge>
                {regions.map(r => (
                  <Badge key={r} variant={regionFilter === r ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setRegionFilter(r)}>{r}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCountries.map(c => (
                  <CountryCard key={c.code} c={c} selected={selectedCountries.includes(c.code)} onSelect={() => toggleCountry(c.code)} />
                ))}
              </div>

              {selectedCountries.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Quick Summary
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedCountries.map(code => (
                      <TrustSummaryPanel key={code} code={code} />
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* ── COMPARE TAB ── */}
            <TabsContent value="compare" className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground">Comparing:</p>
                {selectedCountries.map(code => {
                  const c = COUNTRIES.find(x => x.code === code)!;
                  return <Badge key={code} className="gap-1">{c.flag} {c.name}</Badge>;
                })}
                {selectedCountries.length < 2 && <p className="text-xs text-muted-foreground italic">Select at least 2 countries from the Explore tab</p>}
              </div>

              {selectedCountries.length >= 2 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Market Profile Radar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ComparisonRadar countries={selectedCountries} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Yield & Growth Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <YieldComparisonChart countries={selectedCountries} />
                    </CardContent>
                  </Card>

                  {/* detailed table */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Detailed Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Metric</th>
                              {selectedCountries.map(code => {
                                const c = COUNTRIES.find(x => x.code === code)!;
                                return <th key={code} className="text-center py-2 px-3 font-medium">{c.flag} {c.code}</th>;
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: 'Rental Yield', key: 'yield' as const, fmt: (v: number) => `${v}%` },
                              { label: 'Price Growth', key: 'growth' as const, fmt: (v: number) => `${v}%` },
                              { label: 'Entry Barrier', key: 'entry' as const, fmt: (v: number) => `${v}/100` },
                              { label: 'Risk Level', key: 'risk' as const, fmt: (v: number) => riskLabel(v) },
                              { label: 'Foreign Demand', key: 'demand' as const, fmt: (v: number) => `${v}/100` },
                              { label: 'Liquidity', key: 'liquidity' as const, fmt: (v: number) => `${v}/100` },
                            ].map(row => (
                              <tr key={row.label} className="border-b border-border/50">
                                <td className="py-2 px-3 text-muted-foreground">{row.label}</td>
                                {selectedCountries.map(code => (
                                  <td key={code} className="py-2 px-3 text-center font-medium">{row.fmt(MARKET_METRICS[code][row.key])}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ── LEGAL TAB ── */}
            <TabsContent value="legal" className="space-y-6">
              <div className="flex items-center gap-3">
                <Select value={focusCountry} onValueChange={setFocusCountry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Legal & regulatory overview</p>
              </div>
              <LegalGuidePanel code={focusCountry} />
            </TabsContent>

            {/* ── ASSIST TAB ── */}
            <TabsContent value="assist" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Investment Support Services
                  </h2>
                  <div className="space-y-3">
                    {[
                      { icon: Scale, title: 'Legal Process Guidance', desc: 'Step-by-step guidance through foreign ownership laws, title verification, and notarization for each country.' },
                      { icon: Landmark, title: 'Financing Consultation', desc: 'Connect with international mortgage brokers and understand LTV ratios, interest rates, and qualification requirements.' },
                      { icon: Phone, title: 'Remote Purchase Assistance', desc: 'End-to-end support for buying property remotely — from due diligence to closing, without traveling.' },
                      { icon: BookOpen, title: 'Tax & Compliance Advisory', desc: 'Understand stamp duty, capital gains, and annual property tax obligations in your target market.' },
                    ].map(item => (
                      <Card key={item.title} className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <AssistanceRequestForm selectedCountry={focusCountry} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CrossBorderDiscoveryPage;
