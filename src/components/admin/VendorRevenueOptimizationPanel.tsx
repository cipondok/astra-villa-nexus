import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVendorRevenueMetrics } from '@/hooks/useVendorRevenueFlywheel';
import { useBatchVendorRevenueScoring } from '@/hooks/useVendorRevenueInsights';
import {
  TrendingUp, Zap, Target, DollarSign, BarChart3, ArrowUpRight,
  RefreshCw, Users, Award, Gauge,
} from 'lucide-react';

const WEIGHTS = [
  { label: 'Response Speed', pct: 20, color: 'bg-emerald-500' },
  { label: 'Acceptance Rate', pct: 15, color: 'bg-sky-500' },
  { label: 'Reputation', pct: 25, color: 'bg-amber-500' },
  { label: 'Conversion', pct: 20, color: 'bg-rose-500' },
  { label: 'Demand Alignment', pct: 20, color: 'bg-violet-500' },
];

const PRICE_LABELS: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  increase_10pct: { label: '↑ +10%', variant: 'default' },
  increase_5pct: { label: '↑ +5%', variant: 'secondary' },
  decrease_15pct: { label: '↓ −15%', variant: 'destructive' },
  hold: { label: '— Hold', variant: 'outline' },
};

const TIER_COLORS: Record<string, string> = {
  platinum: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  gold: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  silver: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  standard: 'bg-muted text-muted-foreground',
};

