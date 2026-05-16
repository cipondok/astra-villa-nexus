import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Network, Zap, Target, Play, RotateCcw, ArrowRight } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';

/* ── Simulation engine ─────────────────────────────────────────────────── */

interface SimInputs {
  listings: number;
  userGrowthRate: number;
  vendorCount: number;
  capitalInflowM: number;
  conversionRate: number;
  liquidityCycleDays: number;
  marketingSpendK: number;
  commissionPct: number;
  premiumSlotPrice: number;
  expansionCities: number;
}

const DEFAULTS: SimInputs = {
  listings: 2400,
  userGrowthRate: 12,
  vendorCount: 180,
  capitalInflowM: 8.5,
  conversionRate: 6.4,
  liquidityCycleDays: 42,
  marketingSpendK: 120,
  commissionPct: 1.5,
  premiumSlotPrice: 750,
  expansionCities: 3,
};

function simulate(inputs: SimInputs) {
  const months: any[] = [];
  let listings = inputs.listings;
  let users = listings * 4.2;
  let vendors = inputs.vendorCount;
  let capital = inputs.capitalInflowM;
  let monthlyRevenue = 0;

  for (let m = 1; m <= 24; m++) {
    // Network effect feedback loops
    const listingGrowth = 1 + (users * 0.00008 + vendors * 0.0003 + capital * 0.005);
    const userGrowth = 1 + (inputs.userGrowthRate / 100) + (listings * 0.000015);
    const vendorGrowth = 1 + (listings * 0.00012 + capital * 0.002);
    const capitalGrowth = 1 + (listings * 0.00005 + users * 0.000003);

    listings = Math.round(listings * listingGrowth);
    users = Math.round(users * userGrowth);
    vendors = Math.round(vendors * vendorGrowth);
    capital = +(capital * capitalGrowth).toFixed(2);

    const deals = Math.round(listings * (inputs.conversionRate / 100) * 0.3);
    const avgDealValue = 1800 + capital * 12;
    const commissionRev = deals * avgDealValue * (inputs.commissionPct / 100);
    const premiumRev = Math.round(listings * 0.08) * inputs.premiumSlotPrice;
    const vendorSubRev = vendors * 285;
    const dataLicRev = capital > 15 ? capital * 1200 : 0;
    monthlyRevenue = commissionRev + premiumRev + vendorSubRev + dataLicRev;

    const liquidityIndex = Math.min(100, Math.round(
      (deals / Math.max(listings, 1)) * 800 +
      (1 / Math.max(inputs.liquidityCycleDays, 1)) * 1200 +
      capital * 1.5
    ));

    const vendorSaturation = Math.min(100, Math.round((vendors / (listings * 0.15)) * 100));

    const networkDominance = Math.min(100, Math.round(
      listings * 0.003 + users * 0.0002 + vendors * 0.04 + capital * 0.8
    ));

    months.push({
      month: `M${m}`,
      listings,
      users,
      vendors,
      capital,
      deals,
      revenue: Math.round(monthlyRevenue),
      liquidityIndex,
      vendorSaturation,
      networkDominance,
      arr: Math.round(monthlyRevenue * 12),
    });
  }
  return months;
}

/* ── Feedback Loop Data ────────────────────────────────────────────────── */

const FEEDBACK_LOOPS = [
  {
    name: 'Listing → User Acquisition',
    description: 'More listings attract more active users searching for properties',
    strength: 85,
    status: 'active' as const,
  },
  {
    name: 'User → Deal Volume',
    description: 'More users increase inquiry volume and deal conversion probability',
    strength: 72,
    status: 'active' as const,
  },
  {
    name: 'Deal → Vendor Jobs',
    description: 'Completed deals generate renovation, legal, and financing service demand',
    strength: 68,
    status: 'active' as const,
  },
  {
    name: 'Data → Investor Confidence',
    description: 'Transaction data improves pricing accuracy and attracts institutional capital',
    strength: 58,
    status: 'building' as const,
  },
  {
    name: 'Capital → Premium Inventory',
    description: 'Investor capital inflow signals attract exclusive developer listings',
    strength: 42,
    status: 'building' as const,
  },
  {
    name: 'Vendor Quality → Retention',
    description: 'Better service outcomes increase platform stickiness and repeat transactions',
    strength: 64,
    status: 'active' as const,
  },
];

