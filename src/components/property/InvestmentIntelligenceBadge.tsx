import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Flame, Shield, BarChart3, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface InvestmentIntelligenceBadgeProps {
  investmentScore?: number;
  rentalYield?: number;
  priceGrowth?: number;
  liquidityScore?: number;
  demandScore?: number;
  compact?: boolean;
}

export default function InvestmentIntelligenceBadge({
  investmentScore = 0,
  rentalYield = 0,
  priceGrowth = 0,
  liquidityScore = 0,
  demandScore = 0,
  compact = false,
}: InvestmentIntelligenceBadgeProps) {
  if (!investmentScore) return null;

  const tier =
    investmentScore >= 85 ? { label: 'Elite', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' } :
    investmentScore >= 65 ? { label: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' } :
    investmentScore >= 40 ? { label: 'Moderate', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' } :
    { label: 'Emerging', color: 'text-muted-foreground', bg: 'bg-muted/20 border-border/30' };

  if (compact) {
    return (
      <Badge variant="outline" className={`${tier.bg} ${tier.color} gap-1 text-xs`}>
        <Zap className="h-3 w-3" /> {investmentScore}/100 {tier.label}
      </Badge>
    );
  }

  return (
    <Card className={`border ${tier.bg}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className={`h-4 w-4 ${tier.color}`} />
            <span className="text-xs font-semibold text-foreground">AI Investment Score</span>
          </div>
          <Badge variant="outline" className={`${tier.bg} ${tier.color} font-mono`}>
            {investmentScore}/100
          </Badge>
        </div>

        <Progress value={investmentScore} className="h-2" />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-chart-2" />
            <div>
              <p className="text-[10px] text-muted-foreground">Rental Yield</p>
              <p className="text-xs font-semibold text-foreground">{rentalYield.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-chart-3" />
            <div>
              <p className="text-[10px] text-muted-foreground">Price Growth</p>
              <p className="text-xs font-semibold text-foreground">{priceGrowth.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">Demand</p>
              <p className="text-xs font-semibold text-foreground">{demandScore}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-chart-4" />
            <div>
              <p className="text-[10px] text-muted-foreground">Liquidity</p>
              <p className="text-xs font-semibold text-foreground">{liquidityScore}/100</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">AI Market Intelligence Powered Investment Insight</p>
      </CardContent>
    </Card>
  );
}
