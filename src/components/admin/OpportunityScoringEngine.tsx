import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AdminPageHeader } from './shared/AdminPageHeader';
import {
  Brain, Zap, RefreshCw, Trophy, TrendingUp, Shield, ShieldAlert,
  ShieldCheck, Flame, Snowflake, BarChart3, Target, Loader2,
  Sparkles, Activity, Gauge, Crown, Star,
} from 'lucide-react';
import {
  useOpportunityScoreStats,
  useBatchRefreshScores,
  getScoreTier,
  SCORE_TIERS,
} from '@/hooks/useOpportunityEngine';
import { cn } from '@/lib/utils';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
}) {
  return (
    <Card className="bg-card border-border/40 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center bg-muted/30', color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold font-mono text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
            {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreDistributionBar({
  elite, strong, moderate, weak, total,
}: { elite: number; strong: number; moderate: number; weak: number; total: number }) {
  if (total === 0) return null;
  const pct = (v: number) => Math.max(1, (v / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex h-4 rounded-full overflow-hidden bg-muted/20">
        {elite > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${pct(elite)}%` }} />}
        {strong > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${pct(strong)}%` }} />}
        {moderate > 0 && <div className="bg-primary transition-all" style={{ width: `${pct(moderate)}%` }} />}
        {weak > 0 && <div className="bg-muted-foreground/30 transition-all" style={{ width: `${pct(weak)}%` }} />}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />{elite} Elite</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{strong} Strong</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />{moderate} Moderate</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground/30" />{weak} Weak</span>
      </div>
    </div>
  );
}

function WeightBreakdown() {
  const weights = [
    { label: 'ROI Projection', weight: 30, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Market Demand Heat', weight: 20, icon: Flame, color: 'text-orange-500' },
    { label: 'Price Undervaluation', weight: 20, icon: Target, color: 'text-primary' },
    { label: 'Inquiry Velocity', weight: 15, icon: Activity, color: 'text-blue-400' },
    { label: 'Rental Yield', weight: 10, icon: BarChart3, color: 'text-amber-500' },
    { label: 'Luxury Appeal', weight: 5, icon: Crown, color: 'text-purple-400' },
  ];

  return (
    <Card className="bg-card border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          Scoring Model Weights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {weights.map(w => (
          <div key={w.label} className="flex items-center gap-3">
            <w.icon className={cn('h-3.5 w-3.5 flex-shrink-0', w.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground font-medium">{w.label}</span>
                <span className="text-xs font-mono text-muted-foreground">{w.weight}%</span>
              </div>
              <Progress value={w.weight} className="h-1.5" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const OpportunityScoringEngine = () => {
  const { data: stats, isLoading, refetch } = useOpportunityScoreStats();
  const batchRefresh = useBatchRefreshScores();
  const [batchSize, setBatchSize] = useState(200);

  const handleBatchRefresh = () => {
    batchRefresh.mutate(batchSize);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AI Opportunity Scoring Engine"
        description="Institutional-grade composite scoring — ROI, demand, undervaluation, velocity, yield, luxury"
        icon={Brain}
        badge={stats ? { text: `${stats.coverage_pct || 0}% Coverage`, variant: 'default' } : undefined}
      />

      {/* Action Bar */}
      <Card className="bg-card border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleBatchRefresh}
              disabled={batchRefresh.isPending}
              className="gap-2"
              size="sm"
            >
              {batchRefresh.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Run Batch Scoring
            </Button>
            <div className="flex items-center gap-2">
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="h-8 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground"
              >
                <option value={50}>50 properties</option>
                <option value={100}>100 properties</option>
                <option value={200}>200 properties</option>
                <option value={500}>500 properties</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 ml-auto">
              <RefreshCw className="h-3 w-3" />
              Refresh Stats
            </Button>
          </div>

          {batchRefresh.data && (
            <div className="mt-3 p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-500">
              ✓ Scored {batchRefresh.data.updated} properties in {Math.round(batchRefresh.data.duration_ms)}ms
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading scoring engine stats...</p>
        </div>
      ) : stats ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total Scored" value={stats.total_scored} icon={BarChart3} color="text-primary" />
            <StatCard label="Avg Score" value={stats.avg_score || 0} icon={Gauge} color="text-emerald-500" />
            <StatCard label="Elite (85+)" value={stats.elite_count} icon={Crown} color="text-amber-400" />
            <StatCard label="Strong (65+)" value={stats.strong_count} icon={Star} color="text-emerald-500" />
            <StatCard label="Unscored" value={stats.unscored_count} icon={Target} color="text-muted-foreground" />
            <StatCard label="Coverage" value={`${stats.coverage_pct || 0}%`} icon={Sparkles} color="text-primary" />
          </div>

          {/* Score Distribution */}
          <Card className="bg-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreDistributionBar
                elite={stats.elite_count}
                strong={stats.strong_count}
                moderate={stats.moderate_count}
                weak={stats.weak_count}
                total={stats.total_scored}
              />
            </CardContent>
          </Card>

          {/* Intelligence Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Distribution */}
            <Card className="bg-card border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Risk Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Low Risk', count: stats.risk_distribution.low, icon: ShieldCheck, color: 'text-emerald-500' },
                  { label: 'Medium Risk', count: stats.risk_distribution.medium, icon: Shield, color: 'text-amber-500' },
                  { label: 'High Risk', count: stats.risk_distribution.high, icon: ShieldAlert, color: 'text-destructive' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs">
                      <r.icon className={cn('h-3.5 w-3.5', r.color)} />
                      <span className="text-foreground">{r.label}</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">{r.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Demand Trends */}
            <Card className="bg-card border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Demand Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Hot Markets', count: stats.trend_distribution.hot, icon: '🔥', color: 'text-orange-500' },
                  { label: 'Stable', count: stats.trend_distribution.stable, icon: '⚖️', color: 'text-emerald-500' },
                  { label: 'Cooling', count: stats.trend_distribution.cooling, icon: '❄️', color: 'text-blue-400' },
                ].map(t => (
                  <div key={t.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs">
                      <span>{t.icon}</span>
                      <span className="text-foreground">{t.label}</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">{t.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Forecast & Luxury */}
            <Card className="bg-card border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Intelligence Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg Forecast (3M)</span>
                  <span className="text-sm font-bold font-mono text-foreground">{stats.avg_forecast_3m}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg Luxury Index</span>
                  <span className="text-sm font-bold font-mono text-foreground">{stats.avg_luxury_index}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Median Score</span>
                  <span className="text-sm font-bold font-mono text-foreground">{stats.median_score}</span>
                </div>
                {stats.last_batch_run && (
                  <div className="pt-2 border-t border-border/20">
                    <p className="text-[10px] text-muted-foreground">
                      Last batch: {new Date(stats.last_batch_run).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weight Breakdown */}
          <WeightBreakdown />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Brain className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No scoring data available</p>
          <p className="text-xs mt-1">Run batch scoring to generate opportunity scores</p>
        </div>
      )}
    </div>
  );
};

export default OpportunityScoringEngine;
