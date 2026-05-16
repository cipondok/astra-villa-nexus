import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAIJobObservability } from "@/hooks/useAIJobObservability";
import {
  Eye,
  Activity,
  Layers,
  XCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Gauge,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/utils/dateUtils";

const throughputConfig = {
  high:       { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "High Throughput", icon: Activity },
  normal:     { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30", label: "Normal", icon: Gauge },
  bottleneck: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Bottleneck", icon: AlertTriangle },
};

const jobTypeLabels: Record<string, string> = {
  investment_analysis: "AI Analysis",
  demand_signal_refresh: "Demand Refresh",
  market_intelligence_update: "Market Intel",
  seo_scan: "SEO Scan",
  seo_optimize: "SEO Optimize",
  calculate_investment_scores: "Inv. Scores",
  update_roi_forecasts: "ROI Forecast",
  detect_investment_hotspots: "Hotspots",
  update_market_insights: "Market Insights",
  deal_hunter_scan: "Deal Hunter",
  compute_investor_dna: "Investor DNA",
};

function shortLabel(jobType: string): string {
  return jobTypeLabels[jobType] || jobType.replace(/_/g, " ").slice(0, 18);
}

const AIJobObservabilityPanel = React.memo(function AIJobObservabilityPanel() {
  const { data, isLoading } = useAIJobObservability();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || !data) {
    return (
      <Card className="rounded-2xl border-border/30 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tpCfg = throughputConfig[data.throughput_status];
  const TpIcon = tpCfg.icon;
  const hasRunning = data.running_jobs.length > 0;
  const hasFailed = data.failed_recent.length > 0;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        data.throughput_status === "bottleneck"
          ? "from-destructive/50 via-destructive/25 to-destructive/50"
          : data.throughput_status === "high"
            ? "from-chart-1/50 via-chart-1/25 to-chart-1/50"
            : "from-primary/30 via-accent/20 to-primary/30"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Eye className="h-3.5 w-3.5" /> Job Observability
          </span>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn("text-[10px] h-5 px-2 gap-1", tpCfg.color, tpCfg.bg, tpCfg.border)}
            >
              <TpIcon className={cn("h-3 w-3", data.throughput_status === "bottleneck" && "animate-pulse")} />
              {tpCfg.label}
            </Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 rounded hover:bg-muted/50 transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Top metrics row */}
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-4 gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-1.5 rounded-lg border border-border/20 bg-card/50">
                  <Activity className={cn("h-3 w-3 mb-0.5", hasRunning ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-semibold text-foreground">{data.running_jobs.length}</span>
                  <span className="text-[8px] text-muted-foreground">Running</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">Active jobs being processed</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex flex-col items-center p-1.5 rounded-lg border",
                  data.pending_count > 5 ? "border-chart-3/30 bg-chart-3/5" : "border-border/20 bg-card/50"
                )}>
                  <Layers className={cn("h-3 w-3 mb-0.5", data.pending_count > 5 ? "text-chart-3" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-semibold", data.pending_count > 5 ? "text-chart-3" : "text-foreground")}>{data.pending_count}</span>
                  <span className="text-[8px] text-muted-foreground">Queued</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">Pending jobs in queue</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-1.5 rounded-lg border border-border/20 bg-card/50">
                  <CheckCircle2 className="h-3 w-3 mb-0.5 text-chart-1" />
                  <span className="text-sm font-semibold text-foreground">{data.completed_1h}</span>
                  <span className="text-[8px] text-muted-foreground">Done/1h</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">Completed in last hour</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex flex-col items-center p-1.5 rounded-lg border",
                  data.failed_1h > 0 ? "border-destructive/30 bg-destructive/5" : "border-border/20 bg-card/50"
                )}>
                  <XCircle className={cn("h-3 w-3 mb-0.5", data.failed_1h > 0 ? "text-destructive" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-semibold", data.failed_1h > 0 ? "text-destructive" : "text-foreground")}>{data.failed_1h}</span>
                  <span className="text-[8px] text-muted-foreground">Failed/1h</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">Failed in last hour</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Intelligence Coverage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Intelligence Coverage
            </span>
            <span className={cn(
              "text-[10px] font-semibold",
              data.coverage_percent >= 80 ? "text-chart-1" : data.coverage_percent >= 50 ? "text-chart-3" : "text-destructive"
            )}>
              {data.coverage_percent}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all rounded-full",
                data.coverage_percent >= 80 ? "bg-chart-1" : data.coverage_percent >= 50 ? "bg-chart-3" : "bg-destructive"
              )}
              style={{ width: `${data.coverage_percent}%` }}
            />
          </div>
          <span className="text-[8px] text-muted-foreground">
            {data.scored_listings.toLocaleString()} / {data.total_listings.toLocaleString()} listings scored
          </span>
        </div>

        {/* Expandable section */}
        {expanded && (
          <div className="space-y-2.5 pt-1 border-t border-border/30">
            {/* Running jobs */}
            {hasRunning && (
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">Active Jobs</span>
                {data.running_jobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-primary/5 border border-primary/20">
                    <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium truncate">{shortLabel(job.job_type)}</span>
                        <span className="text-[9px] text-primary font-semibold">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-1 mt-0.5" />
                    </div>
                    <span className="text-[8px] text-muted-foreground shrink-0">
                      {job.started_at ? formatDistanceToNow(new Date(job.started_at)) : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent failures */}
            {hasFailed && (
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">Recent Failures</span>
                {data.failed_recent.map((job) => (
                  <div key={job.id} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-destructive/5 border border-destructive/20">
                    <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium text-destructive">{shortLabel(job.job_type)}</span>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {job.error_message || "Unknown error"}
                      </p>
                    </div>
                    <span className="text-[8px] text-muted-foreground shrink-0">
                      {job.completed_at ? formatDistanceToNow(new Date(job.completed_at)) : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!hasRunning && !hasFailed && (
              <div className="text-center py-2">
                <CheckCircle2 className="h-4 w-4 text-chart-1 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">All systems nominal — no active or failed jobs</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default AIJobObservabilityPanel;
