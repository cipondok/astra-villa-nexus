import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useLaunchRoadmap,
  useUpdateTaskStatus,
  useUpdatePhaseStatus,
  type PhaseWithTasks,
  type RoadmapTask,
  type TaskStatus,
  type TaskPriority,
  type PhaseStatus,
} from "@/hooks/useLaunchRoadmap";
import {
  Rocket,
  Target,
  TrendingUp,
  Crown,
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Ban,
  Zap,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Config ──

const phaseIcons: Record<string, typeof Rocket> = {
  pre_launch: Target,
  soft_launch: Rocket,
  growth_acceleration: TrendingUp,
  platform_maturity: Crown,
};

const phaseColors: Record<string, { accent: string; bg: string; border: string }> = {
  pre_launch:           { accent: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30" },
  soft_launch:          { accent: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  growth_acceleration:  { accent: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30" },
  platform_maturity:    { accent: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30" },
};

const statusConfig: Record<PhaseStatus, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground" },
  in_progress: { label: "In Progress", color: "text-primary" },
  completed:   { label: "Completed", color: "text-chart-1" },
};

const taskStatusIcons: Record<TaskStatus, typeof Circle> = {
  pending: Circle,
  in_progress: Play,
  completed: CheckCircle2,
  blocked: Ban,
};

const taskStatusColors: Record<TaskStatus, string> = {
  pending: "text-muted-foreground",
  in_progress: "text-primary",
  completed: "text-chart-1",
  blocked: "text-destructive",
};

const priorityConfig: Record<TaskPriority, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Critical" },
  high:     { color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", label: "High" },
  medium:   { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Medium" },
  low:      { color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border/30", label: "Low" },
};

const nextStatuses: Record<TaskStatus, TaskStatus> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
  blocked: "pending",
};

// ── Task Row ──

function TaskRow({ task, onStatusChange }: { task: RoadmapTask; onStatusChange: (id: string, status: TaskStatus) => void }) {
  const Icon = taskStatusIcons[task.status];
  const pc = priorityConfig[task.priority];

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 p-2.5 rounded-lg border transition-all group cursor-pointer hover:bg-muted/30",
        task.status === "completed" ? "border-chart-1/20 bg-chart-1/5 opacity-70" : "border-border/30 bg-card/50",
        task.status === "blocked" && "border-destructive/20 bg-destructive/5"
      )}
      onClick={() => onStatusChange(task.id, nextStatuses[task.status])}
    >
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0 transition-colors", taskStatusColors[task.status])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("text-[11px] font-medium", task.status === "completed" && "line-through text-muted-foreground")}>{task.task_title}</span>
          <Badge variant="outline" className={cn("text-[8px] h-3.5 px-1", pc.color, pc.bg, pc.border)}>
            {pc.label}
          </Badge>
        </div>
        {task.task_description && (
          <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{task.task_description}</p>
        )}
      </div>
    </div>
  );
}

// ── Phase Card ──

function PhaseCard({ phase, defaultExpanded }: { phase: PhaseWithTasks; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const updateTask = useUpdateTaskStatus();
  const updatePhase = useUpdatePhaseStatus();

  const pc = phaseColors[phase.phase_key] || phaseColors.pre_launch;
  const PhaseIcon = phaseIcons[phase.phase_key] || Target;
  const sc = statusConfig[phase.status];

  const criticalPending = phase.tasks.filter((t) => t.priority === "critical" && t.status !== "completed").length;

  const handleTaskToggle = useCallback((taskId: string, status: TaskStatus) => {
    updateTask.mutate({ taskId, status });
  }, [updateTask]);

  const handlePhaseToggle = useCallback(() => {
    const next: PhaseStatus = phase.status === "not_started" ? "in_progress" : phase.status === "in_progress" ? "completed" : "not_started";
    updatePhase.mutate({ phaseId: phase.id, status: next });
  }, [phase, updatePhase]);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <Card className={cn("rounded-2xl overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm transition-all", phase.status === "completed" && "opacity-80")}>
      <div className={cn("h-1.5", pc.bg)} />

      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn("p-2 rounded-xl", pc.bg)}>
              <PhaseIcon className={cn("h-5 w-5", pc.accent)} />
            </div>
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                {phase.phase_name}
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", sc.color)}>
                  {sc.label}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(phase.target_start_date)} — {formatDate(phase.target_end_date)}
                </span>
                {criticalPending > 0 && (
                  <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-destructive bg-destructive/10 border-destructive/30">
                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{criticalPending} critical
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={handlePhaseToggle}>
                    {phase.status === "not_started" ? <Play className="h-3 w-3" /> : phase.status === "in_progress" ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Toggle phase status</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-muted/50 transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{phase.completedCount}/{phase.totalCount} tasks</span>
            <span className={cn("font-bold", phase.progressPct >= 80 ? "text-chart-1" : phase.progressPct >= 40 ? "text-chart-4" : "text-muted-foreground")}>{phase.progressPct}%</span>
          </div>
          <Progress value={phase.progressPct} className="h-1.5" />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 pt-0 space-y-1.5">
          {phase.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 border-b border-border/20 pb-2">{phase.description}</p>
          )}
          {phase.tasks.map((task) => (
            <TaskRow key={task.id} task={task} onStatusChange={handleTaskToggle} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Component ──

const LaunchRoadmapDashboard = React.memo(function LaunchRoadmapDashboard() {
  const { data: phases, isLoading } = useLaunchRoadmap();

  const stats = useMemo(() => {
    if (!phases) return { total: 0, completed: 0, critical: 0, pct: 0 };
    const total = phases.reduce((s, p) => s + p.totalCount, 0);
    const completed = phases.reduce((s, p) => s + p.completedCount, 0);
    const critical = phases.reduce((s, p) => s + p.tasks.filter((t) => t.priority === "critical" && t.status !== "completed").length, 0);
    return { total, completed, critical, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [phases]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          National Launch Roadmap
        </h1>
        <p className="text-sm text-muted-foreground">6-month sprint — 10+ city simultaneous launch across Indonesia</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks", value: stats.total, icon: BarChart3, color: "text-foreground" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-chart-1" },
          { label: "Critical Pending", value: stats.critical, icon: AlertTriangle, color: "text-destructive" },
          { label: "Progress", value: `${stats.pct}%`, icon: Zap, color: stats.pct >= 60 ? "text-chart-1" : stats.pct >= 30 ? "text-chart-4" : "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-xl border-border/30 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/30">
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">{label}</span>
                <span className={cn("text-lg font-bold", color)}>{value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global progress */}
      <div className="space-y-1">
        <Progress value={stats.pct} className="h-2" />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Overall launch readiness</span>
          <span className="font-medium">{stats.pct}%</span>
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-4">
        {(phases || []).map((phase, i) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            defaultExpanded={i === 0 || phase.status === "in_progress"}
          />
        ))}
      </div>
    </div>
  );
});

export default LaunchRoadmapDashboard;
