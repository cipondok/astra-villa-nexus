import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProvinceData } from './ProvinceRow';

interface SeoStateSummaryCardsProps {
  overview: ProvinceData[];
}

const SeoStateSummaryCards = React.memo(({ overview }: SeoStateSummaryCardsProps) => {
  const withData = overview.filter(s => s.analyzedCount > 0);
  const goodCount = overview.filter(s => s.status === 'good').length;
  const needsWorkCount = overview.filter(s => s.status === 'needs-work').length;
  const poorCount = overview.filter(s => s.status === 'poor').length;
  const unanalyzedCount = overview.filter(s => s.status === 'unanalyzed' || s.status === 'no-data').length;
  const globalAvg = withData.length > 0 ? Math.round(withData.reduce((s, x) => s + x.avgSeoScore, 0) / withData.length) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-3 text-center">
          <p className={cn("text-2xl font-bold", globalAvg >= 70 ? "text-chart-1" : globalAvg >= 40 ? "text-chart-4" : "text-destructive")}>{globalAvg}</p>
          <p className="text-[9px] text-muted-foreground">Avg Score</p>
        </CardContent>
      </Card>
      <Card className="bg-chart-1/5 border-chart-1/20">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-chart-1">{goodCount}</p>
          <p className="text-[9px] text-muted-foreground">✅ Good States</p>
        </CardContent>
      </Card>
      <Card className="bg-chart-4/5 border-chart-4/20">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-chart-4">{needsWorkCount}</p>
          <p className="text-[9px] text-muted-foreground">⚠️ Needs Work</p>
        </CardContent>
      </Card>
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{poorCount}</p>
          <p className="text-[9px] text-muted-foreground">❌ Poor</p>
        </CardContent>
      </Card>
      <Card className="bg-muted/30 border-border/40">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{unanalyzedCount}</p>
          <p className="text-[9px] text-muted-foreground">🔍 Unanalyzed</p>
        </CardContent>
      </Card>
    </div>
  );
});

SeoStateSummaryCards.displayName = 'SeoStateSummaryCards';

export default SeoStateSummaryCards;
