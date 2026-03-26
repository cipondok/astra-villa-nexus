import React from 'react';
import { useCapitalFlowSignals } from '@/hooks/useCapitalFlowSignals';
import { useGrowthTrajectory } from '@/hooks/useGrowthTrajectory';
import { computeLeadershipPhases } from '@/services/capitalNetworkService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Globe, TrendingUp, Zap, Target, MapPin, Timer,
  Loader2, ArrowUpRight, Activity, Crown, Rocket, Shield,
  DollarSign, BarChart3, Clock, CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const READINESS_COLORS = {
  dormant: 'text-muted-foreground',
  warming: 'text-amber-400',
  active: 'text-blue-400',
  surging: 'text-emerald-400',
} as const;

const VERDICT_STYLES = {
  wait: { color: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-muted/30', label: '⏸ Wait', desc: 'Build fundamentals before major moves' },
  prepare: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: '🔧 Prepare', desc: 'Ready for the next growth phase' },
  execute: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: '▶ Execute', desc: 'Conditions favorable — proceed with plans' },
  accelerate: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: '🚀 Accelerate', desc: 'Optimal timing — maximize investment' },
} as const;

const TREND_ICONS = { improving: TrendingUp, stable: Activity, declining: ArrowUpRight } as const;

const CapitalIntelligenceDashboard: React.FC = () => {
  const { capital, timing, isLoading: cLoad } = useCapitalFlowSignals();
  const { trajectory, isLoading: gLoad } = useGrowthTrajectory();

  if (cLoad || gLoad || !capital || !timing || !trajectory) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <DollarSign className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Analyzing global capital signals…</p>
        </div>
      </div>
    );
  }

  const verdict = VERDICT_STYLES[timing.verdict];
  const phases = computeLeadershipPhases(trajectory.score);

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Capital Intelligence Center
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Capital Network · Market Timing · Category Leadership
          </p>
        </div>
        <Badge className={cn('text-xs px-3 py-1.5 font-semibold', verdict.bg, verdict.border, verdict.color)}>
          {verdict.label}
        </Badge>
      </div>

      {/* Timing Verdict Banner */}
      <div className={cn('p-4 rounded-lg border', verdict.bg, verdict.border)}>
        <div className="flex items-center gap-3">
          <Clock className={cn('h-5 w-5', verdict.color)} />
          <div>
            <div className={cn('text-sm font-bold', verdict.color)}>{verdict.label}</div>
            <div className="text-xs text-muted-foreground">{verdict.desc}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[10px] text-muted-foreground">Timing Score</div>
            <div className={cn('text-lg font-bold', verdict.color)}>{timing.overallReadiness}</div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { label: 'Global Liquidity', value: `${capital.globalLiquidityIndex}%`, icon: Globe, color: capital.globalLiquidityIndex >= 40 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Capital Pipeline', value: capital.totalActivatedCapital, icon: DollarSign, color: 'text-primary' },
          { label: 'Timing Score', value: String(timing.overallReadiness), icon: Timer, color: verdict.color },
          { label: 'Active Regions', value: String(capital.topRegions.filter(r => r.capitalReadiness !== 'dormant').length), icon: MapPin, color: 'text-blue-400' },
          { label: 'Opportunity Clusters', value: String(capital.topRegions.reduce((s, r) => s + r.opportunityClusters, 0)), icon: Target, color: 'text-primary' },
          { label: 'Growth Score', value: String(trajectory.score), icon: Rocket, color: trajectory.score >= 40 ? 'text-emerald-400' : 'text-amber-400' },
        ].map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <k.icon className={cn('h-3 w-3', k.color)} />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
              </div>
              <div className={cn('text-sm font-bold', k.color)}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Regional Capital Heatmap */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Regional Capital Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {capital.topRegions.map(r => (
              <div key={r.region} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className={cn('h-3 w-3', READINESS_COLORS[r.capitalReadiness])} />
                    <span className="font-medium text-foreground">{r.region}, {r.country}</span>
                    <Badge variant="outline" className="text-[9px] capitalize">{r.capitalReadiness}</Badge>
                  </div>
                  <span className={cn('font-bold', READINESS_COLORS[r.capitalReadiness])}>{r.liquidityDensity}</span>
                </div>
                <Progress value={r.liquidityDensity} className="h-1.5" />
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>Investors: {r.investorDensityScore}</span>
                  <span>Cross-border: {r.crossBorderFlowIndex}</span>
                  <span>Institutional: {r.institutionalInterest}</span>
                  <span>Clusters: {r.opportunityClusters}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Timing Signals */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Market Timing Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {timing.signals.map(s => {
              const TIcon = TREND_ICONS[s.trend] || Activity;
              return (
                <div key={s.dimension} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <TIcon className={cn('h-3 w-3', s.trend === 'improving' ? 'text-emerald-400' : s.trend === 'declining' ? 'text-red-400' : 'text-muted-foreground')} />
                      <span className="font-medium text-foreground">{s.dimension}</span>
                    </div>
                    <span className="font-bold text-foreground">{s.score}</span>
                  </div>
                  <Progress value={s.score} className="h-1.5" />
                  <div className="text-[10px] text-muted-foreground">{s.insight}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Timing Windows */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Execution Windows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {timing.windowsOpen.map((w, i) => (
              <div key={i} className={cn('p-2.5 rounded-lg border',
                w.urgency === 'now' ? 'bg-emerald-500/5 border-emerald-500/20' :
                w.urgency === 'soon' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-muted/10 border-border/20'
              )}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-foreground">{w.action}</span>
                  <Badge variant="outline" className={cn('text-[9px] capitalize',
                    w.urgency === 'now' ? 'text-emerald-400 border-emerald-500/30' :
                    w.urgency === 'soon' ? 'text-amber-400 border-amber-500/30' : ''
                  )}>{w.urgency}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">{w.rationale}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Partnership Priorities */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Partnership Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {capital.partnershipPriorities.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" /> {p}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Category Leadership Phases */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            Category Leadership Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {phases.map(p => (
              <div key={p.phase} className={cn('p-3 rounded-lg border',
                p.progress >= 100 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/10 border-border/20'
              )}>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[9px]">{p.phase}</Badge>
                  {p.progress >= 100 && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-semibold text-foreground mb-0.5">{p.title}</div>
                <div className="text-[10px] text-muted-foreground mb-2">{p.description}</div>
                <Progress value={p.progress} className="h-1.5 mb-2" />
                <ul className="space-y-0.5">
                  {p.milestones.map((m, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Combined Recommendations */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Globe className="h-3 w-3" /> Capital Network</div>
              <ul className="space-y-1.5">
                {capital.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Timer className="h-3 w-3" /> Market Timing</div>
              <ul className="space-y-1.5">
                {timing.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapitalIntelligenceDashboard;
