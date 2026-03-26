import React from 'react';
import { useExecutionPlan } from '@/hooks/useExecutionPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Zap, Target, Shield, TrendingUp, AlertTriangle, Loader2,
  ArrowUpRight, Ban, CheckCircle, Calendar, Wrench, Rocket,
  Activity, XCircle, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const URGENCY_STYLES = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Zap },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Target },
  low: { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border/30', icon: Activity },
} as const;

const SEVERITY_STYLES = {
  block: { color: 'text-red-400', bg: 'bg-red-500/5', icon: XCircle },
  warn: { color: 'text-amber-400', bg: 'bg-amber-500/5', icon: AlertTriangle },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/5', icon: CheckCircle },
} as const;

const FounderExecutionDashboard: React.FC = () => {
  const { plan, isLoading } = useExecutionPlan();

  if (isLoading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Zap className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Computing execution plan…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Founder Execution Command
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Actions · Weekly Plan · Discipline · Opportunities
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5 font-medium">
          <Calendar className="h-3 w-3 mr-1.5" />
          Week of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Badge>
      </div>

      {/* This Week Focus Banner */}
      <div className={cn('p-4 rounded-lg border',
        plan.criticalAlerts.length > 0
          ? 'bg-red-500/5 border-red-500/20'
          : plan.thisWeekFocus.includes('GROWTH')
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-primary/5 border-primary/20'
      )}>
        <div className="flex items-center gap-3">
          <Target className={cn('h-5 w-5',
            plan.criticalAlerts.length > 0 ? 'text-red-400' : 'text-primary'
          )} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">This Week Focus</div>
            <div className="text-sm font-bold text-foreground">{plan.thisWeekFocus}</div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {plan.criticalAlerts.length > 0 && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Critical Alerts ({plan.criticalAlerts.length})</AlertTitle>
          <AlertDescription>
            <ul className="space-y-1 mt-1">
              {plan.criticalAlerts.map((a, i) => (
                <li key={i} className="text-xs">{a}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.priorityActions.map((a, i) => {
              const style = URGENCY_STYLES[a.urgency];
              const UIcon = style.icon;
              return (
                <div key={i} className={cn('p-2.5 rounded-lg border', style.bg, style.border)}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <UIcon className={cn('h-3.5 w-3.5', style.color)} />
                    <span className="text-xs font-medium text-foreground flex-1">{a.action}</span>
                    <Badge variant="outline" className={cn('text-[9px] capitalize', style.color)}>{a.urgency}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-5">{a.rationale}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Weekly Plan */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Weekly Execution Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <Target className="h-3 w-3" /> Top 3 Priorities
              </div>
              {plan.weeklyPlan.topPriorities.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground mb-1">
                  <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{i + 1}</div>
                  {p}
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <Wrench className="h-3 w-3" /> Technical Tasks
              </div>
              <ul className="space-y-1">
                {plan.weeklyPlan.technicalTasks.map((t, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <Rocket className="h-3 w-3" /> Growth Actions
              </div>
              <ul className="space-y-1">
                {plan.weeklyPlan.growthActions.map((g, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> {g}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Growth Opportunities */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan.growthOpportunities.length > 0 ? (
              <ul className="space-y-2">
                {plan.growthOpportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> {o}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No immediate opportunities detected — focus on fundamentals.</p>
            )}
          </CardContent>
        </Card>

        {/* Do Not Do List */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              Do Not Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.doNotDoList.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /> {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Discipline Rules */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Automatic Discipline Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {plan.disciplineRules.map((r, i) => {
              const style = SEVERITY_STYLES[r.severity];
              const SIcon = style.icon;
              return (
                <div key={i} className={cn('p-3 rounded-lg border border-border/20', r.triggered ? style.bg : 'bg-muted/5')}>
                  <div className="flex items-center gap-2 mb-1">
                    <SIcon className={cn('h-3.5 w-3.5', r.triggered ? style.color : 'text-muted-foreground')} />
                    <Badge variant={r.triggered ? 'default' : 'outline'} className="text-[9px]">
                      {r.triggered ? 'TRIGGERED' : 'OK'}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-medium text-foreground mb-0.5">{r.rule}</div>
                  {r.triggered && (
                    <div className={cn('text-[10px]', style.color)}>{r.consequence}</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderExecutionDashboard;
