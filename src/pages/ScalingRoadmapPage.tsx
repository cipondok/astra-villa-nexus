import { motion } from 'framer-motion';
import {
  Rocket, Target, TrendingUp, Globe, CheckCircle2, Circle, Clock,
  ArrowRight, RefreshCw, Zap, AlertTriangle, ChevronRight, Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useScalingRoadmap, type FundingStage, type Milestone, type StageInitiative } from '@/hooks/useScalingRoadmap';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STAGE_ICONS: Record<string, React.ElementType> = {
  seed: Rocket,
  series_a: TrendingUp,
  expansion: Globe,
};

const PRIORITY_STYLES = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  high: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
  medium: 'bg-primary/10 text-primary border-primary/30',
};

const STATUS_ICONS = {
  completed: CheckCircle2,
  in_progress: Clock,
  planned: Circle,
};

export default function ScalingRoadmapPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useScalingRoadmap();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-52 rounded-xl bg-muted/30 animate-pulse" />
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
            <Rocket className="h-5 w-5 text-chart-4" />
            Scaling Roadmap
          </h1>
          <p className="text-xs text-muted-foreground">
            Strategic evolution across funding stages · Updated {dataUpdatedAt ? format(new Date(dataUpdatedAt), 'MMM d, HH:mm') : '—'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Stage Progress Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-border/40 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-bold text-foreground">Journey Progress</span>
              <Badge variant="outline" className="ml-auto text-[9px] bg-primary/10 text-primary border-primary/30">
                Current: {data.stages.find(s => s.id === data.current_stage)?.name}
              </Badge>
            </div>

            {/* Timeline bar */}
            <div className="flex items-center gap-0 mb-4">
              {data.stages.map((stage, i) => {
                const isCurrent = stage.id === data.current_stage;
                const isPast = data.stages.findIndex(s => s.id === data.current_stage) > i;
                const Icon = STAGE_ICONS[stage.id] || Rocket;
                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all',
                        isCurrent ? 'bg-primary border-primary text-primary-foreground scale-110' :
                        isPast ? 'bg-chart-2 border-chart-2 text-primary-foreground' :
                        'bg-muted/30 border-border text-muted-foreground'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn('text-[10px] font-semibold mt-1.5', isCurrent ? 'text-primary' : 'text-muted-foreground')}>
                        {stage.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{stage.timeline}</span>
                      <span className="text-[9px] text-muted-foreground">{stage.funding_target}</span>
                    </div>
                    {i < data.stages.length - 1 && (
                      <div className={cn('h-0.5 flex-1 -mx-2', isPast ? 'bg-chart-2' : 'bg-border')} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall readiness */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
              <div className="w-14 h-14 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%" cy="50%" innerRadius="65%" outerRadius="100%"
                    startAngle={180} endAngle={0}
                    data={[{ value: data.overall_readiness, fill: data.overall_readiness >= 50 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))' }]}
                  >
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'hsl(var(--muted))' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className="text-center -mt-6 text-xs font-bold text-foreground">{data.overall_readiness}%</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">Overall Scaling Readiness</p>
                <p className="text-[10px] text-muted-foreground">
                  Composite progress across all funding stage milestones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stage Cards */}
      {data.stages.map((stage, i) => (
        <StageCard
          key={stage.id}
          stage={stage}
          isCurrent={stage.id === data.current_stage}
          delay={0.1 + i * 0.08}
        />
      ))}
    </div>
  );
}

function StageCard({ stage, isCurrent, delay }: { stage: FundingStage; isCurrent: boolean; delay: number }) {
  const Icon = STAGE_ICONS[stage.id] || Rocket;
  const completedMilestones = stage.milestones.filter(m => m.completed).length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className={cn('border-border/40 overflow-hidden', isCurrent && 'ring-1 ring-primary/30')}>
        {/* Stage Header */}
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground')}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  {stage.name}
                  {isCurrent && <Badge className="text-[8px] bg-primary/20 text-primary border-primary/30 h-4">CURRENT</Badge>}
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">{stage.subtitle} · {stage.timeline}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{stage.readiness_score}%</p>
              <p className="text-[9px] text-muted-foreground">readiness</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-3">
          {/* Milestone Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Milestones ({completedMilestones}/{stage.milestones.length})
              </span>
              <span className="text-[9px] text-muted-foreground">{stage.funding_target}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stage.milestones.map(m => (
                <MilestoneCard key={m.id} milestone={m} />
              ))}
            </div>
          </div>

          {/* Strategic Initiatives */}
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Strategic Initiatives
            </span>
            <div className="mt-1.5 space-y-1.5">
              {stage.initiatives.map((init, i) => (
                <InitiativeRow key={i} initiative={init} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const pct = Math.min(100, Math.round((milestone.current / milestone.goal) * 100));
  return (
    <div className={cn(
      'p-2 rounded-lg border',
      milestone.completed ? 'bg-chart-2/5 border-chart-2/30' : 'bg-muted/10 border-border/30'
    )}>
      <div className="flex items-center gap-1 mb-1">
        {milestone.completed
          ? <CheckCircle2 className="h-3 w-3 text-chart-2" />
          : <Target className="h-3 w-3 text-muted-foreground" />
        }
        <span className="text-[9px] font-medium text-muted-foreground truncate">{milestone.label}</span>
      </div>
      <p className="text-sm font-bold text-foreground">
        {milestone.current >= 1_000_000_000 ? `${(milestone.current / 1_000_000_000).toFixed(1)}B`
          : milestone.current >= 1_000_000 ? `${(milestone.current / 1_000_000).toFixed(1)}M`
          : milestone.current.toLocaleString()}
      </p>
      <p className="text-[9px] text-muted-foreground">/ {milestone.target}</p>
      <Progress value={pct} className="h-1 mt-1" />
    </div>
  );
}

function InitiativeRow({ initiative }: { initiative: StageInitiative }) {
  const StatusIcon = STATUS_ICONS[initiative.status];
  const statusColors = {
    completed: 'text-chart-2',
    in_progress: 'text-chart-4',
    planned: 'text-muted-foreground',
  };

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/15 border border-border/20">
      <StatusIcon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', statusColors[initiative.status])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-foreground">{initiative.title}</span>
          <Badge variant="outline" className={cn('text-[8px] h-3.5', PRIORITY_STYLES[initiative.priority])}>
            {initiative.priority}
          </Badge>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">{initiative.description}</p>
      </div>
      <Badge variant="outline" className={cn('text-[8px] shrink-0', statusColors[initiative.status])}>
        {initiative.status.replace('_', ' ')}
      </Badge>
    </div>
  );
}
