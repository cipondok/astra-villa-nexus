import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useCityExpansionPlanner,
  INDONESIA_EXPANSION_CITIES,
  type CityExpansionPlan,
} from '@/hooks/useCityExpansion';
import {
  MapPin, Rocket, Target, DollarSign, Users, BarChart3,
  AlertTriangle, CheckCircle2, TrendingUp, Building2,
} from 'lucide-react';

const TIER_STYLE: Record<string, string> = {
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  promising: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  developing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  early: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

const formatIDR = (n: number) => `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
const formatM = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1_000).toFixed(0)}K`;

// ─── Readiness Dashboard ──────────────────────────────────────────────────────
const ReadinessTab = ({ plans }: { plans: CityExpansionPlan[] }) => (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Total Cities', value: plans.length, icon: MapPin },
        { label: 'Ready to Launch', value: plans.filter(p => p.readiness_tier === 'ready').length, icon: Rocket },
        { label: 'Total Budget', value: formatIDR(plans.reduce((s, p) => s + p.recommended_budget_idr, 0)), icon: DollarSign },
        { label: 'Target Listings', value: plans.reduce((s, p) => s + p.target_listings, 0).toLocaleString(), icon: Building2 },
      ].map(s => (
        <Card key={s.label}>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><s.icon className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="rounded-lg border overflow-hidden">
      <div className="grid grid-cols-[1fr_80px_80px_100px_100px_90px] gap-2 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>City</span><span>Score</span><span>Tier</span><span>Budget</span><span>Listings</span><span>M6 Rev</span>
      </div>
      <div className="divide-y max-h-[350px] overflow-y-auto">
        {plans.map(p => (
          <div key={p.city} className="grid grid-cols-[1fr_80px_80px_100px_100px_90px] gap-2 items-center px-4 py-2.5 text-sm">
            <span className="font-medium">{p.city}</span>
            <div className="flex items-center gap-1.5">
              <Progress value={p.readiness_score} className="h-1.5 flex-1" />
              <span className="text-xs font-semibold w-6 text-right">{p.readiness_score}</span>
            </div>
            <Badge variant="outline" className={`text-[10px] ${TIER_STYLE[p.readiness_tier]}`}>{p.readiness_tier}</Badge>
            <span className="text-xs">{formatIDR(p.recommended_budget_idr)}</span>
            <span className="text-xs">{p.target_listings}</span>
            <span className="text-xs font-medium">{formatIDR(p.revenue_ramp[5]?.revenue_idr ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Launch Checklist ─────────────────────────────────────────────────────────
const ChecklistTab = ({ plans }: { plans: CityExpansionPlan[] }) => {
  const [selectedCity, setSelectedCity] = useState(plans[0]?.city ?? '');
  const plan = plans.find(p => p.city === selectedCity);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {plans.map(p => (
          <Button
            key={p.city}
            size="sm"
            variant={p.city === selectedCity ? 'default' : 'outline'}
            onClick={() => setSelectedCity(p.city)}
          >
            {p.city}
          </Button>
        ))}
      </div>

      {plan && (
        <div className="space-y-3">
          {plan.launch_checklist.map((phase, pi) => (
            <Card key={phase.phase}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{pi + 1}</div>
                  <p className="text-sm font-semibold">{phase.phase}</p>
                </div>
                <div className="space-y-2 pl-8">
                  {phase.items.map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <Checkbox />
                      {item}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {plan.risk_factors.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="pt-4 space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Risk Factors</p>
                {plan.risk_factors.map(r => (
                  <p key={r} className="text-xs text-muted-foreground pl-6">• {r}</p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Revenue Ramp Tab ─────────────────────────────────────────────────────────
const RevenueRampTab = ({ plans }: { plans: CityExpansionPlan[] }) => (
  <div className="space-y-4">
    {plans.slice(0, 4).map(p => (
      <Card key={p.city}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> {p.city}</span>
            <Badge variant="outline" className={TIER_STYLE[p.readiness_tier]}>{p.readiness_score}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-20">
            {p.revenue_ramp.map(r => {
              const maxRev = p.revenue_ramp[p.revenue_ramp.length - 1].revenue_idr;
              const pct = maxRev > 0 ? (r.revenue_idr / maxRev) * 100 : 0;
              return (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{formatIDR(r.revenue_idr)}</span>
                  <div className="w-full bg-muted rounded-t" style={{ height: `${Math.max(8, pct)}%` }}>
                    <div className="w-full h-full bg-primary/60 rounded-t" />
                  </div>
                  <span className="text-[9px] text-muted-foreground">M{r.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// ─── Vendor Recruitment Tab ───────────────────────────────────────────────────
const VendorRecruitmentTab = ({ plans }: { plans: CityExpansionPlan[] }) => {
  const topCity = plans[0];
  if (!topCity) return null;

  const categories = Object.entries(topCity.vendor_recruitment_targets);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Vendor recruitment targets for <strong>{topCity.city}</strong> (top-ranked city)</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map(([cat, count]) => (
          <Card key={cat}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{cat}</span>
              </div>
              <Badge variant="secondary">{count} vendors</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
const CityExpansionCommandPanel = () => {
  const planner = useCityExpansionPlanner();
  const [plans, setPlans] = useState<CityExpansionPlan[]>([]);

  const handleGenerate = () => {
    planner.mutate(INDONESIA_EXPANSION_CITIES, {
      onSuccess: (data) => setPlans(data.plans),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">City Expansion Command</h2>
          <p className="text-sm text-muted-foreground">Auto-deploy marketplace operations to new Indonesian cities</p>
        </div>
        <Button onClick={handleGenerate} disabled={planner.isPending}>
          <Rocket className="mr-1.5 h-4 w-4" />
          {planner.isPending ? 'Analyzing…' : 'Generate Plans'}
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Click "Generate Plans" to analyze {INDONESIA_EXPANSION_CITIES.length} Indonesian expansion targets</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="readiness" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="readiness">Readiness</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Ramp</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="readiness"><ReadinessTab plans={plans} /></TabsContent>
          <TabsContent value="checklist"><ChecklistTab plans={plans} /></TabsContent>
          <TabsContent value="revenue"><RevenueRampTab plans={plans} /></TabsContent>
          <TabsContent value="vendors"><VendorRecruitmentTab plans={plans} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CityExpansionCommandPanel;
