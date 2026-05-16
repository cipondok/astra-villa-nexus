import { motion } from 'framer-motion';
import {
  Calendar, Rocket, TrendingUp, Brain, Zap, CheckCircle2, Circle,
  Clock, Target, RefreshCw, ArrowRight, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useExecutionRoadmap, type RoadmapPhase } from '@/hooks/useExecutionRoadmap';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PHASE_ICONS: Record<string, React.ElementType> = {
  foundation: Rocket,
  traction: TrendingUp,
  intelligence: Brain,
  scaling: Zap,
};

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'chart-2': { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-chart-2/30', badge: 'bg-chart-2' },
  primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30', badge: 'bg-primary' },
  'chart-4': { bg: 'bg-chart-4/10', text: 'text-chart-4', border: 'border-chart-4/30', badge: 'bg-chart-4' },
  'chart-5': { bg: 'bg-chart-5/10', text: 'text-chart-5', border: 'border-chart-5/30', badge: 'bg-chart-5' },
};

const PRIORITY_STYLES = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  high: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
  medium: 'bg-primary/10 text-primary border-primary/30',
};

const STATUS_ICONS = { completed: CheckCircle2, in_progress: Clock, planned: Circle };
const STATUS_COLORS = { completed: 'text-chart-2', in_progress: 'text-chart-4', planned: 'text-muted-foreground' };

export default function ExecutionRoadmapPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useExecutionRoadmap();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-chart-4" />
            12-Month Execution Roadmap
          </h1>
          <p className="text-xs text-muted-foreground">
            Phased milestones toward marketplace traction · Updated {dataUpdatedAt ? format(new Date(dataUpdatedAt), 'MMM d, HH:mm') : '—'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Overall Progress Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <Card className="border-border/40 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-bold text-foreground">Execution Progress</span>
              <Badge variant="outline" className="ml-auto text-[9px] bg-primary/10 text-primary border-primary/30">
                Phase {data.current_phase} of 4
              </Badge>
            </div>

            {/* Phase timeline */}
            <div className="flex items-stretch gap-1 mb-4">
              {data.phases.map((phase) => {
                const isCurrent = phase.id === data.current_phase;
                const isPast = phase.id < data.current_phase;
                const colors = PHASE_COLORS[phase.color];
                return (
                  <div key={phase.id} className="flex-1 flex flex-col">
                    <div className={cn(
                      'h-2 rounded-full transition-all',
                      isPast ? colors.badge : isCurrent ? `${colors.badge} animate-pulse` : 'bg-muted/40'
                    )} />
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className={cn(
                        'text-[9px] font-bold',
                        isCurrent ? colors.text : isPast ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        P{phase.id}
                      </span>
                      <span className="text-[8px] text-muted-foreground truncate hidden sm:inline">{phase.name}</span>
                    </div>
                    <span className="text-[8px] text-muted-foreground">{phase.months}</span>
                  </div>
                );
              })}
            </div>

            {/* Overall stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 text-center">
                <p className="text-lg font-bold text-foreground">{data.overall_progress}%</p>
                <p className="text-[9px] text-muted-foreground">Overall Progress</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 text-center">
                <p className="text-lg font-bold text-foreground">~{data.months_elapsed}</p>
                <p className="text-[9px] text-muted-foreground">Months Elapsed</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 text-center">
                <p className="text-lg font-bold text-foreground">
                  {data.phases.reduce((s, p) => s + p.milestones.filter(m => m.completed).length, 0)}
                  /{data.phases.reduce((s, p) => s + p.milestones.length, 0)}
                </p>
                <p className="text-[9px] text-muted-foreground">Milestones Hit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phase Cards */}
      {data.phases.map((phase, i) => (
        <PhaseCard key={phase.id} phase={phase} isCurrent={phase.id === data.current_phase} delay={0.1 + i * 0.07} />
      ))}
    </div>
  );
}

function PhaseCard({ phase, isCurrent, delay }: { phase: RoadmapPhase; isCurrent: boolean; delay: number }) {
  const Icon = PHASE_ICONS[phase.icon] || Rocket;
  const colors = PHASE_COLORS[phase.color];
  const completed = phase.milestones.filter(m => m.completed).length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className={cn('border-border/40 overflow-hidden', isCurrent && 'ring-1 ring-primary/30')}>
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', isCurrent ? `${colors.badge} text-primary-foreground` : `${colors.bg}`)}>
                <Icon className={cn('h-4 w-4', !isCurrent && colors.text)} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  Phase {phase.id}: {phase.name}
                  {isCurrent && <Badge className="text-[8px] bg-primary/20 text-primary border-primary/30 h-4">ACTIVE</Badge>}
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">{phase.subtitle} · {phase.months}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{phase.readiness}%</p>
              <p className="text-[9px] text-muted-foreground">{completed}/{phase.milestones.length} milestones</p>
            </div>
          </div>
          <Progress value={phase.readiness} className="h-1.5 mt-2" />
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-3">
          {/* Milestones */}
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Key Milestones</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              {phase.milestones.map(m => {
                const pct = Math.min(100, Math.round((m.current / m.goal) * 100));
                return (
                  <div key={m.id} className={cn(
                    'p-2 rounded-lg border',
                    m.completed ? 'bg-chart-2/5 border-chart-2/30' : 'bg-muted/10 border-border/30'
                  )}>
                    <div className="flex items-center gap-1 mb-1">
                      {m.completed
                        ? <CheckCircle2 className="h-3 w-3 text-chart-2 shrink-0" />
                        : <Target className="h-3 w-3 text-muted-foreground shrink-0" />
                      }
                      <span className="text-[9px] font-medium text-muted-foreground truncate">{m.label}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {m.current >= 1_000_000_000 ? `${(m.current / 1_000_000_000).toFixed(1)}B`
                        : m.current >= 1_000_000 ? `${(m.current / 1_000_000).toFixed(1)}M`
                        : m.current >= 1_000 ? `${(m.current / 1_000).toFixed(1)}K`
                        : m.current.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      / {m.goal >= 1_000_000 ? `${(m.goal / 1_000_000).toFixed(0)}M` : m.goal.toLocaleString()} {m.unit}
                    </p>
                    <Progress value={pct} className="h-1 mt-1" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Strategic Objectives</span>
            <div className="mt-1.5 space-y-1.5">
              {phase.objectives.map((obj, i) => {
                const StatusIcon = STATUS_ICONS[obj.status];
                return (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/15 border border-border/20">
                    <StatusIcon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', STATUS_COLORS[obj.status])} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-foreground">{obj.title}</span>
                        <Badge variant="outline" className={cn('text-[8px] h-3.5', PRIORITY_STYLES[obj.priority])}>
                          {obj.priority}
                        </Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{obj.description}</p>
                    </div>
                    <Badge variant="outline" className={cn('text-[8px] shrink-0', STATUS_COLORS[obj.status])}>
                      {obj.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
