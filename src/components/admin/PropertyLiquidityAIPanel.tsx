import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Droplets, Clock, TrendingUp, AlertTriangle, Zap, RefreshCw,
  BarChart3, Target, Eye, ArrowUpRight
} from 'lucide-react';
import { useAllLiquidityScores, LiquidityScoreResult } from '@/hooks/useLiquidityScore';
import { useLiquidityMetrics, usePropertyLiquidity } from '@/hooks/useLiquidityMetrics';
import { useLiquidityScan, useIncrementalLiquidityUpdate, useLiquiditySignalQueue } from '@/hooks/useLiquidityEngine';
import { toast } from 'sonner';

const gradeColor: Record<string, string> = {
  'A+': 'bg-emerald-500', A: 'bg-emerald-400', B: 'bg-amber-400',
  C: 'bg-orange-400', D: 'bg-red-400', F: 'bg-red-600',
};

const boostLabel: Record<string, { text: string; cls: string }> = {
  none: { text: 'No boost needed', cls: 'bg-muted text-muted-foreground' },
  low: { text: 'Low boost', cls: 'bg-blue-100 text-blue-700' },
  medium: { text: 'Medium boost', cls: 'bg-amber-100 text-amber-700' },
  high: { text: 'High boost', cls: 'bg-orange-100 text-orange-700' },
  urgent: { text: '🚨 Urgent boost', cls: 'bg-red-100 text-red-700' },
};

