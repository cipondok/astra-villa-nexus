import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search, Eye, Heart, FileText, Home, Wrench, TrendingUp,
  ArrowRight, CheckCircle2, Clock, Users, Wallet, Building2,
  BarChart3, Shield, Bell, Layers, MapPin, Zap,
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const FLOWS = [
  {
    id: 'discovery',
    title: 'Property Discovery',
    icon: Search,
    color: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    steps: [
      { label: 'AI Smart Search', desc: 'Natural language + filters, DNA-weighted ranking', route: '/properties', status: 'live' },
      { label: '3D / VR Viewing', desc: 'Immersive tours with hotspot annotations', route: '/property/:id', status: 'live' },
      { label: 'Demand Indicators', desc: 'Popularity badges, view count, save ratio', route: '/property/:id', status: 'live' },
      { label: 'Save / Compare / Share', desc: 'Watchlist, side-by-side comparison, social share', route: '/investor-watchlist', status: 'live' },
      { label: 'Map Intelligence', desc: 'Heat overlays, micro-location scoring', route: '/investment-map-explorer', status: 'live' },
    ],
  },
  {
    id: 'transaction',
    title: 'Transaction Initiation',
    icon: FileText,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    steps: [
      { label: 'Request Viewing', desc: 'Calendar booking with agent availability', route: '/property/:id', status: 'live' },
      { label: 'Digital Offer', desc: 'Submit binding offer with terms & conditions', route: '/my-offers', status: 'live' },
      { label: 'Negotiation Panel', desc: 'AI counter-offer suggestions, flexibility scoring', route: '/negotiation-assistant', status: 'live' },
      { label: 'Financing Pre-Check', desc: 'Mortgage eligibility, DTI calculator, bank matching', route: '/mortgage-financing', status: 'live' },
    ],
  },
  {
    id: 'execution',
    title: 'Deal Execution',
    icon: Shield,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    steps: [
      { label: 'Deal Progress Timeline', desc: '7-stage state machine: Inquiry → Closed', route: '/my-deals', status: 'live' },
      { label: 'Document Checklist', desc: 'Auto-tracked KTP, NPWP, AJB completion', route: '/my-deals/:id', status: 'live' },
      { label: 'Vendor Suggestions', desc: 'Contextual service recommendations per stage', route: '/vendor-marketplace', status: 'partial' },
      { label: 'Payment Milestones', desc: 'Escrow tracking, commission splits, receipts', route: '/my-deals/:id', status: 'live' },
    ],
  },
  {
    id: 'post-deal',
    title: 'Post-Purchase / Rental',
    icon: Home,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    steps: [
      { label: 'Renovation Booking', desc: 'Browse vendors, get quotes, track projects', route: '/vendor-marketplace', status: 'live' },
      { label: 'Interior Marketplace', desc: 'Furnishing, styling, smart-home services', route: '/vendor-marketplace', status: 'partial' },
      { label: 'Rental Dashboard', desc: 'Income tracking, tenant lifecycle, yield analysis', route: '/rental-yield-optimizer', status: 'live' },
      { label: 'Resale Intelligence', desc: 'Exit timing alerts, appreciation forecasts', route: '/portfolio-command-center', status: 'partial' },
    ],
  },
  {
    id: 'investor',
    title: 'Investor Experience',
    icon: TrendingUp,
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    steps: [
      { label: 'Portfolio Overview', desc: 'Multi-city allocation, ROI sparklines, total value', route: '/portfolio-command-center', status: 'live' },
      { label: 'Yield Analytics', desc: 'Rental yield optimization, cap rate comparisons', route: '/rental-yield-optimizer', status: 'live' },
      { label: 'Curated Deal Feed', desc: 'AI-matched opportunities based on DNA profile', route: '/recommendations', status: 'live' },
      { label: 'Diversification Recs', desc: 'Portfolio gap analysis, risk-adjusted suggestions', route: '/investment-advisor', status: 'live' },
      { label: 'Social Network', desc: 'Follow investors, share insights, leaderboard', route: '/investor-social', status: 'live' },
    ],
  },
];

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  live: { label: 'Live', variant: 'default' },
  partial: { label: 'Partial', variant: 'secondary' },
  planned: { label: 'Planned', variant: 'outline' },
};

const LIFECYCLE_STAGES = [
  { phase: 'Awareness', modules: ['SEO Content', 'Social Ads', 'Referral Program'], pct: 95 },
  { phase: 'Discovery', modules: ['AI Search', 'Map Explorer', 'Smart Feed'], pct: 90 },
  { phase: 'Evaluation', modules: ['3D Tours', 'Price Prediction', 'Comparisons'], pct: 85 },
  { phase: 'Transaction', modules: ['Digital Offers', 'Negotiation AI', 'Escrow'], pct: 80 },
  { phase: 'Ownership', modules: ['Vendor Services', 'Rental Management', 'Portfolio'], pct: 70 },
  { phase: 'Growth', modules: ['Resale Intel', 'Reinvestment', 'Social Network'], pct: 60 },
];

const MODULE_DEPS = [
  { module: 'AI Search', depends: ['Behavioral Events', 'Investor DNA', 'Liquidity Scores'] },
  { module: 'Deal Matching', depends: ['Investor Profiles', 'Property Scores', 'Market Data'] },
  { module: 'Vendor Routing', depends: ['Vendor Scores', 'Lead Pipeline', 'Category Gaps'] },
  { module: 'Revenue Flywheel', depends: ['Subscriptions', 'Transactions', 'Premium Slots'] },
  { module: 'Portfolio Intelligence', depends: ['Deal History', 'Market Trends', 'Yield Data'] },
  { module: 'Notification Engine', depends: ['User Preferences', 'AI Alerts', 'Deal Events'] },
];

