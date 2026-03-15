import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIReadinessScore } from "@/hooks/useAIHealthMetrics";
import { Brain, Activity, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "warning" | "critical";

function deriveStatus(readiness: {
  readiness_score: number;
  job_success_rate: number;
  freshness_avg: number;
}): { status: HealthStatus; label: string } {
  if (readiness.readiness_score >= 75 && readiness.job_success_rate >= 90 && readiness.freshness_avg >= 70) {
    return { status: "healthy", label: "All Systems Operational" };
  }
  if (readiness.readiness_score >= 40 || readiness.job_success_rate >= 60) {
    return { status: "warning", label: "Partial Degradation" };
  }
  return { status: "critical", label: "Needs Immediate Attention" };
}

const statusConfig: Record<HealthStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  healthy:  { color: "text-chart-1", bg: "bg-chart-1/5", border: "border-chart-1/30", icon: CheckCircle2 },
  warning:  { color: "text-chart-4", bg: "bg-chart-4/5", border: "border-chart-4/30", icon: AlertTriangle },
  critical: { color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/30", icon: XCircle },
};

interface AIHealthSummaryCardProps {
  onNavigate?: () => void;
}

const AIHealthSummaryCard = React.memo(function AIHealthSummaryCard({ onNavigate }: AIHealthSummaryCardProps) {
  const { data: readiness, isLoading } = useAIReadinessScore();

  if (isLoading || !readiness) {
    return (
      <Card className="border-border/30">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-2 w-full bg-muted animate-pulse rounded" />
            <div className="h-2 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, label } = deriveStatus(readiness);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const metrics = [
    {
      label: "Listings Scored",
      value: readiness.coverage_scored,
      tooltip: `${readiness.coverage_scored.toFixed(1)}% of listings have AI deal scores`,
    },
    {
      label: "Job Success Rate",
      value: readiness.job_success_rate,
      tooltip: `${readiness.job_success_rate.toFixed(1)}% of AI jobs completed successfully`,
    },
    {
      label: "Intel Freshness",
      value: readiness.freshness_avg,
      tooltip: `${readiness.freshness_avg.toFixed(1)}% of intelligence data is within freshness window`,
    },
  ];

  return (
    <Card
      className={cn(
        "border-border/30 cursor-pointer hover:border-primary/30 transition-colors",
        onNavigate && "hover:shadow-sm"
      )}
      onClick={onNavigate}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Brain className="h-3.5 w-3.5" /> AI Intelligence
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1", config.color, config.bg, config.border)}
          >
            <StatusIcon className="h-3 w-3" />
            {readiness.readiness_score.toFixed(0)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Overall status banner */}
        <div className={cn("flex items-center gap-2 p-2 rounded-lg border", config.bg, config.border)}>
          <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
          <span className="text-[10px] font-medium">{label}</span>
        </div>

        {/* Metric bars */}
        <TooltipProvider delayDuration={200}>
          {metrics.map((metric) => (
            <Tooltip key={metric.label}>
              <TooltipTrigger asChild>
                <div className="space-y-1 cursor-default">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{metric.label}</span>
                    <span className={cn(
                      "text-[10px] font-bold",
                      metric.value >= 75 ? "text-chart-1" :
                      metric.value >= 40 ? "text-chart-4" :
                      "text-destructive"
                    )}>
                      {metric.value.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-1.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-[10px] max-w-[200px]">
                {metric.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {/* Footer: total properties + freshness timestamp */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {readiness.total_properties.toLocaleString()} properties
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Live
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

export default AIHealthSummaryCard;