const PropertyLiquidityAIPanel = () => {
  const { data: allScores = [], isLoading } = useAllLiquidityScores(200);
  const { data: districtMetrics = [] } = useLiquidityMetrics();
  const { data: signalQueue } = useLiquiditySignalQueue();
  const fullScan = useLiquidityScan();
  const incrementalUpdate = useIncrementalLiquidityUpdate();
  const [tab, setTab] = useState('overview');

  const stats = useMemo(() => {
    if (!allScores.length) return null;
    const scores = allScores.map(s => s.liquidityScore);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const urgentCount = allScores.filter(s => s.urgencyAlert).length;
    const boostNeeded = allScores.filter(s => s.visibilityBoost !== 'none').length;
    const avgDom = Math.round(allScores.reduce((a, s) => a + s.signals.daysOnMarket, 0) / allScores.length);
    const gradeDistribution = allScores.reduce((acc, s) => {
      acc[s.liquidityGrade] = (acc[s.liquidityGrade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { avg, urgentCount, boostNeeded, avgDom, total: allScores.length, gradeDistribution };
  }, [allScores]);

  const handleFullScan = () => {
    fullScan.mutate('full_forecast', {
      onError: (e) => toast.error(`Scan failed: ${e.message}`),
    });
  };

  const handleIncrementalUpdate = () => {
    incrementalUpdate.mutate(50, {
      onError: (e) => toast.error(`Update failed: ${e.message}`),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Droplets className="h-6 w-6" /> Property Liquidity AI Scoring
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Dynamic scoring engine predicting sell speed and optimizing visibility
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleIncrementalUpdate} disabled={incrementalUpdate.isPending}>
            <Zap className="h-4 w-4 mr-1" /> Signal Update
          </Button>
          <Button size="sm" onClick={handleFullScan} disabled={fullScan.isPending}>
            <RefreshCw className={`h-4 w-4 mr-1 ${fullScan.isPending ? 'animate-spin' : ''}`} /> Full Recompute
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Droplets className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold tabular-nums">{stats.avg}</div>
              <p className="text-xs text-muted-foreground">Avg Liquidity Score</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold tabular-nums">{stats.avgDom}d</div>
              <p className="text-xs text-muted-foreground">Avg Days on Market</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
              <div className="text-2xl font-bold tabular-nums">{stats.urgentCount}</div>
              <p className="text-xs text-muted-foreground">Urgency Alerts</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Eye className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-bold tabular-nums">{stats.boostNeeded}</div>
              <p className="text-xs text-muted-foreground">Need Visibility Boost</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold tabular-nums">{signalQueue?.pending ?? 0}</div>
              <p className="text-xs text-muted-foreground">Pending Signals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">Scoring Formula</TabsTrigger>
          <TabsTrigger value="properties" className="text-xs">Property Scores</TabsTrigger>
          <TabsTrigger value="districts" className="text-xs">District Metrics</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs">Data Pipeline</TabsTrigger>
        </TabsList>

        {/* SCORING FORMULA */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Liquidity Score Formula Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm mb-3">Input Signal Weights</h4>
                <div className="space-y-2">
                  {[
                    { signal: 'Viewing Velocity', weight: 10, desc: 'View rate per day relative to segment average' },
                    { signal: 'Offer Momentum', weight: 25, desc: 'Offer-to-listing ratio with recency decay' },
                    { signal: 'Escrow Activity', weight: 35, desc: 'Active escrow signals (strongest conversion indicator)' },
                    { signal: 'Closed Deals', weight: 30, desc: 'Nearby closed transactions in same segment' },
                  ].map(s => (
                    <div key={s.signal} className="flex items-center gap-3">
                      <div className="w-24 text-xs font-medium">{s.signal}</div>
                      <div className="flex-1">
                        <Progress value={s.weight * 2.86} className="h-2" />
                      </div>
                      <Badge variant="secondary" className="text-xs tabular-nums w-12 justify-center">{s.weight}%</Badge>
                      <span className="text-xs text-muted-foreground hidden md:block w-60">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">Output Scores Generated</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { output: 'Liquidity Score (0–100)', desc: 'Composite score from weighted signals', icon: Droplets },
                    { output: 'Time-to-Sell Prediction', desc: 'Estimated days to close based on score + DOM', icon: Clock },
                    { output: 'Demand Cluster Rank (1–5)', desc: 'Position within demand tier classification', icon: Target },
                    { output: 'Visibility Boost Recommendation', desc: 'none → low → medium → high → urgent', icon: Eye },
                    { output: 'Urgency Alert Flag', desc: 'Triggered when score < 30 AND DOM > 45 days', icon: AlertTriangle },
                    { output: 'Liquidity Grade (A+ to F)', desc: 'Letter grade for quick assessment', icon: TrendingUp },
                  ].map(o => (
                    <div key={o.output} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                      <o.icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{o.output}</span>
                        <p className="text-xs text-muted-foreground">{o.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">System Behavior</h4>
                <div className="space-y-1.5 text-sm">
                  {[
                    'Recalculates on major user interactions (view, save, inquire, offer)',
                    'Signal-driven incremental updates via liquidity_signal_queue',
                    'Full batch recompute available via admin trigger',
                    'Auto-adjusts listing ranking through deal_visibility_ranking',
                    'Triggers investor deal alerts for high-score properties',
                    'Surfaces stagnation warnings (grade D/F) to admin dashboard',
                    'Feeds into premium listing pricing logic',
                  ].map(b => (
                    <div key={b} className="flex items-start gap-2">
                      <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROPERTY SCORES */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Property Liquidity Scores ({allScores.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading scores…</p>
              ) : allScores.length === 0 ? (
                <div className="text-center py-8">
                  <Droplets className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No liquidity scores computed yet</p>
                  <Button size="sm" className="mt-3" onClick={handleFullScan} disabled={fullScan.isPending}>
                    Run First Computation
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {allScores.map(s => {
                    const bl = boostLabel[s.visibilityBoost];
                    return (
                      <div key={s.propertyId} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg text-sm">
                        <Badge className={`${gradeColor[s.liquidityGrade] || 'bg-muted'} text-white text-xs w-8 justify-center`}>
                          {s.liquidityGrade}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <code className="text-xs font-mono text-muted-foreground truncate block">{s.propertyId.slice(0, 12)}…</code>
                        </div>
                        <div className="w-20">
                          <Progress value={s.liquidityScore} className="h-2" />
                        </div>
                        <span className="tabular-nums text-xs font-medium w-8 text-right">{s.liquidityScore}</span>
                        <Badge variant="outline" className="text-xs tabular-nums w-16 justify-center">
                          ~{s.timeToSellDays}d
                        </Badge>
                        <Badge className={`text-xs ${bl.cls}`}>{bl.text}</Badge>
                        {s.urgencyAlert && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          {stats?.gradeDistribution && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  {['A+', 'A', 'B', 'C', 'D', 'F'].map(grade => (
                    <div key={grade} className="text-center">
                      <div className={`w-12 h-12 rounded-lg ${gradeColor[grade]} text-white flex items-center justify-center font-bold text-lg`}>
                        {stats.gradeDistribution[grade] || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{grade}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DISTRICT METRICS */}
        <TabsContent value="districts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">District Liquidity Metrics ({districtMetrics.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {districtMetrics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No district metrics available yet. Run a full recompute.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {districtMetrics.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{d.district}</span>
                        <span className="text-xs text-muted-foreground ml-2">{d.segment_type}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">LSI</span>
                        <div className="tabular-nums font-bold">{Math.round(d.liquidity_strength_index)}</div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">Absorption</span>
                        <div className="tabular-nums font-bold">{(d.absorption_rate * 100).toFixed(1)}%</div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">Avg Close</span>
                        <div className="tabular-nums font-bold">{Math.round(d.avg_days_to_close)}d</div>
                      </div>
                      <Badge variant={d.momentum_trend === 'accelerating' ? 'default' : 'secondary'} className="text-xs">
                        {d.momentum_trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PIPELINE */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Data Pipeline Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { step: '1. Signal Ingestion', desc: 'behavioral_events → liquidity_signal_queue', detail: 'View, save, inquire, offer, escrow events captured via useTrackEvent hook' },
                  { step: '2. Incremental Processing', desc: 'update-liquidity-on-signal edge function', detail: 'Processes pending signals in batches of 50, updates property_liquidity_scores' },
                  { step: '3. District Aggregation', desc: 'recompute-liquidity (district mode)', detail: 'Aggregates property signals into market_liquidity_metrics per district+segment' },
                  { step: '4. Score Caching', desc: 'property_liquidity_scores table', detail: 'Stores per-property score, grade, signals, and last_recalculated_at timestamp' },
                  { step: '5. Consumer Hooks', desc: 'useLiquidityScore() → UI components', detail: 'Derives time-to-sell, demand rank, visibility boost, urgency from cached scores' },
                  { step: '6. Ranking Output', desc: 'deal_visibility_ranking integration', detail: 'Liquidity score feeds into listing ranking for search results and featured slots' },
                ].map(p => (
                  <div key={p.step} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-sm">{p.step}</span>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{p.desc}</code>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{p.detail}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Edge Functions</h4>
                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  {[
                    { fn: 'recompute-liquidity', mode: 'Full batch + district + property modes' },
                    { fn: 'update-liquidity-on-signal', mode: 'Incremental signal processing' },
                    { fn: 'liquidity-engine', mode: 'Absorption, crisis, exit analysis' },
                    { fn: 'liquidity-flywheel', mode: 'Investor alert + supply triggers' },
                  ].map(f => (
                    <div key={f.fn} className="flex items-start gap-1.5">
                      <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{f.fn}</code>
                      <span className="text-muted-foreground">{f.mode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyLiquidityAIPanel;
