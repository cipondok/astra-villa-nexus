import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  useGrowthExecutionPlan,
  useUpdateGrowthTaskStatus,
  useUpdateGrowthWeekStatus,
  type PhaseGroup,
  type GrowthWeekWithTasks,
  type GrowthTask,
  type TaskStatus,
  type TaskCategory,
} from "@/hooks/useGrowthExecutionPlan";
import { toast } from "sonner";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  TrendingUp,
  Rocket,
  BarChart3,
  Users,
  Search,
  Tag,
  DollarSign,
  Share2,
  Gauge,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Config ──

const phaseConfig: Record<number, { color: string; bg: string; border: string; icon: React.ElementType; emoji: string }> = {
  1: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: Rocket, emoji: "🏗️" },
  2: { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", icon: TrendingUp, emoji: "🚀" },
  3: { color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", icon: DollarSign, emoji: "💰" },
};

const categoryConfig: Record<TaskCategory, { icon: React.ElementType; color: string; label: string }> = {
  listings: { icon: Building, color: "text-primary", label: "Listings" },
  seo: { icon: Search, color: "text-chart-1", label: "SEO" },
  marketing: { icon: Tag, color: "text-chart-3", label: "Marketing" },
  agents: { icon: Users, color: "text-chart-4", label: "Agents" },
  investors: { icon: BarChart3, color: "text-chart-5", label: "Investors" },
  referral: { icon: Share2, color: "text-primary", label: "Referral" },
  monetization: { icon: DollarSign, color: "text-chart-1", label: "Monetization" },
  performance: { icon: Gauge, color: "text-chart-4", label: "Performance" },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: "text-destructive", bg: "bg-destructive/10" },
  high: { color: "text-chart-3", bg: "bg-chart-3/10" },
  medium: { color: "text-chart-4", bg: "bg-chart-4/10" },
  low: { color: "text-muted-foreground", bg: "bg-muted/20" },
};

const statusIcon: Record<TaskStatus, React.ElementType> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  blocked: AlertTriangle,
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
  blocked: "pending",
};

// ── Task Row ──

