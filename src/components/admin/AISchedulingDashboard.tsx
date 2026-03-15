import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScheduledJobs, useToggleScheduledJob } from "@/hooks/useScheduledJobs";
import { useAISystemHealth } from "@/hooks/useAISystemHealth";
import {
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/utils/dateUtils";

const statusStyles: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  idle:      { color: "text-muted-foreground", bg: "bg-muted/10", icon: Clock },
  triggered: { color: "text-chart-1", bg: "bg-chart-1/10", icon: CheckCircle2 },
  skipped:   { color: "text-muted-foreground", bg: "bg-muted/10", icon: RefreshCw },
  error:     { color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
};

const freshnessStyles: Record<string, { color: string; bg: string; label: string }> = {
  FRESH:  { color: "text-chart-1", bg: "bg-chart-1/10", label: "Fresh" },
  AGING:  { color: "text-chart-3", bg: "bg-chart-3/10", label: "Aging" },
  STALE:  { color: "text-destructive", bg: "bg-destructive/10", label: "Stale" },
};

function getRowColor(job: { enabled: boolean; retry_count: number; last_status: string }) {
  if (!job.enabled) return "border-destructive/20 bg-destructive/5";
  if (job.retry_count > 0) return "border-chart-3/20 bg-chart-3/5";
  if (job.last_status === "triggered") return "border-chart-1/20 bg-chart-1/5";
  return "border-border/20 bg-card/50";
}

const AISchedulingDashboard = React.memo(function AISchedulingDashboard() {
  const { data: jobs, isLoading } = useScheduledJobs();
  const toggleJob = useToggleScheduledJob();
  const { data: health } = useAISystemHealth();

  const freshness = health?.freshness_state || "FRESH";
  const fStyle = freshnessStyles[freshness] || freshnessStyles.FRESH;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className="h-1 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Calendar className="h-3.5 w-3.5" /> AI Scheduling
          </span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] h-5 px-2 gap-1", fStyle.color, fStyle.bg)}
                >
                  <Shield className="h-3 w-3" />
                  {fStyle.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-[10px]">
                Staleness Guard: Intelligence is {freshness.toLowerCase()}
                {health?.hours_since_update != null && ` (${health.hours_since_update.toFixed(1)}h ago)`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : !jobs?.length ? (
          <p className="text-[10px] text-muted-foreground text-center py-3">No schedules configured</p>
        ) : (
          <TooltipProvider delayDuration={100}>
            {jobs.map((job) => {
              const st = statusStyles[job.last_status] || statusStyles.idle;
              const StIcon = st.icon;
              return (
                <div
                  key={job.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                    getRowColor(job)
                  )}
                >
                  <Switch
                    checked={job.enabled}
                    onCheckedChange={(enabled) => toggleJob.mutate({ id: job.id, enabled })}
                    className="scale-75"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-[11px] font-medium truncate", !job.enabled && "line-through text-muted-foreground")}>
                        {job.name}
                      </span>
                      {job.retry_count > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-[8px] h-4 px-1 text-chart-3 border-chart-3/30 bg-chart-3/10">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                              {job.retry_count}/{job.max_retries}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-[10px] max-w-48">
                            {job.last_error || "Retry in progress"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground font-mono">{job.cron_expression}</span>
                      {job.next_run_at && job.enabled && (
                        <span className="text-[9px] text-muted-foreground">
                          Next: {formatDistanceToNow(new Date(job.next_run_at))}
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn("text-[8px] h-4 px-1.5 gap-0.5 shrink-0", st.color, st.bg)}
                  >
                    <StIcon className="h-2.5 w-2.5" />
                    {job.last_status}
                  </Badge>
                </div>
              );
            })}
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
});

export default AISchedulingDashboard;
