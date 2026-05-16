import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Globe, MapPin, Rocket, Target, ChevronRight, TrendingUp, Users, Building, DollarSign, Wifi, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, AreaChart, Area } from 'recharts';

/* ── City database ──────────────────────────────────────────────────── */

interface CityProfile {
  name: string;
  country: string;
  region: 'Indonesia' | 'SEA' | 'Global';
  phase: 'active' | 'planned' | 'research';
  signals: {
    transactionVolume: number;
    populationGrowth: number;
    rentalDemand: number;
    developerSupply: number;
    investorCapital: number;
    vendorEcosystem: number;
    digitalReadiness: number;
  };
  launchCostM: number;
  monthsToBreakeven: number;
}

const CITIES: CityProfile[] = [
  { name: 'Jakarta', country: 'Indonesia', region: 'Indonesia', phase: 'active', signals: { transactionVolume: 92, populationGrowth: 78, rentalDemand: 88, developerSupply: 90, investorCapital: 85, vendorEcosystem: 72, digitalReadiness: 82 }, launchCostM: 0.8, monthsToBreakeven: 6 },
  { name: 'Surabaya', country: 'Indonesia', region: 'Indonesia', phase: 'planned', signals: { transactionVolume: 74, populationGrowth: 68, rentalDemand: 71, developerSupply: 65, investorCapital: 58, vendorEcosystem: 48, digitalReadiness: 64 }, launchCostM: 0.5, monthsToBreakeven: 9 },
  { name: 'Bali (Denpasar)', country: 'Indonesia', region: 'Indonesia', phase: 'planned', signals: { transactionVolume: 68, populationGrowth: 72, rentalDemand: 94, developerSupply: 58, investorCapital: 82, vendorEcosystem: 55, digitalReadiness: 70 }, launchCostM: 0.6, monthsToBreakeven: 7 },
  { name: 'Bandung', country: 'Indonesia', region: 'Indonesia', phase: 'planned', signals: { transactionVolume: 62, populationGrowth: 65, rentalDemand: 66, developerSupply: 55, investorCapital: 45, vendorEcosystem: 42, digitalReadiness: 60 }, launchCostM: 0.4, monthsToBreakeven: 10 },
  { name: 'Medan', country: 'Indonesia', region: 'Indonesia', phase: 'research', signals: { transactionVolume: 52, populationGrowth: 58, rentalDemand: 55, developerSupply: 45, investorCapital: 38, vendorEcosystem: 35, digitalReadiness: 50 }, launchCostM: 0.4, monthsToBreakeven: 12 },
  { name: 'Makassar', country: 'Indonesia', region: 'Indonesia', phase: 'research', signals: { transactionVolume: 48, populationGrowth: 62, rentalDemand: 52, developerSupply: 40, investorCapital: 35, vendorEcosystem: 30, digitalReadiness: 45 }, launchCostM: 0.35, monthsToBreakeven: 14 },
  { name: 'Singapore', country: 'Singapore', region: 'SEA', phase: 'research', signals: { transactionVolume: 88, populationGrowth: 42, rentalDemand: 90, developerSupply: 82, investorCapital: 95, vendorEcosystem: 78, digitalReadiness: 96 }, launchCostM: 2.5, monthsToBreakeven: 10 },
  { name: 'Kuala Lumpur', country: 'Malaysia', region: 'SEA', phase: 'research', signals: { transactionVolume: 76, populationGrowth: 55, rentalDemand: 72, developerSupply: 70, investorCapital: 68, vendorEcosystem: 60, digitalReadiness: 78 }, launchCostM: 1.2, monthsToBreakeven: 11 },
  { name: 'Bangkok', country: 'Thailand', region: 'SEA', phase: 'research', signals: { transactionVolume: 80, populationGrowth: 48, rentalDemand: 78, developerSupply: 72, investorCapital: 70, vendorEcosystem: 62, digitalReadiness: 74 }, launchCostM: 1.0, monthsToBreakeven: 10 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', region: 'SEA', phase: 'research', signals: { transactionVolume: 72, populationGrowth: 75, rentalDemand: 70, developerSupply: 60, investorCapital: 55, vendorEcosystem: 40, digitalReadiness: 62 }, launchCostM: 0.8, monthsToBreakeven: 12 },
];

const WEIGHTS = { transactionVolume: 0.22, populationGrowth: 0.12, rentalDemand: 0.18, developerSupply: 0.14, investorCapital: 0.16, vendorEcosystem: 0.08, digitalReadiness: 0.10 };

function dominationScore(s: CityProfile['signals']): number {
  return Math.round(
    s.transactionVolume * WEIGHTS.transactionVolume +
    s.populationGrowth * WEIGHTS.populationGrowth +
    s.rentalDemand * WEIGHTS.rentalDemand +
    s.developerSupply * WEIGHTS.developerSupply +
    s.investorCapital * WEIGHTS.investorCapital +
    s.vendorEcosystem * WEIGHTS.vendorEcosystem +
    s.digitalReadiness * WEIGHTS.digitalReadiness
  );
}

/* ── War plan checklist ──────────────────────────────────────────────── */

const WAR_MODULES = [
  {
    title: 'Listing Acquisition Engine',
    icon: Building,
    tasks: ['Developer outreach pipeline (top 20 developers)', 'Agent onboarding campaign (50 target agents)', 'Inventory verification workflow setup', 'Minimum 200 verified listings before launch', 'Exclusive listing partnerships signed'],
  },
  {
    title: 'Vendor Network Activation',
    icon: ShoppingBag,
    tasks: ['Category supply gap analysis', 'Early vendor incentive program (3-month free)', 'Service routing initialization for 6 categories', 'Vendor quality verification process', 'Premium slot infrastructure ready'],
  },
  {
    title: 'Investor Capital Ignition',
    icon: DollarSign,
    tasks: ['Curated deal launch event (100+ investors)', 'Local investor community funnel', 'Premium intelligence subscription trials', 'Investor DNA profiling for first 50 users', 'Cross-city arbitrage alerts activated'],
  },
  {
    title: 'Marketing Strike Plan',
    icon: Target,
    tasks: ['Geo-targeted ad campaigns (Google + Meta)', 'Influencer property showcase (3 KOLs)', 'Referral reward program activated', 'SEO content for city + district keywords', 'PR launch coverage in local media'],
  },
];

/* ── Revenue ramp model ──────────────────────────────────────────────── */

function revenueRamp(city: CityProfile) {
  const score = dominationScore(city.signals);
  const base = score * 180;
  return Array.from({ length: 18 }, (_, i) => {
    const m = i + 1;
    const rev = Math.round(base * (1 + 0.22 * m) * (m > 3 ? 1.15 : 0.6));
    const cost = Math.round(city.launchCostM * 1e6 / 12 * (m <= 3 ? 1.8 : m <= 6 ? 1.2 : 0.7));
    return { month: `M${m}`, revenue: rev, cost, net: rev - cost };
  });
}

/* ── Launch KPI framework ────────────────────────────────────────────── */

const LAUNCH_KPIS = [
  { name: 'Verified Listings', target: 200, unit: '', phase: 'Pre-launch' },
  { name: 'Active Agents', target: 50, unit: '', phase: 'Pre-launch' },
  { name: 'Registered Investors', target: 100, unit: '', phase: 'Month 1' },
  { name: 'Vendor Partners', target: 30, unit: '', phase: 'Month 1' },
  { name: 'Monthly Inquiries', target: 500, unit: '', phase: 'Month 3' },
  { name: 'Deal Conversion Rate', target: 6.5, unit: '%', phase: 'Month 3' },
  { name: 'Liquidity Index', target: 45, unit: '/100', phase: 'Month 6' },
  { name: 'Revenue Break-even', target: 100, unit: '%', phase: 'Month 9' },
];

/* ── Component ─────────────────────────────────────────────────────── */

export default function GlobalExpansionWarPanel() {
  const [selectedCity, setSelectedCity] = useState<string>('Jakarta');

  const rankedCities = useMemo(() =>
    [...CITIES].map(c => ({ ...c, score: dominationScore(c.signals) })).sort((a, b) => b.score - a.score),
  []);

  const city = rankedCities.find(c => c.name === selectedCity) || rankedCities[0];
  const ramp = useMemo(() => revenueRamp(city), [city]);

  const radarData = Object.entries(city.signals).map(([key, val]) => ({
    axis: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value: val,
  }));

  const barData = rankedCities.slice(0, 8).map(c => ({
    city: c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name,
    score: c.score,
    phase: c.phase,
  }));

  const phaseColor = (p: string) =>
    p === 'active' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
    p === 'planned' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' :
    'bg-muted text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Global Expansion War Strategy</h2>
        <p className="text-muted-foreground text-sm mt-1">
          City domination scoring, launch war plans, and regional scaling roadmap
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cities Evaluated', value: CITIES.length, icon: Globe },
          { label: 'Active Markets', value: CITIES.filter(c => c.phase === 'active').length, icon: MapPin },
          { label: 'Planned Launches', value: CITIES.filter(c => c.phase === 'planned').length, icon: Rocket },
          { label: 'Avg Domination Score', value: Math.round(rankedCities.reduce((s, c) => s + c.score, 0) / rankedCities.length), icon: Target },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="heatmap">City Rankings</TabsTrigger>
          <TabsTrigger value="warplan">War Plan</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="roadmap">Domination Roadmap</TabsTrigger>
        </TabsList>

        {/* ── City Rankings ──────────────────────────────────── */}
        <TabsContent value="heatmap">
          <div className="grid md:grid-cols-5 gap-6">
            {/* Ranking table */}
            <div className="md:col-span-3 space-y-2">
              {rankedCities.map((c, i) => (
                <Card
                  key={c.name}
                  className={`cursor-pointer transition-all ${selectedCity === c.name ? 'ring-2 ring-primary' : 'hover:bg-accent/30'}`}
                  onClick={() => setSelectedCity(c.name)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-7 text-right">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{c.name}</p>
                        <span className="text-xs text-muted-foreground">{c.country}</span>
                        <Badge className={`text-[10px] ${phaseColor(c.phase)}`} variant="secondary">{c.phase}</Badge>
                      </div>
                      <Progress value={c.score} className="h-1.5 mt-1.5" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{c.score}</p>
                      <p className="text-[10px] text-muted-foreground">/ 100</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Radar for selected city */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader><CardTitle className="text-base">{city.name} — Signal Analysis</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid className="stroke-border" />
                      <PolarAngleAxis dataKey="axis" className="text-[10px]" />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div><span className="text-muted-foreground">Launch Cost:</span> <span className="font-medium">${city.launchCostM}M</span></div>
                    <div><span className="text-muted-foreground">Break-even:</span> <span className="font-medium">{city.monthsToBreakeven} months</span></div>
                    <div><span className="text-muted-foreground">Region:</span> <span className="font-medium">{city.region}</span></div>
                    <div><span className="text-muted-foreground">Score:</span> <span className="font-bold text-primary">{city.score}/100</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader><CardTitle className="text-base">Score Comparison (Top 8)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis type="category" dataKey="city" width={80} className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── War Plan ───────────────────────────────────────── */}
        <TabsContent value="warplan">
          <div className="grid md:grid-cols-2 gap-4">
            {WAR_MODULES.map((mod, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <mod.icon className="w-4 h-4 text-primary" /> {mod.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mod.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            {/* Launch KPIs */}
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Launch KPI Framework</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LAUNCH_KPIS.map((kpi, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">{kpi.phase}</p>
                      <p className="font-semibold text-sm mt-1">{kpi.name}</p>
                      <p className="text-lg font-bold mt-0.5">{kpi.target}{kpi.unit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Revenue Forecast ───────────────────────────────── */}
        <TabsContent value="revenue">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{city.name} — 18-Month Revenue vs Cost Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={ramp}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={v => `$${(v / 1e3).toFixed(0)}k`} className="text-xs" />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.15)" name="Revenue" />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/0.1)" name="Cost" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Unit Economics</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Launch Investment', value: `$${city.launchCostM}M` },
                  { label: 'Break-even Month', value: `M${city.monthsToBreakeven}` },
                  { label: 'M18 Monthly Revenue', value: `$${(ramp[17].revenue / 1e3).toFixed(0)}k` },
                  { label: 'M18 Net Margin', value: `$${(ramp[17].net / 1e3).toFixed(0)}k` },
                  { label: 'Payback Multiple (M18)', value: `${((ramp.reduce((s, r) => s + r.revenue, 0)) / (city.launchCostM * 1e6)).toFixed(1)}x` },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Weight Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {Object.entries(WEIGHTS).map(([key, w]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-muted-foreground flex-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    <Progress value={w * 100} className="w-24 h-1.5" />
                    <span className="font-medium w-10 text-right">{(w * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Domination Roadmap ─────────────────────────────── */}
        <TabsContent value="roadmap">
          <div className="space-y-6">
            {[
              { phase: 'Phase 1 — Indonesia Domination', period: 'Year 1–2', cities: rankedCities.filter(c => c.region === 'Indonesia'), target: 'Control 60%+ urban transaction intelligence' },
              { phase: 'Phase 2 — SEA Expansion', period: 'Year 2–3', cities: rankedCities.filter(c => c.region === 'SEA'), target: 'Top-3 proptech platform in 4+ SEA markets' },
              { phase: 'Phase 3 — Global Infrastructure', period: 'Year 3–5', cities: [], target: 'Cross-border capital intelligence backbone for institutional investors' },
            ].map((p, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.phase}</CardTitle>
                    <Badge variant="outline">{p.period}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.target}</p>
                </CardHeader>
                <CardContent>
                  {p.cities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {p.cities.map(c => (
                        <div key={c.name} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.country}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{c.score}</p>
                            <Badge className={`text-[10px] ${phaseColor(c.phase)}`} variant="secondary">{c.phase}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground rounded-lg border border-dashed">
                      Target markets to be identified based on Phase 2 learnings and institutional partner demand signals
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
