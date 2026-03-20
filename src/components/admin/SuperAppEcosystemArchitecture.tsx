import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Search, Home, Banknote, Wrench, TrendingUp, Users,
  ArrowRight, CheckCircle, Clock, Layers, Network, DollarSign,
  Shield, Globe, Zap, Target, BarChart3, Building2
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────────────────── */

const modules = [
  {
    id: 'discovery',
    title: 'Property Discovery & Transaction',
    icon: Search,
    color: 'hsl(var(--chart-1))',
    status: 'live',
    progress: 82,
    features: [
      { name: 'AI property search', done: true },
      { name: '3D immersive viewing', done: false },
      { name: 'Digital offer submission', done: true },
      { name: 'Transaction orchestration', done: true },
    ],
    metrics: { mau: '3,200', conversion: '6.4%', txVolume: 'Rp 85B/mo' },
    dataCaptured: ['Search sequences', 'Clickstream depth', 'Offer negotiation spreads', 'Time-on-market'],
  },
  {
    id: 'financing',
    title: 'Property Financing Hub',
    icon: Banknote,
    color: 'hsl(var(--chart-2))',
    status: 'partial',
    progress: 45,
    features: [
      { name: 'Mortgage marketplace', done: true },
      { name: 'Financing eligibility scoring', done: true },
      { name: 'Refinancing intelligence alerts', done: false },
    ],
    metrics: { applications: '180/mo', approvalRate: '62%', avgLoan: 'Rp 1.2B' },
    dataCaptured: ['Eligibility profiles', 'Approval timelines', 'Rate sensitivity'],
  },
  {
    id: 'management',
    title: 'Property Management Platform',
    icon: Home,
    color: 'hsl(var(--chart-3))',
    status: 'planned',
    progress: 15,
    features: [
      { name: 'Rental income dashboard', done: false },
      { name: 'Maintenance vendor automation', done: false },
      { name: 'Tenant lifecycle management', done: false },
    ],
    metrics: { units: '—', occupancy: '—', noi: '—' },
    dataCaptured: ['Rental yield actuals', 'Maintenance cost patterns', 'Tenant churn signals'],
  },
  {
    id: 'renovation',
    title: 'Renovation & Interior Marketplace',
    icon: Wrench,
    color: 'hsl(var(--chart-4))',
    status: 'partial',
    progress: 55,
    features: [
      { name: 'Vendor service booking', done: true },
      { name: 'Project budgeting intelligence', done: false },
      { name: 'ROI improvement recommendations', done: false },
    ],
    metrics: { vendors: '310', jobs: '420/mo', avgTicket: 'Rp 18M' },
    dataCaptured: ['Renovation cost benchmarks', 'Value-add ROI data', 'Vendor performance'],
  },
  {
    id: 'portfolio',
    title: 'Investment Portfolio Terminal',
    icon: TrendingUp,
    color: 'hsl(var(--chart-5))',
    status: 'live',
    progress: 70,
    features: [
      { name: 'Cross-city asset allocation', done: true },
      { name: 'Yield optimization analytics', done: true },
      { name: 'Exit timing intelligence', done: false },
    ],
    metrics: { aum: 'Rp 420B', avgYield: '8.2%', portfolios: '1,840' },
    dataCaptured: ['Allocation behaviour', 'Yield preferences', 'Exit timing patterns'],
  },
];

const journeyPhases = [
  { phase: 'Discovery', description: 'AI search, 3D viewing, market intelligence', modules: ['discovery'], conversion: '100%' },
  { phase: 'Evaluation', description: 'Yield analysis, area scoring, comp data', modules: ['discovery', 'portfolio'], conversion: '34%' },
  { phase: 'Transaction', description: 'Offer, negotiation, escrow, closing', modules: ['discovery', 'financing'], conversion: '6.4%' },
  { phase: 'Ownership', description: 'Rental management, maintenance, tenant ops', modules: ['management', 'renovation'], conversion: '92% retain' },
  { phase: 'Growth', description: 'Portfolio rebalance, exit timing, reinvestment', modules: ['portfolio', 'financing'], conversion: '47% repeat' },
];

