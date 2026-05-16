import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Globe } from 'lucide-react';
import type { ProvinceData } from './ProvinceRow';

interface SeoDashboardChartsProps {
  stats: {
    excellent: number;
    good: number;
    needsImprovement: number;
    poor: number;
    analyzedCount: number;
    totalProperties: number;
  } | undefined;
  stateSeoOverview: ProvinceData[];
}

const SCORE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-4))',
  'hsl(var(--destructive))',
];

const tooltipStyle = {
  fontSize: 11,
  background: 'hsl(var(--popover))',
  color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  boxShadow: '0 4px 12px hsl(var(--foreground) / 0.08)',
};

const SeoDashboardCharts = React.memo(({ stats, stateSeoOverview }: SeoDashboardChartsProps) => {
  const scoreDistribution = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Excellent (80+)', value: stats.excellent },
      { name: 'Good (60-79)', value: stats.good },
      { name: 'Needs Work (40-59)', value: stats.needsImprovement },
      { name: 'Poor (<40)', value: stats.poor },
    ].filter(d => d.value > 0);
  }, [stats]);

  const provinceRankings = useMemo(() => {
    return stateSeoOverview
      .filter(s => s.analyzedCount > 0)
      .sort((a, b) => b.avgSeoScore - a.avgSeoScore)
      .slice(0, 15)
      .map(s => ({
        name: s.state.length > 12 ? s.state.slice(0, 12) + '…' : s.state,
        score: s.avgSeoScore,
        properties: s.totalProperties,
        fill: s.avgSeoScore >= 70
          ? 'hsl(var(--chart-1))'
          : s.avgSeoScore >= 40
            ? 'hsl(var(--chart-4))'
            : 'hsl(var(--destructive))',
      }));
  }, [stateSeoOverview]);

  if (!stats || stats.analyzedCount === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* SEO Score Distribution */}
      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs flex items-center gap-1.5 text-foreground">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            SEO Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {scoreDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  label={({ value }) => `${value}`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                >
                  {scoreDistribution.map((_, i) => (
                    <Cell key={i} fill={SCORE_COLORS[i % SCORE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-8">No data</p>
          )}
        </CardContent>
      </Card>

      {/* Province SEO Rankings */}
      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs flex items-center gap-1.5 text-foreground">
            <Globe className="h-3.5 w-3.5 text-chart-2" />
            Top Province SEO Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {provinceRankings.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={provinceRankings} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                  width={80}
                  stroke="hsl(var(--border))"
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  formatter={(value: number) => [`${value}/100`, 'SEO Score']}
                />
                <Bar dataKey="score" name="SEO Score" radius={[0, 4, 4, 0]}>
                  {provinceRankings.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-8">No analyzed provinces yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

SeoDashboardCharts.displayName = 'SeoDashboardCharts';

export default SeoDashboardCharts;