const ROLLOUT = [
  { phase: 'Phase 1 — Core Loop', timeline: 'Month 1–3', items: ['Discovery → Transaction flow', 'Agent coordination', 'Basic vendor integration'], status: 'live' },
  { phase: 'Phase 2 — Intelligence', timeline: 'Month 4–6', items: ['AI scoring across all modules', 'Personalized feeds & alerts', 'Portfolio command center'], status: 'live' },
  { phase: 'Phase 3 — Ecosystem', timeline: 'Month 7–9', items: ['Full vendor marketplace', 'Post-deal service automation', 'Rental management suite'], status: 'building' },
  { phase: 'Phase 4 — Super-App', timeline: 'Month 10–12', items: ['Financing hub integration', 'Cross-module AI orchestration', 'Institutional investor terminal'], status: 'planned' },
];

/* ─── Tabs ─────────────────────────────────────────────────────────────────── */

const FlowsTab = () => {
  const [active, setActive] = useState('discovery');
  const flow = FLOWS.find(f => f.id === active)!;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FLOWS.map(f => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              f.id === active ? `${f.bg} ${f.color}` : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <f.icon className="h-4 w-4" />
            {f.title}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={`text-base flex items-center gap-2 ${flow.color}`}>
            <flow.icon className="h-5 w-5" />
            {flow.title} Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {flow.steps.map((step, i) => {
              const sb = STATUS_BADGE[step.status];
              return (
                <div key={step.label} className="flex items-start gap-3 py-2.5">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${flow.bg} ${flow.color}`}>
                      {i + 1}
                    </div>
                    {i < flow.steps.length - 1 && <div className="h-6 w-px bg-border" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{step.label}</p>
                      <Badge variant={sb.variant} className="text-[9px] h-4">{sb.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    <code className="text-[10px] text-muted-foreground/60 font-mono">{step.route}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LifecycleTab = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">End-to-end user lifecycle with module readiness per stage</p>
    {LIFECYCLE_STAGES.map((s, i) => (
      <Card key={s.phase}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
              <p className="text-sm font-semibold">{s.phase}</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{s.pct}% ready</span>
          </div>
          <Progress value={s.pct} className="h-1.5 mb-2" />
          <div className="flex flex-wrap gap-1.5">
            {s.modules.map(m => (
              <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const DependencyTab = () => (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Feature module dependency graph — each module requires its data dependencies to function</p>
    {MODULE_DEPS.map(d => (
      <Card key={d.module}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">{d.module}</p>
          </div>
          <div className="flex items-center gap-2 pl-6 flex-wrap">
            <span className="text-xs text-muted-foreground">Requires:</span>
            {d.depends.map(dep => (
              <Badge key={dep} variant="outline" className="text-[10px]">{dep}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const RolloutTab = () => (
  <div className="space-y-4">
    {ROLLOUT.map(r => (
      <Card key={r.phase}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">{r.phase}</p>
              <p className="text-xs text-muted-foreground">{r.timeline}</p>
            </div>
            <Badge variant={r.status === 'live' ? 'default' : r.status === 'building' ? 'secondary' : 'outline'}>
              {r.status}
            </Badge>
          </div>
          <ul className="space-y-1.5 pl-1">
            {r.items.map(item => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-primary/60" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    ))}
  </div>
);

/* ─── Principles ───────────────────────────────────────────────────────────── */

const PRINCIPLES = [
  { icon: Users, title: 'Single Identity', desc: 'One auth profile powering all modules — buyer, investor, owner' },
  { icon: Clock, title: 'Persistent Timeline', desc: 'Property lifecycle tracked from first view to resale exit' },
  { icon: Zap, title: 'Contextual AI', desc: 'Recommendations adapt per module context and user stage' },
  { icon: MapPin, title: 'Cross-Module Nav', desc: 'Seamless transitions between discovery, deals, and services' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Preference-based alerts across all lifecycle stages' },
];

/* ─── Main ─────────────────────────────────────────────────────────────────── */

const SuperAppJourneyPanel = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold tracking-tight">Super-App User Journey</h2>
      <p className="text-sm text-muted-foreground">Unified experience architecture connecting discovery → transaction → services → investment</p>
    </div>

    <div className="grid gap-3 sm:grid-cols-5">
      {PRINCIPLES.map(p => (
        <Card key={p.title}>
          <CardContent className="pt-4 text-center">
            <p.icon className="mx-auto h-5 w-5 text-primary mb-1.5" />
            <p className="text-xs font-semibold">{p.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <Tabs defaultValue="flows" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="flows">User Flows</TabsTrigger>
        <TabsTrigger value="lifecycle">Lifecycle Map</TabsTrigger>
        <TabsTrigger value="deps">Dependencies</TabsTrigger>
        <TabsTrigger value="rollout">Rollout</TabsTrigger>
      </TabsList>

      <TabsContent value="flows"><FlowsTab /></TabsContent>
      <TabsContent value="lifecycle"><LifecycleTab /></TabsContent>
      <TabsContent value="deps"><DependencyTab /></TabsContent>
      <TabsContent value="rollout"><RolloutTab /></TabsContent>
    </Tabs>
  </div>
);

export default SuperAppJourneyPanel;
