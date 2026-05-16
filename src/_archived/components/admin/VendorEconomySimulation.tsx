import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Users, TrendingUp, Activity, Building2, DollarSign,
  BarChart3, AlertTriangle, Award, Zap, Shield, Target
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar
} from 'recharts';

/* ─── Simulation Engine ─── */
type Scenario = 'conservative' | 'ai_accelerated' | 'aggressive';

interface SimInputs {
  onboardingRate: number;     // vendors/month
  activationSpeed: number;    // days to first listing
  avgDealCycle: number;       // days
  commissionOptPct: number;   // % improvement
  demandElasticity: number;   // 0-1 scale
}

const SCENARIO_DEFAULTS: Record<Scenario, SimInputs> = {
  conservative:   { onboardingRate: 8,  activationSpeed: 14, avgDealCycle: 45, commissionOptPct: 2,  demandElasticity: 0.3 },
  ai_accelerated: { onboardingRate: 18, activationSpeed: 7,  avgDealCycle: 28, commissionOptPct: 8,  demandElasticity: 0.6 },
  aggressive:     { onboardingRate: 35, activationSpeed: 3,  avgDealCycle: 18, commissionOptPct: 15, demandElasticity: 0.85 },
};

const SCENARIO_LABELS: Record<Scenario, { label: string; color: string }> = {
  conservative:   { label: 'Conservative', color: 'text-chart-2' },
  ai_accelerated: { label: 'AI-Accelerated', color: 'text-chart-1' },
  aggressive:     { label: 'Aggressive Global', color: 'text-primary' },
};

interface SimMonth {
  month: string;
  vendors: number;
  activeListings: number;
  deals: number;
  revenue: number;
  workload: number; // operational hours
  capitalEfficiency: number; // revenue per Rp spent
}

function simulate(inputs: SimInputs, months = 12): SimMonth[] {
  let vendors = 45;
  let listings = 120;
  const results: SimMonth[] = [];
  const baseRevPerDeal = 45_000_000;
  const costPerVendor = 2_500_000; // monthly ops cost

  for (let m = 1; m <= months; m++) {
    vendors += inputs.onboardingRate * (1 + inputs.demandElasticity * 0.1 * m);
    const activationRate = Math.min(0.95, 0.5 + (14 - inputs.activationSpeed) * 0.03);
    const activeVendors = Math.round(vendors * activationRate);
    listings += activeVendors * 2.5;
    const dealRate = Math.min(0.12, 0.03 + (45 - inputs.avgDealCycle) * 0.002);
    const deals = Math.round(listings * dealRate);
    const commMult = 1 + inputs.commissionOptPct / 100;
    const revenue = deals * baseRevPerDeal * commMult;
    const workload = Math.round(activeVendors * 3.2 + deals * 8);
    const totalCost = activeVendors * costPerVendor;
    const capitalEfficiency = totalCost > 0 ? revenue / totalCost : 0;

    results.push({
      month: `M${m}`,
      vendors: Math.round(vendors),
      activeListings: Math.round(listings),
      deals,
      revenue,
      workload,
      capitalEfficiency: Math.round(capitalEfficiency * 100) / 100,
    });
  }
  return results;
}

const formatRp = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

/* ─── Top Vendor Leaderboard ─── */
const MOCK_LEADERS = [
  { name: 'Bali Coastal Living', deals: 38, revenue: 1_710_000_000, growth: 24 },
  { name: 'Jakarta Realty Group', deals: 23, revenue: 1_035_000_000, growth: 18 },
  { name: 'Canggu Surf Villas', deals: 31, revenue: 925_000_000, growth: 31 },
  { name: 'Seminyak Luxury', deals: 12, revenue: 540_000_000, growth: 12 },
  { name: 'Lombok Paradise', deals: 19, revenue: 475_000_000, growth: 22 },
];

