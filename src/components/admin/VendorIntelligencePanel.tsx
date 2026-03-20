import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useVendorRouting, triggerVendorEngine } from '@/hooks/useVendorRouting';
import {
  DEFAULT_SLA,
  SLA_COLORS,
  TIER_LABELS,
  TIER_COLORS,
  GAP_COLORS,
  type SLAThresholds,
} from '@/utils/vendorScoringEngine';
import {
  Store, Zap, BarChart3, Sliders, AlertTriangle,
  ArrowUpRight, RefreshCw, ShieldCheck, Clock,
  Users, TrendingUp, Route, Activity, Gauge,
  ChevronRight, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── SLA Editor ──────────────────────────────────────────────────────────
const SLASlider = ({ label, value, onChange, unit, max }: {
  label: string; value: number; onChange: (v: number) => void; unit: string; max: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <span className="tabular-nums text-muted-foreground">{value}{unit}</span>
    </div>
    <Slider value={[value]} onValueChange={([v]) => onChange(v)} max={max} min={0} step={1} />
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────
const VendorIntelligencePanel = () => {
  const [sla, setSLA] = useState<SLAThresholds>(DEFAULT_SLA);
  const { data, isLoading, refetch } = useVendorRouting(sla);
  const [engineRunning, setEngineRunning] = useState(false);

  const scoredVendors = data?.scoredVendors ?? [];
  const supplyGaps = data?.supplyGaps ?? [];

  const handleTriggerEngine = async (mode: 'full' | 'score' | 'match' | 'route') => {
    setEngineRunning(true);
    toast.loading(`Running vendor engine (${mode})...`, { id: 'vendor-engine' });
    try {
      await triggerVendorEngine(mode);
      toast.success('Vendor engine completed', { id: 'vendor-engine' });
      refetch();
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`, { id: 'vendor-engine' });
    } finally {
      setEngineRunning(false);
    }
  };

  // Aggregate stats
  const stats = React.useMemo(() => {
    if (!scoredVendors.length) return null;
    const slaBreakdown = { excellent: 0, good: 0, warning: 0, critical: 0 };
    let totalRouting = 0;
    let totalPerf = 0;
    let totalRevOpp = 0;
    scoredVendors.forEach((sv: any) => {
      slaBreakdown[sv.score.slaStatus as keyof typeof slaBreakdown]++;
      totalRouting += sv.score.routingPriority;
      totalPerf += sv.score.performanceScore;
      totalRevOpp += sv.score.revenueOpportunity;
    });
    return {
      total: scoredVendors.length,
      avgPerformance: totalPerf / scoredVendors.length,
      avgRouting: totalRouting / scoredVendors.length,
      totalRevOpp,
      slaBreakdown,
      criticalGaps: supplyGaps.filter((g: any) => g.gap === 'critical').length,
    };
  }, [scoredVendors, supplyGaps]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Route className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Vendor Marketplace Intelligence</h1>
            <p className="text-sm text-muted-foreground">Smart routing · performance scoring · supply gap detection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => handleTriggerEngine('full')} disabled={engineRunning} className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Run Engine
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Vendors</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{stats?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Performance</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{(stats?.avgPerformance ?? 0).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Routing</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{(stats?.avgRouting ?? 0).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rev Opportunity</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
              Rp {((stats?.totalRevOpp ?? 0) / 1_000_000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Critical Gaps</p>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle className={cn("h-5 w-5", (stats?.criticalGaps ?? 0) > 0 ? 'text-red-500' : 'text-emerald-500')} />
              <span className="text-2xl font-bold tabular-nums text-foreground">{stats?.criticalGaps ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="routing" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="routing" className="gap-1.5 text-xs"><Route className="h-3.5 w-3.5" />Routing Board</TabsTrigger>
          <TabsTrigger value="supply" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Supply Gaps</TabsTrigger>
          <TabsTrigger value="engine" className="gap-1.5 text-xs"><Zap className="h-3.5 w-3.5" />Engine Controls</TabsTrigger>
          <TabsTrigger value="sla" className="gap-1.5 text-xs"><Sliders className="h-3.5 w-3.5" />SLA Thresholds</TabsTrigger>
        </TabsList>

        {/* Routing Board */}
        <TabsContent value="routing">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Vendor Routing Priority — Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading vendor data...</p>
              ) : !scoredVendors.length ? (
                <div className="text-center py-8">
                  <Store className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">No active vendors</p>
                  <p className="text-xs text-muted-foreground mt-1">Onboard vendors to populate the routing board</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scoredVendors.slice(0, 30).map((sv: any, i: number) => {
                    const v = sv.vendor;
                    const s = sv.score;
                    return (
                      <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <span className="text-sm font-bold tabular-nums text-muted-foreground w-6 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{v.business_name}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{v.business_type}</Badge>
                            {v.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex-1">
                              <Progress value={s.routingPriority} className="h-1.5" />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground w-16">{s.routingPriority.toFixed(1)} / 100</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={cn('text-[10px] px-1.5 border', SLA_COLORS[s.slaStatus])}>
                            {s.slaStatus}
                          </Badge>
                          <Badge className={cn('text-[10px] font-bold uppercase px-2', TIER_COLORS[s.tier])}>
                            {TIER_LABELS[s.tier]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supply Gaps */}
        <TabsContent value="supply">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Category Supply Gap Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplyGaps.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No categories to analyze yet</p>
                ) : (
                  supplyGaps.map((gap: any) => (
                    <div key={gap.category} className={cn("rounded-lg border px-3 py-2.5", GAP_COLORS[gap.gap])}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{gap.category}</p>
                          <p className="text-xs mt-0.5">{gap.activeVendors} vendors · demand signal {gap.demandSignal}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[10px] border', GAP_COLORS[gap.gap])}>
                          {gap.gap.toUpperCase()}
                        </Badge>
                      </div>
                      <Progress value={gap.gapScore} className="h-1.5 mt-2" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  SLA Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['excellent', 'good', 'warning', 'critical'].map(status => {
                  const count = stats?.slaBreakdown?.[status as keyof typeof stats.slaBreakdown] ?? 0;
                  const total = stats?.total || 1;
                  const pct = (count / total) * 100;
                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className={cn('text-[10px] border', SLA_COLORS[status])}>{status}</Badge>
                        <span className="tabular-nums text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500",
                          status === 'excellent' ? 'bg-emerald-500' :
                          status === 'good' ? 'bg-blue-500' :
                          status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                        )} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engine Controls */}
        <TabsContent value="engine">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Engine Trigger Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Full Cycle', mode: 'full' as const, desc: 'Score + Match + Route — complete engine run' },
                  { label: 'Score Only', mode: 'score' as const, desc: 'Recalculate all vendor performance scores' },
                  { label: 'Match Engine', mode: 'match' as const, desc: 'Run AI matching for pending service requests' },
                  { label: 'Route Leads', mode: 'route' as const, desc: 'Auto-assign unrouted leads to optimal vendors' },
                ].map(item => (
                  <div key={item.mode} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleTriggerEngine(item.mode)} disabled={engineRunning} className="gap-1.5 flex-shrink-0">
                      <Zap className="h-3.5 w-3.5" />
                      Run
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Launch Category Campaign', desc: 'Target vendor acquisition for gap categories', icon: Users },
                  { label: 'Boost Top Performers', desc: 'Increase routing weight for diamond-tier vendors', icon: Crown },
                  { label: 'SLA Warning Broadcast', desc: 'Notify vendors below SLA thresholds', icon: AlertTriangle },
                  { label: 'Revenue Forecast Update', desc: 'Recalculate marketplace revenue projections', icon: TrendingUp },
                ].map(action => (
                  <Button key={action.label} variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <action.icon className="h-4 w-4 flex-shrink-0" />
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

        {/* SLA Thresholds */}
        <TabsContent value="sla">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                SLA Threshold Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-xs text-muted-foreground">
                Set minimum service level thresholds. Vendors falling below these are flagged for review.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <SLASlider label="Max Response Time" value={sla.responseTimeMinutes} onChange={v => setSLA(p => ({ ...p, responseTimeMinutes: v }))} unit=" min" max={480} />
                <SLASlider label="Min Conversion Rate" value={Math.round(sla.minConversionRate * 100)} onChange={v => setSLA(p => ({ ...p, minConversionRate: v / 100 }))} unit="%" max={50} />
                <SLASlider label="Min Rating" value={Math.round(sla.minRating * 10)} onChange={v => setSLA(p => ({ ...p, minRating: v / 10 }))} unit="/5" max={50} />
                <SLASlider label="Max Pending Leads" value={sla.maxPendingLeads} onChange={v => setSLA(p => ({ ...p, maxPendingLeads: v }))} unit=" leads" max={100} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <p className="text-xs text-muted-foreground">Changes apply to scoring in real-time</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSLA(DEFAULT_SLA); toast.success('SLA reset to defaults'); }}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => { refetch(); toast.success('SLA thresholds applied'); }}>
                    Apply & Rescore
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorIntelligencePanel;
