import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProvinceData } from './ProvinceRow';

interface SeoStateSummaryCardsProps {
  overview: ProvinceData[];
}

const SeoStateSummaryCards = React.memo(({ overview }: SeoStateSummaryCardsProps) => {
  const withData = overview.filter(s => s.analyzedCount > 0);
  const totalProperties = overview.reduce((s, x) => s + x.totalProperties, 0);
  const totalAnalyzed = overview.reduce((s, x) => s + x.analyzedCount, 0);
  const goodCount = overview.filter(s => s.status === 'good').length;
  const needsWorkCount = overview.filter(s => s.status === 'needs-work').length;
  const poorCount = overview.filter(s => s.status === 'poor').length;
  const unanalyzedCount = overview.filter(s => s.status === 'unanalyzed' || s.status === 'no-data').length;
  const globalAvg = withData.length > 0 ? Math.round(withData.reduce((s, x) => s + x.avgSeoScore, 0) / withData.length) : 0;
  const coveragePct = totalProperties > 0 ? Math.round((totalAnalyzed / totalProperties) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className={cn("text-2xl font-bold tabular-nums", globalAvg >= 70 ? "text-chart-1" : globalAvg >= 40 ? "text-chart-4" : "text-destructive")}>{globalAvg}</p>
          <p className="text-[8px] text-muted-foreground">Avg Score</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className="text-2xl font-bold text-primary tabular-nums">{totalProperties}</p>
          <p className="text-[8px] text-muted-foreground">Total Properties</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className="text-2xl font-bold text-chart-2 tabular-nums">{totalAnalyzed}</p>
          <p className="text-[8px] text-muted-foreground">Analyzed</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className="text-2xl font-bold text-chart-2 tabular-nums">{coveragePct}%</p>
          <p className="text-[8px] text-muted-foreground">Coverage</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className="text-2xl font-bold text-chart-1 tabular-nums">{goodCount}</p>
          <p className="text-[8px] text-muted-foreground">✅ Good States</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className="text-2xl font-bold text-chart-4 tabular-nums">{needsWorkCount}</p>
          <p className="text-[8px] text-muted-foreground">⚠️ Needs Work</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className="text-2xl font-bold text-destructive tabular-nums">{poorCount}</p>
          <p className="text-[8px] text-muted-foreground">❌ Poor</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-2.5 text-center">
          <p className="text-2xl font-bold text-muted-foreground tabular-nums">{unanalyzedCount}</p>
          <p className="text-[8px] text-muted-foreground">🔍 Unanalyzed</p>
        </CardContent>
      </Card>
    </div>
  );
});

SeoStateSummaryCards.displayName = 'SeoStateSummaryCards';

export default SeoStateSummaryCards;
