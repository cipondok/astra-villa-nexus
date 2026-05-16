/**
 * Advanced Investment Intelligence Dashboard
 * Shows portfolio performance, forecasts, risk exposure, and market trends
 */

import { memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Shield, BarChart3, Target, Brain,
  ArrowUpRight, ArrowDownRight, Sparkles, Activity,
  PieChart, AlertTriangle, Globe, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGeoPersonalization } from '@/hooks/useGeoPersonalization';
import { usePortfolioOptimizer } from '@/hooks/usePortfolioOptimizationEngine';
import { usePredictiveInsights } from '@/hooks/usePredictiveInsights';
import { useMLRecommendationEngine } from '@/hooks/useMLRecommendationEngine';

const InvestmentIntelligenceDashboard = memo(() => {
  const { formatPrice } = useGeoPersonalization();
  const { optimize, availableAssets } = usePortfolioOptimizer();
  const { predictions, hotspots, isLoading: loadingPredictions } = usePredictiveInsights();
  const { recommendations, isLoading: loadingRecs } = useMLRecommendationEngine({ limit: 5 });
  const [strategy, setStrategy] = useState<'aggressive' | 'balanced' | 'conservative' | 'income'>('balanced');

  const portfolio = useMemo(() => {
    if (!availableAssets.length) return null;
    return optimize({
      totalBudget: 10000000000, // 10B IDR default
      strategy,
      maxConcentration: 0.3,
    });
  }, [availableAssets, strategy, optimize]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 lg:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Investment Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights for smarter investment decisions
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
          <TabsTrigger value="predictions" className="text-xs">Predictions</TabsTrigger>
          <TabsTrigger value="hotspots" className="text-xs">Hotspots</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'AI Recommendations', value: recommendations.length.toString(), icon: Sparkles, color: 'text-primary' },
              { label: 'Market Hotspots', value: hotspots.length.toString(), icon: Zap, color: 'text-amber-400' },
              { label: 'Avg Expected ROI', value: recommendations.length > 0 ? `${(recommendations.reduce((s, r) => s + r.expectedROI, 0) / recommendations.length * 100).toFixed(1)}%` : '—', icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Portfolio Score', value: portfolio ? `${portfolio.sharpeRatio.toFixed(2)}` : '—', icon: Target, color: 'text-sky-400' },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} variants={itemVariants}>
                <Card className="bg-card/50 border-border/30">
                  <CardContent className="p-3">
                    <kpi.icon className={cn('w-4 h-4 mb-2', kpi.color)} />
                    <p className="text-lg font-semibold text-foreground">{kpi.value}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Top Recommendations */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  ML-Ranked Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingRecs ? (
                  <div className="space-y-2">
                    {[0,1,2].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
                  </div>
                ) : recommendations.slice(0, 5).map((rec) => (
                  <div
                    key={rec.propertyId}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{rec.title}</p>
                      <p className="text-[10px] text-muted-foreground">{rec.city} · {rec.propertyType}</p>
                      <p className="text-[10px] text-primary/70 italic mt-0.5">{rec.explanations[0]}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-semibold text-foreground">{formatPrice(rec.price)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {(rec.expectedROI * 100).toFixed(1)}% ROI
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {(rec.conversionProbability * 100).toFixed(0)}% match
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['conservative', 'balanced', 'aggressive', 'income'] as const).map(s => (
              <Button
                key={s}
                variant={strategy === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStrategy(s)}
                className="text-xs capitalize"
              >
                {s}
              </Button>
            ))}
          </div>

          {portfolio && (
            <>
              {/* Portfolio Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Expected Return', value: `${portfolio.totalExpectedReturn.toFixed(1)}%`, color: 'text-emerald-400' },
                  { label: 'Risk Score', value: `${portfolio.portfolioRiskScore.toFixed(0)}`, color: portfolio.portfolioRiskScore > 50 ? 'text-red-400' : 'text-emerald-400' },
                  { label: 'Sharpe Ratio', value: portfolio.sharpeRatio.toFixed(2), color: 'text-primary' },
                  { label: 'Diversification', value: `${portfolio.diversificationScore.toFixed(0)}%`, color: 'text-sky-400' },
                ].map(m => (
                  <Card key={m.label} className="bg-card/50 border-border/30">
                    <CardContent className="p-3">
                      <p className={cn('text-lg font-semibold', m.color)}>{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Allocations */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    Optimal Allocation ({strategy})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {portfolio.allocations.map((alloc, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-background/50 border border-border/20">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{alloc.allocationPct.toFixed(0)}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{alloc.city} — {alloc.propertyType}</p>
                        <p className="text-[10px] text-muted-foreground">{alloc.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-foreground">{formatPrice(alloc.allocatedAmount)}</p>
                        <p className="text-[10px] text-emerald-400">{(alloc.expectedReturn * 100).toFixed(1)}% return</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="bg-card/50 border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                12-Month Price Forecasts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingPredictions ? (
                <div className="space-y-2">
                  {[0,1,2].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : predictions.slice(0, 8).map((pred, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{pred.city}</p>
                    <p className="text-[10px] text-muted-foreground">{pred.propertyType}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pred.growthDrivers.slice(0, 2).map((d, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="flex items-center gap-1 justify-end">
                      {pred.trend === 'rising' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : pred.trend === 'declining' ? (
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                      ) : (
                        <Activity className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={cn(
                        'text-xs font-semibold',
                        pred.trend === 'rising' ? 'text-emerald-400' : pred.trend === 'declining' ? 'text-red-400' : 'text-muted-foreground'
                      )}>
                        {pred.predictedAppreciation > 0 ? '+' : ''}{pred.predictedAppreciation.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Yield: {pred.predictedYield.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground">Confidence: {pred.confidenceScore.toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {predictions.some(p => p.riskFactors.length > 0) && (
            <Card className="bg-card/50 border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Risk Factors to Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {[...new Set(predictions.flatMap(p => p.riskFactors))].slice(0, 5).map((risk, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/10">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-muted-foreground">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Hotspots Tab */}
        <TabsContent value="hotspots" className="space-y-4">
          <Card className="bg-card/50 border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Market Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hotspots.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {loadingPredictions ? 'Analyzing markets...' : 'Add market data to discover hotspots'}
                </p>
              ) : hotspots.map((spot, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">{spot.city}</p>
                      <span className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                        spot.investorActivity === 'Very High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'
                      )}>
                        {spot.investorActivity}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {spot.reasons.map((r, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-primary">{spot.score.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">Hotspot Score</p>
                    <p className="text-[10px] text-emerald-400">+{spot.predictedGrowth.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
});

InvestmentIntelligenceDashboard.displayName = 'InvestmentIntelligenceDashboard';

export default InvestmentIntelligenceDashboard;
