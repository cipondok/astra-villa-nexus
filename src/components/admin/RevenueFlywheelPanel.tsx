import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  useRevenueSnapshots,
  useRevenueExperiments,
  useFlywheelHealth,
  useSubscriptionPlans,
  useUpdatePlan,
  useCreateExperiment,
  useUpdateExperiment,
} from '@/hooks/useRevenueInsights';
import {
  formatRupiah,
  MOMENTUM_COLORS,
  STREAM_TREND_COLORS,
  PRIORITY_COLORS,
  EXPERIMENT_STATUS_COLORS,
} from '@/utils/revenueOptimizationEngine';
import {
  DollarSign, TrendingUp, BarChart3, Zap, FlaskConical,
  RefreshCw, ArrowUpRight, ArrowDownRight, Minus, Gauge,
  Layers, Activity, Settings, Rocket, Target, Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'growing' || trend === 'accelerating') return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (trend === 'declining' || trend === 'decelerating') return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
};

const RevenueFlywheelPanel = () => {
  const { data: health, isLoading: healthLoading } = useFlywheelHealth();
  const { data: snapshots } = useRevenueSnapshots(30);
  const { data: experiments, refetch: refetchExps } = useRevenueExperiments();
  const { data: plans } = useSubscriptionPlans();
  const updatePlan = useUpdatePlan();
  const createExperiment = useCreateExperiment();
  const updateExperiment = useUpdateExperiment();
  const [commissionOverride, setCommissionOverride] = useState(1.15);

  const velocity = health?.velocity;
  const streams = health?.streams ?? [];
  const upsellSignals = health?.upsell_signals ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Revenue Flywheel Optimizer</h1>
            <p className="text-sm text-muted-foreground">Pricing · experiments · upsells · velocity forecasting</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {health && (
            <div className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-1.5">
              <Gauge className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tabular-nums text-foreground">{health.score}</span>
              <span className="text-xs text-muted-foreground">/ 100 health</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Avg</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{formatRupiah(velocity?.daily_avg ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Projected</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{formatRupiah(velocity?.monthly_projected ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ARR Run Rate</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{formatRupiah(velocity?.arr_projected ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Growth</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn("text-2xl font-bold tabular-nums", (velocity?.growth_rate_pct ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {velocity?.growth_rate_pct ?? 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Momentum</p>
            <div className="mt-1">
              {velocity && (
                <Badge variant="outline" className={cn('text-xs border', MOMENTUM_COLORS[velocity.momentum])}>
                  <TrendIcon trend={velocity.momentum} />
                  <span className="ml-1 capitalize">{velocity.momentum}</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diversification Bar */}
      {health && (
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Revenue Diversification Index</span>
              </div>
              <span className="text-sm font-bold tabular-nums text-foreground">{health.diversification_index}/100</span>
            </div>
            <Progress value={health.diversification_index} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">
              {health.diversification_index >= 70 ? 'Well diversified — low single-stream dependency' :
               health.diversification_index >= 40 ? 'Moderate — consider growing underperforming streams' :
               'Concentrated — high dependency risk on dominant stream'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="streams" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="streams" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Revenue Streams</TabsTrigger>
          <TabsTrigger value="upsells" className="gap-1.5 text-xs"><Rocket className="h-3.5 w-3.5" />Upsell Signals</TabsTrigger>
          <TabsTrigger value="experiments" className="gap-1.5 text-xs"><FlaskConical className="h-3.5 w-3.5" />Experiments</TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" />Pricing Editor</TabsTrigger>
          <TabsTrigger value="commission" className="gap-1.5 text-xs"><Target className="h-3.5 w-3.5" />Commission</TabsTrigger>
        </TabsList>

        {/* Revenue Streams */}
        <TabsContent value="streams">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Stream Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {streams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No revenue snapshot data yet. Snapshots accumulate daily.</p>
                ) : (
                  streams.map(stream => (
                    <div key={stream.stream} className="rounded-lg border border-border/30 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{stream.stream}</p>
                          <span className={cn("flex items-center gap-0.5 text-xs", STREAM_TREND_COLORS[stream.trend])}>
                            <TrendIcon trend={stream.trend} />
                            {stream.trend}
                          </span>
                        </div>
                        <span className="text-sm font-bold tabular-nums text-foreground">{formatRupiah(stream.revenue)}/day</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1"><Progress value={stream.share_pct} className="h-1.5" /></div>
                        <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">{stream.share_pct}%</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Velocity Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Daily Average', value: velocity?.daily_avg ?? 0 },
                    { label: 'Weekly Run Rate', value: velocity?.weekly_avg ?? 0 },
                    { label: 'Monthly Projected', value: velocity?.monthly_projected ?? 0 },
                    { label: 'ARR Run Rate', value: velocity?.arr_projected ?? 0 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-bold tabular-nums text-foreground">{formatRupiah(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upsell Signals */}
        <TabsContent value="upsells">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" />
                Active Upsell Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upsellSignals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No upsell signals detected yet. Build marketplace volume to unlock.</p>
              ) : (
                upsellSignals.map((signal, i) => (
                  <div key={i} className="rounded-lg border border-border/30 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn('text-[10px] border', PRIORITY_COLORS[signal.priority])}>
                            {signal.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">{signal.type.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-sm text-foreground">{signal.trigger}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold tabular-nums text-foreground">{formatRupiah(signal.estimated_revenue)}</p>
                        <p className="text-xs text-muted-foreground">{signal.target_count} targets</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Zap className="h-3 w-3" /> Launch Campaign
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experiments */}
        <TabsContent value="experiments">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    Pricing & Revenue Experiments
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => {
                    createExperiment.mutate({
                      experiment_name: `Experiment ${(experiments?.length ?? 0) + 1}`,
                      experiment_type: 'pricing',
                      target_metric: 'conversion_rate',
                      variant_a: { price: 299000 },
                      variant_b: { price: 349000 },
                    } as any);
                  }} className="gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" /> New Experiment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {!experiments?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No experiments created yet. Launch one to start optimizing.</p>
                ) : (
                  experiments.map(exp => (
                    <div key={exp.id} className="rounded-lg border border-border/30 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{exp.experiment_name}</p>
                          <Badge variant="outline" className={cn('text-[10px] border', EXPERIMENT_STATUS_COLORS[exp.status])}>
                            {exp.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{exp.experiment_type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {exp.status === 'draft' && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                              updateExperiment.mutate({ id: exp.id, status: 'active', started_at: new Date().toISOString() } as any);
                            }}>Start</Button>
                          )}
                          {exp.status === 'active' && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                              updateExperiment.mutate({ id: exp.id, status: 'paused' } as any);
                            }}>Pause</Button>
                          )}
                          {exp.status === 'paused' && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                              updateExperiment.mutate({ id: exp.id, status: 'active' } as any);
                            }}>Resume</Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Target:</span>
                          <span className="ml-1 font-medium text-foreground">{exp.target_metric.replace(/_/g, ' ')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Split:</span>
                          <span className="ml-1 tabular-nums font-medium text-foreground">{100 - exp.traffic_split_pct}% / {exp.traffic_split_pct}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className={cn("ml-1 tabular-nums font-medium", exp.confidence_pct >= 90 ? 'text-emerald-600' : 'text-foreground')}>
                            {exp.confidence_pct}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                            <span>Variant A (n={exp.current_sample_a})</span>
                            <span>Variant B (n={exp.current_sample_b})</span>
                          </div>
                          <Progress value={exp.traffic_split_pct} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Editor */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                Subscription Plan Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!plans?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">No subscription plans configured yet.</p>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan: any) => (
                    <div key={plan.id} className="rounded-lg border border-border/30 px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{plan.name}</p>
                          <Badge variant="outline" className="text-[10px]">{plan.slug}</Badge>
                          <Switch
                            checked={plan.is_active}
                            onCheckedChange={(checked) => updatePlan.mutate({ id: plan.id, is_active: checked })}
                          />
                        </div>
                        <span className="text-sm font-bold tabular-nums text-foreground">{formatRupiah(plan.price_monthly)}/mo</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Monthly Price</label>
                          <Input
                            type="number"
                            defaultValue={plan.price_monthly}
                            className="h-8 text-xs"
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val !== plan.price_monthly) updatePlan.mutate({ id: plan.id, price_monthly: val });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Annual Price</label>
                          <Input
                            type="number"
                            defaultValue={plan.price_annual ?? 0}
                            className="h-8 text-xs"
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val !== plan.price_annual) updatePlan.mutate({ id: plan.id, price_annual: val });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Listing Limit</label>
                          <Input
                            type="number"
                            defaultValue={plan.listing_limit ?? ''}
                            placeholder="Unlimited"
                            className="h-8 text-xs"
                            onBlur={(e) => {
                              const val = e.target.value ? Number(e.target.value) : null;
                              if (val !== plan.listing_limit) updatePlan.mutate({ id: plan.id, listing_limit: val });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Controls */}
        <TabsContent value="commission">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Transaction Commission Override
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-xs text-muted-foreground">
                  Adjust the platform take-rate applied to property transactions. Changes take effect immediately for new deals.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Platform Take-Rate</span>
                    <span className="text-lg font-bold tabular-nums text-foreground">{commissionOverride}%</span>
                  </div>
                  <Slider
                    value={[commissionOverride * 100]}
                    onValueChange={([v]) => setCommissionOverride(Math.round(v) / 100)}
                    min={50}
                    max={300}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5%</span>
                    <span>1.0%</span>
                    <span>1.5%</span>
                    <span>2.0%</span>
                    <span>3.0%</span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-foreground">Impact Simulation</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg deal Rp 1.8B × {commissionOverride}%</span>
                    <span className="font-bold tabular-nums text-foreground">{formatRupiah(1_800_000_000 * commissionOverride / 100)}/deal</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">48 deals/month projected</span>
                    <span className="font-bold tabular-nums text-foreground">{formatRupiah(48 * 1_800_000_000 * commissionOverride / 100)}/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  Quick Revenue Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Launch Premium Slot Campaign', desc: 'Push sponsored placements to top vendors in hotspot districts' },
                  { label: 'Trigger Vendor Upgrade Push', desc: 'Send upsell offers to vendors exceeding free-tier lead limits' },
                  { label: 'Investor Pro Conversion Wave', desc: 'Target high-engagement free investors with trial offer' },
                  { label: 'Escrow Fee Adjustment', desc: 'Modify escrow service fee for new transactions' },
                  { label: 'Referral Revenue Boost', desc: 'Increase referral reward temporarily to drive viral growth' },
                ].map(action => (
                  <Button key={action.label} variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Zap className="h-4 w-4 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueFlywheelPanel;
