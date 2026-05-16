import React, { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Building2, Users, Target, AlertTriangle, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── types ───────── */

interface YearProjection {
  year: number;
  cities: number;
  listings: number;
  mrr: number;
  arr: number;
  vendorSubs: number;
  investorSubs: number;
  margin: number;
  valuation: number;
  multiple: number;
}

interface Scenario {
  id: string;
  label: string;
  color: string;
  badge: "default" | "secondary" | "destructive";
  growthRate: number;
  cityPerYear: number;
  marginTarget: number;
  multipleBase: number;
}

/* ───────── constants ───────── */

const scenarios: Scenario[] = [
  { id: "conservative", label: "Conservative", color: "hsl(var(--muted-foreground))", badge: "secondary", growthRate: 0.6, cityPerYear: 2, marginTarget: 0.55, multipleBase: 12 },
  { id: "realistic", label: "Realistic Scale-Up", color: "hsl(var(--primary))", badge: "default", growthRate: 1.0, cityPerYear: 4, marginTarget: 0.65, multipleBase: 20 },
  { id: "aggressive", label: "Hyper-Growth", color: "hsl(var(--chart-2))", badge: "destructive", growthRate: 1.6, cityPerYear: 7, marginTarget: 0.72, multipleBase: 35 },
];

const valuationMilestones = [
  { label: "Seed", val: 5, arr: 0.5 },
  { label: "Series A", val: 40, arr: 2 },
  { label: "Series B", val: 150, arr: 8 },
  { label: "Series C", val: 500, arr: 25 },
  { label: "Unicorn", val: 1000, arr: 50 },
  { label: "Decacorn", val: 10000, arr: 350 },
];

const riskFactors = [
  { risk: "Regulatory fragmentation across cities delays expansion by 6+ months per market", severity: "high", mitigation: "Pre-launch legal/compliance playbook per jurisdiction, government liaison partnerships" },
  { risk: "Vendor churn exceeds 8% monthly, collapsing supply-side liquidity", severity: "high", mitigation: "Lock-in via performance analytics, 12-month contracts with graduated pricing, vendor success team" },
  { risk: "Capital markets downturn compresses revenue multiples from 20x to 8x", severity: "medium", mitigation: "Focus on profitability metrics, maintain 18-month runway, diversify revenue streams" },
  { risk: "Well-funded competitor launches aggressive price war in top 3 cities", severity: "medium", mitigation: "Intelligence moat makes price competition irrelevant; lock vendor contracts, deepen data advantage" },
  { risk: "Monetization conversion plateaus below 4% due to price sensitivity", severity: "medium", mitigation: "Behavioral pricing experiments, freemium-to-paid funnel optimization, value demonstration loops" },
  { risk: "Operational complexity of multi-city ops outpaces team capacity", severity: "low", mitigation: "Standardized city-launch playbook, automation-first ops, hire city GMs with P&L ownership" },
];

const fmt = (n: number, decimals = 1) => {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(decimals)}B`;
  if (n >= 1) return `$${n.toFixed(decimals)}M`;
  return `$${(n * 1_000).toFixed(0)}K`;
};

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
};

/* ───────── projection engine ───────── */

function project(s: Scenario, baseMRR: number, baseCities: number, baseListings: number): YearProjection[] {
  const rows: YearProjection[] = [];
  let cities = baseCities;
  let listings = baseListings;
  let mrr = baseMRR;

  for (let y = 0; y < 5; y++) {
    cities += s.cityPerYear;
    listings = Math.round(listings * (1 + 0.4 * s.growthRate) + cities * 800 * s.growthRate);
    const vendorSubs = Math.round(listings * (0.06 + y * 0.015 * s.growthRate));
    const investorSubs = Math.round(listings * (0.12 + y * 0.02 * s.growthRate));
    mrr = mrr * (1 + (0.12 + 0.06 * s.growthRate)) + cities * 15_000 * s.growthRate;
    const arr = mrr * 12;
    const margin = Math.min(s.marginTarget, 0.25 + y * 0.1 * s.growthRate);
    const networkPremium = 1 + Math.min(0.6, cities * 0.03);
    const multiple = s.multipleBase * networkPremium * (1 + margin * 0.5);
    const valuation = (arr / 1_000_000) * multiple;

    rows.push({
      year: 2026 + y,
      cities,
      listings,
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      vendorSubs,
      investorSubs,
      margin: Math.round(margin * 100),
      valuation: Math.round(valuation * 10) / 10,
      multiple: Math.round(multiple * 10) / 10,
    });
  }
  return rows;
}

/* ───────── component ───────── */

const DecacornProjection: React.FC = () => {
  const [baseMRR, setBaseMRR] = useState(25_000);
  const [baseCities, setBaseCities] = useState(1);
  const [baseListings, setBaseListings] = useState(2_500);
  const [activeScenario, setActiveScenario] = useState("realistic");
  const [showRisks, setShowRisks] = useState(false);

  const projections = useMemo(() =>
    Object.fromEntries(scenarios.map(s => [s.id, project(s, baseMRR, baseCities, baseListings)])),
    [baseMRR, baseCities, baseListings]
  );

  const chartData = useMemo(() => {
    return projections["realistic"].map((row, i) => ({
      year: `${row.year}`,
      conservative: projections["conservative"][i].valuation,
      realistic: projections["realistic"][i].valuation,
      aggressive: projections["aggressive"][i].valuation,
    }));
  }, [projections]);

  const arrChartData = useMemo(() => {
    return projections["realistic"].map((row, i) => ({
      year: `${row.year}`,
      conservative: Math.round(projections["conservative"][i].arr / 1_000_000 * 10) / 10,
      realistic: Math.round(projections["realistic"][i].arr / 1_000_000 * 10) / 10,
      aggressive: Math.round(projections["aggressive"][i].arr / 1_000_000 * 10) / 10,
    }));
  }, [projections]);

  const active = scenarios.find(s => s.id === activeScenario)!;
  const activeRows = projections[activeScenario];
  const finalRow = activeRows[activeRows.length - 1];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Decacorn Financial Projection"
        description="3-5 year valuation simulation — liquidity density expansion, monetization depth & multi-city network effects"
        icon={TrendingUp}
        badge={{ text: "💎 Decacorn", variant: "outline" }}
      />

      {/* Input Controls */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Base Assumptions (Adjustable)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current MRR</span>
              <span className="text-sm font-bold text-foreground">{fmt(baseMRR / 1_000_000)}</span>
            </div>
            <Slider value={[baseMRR]} onValueChange={v => setBaseMRR(v[0])} min={5000} max={200000} step={5000} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Cities</span>
              <span className="text-sm font-bold text-foreground">{baseCities}</span>
            </div>
            <Slider value={[baseCities]} onValueChange={v => setBaseCities(v[0])} min={1} max={10} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Listings</span>
              <span className="text-sm font-bold text-foreground">{fmtShort(baseListings)}</span>
            </div>
            <Slider value={[baseListings]} onValueChange={v => setBaseListings(v[0])} min={500} max={50000} step={500} />
          </div>
        </CardContent>
      </Card>

      {/* Scenario Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map(s => {
          const final = projections[s.id][4];
          const isActive = activeScenario === s.id;
          return (
            <Card
              key={s.id}
              className={cn(
                "border-border cursor-pointer transition-all",
                isActive && "ring-2 ring-primary/40 border-primary/30"
              )}
              onClick={() => setActiveScenario(s.id)}
            >
              <CardContent className="p-4 text-center space-y-1">
                <Badge variant={s.badge} className="text-[10px] mb-1">{s.label}</Badge>
                <p className="text-2xl font-bold text-foreground">{fmt(final.valuation)}</p>
                <p className="text-[10px] text-muted-foreground">2030 Valuation · {final.multiple}x ARR</p>
                <div className="flex justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>{final.cities} cities</span>
                  <span>{fmtShort(final.listings)} listings</span>
                  <span>{final.margin}% margin</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Valuation Trajectory ($M)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="aggressive" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.08} strokeDasharray="4 4" name="Hyper-Growth" />
                <Area type="monotone" dataKey="realistic" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="Realistic" />
                <Area type="monotone" dataKey="conservative" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.06} strokeDasharray="4 4" name="Conservative" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">ARR Progression ($M)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={arrChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="conservative" fill="hsl(var(--muted-foreground))" radius={[4,4,0,0]} name="Conservative" />
                <Bar dataKey="realistic" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Realistic" />
                <Bar dataKey="aggressive" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} name="Hyper-Growth" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Projection Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{active.label} — 5-Year Projection</CardTitle>
            <Badge variant={active.badge} className="text-[10px]">{active.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Year","Cities","Listings","MRR","ARR","Vendor Subs","Investor Subs","Margin","Multiple","Valuation"].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeRows.map(row => (
                <tr key={row.year} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="py-2.5 px-2 font-semibold text-foreground">{row.year}</td>
                  <td className="py-2.5 px-2 text-foreground">{row.cities}</td>
                  <td className="py-2.5 px-2 text-foreground">{fmtShort(row.listings)}</td>
                  <td className="py-2.5 px-2 text-foreground">{fmt(row.mrr / 1_000_000)}</td>
                  <td className="py-2.5 px-2 font-semibold text-primary">{fmt(row.arr / 1_000_000)}</td>
                  <td className="py-2.5 px-2 text-foreground">{fmtShort(row.vendorSubs)}</td>
                  <td className="py-2.5 px-2 text-foreground">{fmtShort(row.investorSubs)}</td>
                  <td className="py-2.5 px-2 text-foreground">{row.margin}%</td>
                  <td className="py-2.5 px-2 text-foreground">{row.multiple}x</td>
                  <td className="py-2.5 px-2 font-bold text-chart-2">{fmt(row.valuation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Valuation Milestones */}
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Valuation Milestone Checkpoints</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {valuationMilestones.map((m, i) => {
            const reached = finalRow.valuation >= m.val;
            return (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                reached ? "bg-chart-2/5 border-chart-2/20" : "bg-muted/20 border-border/30"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                  reached ? "bg-chart-2/20 text-chart-2" : "bg-muted/40 text-muted-foreground"
                )}>
                  {reached ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground">{m.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">≥{fmt(m.val)} valuation</span>
                </div>
                <span className="text-xs text-muted-foreground">ARR ≥ {fmt(m.arr)}</span>
                <Badge variant={reached ? "default" : "secondary"} className="text-[9px]">
                  {reached ? "Projected ✓" : "Pending"}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowRisks(!showRisks)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Trajectory Risk Factors
            </CardTitle>
            {showRisks ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        {showRisks && (
          <CardContent className="space-y-2">
            {riskFactors.map((r, i) => (
              <div key={i} className="rounded-lg border border-border/40 p-3 space-y-1">
                <div className="flex items-start gap-2">
                  <Badge variant={r.severity === "high" ? "destructive" : "secondary"} className="text-[9px] shrink-0 mt-0.5">
                    {r.severity.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-foreground">{r.risk}</p>
                </div>
                <p className="text-[11px] text-muted-foreground ml-14">↳ Mitigation: {r.mitigation}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DecacornProjection;
