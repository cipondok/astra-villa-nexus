import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PortfolioBuilderResult, PortfolioItem } from '@/hooks/usePortfolioBuilder';
import {
  TrendingUp, TrendingDown, Minus, BarChart3, Shield, Zap,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface ScenarioComparisonProps {
  result: PortfolioBuilderResult;
}

interface ScenarioProjection {
  year: number;
  bull: number;
  base: number;
  bear: number;
}

const SCENARIO_CONFIG = {
  bull: { label: 'Bull Case', multiplier: 1.5, color: 'hsl(140, 65%, 45%)', icon: TrendingUp, desc: 'Strong market growth' },
  base: { label: 'Base Case', multiplier: 1.0, color: 'hsl(45, 80%, 50%)', icon: Minus, desc: 'Expected returns' },
  bear: { label: 'Bear Case', multiplier: 0.5, color: 'hsl(0, 70%, 55%)', icon: TrendingDown, desc: 'Market downturn' },
};

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ScenarioComparison({ result }: ScenarioComparisonProps) {
  const [activeScenario, setActiveScenario] = useState<'all' | 'bull' | 'base' | 'bear'>('all');
  const horizon = result.investment_horizon;

  const projections = useMemo<ScenarioProjection[]>(() => {
    const baseGrowthRate = result.projected_roi / 100 / horizon;
    const totalAllocated = result.total_allocated;

    return Array.from({ length: horizon + 1 }, (_, year) => {
      const bullGrowth = 1 + (baseGrowthRate * SCENARIO_CONFIG.bull.multiplier);
      const baseGrowth = 1 + (baseGrowthRate * SCENARIO_CONFIG.base.multiplier);
      const bearGrowth = 1 + (baseGrowthRate * SCENARIO_CONFIG.bear.multiplier);

      return {
        year,
        bull: Math.round(totalAllocated * Math.pow(bullGrowth, year)),
        base: Math.round(totalAllocated * Math.pow(baseGrowth, year)),
        bear: Math.round(totalAllocated * Math.pow(bearGrowth, year)),
      };
    });
  }, [result, horizon]);

  const finalYear = projections[projections.length - 1];

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" /> Scenario Comparison
        </CardTitle>
        <CardDescription className="text-xs">
          {horizon}-year projections: Bull, Base, and Bear market scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scenario Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeScenario === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveScenario('all')}
            className="text-xs"
          >
            All
          </Button>
          {(Object.entries(SCENARIO_CONFIG) as [string, typeof SCENARIO_CONFIG.bull][]).map(([key, config]) => (
            <Button
              key={key}
              size="sm"
              variant={activeScenario === key ? 'default' : 'outline'}
              onClick={() => setActiveScenario(key as any)}
              className="text-xs"
            >
              <config.icon className="h-3 w-3 mr-1" />
              {config.label}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `${(v / 1e9).toFixed(1)}B`}
                width={55}
              />
              <Tooltip
                formatter={(value: number) => formatIDR(value)}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {(activeScenario === 'all' || activeScenario === 'bull') && (
                <Line type="monotone" dataKey="bull" name="Bull" stroke={SCENARIO_CONFIG.bull.color} strokeWidth={2} dot={false} />
              )}
              {(activeScenario === 'all' || activeScenario === 'base') && (
                <Line type="monotone" dataKey="base" name="Base" stroke={SCENARIO_CONFIG.base.color} strokeWidth={2} dot={false} />
              )}
              {(activeScenario === 'all' || activeScenario === 'bear') && (
                <Line type="monotone" dataKey="bear" name="Bear" stroke={SCENARIO_CONFIG.bear.color} strokeWidth={2} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Separator />

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(SCENARIO_CONFIG) as [string, typeof SCENARIO_CONFIG.bull][]).map(([key, config]) => {
            const finalValue = finalYear[key as keyof ScenarioProjection] as number;
            const totalReturn = ((finalValue - result.total_allocated) / result.total_allocated * 100).toFixed(1);
            const annualized = (Math.pow(finalValue / result.total_allocated, 1 / horizon) - 1) * 100;

            return (
              <div key={key} className="bg-muted/50 rounded-lg p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <config.icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                  <span className="text-xs font-semibold text-foreground">{config.label}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{formatIDR(finalValue)}</p>
                <p className="text-[10px] text-muted-foreground">
                  ROI: <span style={{ color: config.color }}>{totalReturn}%</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {annualized.toFixed(1)}% p.a.
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