const rolloutPhases = [
  { phase: 'Phase 1 — Foundation', timeline: 'M1–M6', items: ['Discovery & Transaction core', 'Vendor marketplace MVP', 'Investor portfolio v1'], capital: 'Rp 8B' },
  { phase: 'Phase 2 — Financing', timeline: 'M7–M12', items: ['Mortgage marketplace', 'Bank API integrations', 'Refinancing alerts'], capital: 'Rp 5B' },
  { phase: 'Phase 3 — Management', timeline: 'M13–M18', items: ['Rental dashboard', 'Maintenance automation', 'Tenant lifecycle'], capital: 'Rp 6B' },
  { phase: 'Phase 4 — Intelligence', timeline: 'M19–M24', items: ['Cross-module data fusion', 'Predictive lifecycle engine', 'Institutional terminal'], capital: 'Rp 10B' },
];

const monetizationStreams = [
  { stream: 'Transaction Commissions', source: 'Discovery', margin: '1.15%', arr: '$4.2M', growth: '+38%' },
  { stream: 'Vendor SaaS Plans', source: 'Renovation', margin: '85%', arr: '$2.8M', growth: '+52%' },
  { stream: 'Investor Subscriptions', source: 'Portfolio', margin: '92%', arr: '$1.9M', growth: '+44%' },
  { stream: 'Financing Referrals', source: 'Financing', margin: '100%', arr: '$1.1M', growth: '+28%' },
  { stream: 'Management Fees', source: 'Management', margin: '70%', arr: '$0.6M', growth: 'New' },
  { stream: 'Data Intelligence API', source: 'All Modules', margin: '95%', arr: '$0.8M', growth: '+120%' },
  { stream: 'Subscription Bundles', source: 'Cross-Module', margin: '88%', arr: '$1.4M', growth: 'New' },
];

const statusBadge = (s: string) => {
  if (s === 'live') return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Live</Badge>;
  if (s === 'partial') return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">Partial</Badge>;
  return <Badge className="bg-muted text-muted-foreground">Planned</Badge>;
};

/* ─── Component ────────────────────────────────────────────────────── */

