import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Shuffle, PieChart, BarChart3, Layers, ArrowUp, ArrowDown, Minus, Zap, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import {
  usePortfolioOptimizerScan,
  useOptimizerPerformance,
  useOptimizerDiversification,
  useOptimizerAllocations,
  useOptimizerRebalancing,
  useOptimizerScenarios,
} from '@/hooks/usePortfolioOptimizer';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '12px',
  },
};

const DirectionIcon = ({ dir }: { dir: string }) => {
  if (dir === 'increase') return <ArrowUp className="h-4 w-4 text-chart-1" />;
  if (dir === 'decrease') return <ArrowDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  const v = urgency === 'high' ? 'destructive' : urgency === 'medium' ? 'secondary' : 'outline';
  return <Badge variant={v as any}>{urgency}</Badge>;
};

const ActionBadge = ({ action }: { action: string }) => {
  const colors: Record<string, string> = {
    buy: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
    sell: 'bg-destructive/15 text-destructive border-destructive/30',
    hold: 'bg-muted text-muted-foreground border-border',
    rotate: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${colors[action] || colors.hold}`}>{action.toUpperCase()}</span>;
};

// ── Performance Tab ──
const PerformanceTab = () => {
  const { data, isLoading } = useOptimizerPerformance();
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-8 text-primary" />;
  if (!data?.length) return <p className="text-center text-muted-foreground mt-8">No data — run optimization first.</p>;

  // Aggregate by city
  const cityMap = new Map<string, { total_return: number; efficiency_score: number; count: number }>();
  data.forEach(r => {
    const e = cityMap.get(r.city) || { total_return: 0, efficiency_score: 0, count: 0 };
    e.total_return += Number(r.total_return); e.efficiency_score += Number(r.efficiency_score); e.count++;
    cityMap.set(r.city, e);
  });
  const chartData = Array.from(cityMap.entries()).map(([city, v]) => ({
    city, avgReturn: +(v.total_return / v.count).toFixed(2), avgEfficiency: +(v.efficiency_score / v.count).toFixed(1),
  })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">Efficiency Score by City</CardTitle></CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="city" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="avgEfficiency" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Efficiency" />
              <Bar dataKey="avgReturn" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Avg Return %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left p-2">City</th><th className="text-left p-2">Type</th>
            <th className="text-right p-2">Return %</th><th className="text-right p-2">Alpha</th>
            <th className="text-right p-2">Beta</th><th className="text-right p-2">Drawdown %</th>
            <th className="text-right p-2">Efficiency</th>
          </tr></thead>
          <tbody>{data.slice(0, 20).map(r => (
            <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
              <td className="p-2 text-foreground font-medium">{r.city}</td>
              <td className="p-2 text-foreground">{r.property_type}</td>
              <td className="p-2 text-right text-chart-1 font-semibold">{Number(r.total_return).toFixed(2)}%</td>
              <td className="p-2 text-right text-foreground">{Number(r.alpha).toFixed(2)}</td>
              <td className="p-2 text-right text-foreground">{Number(r.beta).toFixed(2)}</td>
              <td className="p-2 text-right text-destructive">{Number(r.max_drawdown).toFixed(1)}%</td>
              <td className="p-2 text-right">
                <Badge variant="outline" className="font-mono">{Number(r.efficiency_score).toFixed(1)}</Badge>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

// ── Diversification Tab ──
const DiversificationTab = () => {
  const { data, isLoading } = useOptimizerDiversification();
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-8 text-primary" />;
  if (!data?.length) return <p className="text-center text-muted-foreground mt-8">No data — run optimization first.</p>;

  const cityMap = new Map<string, { diversification_benefit: number; concentration_risk: number; count: number }>();
  data.forEach(r => {
    const e = cityMap.get(r.city) || { diversification_benefit: 0, concentration_risk: 0, count: 0 };
    e.diversification_benefit += Number(r.diversification_benefit); e.concentration_risk += Number(r.concentration_risk); e.count++;
    cityMap.set(r.city, e);
  });
  const radarData = Array.from(cityMap.entries()).map(([city, v]) => ({
    city, benefit: +(v.diversification_benefit / v.count).toFixed(1), risk: +(v.concentration_risk / v.count).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">Diversification vs Concentration Risk</CardTitle></CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="city" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <Radar name="Benefit" dataKey="benefit" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.25} />
              <Radar name="Risk" dataKey="risk" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.2} />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              <Tooltip {...tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.slice(0, 12).map(r => (
          <Card key={r.id} className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">{r.city}</span>
                <Badge variant="outline">{r.property_type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Correlation</span><p className="font-mono text-foreground">{Number(r.correlation_score).toFixed(2)}</p></div>
                <div><span className="text-muted-foreground">Weight</span><p className="font-mono text-chart-1">{Number(r.recommended_weight).toFixed(1)}%</p></div>
                <div><span className="text-muted-foreground">Exposure</span><p className="capitalize text-foreground">{r.sector_exposure}</p></div>
                <div><span className="text-muted-foreground">Conc. Risk</span>
                  <p className={`font-mono ${Number(r.concentration_risk) > 40 ? 'text-destructive' : 'text-chart-1'}`}>
                    {Number(r.concentration_risk).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── Allocations Tab ──
const AllocationsTab = () => {
  const { data, isLoading } = useOptimizerAllocations();
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-8 text-primary" />;
  if (!data?.length) return <p className="text-center text-muted-foreground mt-8">No data — run optimization first.</p>;

  const top = data.slice(0, 12);
  const chartData = top.map(r => ({
    label: `${r.city} ${r.property_type}`,
    current: Number(r.current_allocation_pct),
    optimal: Number(r.optimal_allocation_pct),
  }));

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">Current vs Optimal Allocation</CardTitle></CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
              <YAxis dataKey="label" type="category" width={140} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="current" fill="hsl(var(--chart-3))" name="Current %" radius={[0, 4, 4, 0]} />
              <Bar dataKey="optimal" fill="hsl(var(--chart-1))" name="Optimal %" radius={[0, 4, 4, 0]} />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left p-2">City</th><th className="text-left p-2">Type</th>
            <th className="text-right p-2">Current</th><th className="text-right p-2">Optimal</th>
            <th className="text-center p-2">Direction</th><th className="text-right p-2">Sharpe</th>
            <th className="text-right p-2">Priority</th>
          </tr></thead>
          <tbody>{data.slice(0, 20).map(r => (
            <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
              <td className="p-2 font-medium text-foreground">{r.city}</td>
              <td className="p-2 text-foreground">{r.property_type}</td>
              <td className="p-2 text-right text-muted-foreground">{Number(r.current_allocation_pct).toFixed(1)}%</td>
              <td className="p-2 text-right text-chart-1 font-semibold">{Number(r.optimal_allocation_pct).toFixed(1)}%</td>
              <td className="p-2 text-center"><DirectionIcon dir={r.adjustment_direction || 'hold'} /></td>
              <td className="p-2 text-right font-mono text-foreground">{Number(r.sharpe_ratio).toFixed(2)}</td>
              <td className="p-2 text-right"><Badge variant="outline">{r.rebalance_priority}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

// ── Rebalancing Tab ──
const RebalancingTab = () => {
  const { data, isLoading } = useOptimizerRebalancing();
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-8 text-primary" />;
  if (!data?.length) return <p className="text-center text-muted-foreground mt-8">No data — run optimization first.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.slice(0, 16).map(r => (
        <Card key={r.id} className="border-border bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-foreground">{r.city}</p>
                <p className="text-xs text-muted-foreground">{r.property_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <ActionBadge action={r.action || 'hold'} />
                <UrgencyBadge urgency={r.urgency || 'low'} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{r.reason}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Return Δ</span>
                <p className="font-mono text-chart-1">+{Number(r.expected_return_improvement).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Δ</span>
                <p className="font-mono text-chart-2">-{Number(r.risk_reduction_pct).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Capital</span>
                <p className="font-mono text-foreground">Rp {(Number(r.capital_required) / 1_000_000).toFixed(0)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ── Scenarios Tab ──
const ScenariosTab = () => {
  const { data, isLoading } = useOptimizerScenarios();
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-8 text-primary" />;
  if (!data?.length) return <p className="text-center text-muted-foreground mt-8">No data — run optimization first.</p>;

  const scenarioNames = ['aggressive', 'balanced', 'conservative', 'income'];
  const summaries = scenarioNames.map(name => {
    const items = data.filter(d => d.scenario_name === name);
    const avgReturn = items.reduce((s, i) => s + Number(i.projected_return), 0) / (items.length || 1);
    const avgRisk = items.reduce((s, i) => s + Number(i.projected_risk), 0) / (items.length || 1);
    const avgSharpe = items.reduce((s, i) => s + Number(i.sharpe_ratio), 0) / (items.length || 1);
    return { name, avgReturn: +avgReturn.toFixed(2), avgRisk: +avgRisk.toFixed(2), avgSharpe: +avgSharpe.toFixed(2), count: items.length };
  });

  const icons: Record<string, React.ReactNode> = {
    aggressive: <Zap className="h-5 w-5 text-destructive" />,
    balanced: <BarChart3 className="h-5 w-5 text-chart-1" />,
    conservative: <Layers className="h-5 w-5 text-chart-2" />,
    income: <TrendingUp className="h-5 w-5 text-chart-4" />,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaries.map(s => (
          <Card key={s.name} className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                {icons[s.name]}
                <h3 className="font-semibold capitalize text-foreground">{s.name}</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Projected Return</span><span className="font-mono text-chart-1">{s.avgReturn}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Projected Risk</span><span className="font-mono text-destructive">{s.avgRisk}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sharpe Ratio</span><span className="font-mono text-foreground">{s.avgSharpe}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">Scenario Comparison</CardTitle></CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="avgReturn" fill="hsl(var(--chart-1))" name="Return %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgRisk" fill="hsl(var(--chart-4))" name="Risk %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgSharpe" fill="hsl(var(--chart-2))" name="Sharpe" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Main Page ──
const PortfolioOptimizerPage = () => {
  const [tab, setTab] = useState('performance');
  const scan = usePortfolioOptimizerScan();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Portfolio Optimizer</h1>
            <p className="text-muted-foreground text-sm mt-1">Intelligent rebalancing &amp; allocation optimization engine</p>
          </div>
          <Button onClick={() => scan.mutate('full_optimize')} disabled={scan.isPending} size="lg" className="gap-2">
            {scan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Run Full Optimization
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50 border border-border rounded-lg p-1 w-full flex flex-wrap gap-1">
            <TabsTrigger value="performance" className="text-xs sm:text-sm gap-1.5"><TrendingUp className="h-4 w-4" />Performance</TabsTrigger>
            <TabsTrigger value="diversification" className="text-xs sm:text-sm gap-1.5"><PieChart className="h-4 w-4" />Diversification</TabsTrigger>
            <TabsTrigger value="allocations" className="text-xs sm:text-sm gap-1.5"><BarChart3 className="h-4 w-4" />Allocations</TabsTrigger>
            <TabsTrigger value="rebalancing" className="text-xs sm:text-sm gap-1.5"><Shuffle className="h-4 w-4" />Rebalancing</TabsTrigger>
            <TabsTrigger value="scenarios" className="text-xs sm:text-sm gap-1.5"><Layers className="h-4 w-4" />Scenarios</TabsTrigger>
          </TabsList>
          <TabsContent value="performance"><PerformanceTab /></TabsContent>
          <TabsContent value="diversification"><DiversificationTab /></TabsContent>
          <TabsContent value="allocations"><AllocationsTab /></TabsContent>
          <TabsContent value="rebalancing"><RebalancingTab /></TabsContent>
          <TabsContent value="scenarios"><ScenariosTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioOptimizerPage;
