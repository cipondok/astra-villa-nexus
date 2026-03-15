import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import {
  Cpu,
  Play,
  RefreshCw,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/utils/dateUtils";

type BatchStatus = "idle" | "processing" | "completed" | "failed";

const statusConfig: Record<BatchStatus, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  idle:       { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30", icon: Minus, label: "Idle" },
  processing: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: Loader2, label: "Processing" },
  completed:  { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", icon: CheckCircle2, label: "Completed" },
  failed:     { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: XCircle, label: "Failed" },
};

const batchActions = [
  {
    key: "market_analysis",
    jobType: "investment_analysis",
    label: "Full AI Analysis",
    description: "Score all active listings",
    icon: Play,
  },
  {
    key: "demand_signals",
    jobType: "demand_signal_refresh",
    label: "Refresh Demand",
    description: "Recalculate buyer intent",
    icon: RefreshCw,
  },
  {
    key: "market_intelligence",
    jobType: "market_intelligence_update",
    label: "Update Market Intel",
    description: "Growth & liquidity signals",
    icon: BarChart3,
  },
] as const;

function useLatestBatchJob() {
  return useQuery({
    queryKey: ["latest-batch-job"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_jobs")
        .select("id, job_type, status, created_at, completed_at, progress, error_message")
        .in("job_type", ["investment_analysis", "demand_signal_refresh", "market_intelligence_update", "seo_scan"])
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

const AIBatchControlPanel = React.memo(function AIBatchControlPanel() {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { data: latestJob } = useLatestBatchJob();
  const [runningKey, setRunningKey] = useState<string | null>(null);

  const currentStatus: BatchStatus =
    runningKey ? "processing" :
    latestJob?.status === "running" || latestJob?.status === "pending" ? "processing" :
    latestJob?.status === "completed" ? "completed" :
    latestJob?.status === "failed" ? "failed" :
    "idle";

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  const handleTrigger = useCallback(async (actionKey: string, jobType: string) => {
    setRunningKey(actionKey);
    try {
      const { error } = await supabase.from("ai_jobs").insert({
        job_type: jobType,
        status: "pending",
        payload: { triggered_from: "admin_batch_control", triggered_at: new Date().toISOString() },
      });
      if (error) throw error;
      showSuccess("Batch job queued", `${jobType} has been queued for processing`);
      queryClient.invalidateQueries({ queryKey: ["latest-batch-job"] });
    } catch (err: any) {
      showError("Failed to queue job", err.message);
    } finally {
      setTimeout(() => setRunningKey(null), 2000);
    }
  }, [showSuccess, showError, queryClient]);

  const lastRun = latestJob?.completed_at || latestJob?.created_at;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        currentStatus === "processing" && "from-primary/60 via-primary/30 to-primary/60",
        currentStatus === "completed" && "from-chart-1/60 via-chart-1/30 to-chart-1/60",
        currentStatus === "failed" && "from-destructive/60 via-destructive/30 to-destructive/60",
        currentStatus === "idle" && "from-muted-foreground/30 via-muted/20 to-muted-foreground/30",
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Cpu className="h-3.5 w-3.5" /> AI Batch Control
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1", config.color, config.bg, config.border)}
          >
            <StatusIcon className={cn("h-3 w-3", currentStatus === "processing" && "animate-spin")} />
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Action buttons grid */}
        <TooltipProvider delayDuration={150}>
          <div className="space-y-1.5">
            {batchActions.map((action) => {
              const isRunning = runningKey === action.key;
              const ActionIcon = action.icon;
              return (
                <Tooltip key={action.key}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!!runningKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrigger(action.key, action.jobType);
                      }}
                      className={cn(
                        "w-full justify-start gap-2 h-8 text-[11px] border-border/30",
                        "hover:border-primary/30 hover:bg-primary/5",
                        isRunning && "border-primary/30 bg-primary/5"
                      )}
                    >
                      {isRunning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <ActionIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{action.label}</span>
                      <span className="text-muted-foreground ml-auto text-[9px]">{action.description}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-[10px]">
                    Queues a {action.jobType} job for background processing
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Last execution + error */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last: {lastRun ? formatDistanceToNow(new Date(lastRun)) : "Never"}
          </span>
          {latestJob?.job_type && (
            <span className="text-[9px] text-muted-foreground">
              {latestJob.job_type}
            </span>
          )}
        </div>

        {/* Error message if failed */}
        {currentStatus === "failed" && latestJob?.error_message && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg border border-destructive/30 bg-destructive/5">
            <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
            <p className="text-[9px] text-destructive truncate">{latestJob.error_message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default AIBatchControlPanel;