const FlywheelDiagram = () => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><RefreshCw className="h-4 w-4" /> Revenue Flywheel</CardTitle></CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { step: '1', title: 'Score Vendors', desc: 'Speed, reputation, conversion signals', icon: Gauge },
          { step: '2', title: 'Route Leads', desc: 'Priority tiers: Platinum → Standard', icon: Target },
          { step: '3', title: 'Optimize Price', desc: 'Dynamic adjustment recommendations', icon: DollarSign },
          { step: '4', title: 'Trigger Upsell', desc: 'Premium, badges, featured slots', icon: ArrowUpRight },
        ].map((s) => (
          <div key={s.step} className="relative rounded-xl border bg-card p-4 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{s.step}</div>
            <s.icon className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground italic">
        Higher scores → better leads → more deals → higher scores → auto-compounding revenue
      </p>
    </CardContent>
  </Card>
);

const ScoringFormulaTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Scoring Weights</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {WEIGHTS.map((w) => (
          <div key={w.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{w.label}</span>
              <span className="text-muted-foreground">{w.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${w.color}`} style={{ width: `${w.pct * 4}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
    <FlywheelDiagram />
  </div>
);

const VendorScoreboardTab = () => {
  const { data: metrics, isLoading } = useVendorRevenueMetrics(100);
  const batchScore = useBatchVendorRevenueScoring();

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading vendor scores…</div>;

  const vendors = (metrics ?? []).map((m) => {
    const inputs = (m.scoring_inputs ?? {}) as Record<string, any>;
    return {
      id: m.vendor_id,
      score: m.revenue_potential_score,
      tier: inputs.lead_priority_tier ?? 'standard',
      priceAdj: inputs.recommended_price_adjustment ?? 'hold',
      upsells: (inputs.upsell_opportunities as string[]) ?? [],
      speedScore: inputs.speed_score ?? 0,
      reputationScore: inputs.reputation_score ?? 0,
    };
  });

  const tiers = { platinum: 0, gold: 0, silver: 0, standard: 0 };
  vendors.forEach((v) => { if (v.tier in tiers) tiers[v.tier as keyof typeof tiers]++; });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {Object.entries(tiers).map(([t, c]) => (
            <Badge key={t} variant="outline" className={TIER_COLORS[t]}>
              {t}: {c}
            </Badge>
          ))}
        </div>
        <Button size="sm" onClick={() => batchScore.mutate()} disabled={batchScore.isPending}>
          <Zap className="mr-1 h-3.5 w-3.5" />
          {batchScore.isPending ? 'Scoring…' : 'Re-Score All'}
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_90px_100px_1fr] gap-2 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Vendor</span><span>Score</span><span>Tier</span><span>Price Rec</span><span>Upsells</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y">
          {vendors.slice(0, 50).map((v) => {
            const pl = PRICE_LABELS[v.priceAdj] ?? PRICE_LABELS.hold;
            return (
              <div key={v.id} className="grid grid-cols-[1fr_100px_90px_100px_1fr] gap-2 items-center px-4 py-2.5 text-sm">
                <span className="truncate font-mono text-xs">{v.id.slice(0, 8)}…</span>
                <div className="flex items-center gap-2">
                  <Progress value={v.score} className="h-1.5 flex-1" />
                  <span className="text-xs font-semibold w-7 text-right">{v.score}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] ${TIER_COLORS[v.tier]}`}>{v.tier}</Badge>
                <Badge variant={pl.variant} className="text-[10px]">{pl.label}</Badge>
                <div className="flex flex-wrap gap-1">
                  {v.upsells.map((u) => (
                    <Badge key={u} variant="secondary" className="text-[9px]">{u.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
            );
          })}
          {vendors.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No scored vendors yet. Click "Re-Score All" to begin.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminControlsTab = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    {[
      { title: 'Boost Vendor Visibility', desc: 'Promote high-potential vendors to top search results', icon: TrendingUp, action: 'Boost Top 10' },
      { title: 'Allocate High-Value Leads', desc: 'Route premium leads to platinum-tier vendors', icon: Target, action: 'Allocate Now' },
      { title: 'Adjust Commission Tiers', desc: 'Modify platform take-rate per vendor tier', icon: DollarSign, action: 'Edit Tiers' },
      { title: 'Growth Campaign Trigger', desc: 'Launch vendor acquisition or activation campaign', icon: Users, action: 'Launch Campaign' },
    ].map((c) => (
      <Card key={c.title}>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><c.icon className="h-4 w-4 text-primary" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full">{c.action}</Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

const DeploymentRoadmapTab = () => (
  <div className="space-y-4">
    {[
      { phase: 'Phase 1 — Scoring Engine', weeks: 'Week 1–2', items: ['Deploy vendor-revenue-optimizer edge function', 'Batch scoring cron job (daily)', 'Populate vendor_revenue_metrics table'], status: 'live' },
      { phase: 'Phase 2 — Lead Routing', weeks: 'Week 3–4', items: ['Integrate priority tiers into lead assignment', 'Auto-route platinum leads first', 'Admin manual override panel'], status: 'building' },
      { phase: 'Phase 3 — Price Intelligence', weeks: 'Week 5–6', items: ['Surface price adjustment recommendations', 'Vendor notification system', 'A/B test pricing impact'], status: 'planned' },
      { phase: 'Phase 4 — Upsell Automation', weeks: 'Week 7–8', items: ['Trigger upsell alerts on score thresholds', 'Premium subscription conversion flow', 'Revenue attribution tracking'], status: 'planned' },
    ].map((p) => (
      <Card key={p.phase}>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">{p.phase}</p>
              <p className="text-xs text-muted-foreground">{p.weeks}</p>
            </div>
            <Badge variant={p.status === 'live' ? 'default' : p.status === 'building' ? 'secondary' : 'outline'}>
              {p.status}
            </Badge>
          </div>
          <ul className="space-y-1">
            {p.items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-3 w-3 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    ))}
  </div>
);

const VendorRevenueOptimizationPanel = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold tracking-tight">Vendor Revenue Optimization</h2>
      <p className="text-sm text-muted-foreground">AI-driven scoring, lead routing, pricing intelligence & upsell automation</p>
    </div>

    <Tabs defaultValue="scoreboard" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="formula">Formula</TabsTrigger>
        <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
        <TabsTrigger value="controls">Controls</TabsTrigger>
        <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
      </TabsList>

      <TabsContent value="formula"><ScoringFormulaTab /></TabsContent>
      <TabsContent value="scoreboard"><VendorScoreboardTab /></TabsContent>
      <TabsContent value="controls"><AdminControlsTab /></TabsContent>
      <TabsContent value="roadmap"><DeploymentRoadmapTab /></TabsContent>
    </Tabs>
  </div>
);

export default VendorRevenueOptimizationPanel;