function TaskRow({ task, onToggle }: { task: GrowthTask; onToggle: (id: string, status: TaskStatus) => void }) {
  const StatusIcon = statusIcon[task.status];
  const cat = categoryConfig[task.category];
  const CatIcon = cat.icon;
  const pri = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer hover:bg-accent/5",
        task.status === "completed" ? "border-border/20 opacity-60" : "border-border/30",
        task.status === "blocked" && "border-destructive/30 bg-destructive/5"
      )}
      onClick={() => onToggle(task.id, nextStatus[task.status])}
    >
      <StatusIcon
        className={cn(
          "h-4 w-4 mt-0.5 shrink-0",
          task.status === "completed" && "text-chart-1",
          task.status === "in_progress" && "text-primary",
          task.status === "blocked" && "text-destructive",
          task.status === "pending" && "text-muted-foreground"
        )}
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-[11px] font-medium leading-tight", task.status === "completed" && "line-through text-muted-foreground")}>
          {task.task_title}
        </p>
        {task.task_description && (
          <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{task.task_description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", cat.color)}>
          <CatIcon className="h-2 w-2 mr-0.5" />{cat.label}
        </Badge>
        <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", pri.color, pri.bg)}>
          {task.priority}
        </Badge>
      </div>
    </div>
  );
}

// ── Week Card ──

function WeekCard({ week, onTaskToggle }: { week: GrowthWeekWithTasks; onTaskToggle: (id: string, status: TaskStatus) => void }) {
  const [open, setOpen] = useState(week.status === "in_progress" || week.progressPct < 100);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/60 hover:bg-accent/5 cursor-pointer transition-all">
          {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold text-foreground">{week.week_label}</span>
              <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-muted-foreground">{week.focus_area}</Badge>
            </div>
            {week.target_kpi && (
              <div className="flex items-center gap-1">
                <Target className="h-2.5 w-2.5 text-chart-4" />
                <span className="text-[9px] text-muted-foreground">{week.target_kpi}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] text-muted-foreground">{week.completedCount}/{week.totalCount}</span>
            <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", week.progressPct >= 100 ? "bg-chart-1" : week.progressPct >= 50 ? "bg-primary" : "bg-muted-foreground")}
                style={{ width: `${week.progressPct}%` }}
              />
            </div>
            <span className={cn("text-[9px] font-bold", week.progressPct >= 100 ? "text-chart-1" : "text-foreground")}>{week.progressPct}%</span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 pl-7 pr-2 pt-2 pb-1">
          {week.tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onTaskToggle} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Phase Section ──

function PhaseSection({ phase, onTaskToggle }: { phase: PhaseGroup; onTaskToggle: (id: string, status: TaskStatus) => void }) {
  const config = phaseConfig[phase.phase_number] || phaseConfig[1];
  const PhaseIcon = config.icon;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80">
      <div className={cn("h-1 bg-gradient-to-r", phase.phase_number === 1 ? "from-primary/40 to-primary/10" : phase.phase_number === 2 ? "from-chart-1/40 to-chart-1/10" : "from-chart-3/40 to-chart-3/10")} />
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2", config.color, config.bg, config.border)}>
              {config.emoji} Phase {phase.phase_number}
            </Badge>
            <CardTitle className="text-sm font-bold">{phase.phase_name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{phase.completedTasks}/{phase.totalTasks} tasks</span>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-bold", phase.progressPct >= 100 ? "text-chart-1 bg-chart-1/10" : config.color)}>
              {phase.progressPct}%
            </Badge>
          </div>
        </div>
        <Progress value={phase.progressPct} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {phase.weeks.map((week) => (
          <WeekCard key={week.id} week={week} onTaskToggle={onTaskToggle} />
        ))}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ──

const GrowthExecutionDashboard = React.memo(function GrowthExecutionDashboard() {
  const { data: phases, isLoading, error } = useGrowthExecutionPlan();
  const updateTask = useUpdateGrowthTaskStatus();

  const handleTaskToggle = useCallback((taskId: string, newStatus: TaskStatus) => {
    updateTask.mutate({ taskId, status: newStatus }, {
      onSuccess: () => toast.success(`Task ${newStatus === "completed" ? "completed" : "updated"}`),
      onError: (e) => toast.error(e.message),
    });
  }, [updateTask]);

  const stats = useMemo(() => {
    if (!phases) return null;
    const total = phases.reduce((s, p) => s + p.totalTasks, 0);
    const completed = phases.reduce((s, p) => s + p.completedTasks, 0);
    const critical = phases.flatMap((p) => p.weeks.flatMap((w) => w.tasks)).filter((t) => t.priority === "critical" && t.status !== "completed").length;
    const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, critical, overallPct };
  }, [phases]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                90-Day Growth Execution Plan
              </CardTitle>
              <CardDescription className="text-[11px]">
                Weekly execution priorities — listing seeding → marketing funnels → monetization
              </CardDescription>
            </div>
            {stats && (
              <Badge variant="outline" className={cn("text-sm h-7 px-3 font-bold", stats.overallPct >= 80 ? "text-chart-1 bg-chart-1/10 border-chart-1/30" : "text-primary bg-primary/10 border-primary/30")}>
                {stats.overallPct}% Complete
              </Badge>
            )}
          </div>
        </CardHeader>

        {stats && (
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Total Tasks", value: String(stats.total), icon: Target, color: "text-foreground" },
                { label: "Completed", value: String(stats.completed), icon: CheckCircle2, color: "text-chart-1" },
                { label: "Critical Pending", value: String(stats.critical), icon: AlertTriangle, color: stats.critical > 0 ? "text-destructive" : "text-muted-foreground" },
                { label: "Overall Progress", value: `${stats.overallPct}%`, icon: BarChart3, color: "text-primary" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="rounded-xl border-border/30 bg-card/60">
                  <CardContent className="p-2.5 flex items-center gap-2">
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
                    <div>
                      <span className="text-[8px] text-muted-foreground block">{label}</span>
                      <span className={cn("text-[12px] font-bold", color)}>{value}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phases */}
      {phases?.map((phase) => (
        <PhaseSection key={phase.phase_number} phase={phase} onTaskToggle={handleTaskToggle} />
      ))}
    </div>
  );
});

export default GrowthExecutionDashboard;
