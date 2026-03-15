import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJobQueueHealth } from "@/hooks/useJobQueueHealth";
import {
  Shield,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const healthConfig = {
  healthy:  { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", icon: CheckCircle2, label: "Healthy", gradient: "from-chart-1/40 via-chart-1/20 to-chart-1/40" },
  degraded: { color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", icon: AlertTriangle, label: "Degraded", gradient: "from-chart-3/40 via-chart-3/20 to-chart-3/40" },
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: XCircle, label: "Critical", gradient: "from-destructive/40 via-destructive/20 to-destructive/40" },
};

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

const JobQueueHealthCard = React.memo(function JobQueueHealthCard() {
  const { data: health, isLoading } = useJobQueueHealth();

  if (isLoading || !health) {
    return (
      <Card className="rounded-2xl border-border/30 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const cfg = healthConfig[health.health_status];
  const StatusIcon = cfg.icon;
  const throughput = health.completed_last_hour + health.failed_last_hour;
  const successRate = throughput > 0 ? Math.round((health.completed_last_hour / throughput) * 100) : 100;

  const metrics = [
    { icon: Layers, label: "Pending", value: health.pending_count, warn: health.pending_count > 5 },
    { icon: Activity, label: "Running", value: health.running_count, warn: false },
    { icon: CheckCircle2, label: "Done/1h", value: health.completed_last_hour, warn: false },
    { icon: XCircle, label: "Failed/1h", value: health.failed_last_hour, warn: health.failed_last_hour > 0 },
  ];

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn("h-1 bg-gradient-to-r", cfg.gradient)} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Shield className="h-3.5 w-3.5" /> Job Queue Watchdog
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1", cfg.color, cfg.bg, cfg.border)}
          >
            <StatusIcon className={cn("h-3 w-3", health.health_status === "critical" && "animate-pulse")} />
            {cfg.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Metrics grid */}
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-4 gap-1.5">
            {metrics.map((m) => (
              <Tooltip key={m.label}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex flex-col items-center p-1.5 rounded-lg border transition-colors",
                    m.warn ? "border-chart-3/30 bg-chart-3/5" : "border-border/20 bg-card/50"
                  )}>
                    <m.icon className={cn("h-3 w-3 mb-0.5", m.warn ? "text-chart-3" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-semibold", m.warn ? "text-chart-3" : "text-foreground")}>{m.value}</span>
                    <span className="text-[8px] text-muted-foreground">{m.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  {m.label}: {m.value} jobs
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Throughput & queue age */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">
              Throughput: {throughput}/h · {successRate}% success
            </span>
          </div>
          {health.queue_delayed && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-chart-3" />
              <span className="text-[9px] text-chart-3 font-medium">
                Wait: {formatAge(health.oldest_pending_age_seconds)}
              </span>
            </div>
          )}
        </div>

        {/* Stalled job warning */}
        {health.stalled_failed > 0 && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg border border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
            <p className="text-[9px] text-destructive">
              {health.stalled_failed} job(s) stalled &gt;15min — watchdog monitoring active
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default JobQueueHealthCard;
