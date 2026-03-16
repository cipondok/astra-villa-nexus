import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AdminPageHeader } from './shared/AdminPageHeader';
import {
  Brain, Loader2, Zap, RefreshCw, TrendingUp, TrendingDown,
  Target, Shield, DollarSign, BarChart3, Activity, Eye,
  Minus, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  usePricePredictionStats, useComputePricePredictions,
  VALUATION_CONFIG, TREND_CONFIG, HINT_CONFIG,
} from '@/hooks/usePricePredictionEngine';
import { cn } from '@/lib/utils';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, delay },
});

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <Card className="bg-card border-border/40">
      <CardContent className="p-3 text-center">
        <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
        <p className={cn('text-xl font-bold font-mono', color)}>{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {sub && <p className="text-[9px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function DistributionBar({ items }: { items: { label: string; count: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
        {items.map(item => item.count > 0 && (
          <div
            key={item.label}
            className={cn('transition-all', item.color)}
            style={{ width: `${(item.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {items.map(item => (
          <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className={cn('w-2 h-2 rounded-full', item.color)} />
            {item.label}: {item.count}
          </span>
        ))}
      </div>
    </div>
  );
}

const PricePredictionEngine = () => {
  const { data: stats, isLoading, refetch } = usePricePredictionStats();
  const computePredictions = useComputePricePredictions();
  const [batchSize, setBatchSize] = useState(200);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Price Prediction Engine"
        description="Autonomous AI valuation, forecast, and undervaluation detection across all active listings"
        icon={Brain}
        badge={stats ? { text: `${stats.coverage_pct}% Coverage`, variant: 'default' } : undefined}
      />

      {/* Action Bar */}
      <Card className="bg-card border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => computePredictions.mutate(batchSize)}
              disabled={computePredictions.isPending}
              className="gap-2"
              size="sm"
            >
              {computePredictions.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Compute Predictions ({batchSize})
            </Button>

            {[100, 200, 500].map(n => (
              <Button
                key={n}
                variant={batchSize === n ? 'secondary' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => setBatchSize(n)}
              >
                {n}
              </Button>
            ))}

            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 ml-auto">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>

            {computePredictions.data && (
              <span className="text-xs text-chart-1">
                ✓ {computePredictions.data.properties_predicted} predicted in {Math.round(computePredictions.data.duration_ms)}ms
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stats ? (
        <>
          {/* Coverage & Confidence Strip */}
          <motion.div {...fadeIn(0)}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <StatCard label="Predicted" value={stats.total_predicted.toLocaleString()} icon={Brain} color="text-primary" sub={`of ${stats.total_active.toLocaleString()}`} />
              <StatCard label="Coverage" value={`${stats.coverage_pct}%`} icon={Target} color={stats.coverage_pct >= 80 ? 'text-chart-1' : stats.coverage_pct >= 50 ? 'text-chart-4' : 'text-destructive'} />
              <StatCard label="Avg Confidence" value={`${stats.avg_confidence || 0}%`} icon={Shield} color={stats.avg_confidence >= 60 ? 'text-chart-1' : 'text-chart-4'} />
              <StatCard label="Avg Gap" value={`${stats.avg_gap_pct || 0}%`} icon={Activity} color={stats.avg_gap_pct <= -5 ? 'text-chart-1' : stats.avg_gap_pct <= 10 ? 'text-foreground' : 'text-chart-4'} />
              <StatCard label="Flip Opps" value={stats.flip_opportunities} icon={Zap} color="text-chart-1" />
              <StatCard label="Risk Zones" value={stats.risk_zones} icon={Shield} color="text-destructive" />
            </div>
          </motion.div>

          {/* Valuation Distribution */}
          <motion.div {...fadeIn(0.05)}>
            <Card className="bg-card border-border/40">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <DollarSign className="h-4 w-4 text-primary" /> Valuation Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <DistributionBar items={[
                  { label: 'Deeply Undervalued', count: stats.deeply_undervalued, color: 'bg-chart-1' },
                  { label: 'Slightly Undervalued', count: stats.slightly_undervalued, color: 'bg-primary' },
                  { label: 'Fairly Priced', count: stats.fairly_priced, color: 'bg-chart-2' },
                  { label: 'Overpriced', count: stats.overpriced, color: 'bg-chart-4' },
                  { label: 'Bubble Risk', count: stats.bubble_risk, color: 'bg-destructive' },
                ]} />

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Deeply Undervalued', count: stats.deeply_undervalued, config: VALUATION_CONFIG['Deeply Undervalued'] },
                    { label: 'Slightly Undervalued', count: stats.slightly_undervalued, config: VALUATION_CONFIG['Slightly Undervalued'] },
                    { label: 'Fairly Priced', count: stats.fairly_priced, config: VALUATION_CONFIG['Fairly Priced'] },
                    { label: 'Overpriced', count: stats.overpriced, config: VALUATION_CONFIG['Overpriced'] },
                    { label: 'Bubble Risk', count: stats.bubble_risk, config: VALUATION_CONFIG['High Bubble Risk'] },
                  ].map(item => (
                    <div key={item.label} className={cn('text-center p-3 rounded-lg', item.config.bg)}>
                      <p className="text-lg mb-0.5">{item.config.icon}</p>
                      <p className={cn('text-xl font-bold font-mono', item.config.color)}>{item.count}</p>
                      <p className="text-[9px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trend Signal Distribution */}
          <motion.div {...fadeIn(0.1)}>
            <Card className="bg-card border-border/40">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" /> Price Trend Forecast Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <DistributionBar items={[
                  { label: 'Strong Growth', count: stats.strong_growth, color: 'bg-chart-1' },
                  { label: 'Moderate Growth', count: stats.moderate_growth, color: 'bg-primary' },
                  { label: 'Stable', count: stats.stable, color: 'bg-chart-4' },
                  { label: 'Decline Risk', count: stats.decline_risk, color: 'bg-destructive' },
                ]} />

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Strong Growth', count: stats.strong_growth, icon: '🚀', color: 'text-chart-1', bg: 'bg-chart-1/10' },
                    { label: 'Moderate Growth', count: stats.moderate_growth, icon: '📈', color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Stable', count: stats.stable, icon: '➡️', color: 'text-chart-4', bg: 'bg-chart-4/10' },
                    { label: 'Decline Risk', count: stats.decline_risk, icon: '📉', color: 'text-destructive', bg: 'bg-destructive/10' },
                  ].map(item => (
                    <div key={item.label} className={cn('text-center p-3 rounded-lg', item.bg)}>
                      <p className="text-lg mb-0.5">{item.icon}</p>
                      <p className={cn('text-xl font-bold font-mono', item.color)}>{item.count}</p>
                      <p className="text-[9px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Hints Summary */}
          <motion.div {...fadeIn(0.15)}>
            <Card className="bg-card border-border/40">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <Target className="h-4 w-4 text-primary" /> AI Decision Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Flip Opportunities', count: stats.flip_opportunities, hint: HINT_CONFIG['Potential flip opportunity'] },
                    { label: 'Acquisition Candidates', count: stats.hold_candidates, hint: HINT_CONFIG['Long-term hold candidate'] },
                    { label: 'Risk Zones', count: stats.risk_zones, hint: HINT_CONFIG['Short-term risk zone'] },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/15 border border-border/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{item.hint.icon}</span>
                        <span className={cn('text-2xl font-bold font-mono', item.hint.color)}>{item.count}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Engine Model Info */}
          <motion.div {...fadeIn(0.2)}>
            <Card className="bg-card border-border/40">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" /> Prediction Model Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Valuation Inputs</p>
                    {[
                      { w: '60%', label: 'Comparable PSM (Price/SQM)' },
                      { w: '40%', label: 'City Average Price Blend' },
                      { w: '±0.3%', label: 'Opportunity Score Modifier' },
                      { w: '±0.2%', label: 'Demand Score Modifier' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded bg-muted/15">
                        <span className="text-muted-foreground">{item.label}</span>
                        <Badge variant="outline" className="text-[9px] font-mono h-5">{item.w}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Forecast Factors</p>
                    {[
                      { w: '35%', label: 'Opportunity Score Momentum' },
                      { w: '25%', label: 'Demand Score Signal' },
                      { w: '25%', label: 'Forecast Score (3M)' },
                      { w: '15%', label: 'Engagement Velocity' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded bg-muted/15">
                        <span className="text-muted-foreground">{item.label}</span>
                        <Badge variant="outline" className="text-[9px] font-mono h-5">{item.w}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : null}
    </div>
  );
};

export default PricePredictionEngine;
