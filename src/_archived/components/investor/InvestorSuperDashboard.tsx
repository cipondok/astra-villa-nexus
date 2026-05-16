import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, DollarSign, Zap, MapPin, ArrowUpRight,
  BarChart3, Home, Target, Minus,
} from 'lucide-react';

import { PortfolioData } from '@/hooks/usePortfolioManager';
import {
  computePortfolioValueTrend,
  computeRentalYieldSignal,
  computeCapitalGrowthMomentum,
  computeSellHoldAdvisory,
  computeNextOpportunityHint,
  type ValueTrend,
  type YieldSignal,
  type GrowthMomentum,
} from '@/hooks/useInvestorSuperInsights';

const formatShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

const fadeCard = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

// ── Trend color mapping ──
const trendStyles: Record<ValueTrend, { color: string; bg: string; border: string }> = {
  ACCELERATING: { color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/30' },
  GROWING: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  FLAT: { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30' },
  DECLINING: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
};

const yieldStyles: Record<YieldSignal, { color: string; bg: string; border: string }> = {
  STRONG_YIELD: { color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/30' },
  STABLE_YIELD: { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30' },
  WEAK_YIELD: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
};

const momentumStyles: Record<GrowthMomentum, { color: string; bg: string; border: string }> = {
  SURGING: { color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/30' },
  STRONG: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  MODERATE: { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30' },
  STALLING: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
};

interface InvestorSuperDashboardProps {
  portfolio: PortfolioData;
  hotspots?: Array<{ city: string; score?: number; demand_heat_score?: number; growth_rate?: number }>;
  onPropertyClick?: (id: string) => void;
}

const InvestorSuperDashboard: React.FC<InvestorSuperDashboardProps> = ({
  portfolio,
  hotspots = [],
  onPropertyClick,
}) => {
  const valueTrend = computePortfolioValueTrend(portfolio);
  const yieldSignal = computeRentalYieldSignal(portfolio.properties);
  const growthMomentum = computeCapitalGrowthMomentum(portfolio.properties);
  const sellHoldAdvisory = computeSellHoldAdvisory(portfolio.properties);
  const nextOpportunity = computeNextOpportunityHint(portfolio, hotspots);

  const ts = trendStyles[valueTrend.trend];
  const ys = yieldStyles[yieldSignal.signal];
  const ms = momentumStyles[growthMomentum.momentum];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Super Insights</h2>
          <p className="text-[10px] text-muted-foreground">AI-driven portfolio intelligence signals</p>
        </div>
      </div>

      {/* ── Row 1: Value Trend + Rental Yield + Growth Momentum ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Portfolio Value Trend */}
        <motion.div {...fadeCard(0)}>
          <Card className={cn("h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all", ts.border)}>
            <div className={cn("h-1 rounded-t-xl", ts.bg)} />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  <TrendingUp className="h-3.5 w-3.5" /> Value Trend
                </span>
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", ts.color, ts.bg, ts.border)}>
                  {valueTrend.trend_emoji} {valueTrend.trend}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              <div>
                <p className="text-xl font-bold text-foreground">Rp {formatShort(valueTrend.current_value)}</p>
                <p className="text-[10px] text-muted-foreground">Current portfolio value</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ArrowUpRight className={cn("h-3 w-3", ts.color)} />
                <span className={cn("font-semibold", ts.color)}>
                  {valueTrend.growth_percent > 0 ? '+' : ''}{valueTrend.growth_percent}%
                </span>
                <span className="text-muted-foreground">5Y projected</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Annualized</span>
                <span className="font-medium text-foreground">{valueTrend.annualized_rate}%/yr</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Projected 5Y</span>
                <span className="font-medium text-foreground">Rp {formatShort(valueTrend.projected_value_5y)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Average Rental Yield Signal */}
        <motion.div {...fadeCard(0.06)}>
          <Card className={cn("h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all", ys.border)}>
            <div className={cn("h-1 rounded-t-xl", ys.bg)} />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  <Home className="h-3.5 w-3.5" /> Rental Yield
                </span>
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", ys.color, ys.bg, ys.border)}>
                  {yieldSignal.signal_emoji} {yieldSignal.signal_label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              <div>
                <p className="text-xl font-bold text-foreground">{yieldSignal.avg_yield}%</p>
                <p className="text-[10px] text-muted-foreground">Average rental yield</p>
              </div>
              <Progress value={Math.min(100, yieldSignal.avg_yield * 10)} className="h-1.5" />
              {yieldSignal.top_yielder && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground truncate mr-2">Top: {yieldSignal.top_yielder.title}</span>
                  <span className={cn("font-semibold shrink-0", ys.color)}>{yieldSignal.top_yielder.yield_pct}%</span>
                </div>
              )}
              {yieldSignal.weakest_yielder && yieldSignal.weakest_yielder.title !== yieldSignal.top_yielder?.title && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground truncate mr-2">Low: {yieldSignal.weakest_yielder.title}</span>
                  <span className="font-semibold text-muted-foreground">{yieldSignal.weakest_yielder.yield_pct}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Capital Growth Momentum */}
        <motion.div {...fadeCard(0.12)}>
          <Card className={cn("h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all", ms.border)}>
            <div className={cn("h-1 rounded-t-xl", ms.bg)} />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  <BarChart3 className="h-3.5 w-3.5" /> Growth Momentum
                </span>
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", ms.color, ms.bg, ms.border)}>
                  {growthMomentum.momentum_emoji} {growthMomentum.momentum_label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              <div>
                <p className="text-xl font-bold text-foreground">{growthMomentum.composite_score}</p>
                <p className="text-[10px] text-muted-foreground">Momentum composite score</p>
              </div>
              <Progress value={growthMomentum.composite_score} className="h-1.5" />
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Avg Growth Rate</span>
                <span className="font-medium text-foreground">{growthMomentum.avg_growth_rate}%/yr</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Avg Investment Score</span>
                <span className="font-medium text-foreground">{growthMomentum.avg_investment_score}/100</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Row 2: Sell/Hold Advisory + Next Opportunity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 4. Smart Sell/Hold Advisory — spans 3 cols */}
        <motion.div {...fadeCard(0.18)} className="lg:col-span-3">
          <Card className="h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Target className="h-3.5 w-3.5" /> Sell / Hold Advisory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              {sellHoldAdvisory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No properties to analyze</p>
              ) : (
                <div className="space-y-1.5">
                  {sellHoldAdvisory.slice(0, 5).map((adv) => {
                    const exitColors: Record<string, string> = {
                      sell_now: 'text-destructive bg-destructive/10 border-destructive/30',
                      take_profit: 'text-chart-4 bg-chart-4/10 border-chart-4/30',
                      hold: 'text-primary bg-primary/10 border-primary/30',
                      long_hold: 'text-chart-1 bg-chart-1/10 border-chart-1/30',
                    };
                    const cls = exitColors[adv.exit_timing.variant] || exitColors.hold;

                    return (
                      <div
                        key={adv.property_id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/15 border border-border/20 hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => onPropertyClick?.(adv.property_id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{adv.property_title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">ROI 5Y: {adv.roi_5y?.toFixed(1)}%</span>
                            <span className="text-[10px] text-muted-foreground">Score: {adv.exit_timing.composite_score}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] h-5 px-2 shrink-0", cls)}>
                          {adv.exit_timing.emoji} {adv.exit_timing.signal}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. Next Investment Opportunity Hint — spans 2 cols */}
        <motion.div {...fadeCard(0.24)} className="lg:col-span-2">
          <Card className="h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all border-primary/20">
            <div className="h-1 rounded-t-xl bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-4/20" />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <MapPin className="h-3.5 w-3.5" /> Next Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{nextOpportunity.suggested_zone}</p>
                  <p className="text-[10px] text-muted-foreground">Recommended expansion zone</p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{nextOpportunity.reason}</p>

              {nextOpportunity.gap_cities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {nextOpportunity.gap_cities.map(city => (
                    <Badge key={city} variant="outline" className="text-[9px] h-5 px-2 text-primary bg-primary/5 border-primary/20">
                      {city}
                    </Badge>
                  ))}
                </div>
              )}

              {nextOpportunity.portfolio_cities.length > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  <span className="font-medium">Your cities:</span>{' '}
                  {nextOpportunity.portfolio_cities.join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestorSuperDashboard;
