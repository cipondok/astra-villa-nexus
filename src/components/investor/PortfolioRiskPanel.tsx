import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PortfolioBuilderResult } from '@/hooks/usePortfolioBuilder';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import { Shield, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface Props {
  result: PortfolioBuilderResult;
}

function getRiskColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function getRiskBadge(score: number): { label: string; className: string } {
  if (score >= 70) return { label: 'Low Risk', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (score >= 40) return { label: 'Medium', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  return { label: 'High Risk', className: 'bg-red-500/15 text-red-400 border-red-500/30' };
}

export default function PortfolioRiskPanel({ result }: Props) {
  const metrics = useMemo(() => {
    const portfolio = result.portfolio;
    if (!portfolio.length) return null;

    // Diversification
    const diversification = result.diversification.score;

    // Geographic exposure: concentration in top city
    const cityCounts: Record<string, number> = {};
    portfolio.forEach(p => { cityCounts[p.city] = (cityCounts[p.city] || 0) + p.allocation_percent; });
    const maxCityPct = Math.max(...Object.values(cityCounts));
    const geoSpread = Math.max(0, Math.min(100, 100 - maxCityPct));

    // Income stability: inverse of yield variance
    const yields = portfolio.map(p => p.estimated_yield);
    const avgYield = yields.reduce((s, v) => s + v, 0) / yields.length;
    const yieldVariance = yields.reduce((s, v) => s + Math.pow(v - avgYield, 2), 0) / yields.length;
    const incomeStability = Math.max(0, Math.min(100, Math.round(100 - yieldVariance * 10)));

    // Growth potential: avg composite score
    const growthPotential = Math.round(portfolio.reduce((s, p) => s + p.composite_score, 0) / portfolio.length);

    // Liquidity: based on investment scores
    const liquidity = Math.round(portfolio.reduce((s, p) => s + p.investment_score, 0) / portfolio.length);

    // Overall risk score
    const overall = Math.round((diversification * 0.25 + geoSpread * 0.2 + incomeStability * 0.25 + growthPotential * 0.15 + liquidity * 0.15));

    // Hedging suggestions
    const suggestions: string[] = [];
    const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCity && topCity[1] > 60) {
      suggestions.push(`Reduce ${topCity[0]} concentration (${topCity[1].toFixed(0)}%). Add properties in other cities.`);
    }
    if (incomeStability < 50) {
      suggestions.push('High yield variance detected. Add stable rental assets (apartments/kost).');
    }
    if (portfolio.length < 3) {
      suggestions.push('Portfolio has few assets. Consider adding 2-3 more for better diversification.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Portfolio is well-balanced across key risk dimensions.');
    }

    return {
      diversification,
      geoSpread,
      incomeStability,
      growthPotential,
      liquidity,
      overall,
      maxCity: topCity ? { name: topCity[0], pct: topCity[1] } : null,
      suggestions,
      radarData: [
        { metric: 'Diversification', value: diversification },
        { metric: 'Geo Spread', value: geoSpread },
        { metric: 'Income Stability', value: incomeStability },
        { metric: 'Growth', value: growthPotential },
        { metric: 'Liquidity', value: liquidity },
      ],
    };
  }, [result]);

  if (!metrics) return null;

  const riskBadge = getRiskBadge(metrics.overall);

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Portfolio Risk Analysis
          </span>
          <Badge className={`${riskBadge.className} border text-xs`}>
            {riskBadge.label} — {metrics.overall}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Radar Chart */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={metrics.radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Risk" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Metric Bars */}
        <div className="space-y-2.5">
          {[
            { label: 'Diversification', value: metrics.diversification },
            { label: 'Geographic Spread', value: metrics.geoSpread },
            { label: 'Income Stability', value: metrics.incomeStability },
            { label: 'Growth Potential', value: metrics.growthPotential },
            { label: 'Liquidity', value: metrics.liquidity },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className={`font-semibold ${getRiskColor(m.value)}`}>{m.value}/100</span>
              </div>
              <Progress value={m.value} className="h-1.5" />
            </div>
          ))}
        </div>

        {/* Hedging Suggestions */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary" /> Risk Mitigation
          </p>
          {metrics.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
              {s.includes('well-balanced') ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
              )}
              <span>{s}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