export default function SuperAppEcosystemArchitecture() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Super-App Ecosystem Architecture</h2>
            <p className="text-muted-foreground text-sm">Full real estate lifecycle platform — from discovery to portfolio growth</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
          <TabsTrigger value="data">Data Layer</TabsTrigger>
          <TabsTrigger value="rollout">Rollout</TabsTrigger>
          <TabsTrigger value="monetization">Revenue</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Module Architecture ─────────────────────────────── */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              const expanded = selectedModule === m.id;
              return (
                <Card
                  key={m.id}
                  className="cursor-pointer transition-shadow hover:shadow-md border-l-4"
                  style={{ borderLeftColor: m.color }}
                  onClick={() => setSelectedModule(expanded ? null : m.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" style={{ color: m.color }} />
                        <CardTitle className="text-sm font-semibold">{m.title}</CardTitle>
                      </div>
                      {statusBadge(m.status)}
                    </div>
                    <Progress value={m.progress} className="h-1.5 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">{m.progress}% complete</p>
                  </CardHeader>

                  {expanded && (
                    <CardContent className="pt-0 space-y-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Features</p>
                        <ul className="space-y-1">
                          {m.features.map((f) => (
                            <li key={f.name} className="flex items-center gap-2">
                              {f.done
                                ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                : <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                              <span className={f.done ? '' : 'text-muted-foreground'}>{f.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(m.metrics).map(([k, v]) => (
                          <div key={k} className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground capitalize">{k}</p>
                            <p className="font-semibold text-xs">{v}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Cross-module network effect */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Network className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Network Effect Flywheel</h3>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                {['More Vendors', 'Faster Deals', 'More Investors', 'More Listings', 'Better Data', 'Smarter Pricing', 'Higher Liquidity'].map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-xs">{step}</span>
                    {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </React.Fragment>
                ))}
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium text-xs">↻ Repeat</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: User Journey Lifecycle ───────────────────────────── */}
        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Investment Lifecycle Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {journeyPhases.map((j, i) => (
                  <div key={j.phase} className="flex gap-4 pb-6 last:pb-0">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
                      {i < journeyPhases.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{j.phase}</h4>
                        <Badge variant="outline" className="text-xs">{j.conversion}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{j.description}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {j.modules.map((mId) => {
                          const mod = modules.find((m) => m.id === mId);
                          return mod ? (
                            <Badge key={mId} variant="secondary" className="text-xs">{mod.title.split(' ')[0]}</Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion strategies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Homeowner → Investor', desc: 'Rental yield data + portfolio tools convert owners into active investors', rate: '23%' },
              { title: 'Investor → Service Buyer', desc: 'Renovation ROI intelligence drives vendor marketplace spend', rate: '41%' },
              { title: 'One-time → Repeat', desc: 'Portfolio analytics + exit timing retain investors for multi-deal lifecycle', rate: '47%' },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-sm mb-1">{c.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold">{c.rate}</span>
                    <span className="text-xs text-muted-foreground">conversion</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 3: Data Sharing Layer ───────────────────────────────── */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Unified Data Sharing Layer
              </CardTitle>
              <p className="text-xs text-muted-foreground">Cross-module intelligence creates compounding data moat</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: m.color }} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{m.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {m.dataCaptured.map((d) => (
                            <Badge key={d} variant="outline" className="text-xs font-normal">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Intelligence outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'ASTRA Liquidity Score', desc: 'City → District → Project → Unit level scoring combining all module signals', icon: BarChart3 },
              { title: 'Predictive Pricing Engine', desc: 'Transaction velocity + demand heat + vendor cost data → dynamic FMV', icon: Target },
              { title: 'Capital Flow Predictor', desc: 'Portfolio behaviour + financing patterns → institutional demand signals', icon: Globe },
              { title: 'Lifecycle Value Model', desc: 'Cross-module engagement depth → investor LTV and churn prediction', icon: DollarSign },
            ].map((o) => {
              const Icon = o.icon;
              return (
                <Card key={o.title}>
                  <CardContent className="pt-6 flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{o.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{o.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB 4: Rollout Roadmap ──────────────────────────────────── */}
        <TabsContent value="rollout" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rolloutPhases.map((r, i) => (
              <Card key={r.phase} className={i === 0 ? 'border-primary/40' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{r.phase}</CardTitle>
                    <Badge variant="outline">{r.timeline}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1.5">
                    {r.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Capital required</p>
                    <p className="font-semibold text-sm">{r.capital}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Total Ecosystem Build Capital</p>
                  <p className="text-xs text-muted-foreground">24-month full super-app deployment</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">Rp 29B</p>
                  <p className="text-xs text-muted-foreground">≈ $1.8M USD</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: Monetization Model ──────────────────────────────── */}
        <TabsContent value="monetization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Ecosystem Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Stream</th>
                      <th className="pb-2 font-medium text-muted-foreground">Source Module</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Margin</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">ARR</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monetizationStreams.map((s) => (
                      <tr key={s.stream} className="border-b last:border-0">
                        <td className="py-2.5 font-medium">{s.stream}</td>
                        <td className="py-2.5">
                          <Badge variant="secondary" className="text-xs">{s.source}</Badge>
                        </td>
                        <td className="py-2.5 text-right">{s.margin}</td>
                        <td className="py-2.5 text-right font-semibold">{s.arr}</td>
                        <td className="py-2.5 text-right">
                          <span className="text-emerald-600 font-medium">{s.growth}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td className="pt-3 font-bold" colSpan={3}>Total Ecosystem ARR</td>
                      <td className="pt-3 text-right font-bold text-lg">$12.8M</td>
                      <td className="pt-3 text-right text-emerald-600 font-semibold">+46%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bundle strategy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Investor Pro Bundle', price: 'Rp 499k/mo', includes: 'Portfolio + Financing + Alerts', ltv: 'Rp 9.9M' },
              { name: 'Owner Complete', price: 'Rp 349k/mo', includes: 'Management + Renovation + Analytics', ltv: 'Rp 5.6M' },
              { name: 'Institutional Terminal', price: 'Rp 15M/mo', includes: 'All modules + API + Custom reports', ltv: 'Rp 360M' },
            ].map((b) => (
              <Card key={b.name}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-sm">{b.name}</h4>
                  <p className="text-2xl font-bold mt-2">{b.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.includes}</p>
                  <div className="mt-3 pt-3 border-t flex justify-between text-xs">
                    <span className="text-muted-foreground">Projected LTV</span>
                    <span className="font-semibold">{b.ltv}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
