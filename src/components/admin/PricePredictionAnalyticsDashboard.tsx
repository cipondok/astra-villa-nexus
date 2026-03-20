import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AdminPageHeader } from './shared/AdminPageHeader';
import {
  Brain, Loader2, RefreshCw, TrendingUp, BarChart3,
  Activity, Shield, Target, Cpu, Layers, GitBranch,
} from 'lucide-react';
import {
  usePricePredictionStats,
  useComputePricePredictions,
} from '@/hooks/usePricePredictionEngine';
import {
  useActiveValuationModel,
  useTrainingRuns,
  useCityValuationStats,
  useRecentPredictions,
} from '@/hooks/useMLValuationEngine';
import { cn } from '@/lib/utils';

const fadeIn = (d = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: d, ease: [0.16, 1, 0.3, 1] as const },
});

const PricePredictionAnalyticsDashboard = () => {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePricePredictionStats();
  const { data: activeModel, isLoading: modelLoading } = useActiveValuationModel();
  const { data: trainingRuns } = useTrainingRuns(5);
  const { data: cityStats } = useCityValuationStats();
  const { data: recentPreds } = useRecentPredictions(20);
  const computePredictions = useComputePricePredictions();

  const isLoading = statsLoading || modelLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Price Prediction Analytics"
        description="Unified ML model performance, city intelligence, and prediction accuracy monitoring"
        icon={Brain}
        badge={stats ? { text: `${stats.coverage_pct}% Coverage`, variant: 'default' } : undefined}
      />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => computePredictions.mutate(200)}
          disabled={computePredictions.isPending}
          size="sm"
          className="gap-2"
        >
          {computePredictions.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Cpu className="h-3.5 w-3.5" />}
          Run Batch Prediction
        </Button>
        <Button variant="outline" size="sm" onClick={() => refetchStats()} className="gap-1.5">
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
        {computePredictions.data && (
          <span className="text-xs text-chart-1">
            ✓ {computePredictions.data.properties_predicted} done in {Math.round(computePredictions.data.duration_ms)}ms
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Active Model Card */}
          {activeModel && (
            <motion.div {...fadeIn(0)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    Active ML Model
                    <Badge variant="secondary" className="ml-auto text-xs font-mono">
                      v{activeModel.model_version}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricBox label="MAE" value={`${(activeModel.mae / 1_000_000).toFixed(1)}M`} sub="Mean Abs Error" />
                    <MetricBox label="MAPE" value={`${activeModel.mape.toFixed(1)}%`} sub="Mean Abs % Error" />
                    <MetricBox label="R²" value={activeModel.r_squared.toFixed(3)} sub="Fit Quality" />
                    <MetricBox label="Samples" value={activeModel.training_sample_size.toLocaleString()} sub="Training Data" />
                  </div>

                  {activeModel.feature_weights && Object.keys(activeModel.feature_weights).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">Feature Weights</p>
                      <div className="space-y-1.5">
                        {Object.entries(activeModel.feature_weights)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 6)
                          .map(([name, weight]) => (
                            <div key={name} className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground w-28 truncate">{name}</span>
                              <Progress value={(weight as number) * 100} className="flex-1 h-1.5" />
                              <span className="text-[10px] font-mono text-foreground w-10 text-right">
                                {((weight as number) * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Coverage & Prediction Stats */}
          {stats && (
            <motion.div {...fadeIn(0.05)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Prediction Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <MetricBox label="Predicted" value={stats.total_predicted.toLocaleString()} />
                    <MetricBox label="Active" value={stats.total_active.toLocaleString()} />
                    <MetricBox label="Coverage" value={`${stats.coverage_pct}%`} />
                    <MetricBox label="Avg Confidence" value={`${stats.avg_confidence || 0}%`} />
                    <MetricBox label="Flip Opps" value={stats.flip_opportunities.toString()} />
                    <MetricBox label="Risk Zones" value={stats.risk_zones.toString()} />
                  </div>

                  <Separator className="my-3" />

                  {/* Valuation distribution mini */}
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'Deep Under', count: stats.deeply_undervalued, color: 'text-chart-1' },
                      { label: 'Undervalued', count: stats.slightly_undervalued, color: 'text-primary' },
                      { label: 'Fair', count: stats.fairly_priced, color: 'text-foreground' },
                      { label: 'Overpriced', count: stats.overpriced, color: 'text-chart-4' },
                      { label: 'Bubble', count: stats.bubble_risk, color: 'text-destructive' },
                    ].map(item => (
                      <div key={item.label} className="text-center p-2 rounded-lg bg-muted/10">
                        <p className={cn('text-lg font-bold font-mono', item.color)}>{item.count}</p>
                        <p className="text-[9px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Training History */}
          {trainingRuns && trainingRuns.length > 0 && (
            <motion.div {...fadeIn(0.1)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" /> Training History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trainingRuns.map(run => (
                      <div key={run.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/10 border border-border/20">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}
                            className="text-[10px] h-5"
                          >
                            {run.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">{run.trigger_source}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span>{run.training_samples} samples</span>
                          {run.mape_after !== null && (
                            <span className={cn(
                              run.mape_before && run.mape_after < run.mape_before ? 'text-chart-1' : 'text-foreground'
                            )}>
                              MAPE: {run.mape_after.toFixed(1)}%
                            </span>
                          )}
                          <span className="text-muted-foreground">{run.duration_ms}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* City Intelligence */}
          {cityStats && cityStats.length > 0 && (
            <motion.div {...fadeIn(0.15)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> City Price Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cityStats.slice(0, 8).map(city => (
                      <div key={city.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/10">
                        <div>
                          <span className="font-medium text-foreground">{city.city}</span>
                          {city.property_type && (
                            <span className="text-xs text-muted-foreground ml-2">· {city.property_type}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span>Rp {(city.avg_price_per_sqm / 1_000_000).toFixed(1)}M/m²</span>
                          <span className={cn(
                            city.yoy_change_pct >= 0 ? 'text-chart-1' : 'text-destructive'
                          )}>
                            {city.yoy_change_pct > 0 ? '+' : ''}{city.yoy_change_pct.toFixed(1)}% YoY
                          </span>
                          <span className="text-muted-foreground">{city.sample_count} props</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Predictions */}
          {recentPreds && recentPreds.length > 0 && (
            <motion.div {...fadeIn(0.2)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Recent Predictions
                    <Badge variant="outline" className="ml-auto text-[10px]">{recentPreds.length} latest</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {recentPreds.slice(0, 12).map(pred => (
                      <div key={pred.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-muted/10">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{pred.city || '—'}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{pred.property_type || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-foreground">
                            Rp {(pred.predicted_value / 1_000_000_000).toFixed(2)}B
                          </span>
                          <span className={cn(
                            'text-[10px]',
                            pred.trend_direction === 'up' ? 'text-chart-1' : pred.trend_direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
                          )}>
                            {pred.trend_direction}
                          </span>
                          <span className="text-muted-foreground">{pred.confidence_score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

function MetricBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/10 border border-border/20">
      <p className="text-lg font-bold font-mono text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {sub && <p className="text-[8px] text-muted-foreground/60">{sub}</p>}
    </div>
  );
}

export default PricePredictionAnalyticsDashboard;