/* ─── Main Dashboard ─── */
const VendorEconomySimulation = () => {
  const [scenario, setScenario] = useState<Scenario>('ai_accelerated');
  const [inputs, setInputs] = useState<SimInputs>(SCENARIO_DEFAULTS.ai_accelerated);

  const simData = useMemo(() => simulate(inputs, 12), [inputs]);
  const finalMonth = simData[simData.length - 1];

  // Multi-scenario comparison for chart
  const comparisonData = useMemo(() => {
    const cons = simulate(SCENARIO_DEFAULTS.conservative, 12);
    const ai = simulate(SCENARIO_DEFAULTS.ai_accelerated, 12);
    const agg = simulate(SCENARIO_DEFAULTS.aggressive, 12);
    return cons.map((c, i) => ({
      month: c.month,
      conservative: c.revenue,
      ai_accelerated: ai[i].revenue,
      aggressive: agg[i].revenue,
    }));
  }, []);

  const healthIndex = useMemo(() => {
    const vendorGrowth = Math.min(30, (inputs.onboardingRate / 35) * 30);
    const activationScore = Math.min(25, ((14 - inputs.activationSpeed) / 14) * 25);
    const dealEfficiency = Math.min(25, ((45 - inputs.avgDealCycle) / 45) * 25);
    const commOpt = Math.min(20, (inputs.commissionOptPct / 15) * 20);
    return Math.round(vendorGrowth + activationScore + dealEfficiency + commOpt);
  }, [inputs]);

  const handleScenarioChange = (s: Scenario) => {
    setScenario(s);
    setInputs(SCENARIO_DEFAULTS[s]);
  };

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Vendor Economy Simulation</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(SCENARIO_LABELS) as Scenario[]).map(s => (
            <button
              key={s}
              onClick={() => handleScenarioChange(s)}
              className={cn(
                "h-6 px-2.5 rounded-md text-[9px] font-medium border transition-colors",
                scenario === s
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/10 border-border/20 text-muted-foreground hover:text-foreground"
              )}
            >
              {SCENARIO_LABELS[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Health + KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card className={cn("border-border/20", healthIndex >= 70 ? 'border-chart-1/20' : healthIndex >= 40 ? 'border-chart-3/20' : 'border-destructive/20')}>
          <CardContent className="p-2.5 text-center">
            <p className="text-[8px] text-muted-foreground uppercase">Economy Health</p>
            <p className={cn("text-2xl font-bold tabular-nums", healthIndex >= 70 ? 'text-chart-1' : healthIndex >= 40 ? 'text-chart-3' : 'text-destructive')}>{healthIndex}</p>
            <p className="text-[7px] text-muted-foreground">/ 100</p>
          </CardContent>
        </Card>
        {[
          { label: 'Projected Vendors', value: finalMonth.vendors, icon: Users },
          { label: 'Monthly Deals', value: finalMonth.deals, icon: Target },
          { label: 'Monthly Revenue', value: formatRp(finalMonth.revenue), icon: DollarSign },
          { label: 'Capital Efficiency', value: `${finalMonth.capitalEfficiency}x`, icon: Zap },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/20">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <kpi.icon className="h-2.5 w-2.5 text-muted-foreground" />
                <p className="text-[7px] text-muted-foreground uppercase">{kpi.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* Charts */}
        <div className="space-y-3">
          {/* Revenue projection by scenario */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold">Simulated Revenue Curve</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={comparisonData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(0)}B` : `${(v/1e6).toFixed(0)}M`} width={40} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => formatRp(v)} />
                  <Area type="monotone" dataKey="conservative" stroke="hsl(var(--chart-2))" fill="none" strokeDasharray="4 4" strokeWidth={1} />
                  <Area type="monotone" dataKey="ai_accelerated" stroke="hsl(var(--chart-1))" fill="url(#gSim)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="aggressive" stroke="hsl(var(--primary))" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Workload forecast */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold">Operational Workload Forecast</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={simData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Bar dataKey="workload" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Simulation controls */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold">Simulation Variables</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-3">
              {[
                { label: 'Vendor Onboarding Rate', key: 'onboardingRate' as const, min: 1, max: 50, unit: '/mo' },
                { label: 'Listing Activation Speed', key: 'activationSpeed' as const, min: 1, max: 30, unit: 'days' },
                { label: 'Avg Deal Cycle Time', key: 'avgDealCycle' as const, min: 7, max: 90, unit: 'days' },
                { label: 'Commission Optimization', key: 'commissionOptPct' as const, min: 0, max: 25, unit: '%' },
                { label: 'Demand Elasticity', key: 'demandElasticity' as const, min: 0, max: 1, unit: '' },
              ].map(ctrl => (
                <div key={ctrl.key} className="flex items-center gap-3">
                  <span className="text-[9px] text-muted-foreground w-36 shrink-0">{ctrl.label}</span>
                  <Slider
                    value={[inputs[ctrl.key]]}
                    onValueChange={([v]) => setInputs(prev => ({ ...prev, [ctrl.key]: v }))}
                    min={ctrl.min} max={ctrl.max}
                    step={ctrl.key === 'demandElasticity' ? 0.05 : 1}
                    className="flex-1"
                  />
                  <span className="text-[9px] tabular-nums text-foreground w-12 text-right">
                    {inputs[ctrl.key]}{ctrl.unit}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Leaderboard + Risk */}
        <div className="space-y-2">
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Award className="h-3 w-3 text-chart-3" />Top Vendor Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {MOCK_LEADERS.map((v, i) => (
                <div key={v.name} className="flex items-center gap-2 py-1">
                  <span className="text-[10px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground truncate">{v.name}</p>
                    <p className="text-[7px] text-muted-foreground">{v.deals} deals</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-semibold text-foreground tabular-nums">{formatRp(v.revenue)}</p>
                    <Badge variant="outline" className="text-[6px] h-3 text-chart-1 border-chart-1/20">+{v.growth}%</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-chart-3" />Risk Concentration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {[
                { label: 'Bali dependency', value: 62, threshold: 50, status: 'warning' },
                { label: 'Top 5 vendor revenue share', value: 45, threshold: 60, status: 'ok' },
                { label: 'Single-city listing ratio', value: 58, threshold: 50, status: 'warning' },
                { label: 'Avg vendor tenure', value: 8.2, threshold: 6, status: 'ok' },
              ].map(risk => (
                <div key={risk.label} className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", risk.status === 'ok' ? 'bg-chart-1' : 'bg-chart-3')} />
                  <span className="text-[9px] text-muted-foreground flex-1">{risk.label}</span>
                  <span className="text-[9px] font-medium text-foreground tabular-nums">{risk.value}{typeof risk.value === 'number' && risk.value > 1 ? '%' : ' mo'}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorEconomySimulation;
