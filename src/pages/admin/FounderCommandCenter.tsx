import React, { useState } from 'react';
import { useDailyOperatingSystem } from '@/hooks/useDailyOperatingSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Zap, Target, Shield, TrendingUp, AlertTriangle,
  ArrowUpRight, Ban, Calendar, Wrench, Rocket,
  XCircle, Lightbulb, Sun, Clock, Moon,
  CheckCircle, BarChart3, Activity, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PHASE_ICONS = { morning: Sun, midday: Zap, evening: Moon } as const;

const URGENCY_STYLES = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Zap },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Target },
  low: { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border/30', icon: Activity },
} as const;

const TARGET_COLORS = {
  achieved: 'text-emerald-400',
  on_track: 'text-blue-400',
  at_risk: 'text-amber-400',
  behind: 'text-red-400',
} as const;

const VERDICT_STYLES = {
  excellent: { label: '🏆 Excellent', color: 'text-emerald-400' },
  good: { label: '✓ Good', color: 'text-blue-400' },
  needs_work: { label: '⚠ Needs Work', color: 'text-amber-400' },
  failing: { label: '✗ Failing', color: 'text-red-400' },
} as const;

const ACTION_BADGE = {
  approve: { label: '✓ Approve', color: 'text-emerald-400 border-emerald-500/30' },
  reject: { label: '✗ Reject', color: 'text-red-400 border-red-500/30' },
  defer: { label: '⏸ Defer', color: 'text-amber-400 border-amber-500/30' },
} as const;

const FounderCommandCenter: React.FC = () => {
  const { routine, decisions, weekly, plan, isLoading } = useDailyOperatingSystem();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (isLoading || !routine || !plan || !weekly || !decisions) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Brain className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading daily operating system…</p>
        </div>
      </div>
    );
  }

  const totalChecks = routine.reduce((s, b) => s + b.items.length, 0);
  const doneChecks = Object.values(checked).filter(Boolean).length;
  const dailyProgress = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const weeklyVerdict = VERDICT_STYLES[weekly.verdict];

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Founder Command Center
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Daily Routine · Execution Plan · Weekly Targets · Decision Rules
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Daily: {dailyProgress}%
          </Badge>
        </div>
      </div>

      {/* Today Focus Banner */}
      <div className={cn('p-4 rounded-lg border',
        plan.criticalAlerts.length > 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'
      )}>
        <div className="flex items-center gap-3">
          <Target className={cn('h-5 w-5', plan.criticalAlerts.length > 0 ? 'text-destructive' : 'text-primary')} />
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today's Focus</div>
            <div className="text-sm font-bold text-foreground">{plan.thisWeekFocus}</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-muted-foreground">Daily Progress</div>
            <div className="text-lg font-bold text-primary">{dailyProgress}%</div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {plan.criticalAlerts.length > 0 && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Critical Alerts</AlertTitle>
          <AlertDescription>
            <ul className="space-y-1 mt-1">
              {plan.criticalAlerts.map((a, i) => <li key={i} className="text-xs">{a}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Daily Routine Phases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {routine.map(block => {
          const PhaseIcon = PHASE_ICONS[block.phase];
          const blockDone = block.items.filter(item => checked[item.id]).length;
          const blockProgress = block.items.length > 0 ? Math.round((blockDone / block.items.length) * 100) : 0;

          return (
            <Card key={block.phase} className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <PhaseIcon className="h-4 w-4 text-primary" />
                    {block.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">{block.timeRange}</span>
                </CardTitle>
                <Progress value={blockProgress} className="h-1.5 mt-1" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                {block.items.map(item => (
                  <div key={item.id} className={cn('flex items-start gap-2 p-1.5 rounded',
                    item.redFlag ? 'bg-destructive/5' : ''
                  )}>
                    <Checkbox
                      id={item.id}
                      checked={!!checked[item.id]}
                      onCheckedChange={(v) => setChecked(prev => ({ ...prev, [item.id]: !!v }))}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={item.id} className={cn('text-xs cursor-pointer',
                        checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}>{item.label}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground"><Clock className="h-2.5 w-2.5 inline mr-0.5" />{item.timeMinutes}m</span>
                        {item.redFlag && (
                          <span className="text-[9px] text-destructive">⚠ {item.redFlag}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
            {plan.priorityActions.slice(0, 5).map((a, i) => {
              const style = URGENCY_STYLES[a.urgency];
              const UIcon = style.icon;
              return (
                <div key={i} className={cn('p-2 rounded-lg border', style.bg, style.border)}>
                  <div className="flex items-center gap-2">
                    <UIcon className={cn('h-3 w-3', style.color)} />
                    <span className="text-xs font-medium text-foreground flex-1">{a.action}</span>
                    <Badge variant="outline" className={cn('text-[9px]', style.color)}>{a.urgency}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-5 mt-0.5">{a.rationale}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Weekly Growth Targets */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Weekly Growth Targets
              </span>
              <span className={cn('text-xs font-medium', weeklyVerdict.color)}>{weeklyVerdict.label}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={weekly.overallScore} className="h-2 flex-1" />
              <span className="text-xs font-bold text-foreground">{weekly.overallScore}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {weekly.targets.map(t => (
              <div key={t.metric} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">{t.current} / {t.target} {t.unit !== 'score' ? '' : ''}</span>
                    <Badge variant="outline" className={cn('text-[9px] capitalize', TARGET_COLORS[t.status])}>{t.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <Progress value={t.progress} className="h-1.5" />
              </div>
            ))}
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
              <p className="text-xs text-muted-foreground">No immediate opportunities — focus on fundamentals.</p>
            )}
          </CardContent>
        </Card>

        {/* Blocked / Do Not Do */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              Do Not Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {plan.doNotDoList.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /> {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Decision Rules */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Decision Rules (Today)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {decisions.map((d, i) => {
              const badge = ACTION_BADGE[d.action];
              return (
                <div key={i} className="p-2.5 rounded-lg bg-muted/10 border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{d.condition}</span>
                    <Badge variant="outline" className={cn('text-[9px]', badge.color)}>{badge.label}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{d.rationale}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Discipline Rules */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Execution Discipline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {plan.disciplineRules.map((r, i) => (
              <div key={i} className={cn('p-2.5 rounded-lg border border-border/20',
                r.triggered ? (r.severity === 'block' ? 'bg-destructive/5' : r.severity === 'warn' ? 'bg-amber-500/5' : 'bg-blue-500/5') : 'bg-muted/5'
              )}>
                <div className="flex items-center gap-2 mb-1">
                  {r.triggered
                    ? <AlertTriangle className={cn('h-3 w-3', r.severity === 'block' ? 'text-destructive' : 'text-amber-400')} />
                    : <CheckCircle className="h-3 w-3 text-emerald-400" />
                  }
                  <Badge variant={r.triggered ? 'default' : 'outline'} className="text-[9px]">
                    {r.triggered ? 'TRIGGERED' : 'OK'}
                  </Badge>
                </div>
                <div className="text-[11px] font-medium text-foreground">{r.rule}</div>
                {r.triggered && <div className="text-[10px] text-muted-foreground mt-0.5">{r.consequence}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderCommandCenter;