const MILESTONES = [
  { threshold: 5000, label: 'Listings critical mass', metric: 'listings' },
  { threshold: 25000, label: 'User network effect ignition', metric: 'users' },
  { threshold: 500, label: 'Vendor marketplace saturation', metric: 'vendors' },
  { threshold: 25, label: 'Capital flywheel self-sustaining ($M)', metric: 'capital' },
  { threshold: 75, label: 'Dominance threshold reached', metric: 'networkDominance' },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function NetworkEffectSimulatorPanel() {
  const [inputs, setInputs] = useState<SimInputs>(DEFAULTS);
  const [isRunning, setIsRunning] = useState(false);

  const data = useMemo(() => simulate(inputs), [inputs]);

  const update = (key: keyof SimInputs, val: number) =>
    setInputs(prev => ({ ...prev, [key]: val }));

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 600);
  };

  const final = data[data.length - 1];
  const mid = data[11];

  const radarData = [
    { axis: 'Listings', value: Math.min(100, (final.listings / 20000) * 100) },
    { axis: 'Users', value: Math.min(100, (final.users / 100000) * 100) },
    { axis: 'Vendors', value: Math.min(100, (final.vendors / 1000) * 100) },
    { axis: 'Capital', value: Math.min(100, (final.capital / 50) * 100) },
    { axis: 'Liquidity', value: final.liquidityIndex },
    { axis: 'Dominance', value: final.networkDominance },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Network Effect & Monopoly Growth Simulator</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Model feedback loops, scenario-test growth levers, and forecast dominance thresholds
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setInputs(DEFAULTS)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={handleRun} disabled={isRunning}>
            <Play className="w-4 h-4 mr-1" /> {isRunning ? 'Simulating…' : 'Run Simulation'}
          </Button>
        </div>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Projected ARR (M24)', value: `$${(final.arr / 1e6).toFixed(1)}M`, delta: `+${Math.round(((final.arr - data[0].arr) / Math.max(data[0].arr, 1)) * 100)}%` },
          { label: 'Listing Volume', value: final.listings.toLocaleString(), delta: `${final.listings - inputs.listings > 0 ? '+' : ''}${(final.listings - inputs.listings).toLocaleString()}` },
          { label: 'Liquidity Index', value: `${final.liquidityIndex}/100`, delta: final.liquidityIndex >= 75 ? 'Strong' : 'Building' },
          { label: 'Vendor Saturation', value: `${final.vendorSaturation}%`, delta: final.vendorSaturation >= 80 ? 'Saturated' : 'Growing' },
          { label: 'Network Dominance', value: `${final.networkDominance}/100`, delta: final.networkDominance >= 75 ? '🏆 Dominant' : 'Pre-threshold' },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold mt-1">{kpi.value}</p>
              <Badge variant="secondary" className="text-xs mt-1">{kpi.delta}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="scenarios">Scenario Controls</TabsTrigger>
          <TabsTrigger value="projections">Growth Projections</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Loops</TabsTrigger>
          <TabsTrigger value="milestones">Strategic Milestones</TabsTrigger>
        </TabsList>

        {/* ── Scenario Controls ──────────────────────────────── */}
        <TabsContent value="scenarios">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Marketplace Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {([
                  { key: 'listings' as const, label: 'Active Listings', min: 500, max: 50000, step: 100 },
                  { key: 'userGrowthRate' as const, label: 'Monthly User Growth (%)', min: 1, max: 40, step: 1 },
                  { key: 'vendorCount' as const, label: 'Vendor Network Size', min: 20, max: 2000, step: 10 },
                  { key: 'capitalInflowM' as const, label: 'Capital Inflow ($M)', min: 0.5, max: 100, step: 0.5 },
                  { key: 'conversionRate' as const, label: 'Deal Conversion Rate (%)', min: 1, max: 20, step: 0.5 },
                ] as const).map(s => (
                  <div key={s.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{inputs[s.key]}{s.key === 'capitalInflowM' ? 'M' : s.key.includes('Rate') || s.key.includes('rate') ? '%' : ''}</span>
                    </div>
                    <Slider
                      value={[inputs[s.key]]}
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      onValueChange={([v]) => update(s.key, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Strategy Levers</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {([
                  { key: 'marketingSpendK' as const, label: 'Marketing Spend (K/mo)', min: 10, max: 1000, step: 10 },
                  { key: 'commissionPct' as const, label: 'Commission Rate (%)', min: 0.5, max: 5, step: 0.1 },
                  { key: 'premiumSlotPrice' as const, label: 'Premium Slot Price ($)', min: 100, max: 5000, step: 50 },
                  { key: 'liquidityCycleDays' as const, label: 'Liquidity Cycle (days)', min: 7, max: 120, step: 1 },
                  { key: 'expansionCities' as const, label: 'Expansion Cities', min: 1, max: 20, step: 1 },
                ] as const).map(s => (
                  <div key={s.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{inputs[s.key]}</span>
                    </div>
                    <Slider
                      value={[inputs[s.key]]}
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      onValueChange={([v]) => update(s.key, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Growth Projections ─────────────────────────────── */}
        <TabsContent value="projections">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Revenue & ARR Trajectory</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} className="text-xs" />
                    <Tooltip formatter={(v: number) => `$${(v / 1e6).toFixed(2)}M`} />
                    <Area type="monotone" dataKey="arr" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" name="Annualized Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Network className="w-4 h-4" /> Network Health Radar (M24)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="axis" className="text-xs" />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Marketplace Volume Growth</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="listings" stroke="hsl(var(--primary))" name="Listings" dot={false} />
                    <Line type="monotone" dataKey="vendors" stroke="hsl(var(--chart-2))" name="Vendors" dot={false} />
                    <Line type="monotone" dataKey="deals" stroke="hsl(var(--chart-3))" name="Deals/mo" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Dominance & Liquidity Index</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="networkDominance" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4)/0.15)" name="Network Dominance" />
                    <Area type="monotone" dataKey="liquidityIndex" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5)/0.15)" name="Liquidity Index" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Feedback Loops ─────────────────────────────────── */}
        <TabsContent value="feedback">
          <div className="grid md:grid-cols-2 gap-4">
            {FEEDBACK_LOOPS.map((loop, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{loop.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{loop.description}</p>
                    </div>
                    <Badge variant={loop.status === 'active' ? 'default' : 'secondary'}>
                      {loop.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Progress value={loop.strength} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-10 text-right">{loop.strength}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Flywheel Equation Framework</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {['More Listings', 'More Users', 'More Deals', 'More Data', 'Better AI', 'Investor Confidence', 'Capital Inflow', 'Premium Inventory'].map((step, i, arr) => (
                    <React.Fragment key={step}>
                      <Badge variant="outline" className="py-1.5 px-3">{step}</Badge>
                      {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </React.Fragment>
                  ))}
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <Badge className="py-1.5 px-3 bg-primary">Monopoly</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Growth = f(Listings × UserVelocity × VendorDensity × CapitalMass) — each variable accelerates the others, creating compounding returns that become impossible to replicate.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Strategic Milestones ───────────────────────────── */}
        <TabsContent value="milestones">
          <div className="space-y-4">
            {MILESTONES.map((ms, i) => {
              const currentVal = ms.metric === 'capital' ? final.capital : (final as any)[ms.metric];
              const progress = Math.min(100, Math.round((currentVal / ms.threshold) * 100));
              const reached = progress >= 100;
              return (
                <Card key={i} className={reached ? 'border-primary/40' : ''}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${reached ? 'bg-primary/10' : 'bg-muted'}`}>
                      {reached ? '✓' : <Target className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{ms.label}</p>
                        <span className="text-xs text-muted-foreground">
                          {typeof currentVal === 'number' && currentVal > 1000 ? currentVal.toLocaleString() : currentVal} / {ms.threshold.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 mt-2" />
                    </div>
                    <Badge variant={reached ? 'default' : 'secondary'}>
                      {reached ? 'Achieved' : `${progress}%`}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}

            <Card>
              <CardHeader><CardTitle className="text-base">Scenario Comparison (M12 vs M24)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[
                    { metric: 'Listings', m12: mid.listings, m24: final.listings },
                    { metric: 'Vendors', m12: mid.vendors, m24: final.vendors },
                    { metric: 'Deals/mo', m12: mid.deals, m24: final.deals },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="metric" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="m12" fill="hsl(var(--chart-2))" name="Month 12" />
                    <Bar dataKey="m24" fill="hsl(var(--primary))" name="Month 24" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
