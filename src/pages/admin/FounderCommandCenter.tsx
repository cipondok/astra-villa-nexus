import React from 'react';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import { usePlatformIntelligence } from '@/hooks/usePlatformIntelligence';
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { useGrowthTrajectory, useExpansionStrategy } from '@/hooks/useGrowthTrajectory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Brain, Shield, TrendingUp, Globe, DollarSign, Target, Gauge,
  AlertTriangle, Loader2, CheckCircle, ArrowUpRight, Rocket,
  Activity, MapPin, Users, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_STYLES = {
  early_traction: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  acceleration: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  expansion: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  dominance: { color: 'text-primary', bg: 'bg-primary/10' },
} as const;

const MOMENTUM_STYLES = {
  accelerating: { color: 'text-emerald-400', icon: Rocket },
  steady: { color: 'text-blue-400', icon: Activity },
  slowing: { color: 'text-amber-400', icon: AlertTriangle },
  stalled: { color: 'text-red-400', icon: AlertTriangle },
} as const;

const KPICard = ({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: React.ElementType; color: string; sub?: string;
}) => (
  <Card className="border-border/50">
    <CardContent className="p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-3.5 w-3.5', color)} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className={cn('text-lg font-bold tracking-tight', color)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </CardContent>
  </Card>
);

const FounderCommandCenter: React.FC = () => {
  const { report, isLoading: hLoad } = useSystemHealthReport();
  const { intelligence, isLoading: iLoad } = usePlatformIntelligence();
  const { kpis, isLoading: rLoad } = useRevenueAnalytics();
  const { trajectory, isLoading: gLoad } = useGrowthTrajectory();
  const { strategy, isLoading: eLoad } = useExpansionStrategy();

  const loading = hLoad || iLoad || rLoad || gLoad || eLoad;

  if (loading || !report || !intelligence || !trajectory || !strategy) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Brain className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading Command Center…</p>
        </div>
      </div>
    );
  }

  const stageSt = STAGE_STYLES[trajectory.stage];
  const momSt = MOMENTUM_STYLES[trajectory.momentum];
  const MomIcon = momSt.icon;
  const healthColor = report.overallScore >= 75 ? 'text-emerald-400' : report.overallScore >= 60 ? 'text-blue-400' : report.overallScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Founder Command Center
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Strategic visibility · Growth tracking · Expansion readiness
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn('text-[10px]', stageSt.bg, stageSt.color)}>{trajectory.stageLabel}</Badge>
          <Badge variant="outline" className={cn('text-[10px]', momSt.color)}>
            <MomIcon className="h-3 w-3 mr-1" /> {trajectory.momentum}
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {report.overallScore < 55 && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Platform Health Critical</AlertTitle>
          <AlertDescription className="text-xs">Health index {report.overallScore} — feature freeze recommended.</AlertDescription>
        </Alert>
      )}
      {trajectory.momentum === 'stalled' && (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-sm font-semibold text-amber-400">Growth Stalled</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">Growth score {trajectory.score} — reassess acquisition strategy.</AlertDescription>
        </Alert>
      )}

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        <KPICard label="Health Index" value={String(report.overallScore)} icon={Gauge} color={healthColor} sub={report.status} />
        <KPICard label="Growth Score" value={String(trajectory.score)} icon={TrendingUp} color={stageSt.color} sub={trajectory.stageLabel} />
        <KPICard label="Scaling" value={`${intelligence.scalingReadiness}%`} icon={Globe} color={intelligence.scalingReadiness >= 60 ? 'text-emerald-400' : 'text-amber-400'} />
        <KPICard label="Risk" value={intelligence.riskLevel} icon={Shield} color={intelligence.riskLevel === 'low' ? 'text-emerald-400' : intelligence.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400'} />
        <KPICard label="Revenue" value={kpis ? `${kpis.listingConversionRate}%` : '—'} icon={DollarSign} color="text-primary" sub="Conversion" />
        <KPICard label="Expansion" value={`${strategy.overallReadiness}%`} icon={MapPin} color={strategy.overallReadiness >= 40 ? 'text-emerald-400' : 'text-amber-400'} sub={strategy.currentPhase} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Growth Projections */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              30-Day Growth Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trajectory.projections.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground">{p.metric}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-foreground">{p.current}</span>
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    <span className="font-mono text-emerald-400">{p.target30d}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intelligence.priorityActions.slice(0, 5).map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" /> {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Global Expansion Map */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Global Expansion Readiness — {strategy.currentPhase}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
              {strategy.regions.map(r => {
                const rColor = r.readinessScore >= 60 ? 'text-emerald-400' : r.readinessScore >= 30 ? 'text-amber-400' : 'text-muted-foreground';
                return (
                  <div key={r.region} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{r.region}</span>
                      <Badge variant="outline" className={cn('text-[9px]', r.priority === 'primary' ? 'border-emerald-500/30 text-emerald-400' : r.priority === 'secondary' ? 'border-amber-500/30 text-amber-400' : 'border-border text-muted-foreground')}>
                        {r.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={cn('font-bold', rColor)}>{r.readinessScore}%</span>
                      <span className="text-muted-foreground">· {r.investorDensity} density</span>
                      <span className="text-muted-foreground">· {r.regulatoryStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Capital Inflow Forecast</span>
              </div>
              <span className="text-xs text-muted-foreground">{strategy.capitalInflowForecast}</span>
            </div>
          </CardContent>
        </Card>

        {/* Growth Recommendations */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Growth Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {trajectory.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" /> {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Expansion Recommendations */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Expansion Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strategy.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-400" /> {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FounderCommandCenter;
