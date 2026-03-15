import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIReadinessScore } from "@/hooks/useAIHealthMetrics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Activity, Clock, CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/utils/dateUtils";

type HealthStatus = "healthy" | "warning" | "critical";
type FreshnessLevel = "fresh" | "aging" | "stale";

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

function deriveFreshness(lastAnalysisDate: Date | null): { level: FreshnessLevel; label: string } {
  if (!lastAnalysisDate) return { level: "stale", label: "No data" };
  const hoursAgo = (Date.now() - lastAnalysisDate.getTime()) / (1000 * 60 * 60);
  if (hoursAgo <= 6) return { level: "fresh", label: "Fresh" };
  if (hoursAgo <= 24) return { level: "aging", label: "Aging" };
  return { level: "stale", label: "Stale" };
}

const statusConfig: Record<HealthStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  healthy:  { color: "text-chart-1", bg: "bg-chart-1/5", border: "border-chart-1/30", icon: CheckCircle2 },
  warning:  { color: "text-chart-4", bg: "bg-chart-4/5", border: "border-chart-4/30", icon: AlertTriangle },
  critical: { color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/30", icon: XCircle },
};

const freshnessConfig: Record<FreshnessLevel, { color: string; dot: string }> = {
  fresh: { color: "text-chart-1", dot: "bg-chart-1" },
  aging: { color: "text-chart-4", dot: "bg-chart-4" },
  stale: { color: "text-destructive", dot: "bg-destructive" },
};

function useLastAIAnalysis() {
  return useQuery({
    queryKey: ['last-ai-analysis-time'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_jobs')
        .select('completed_at')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0]?.completed_at ? new Date(data[0].completed_at) : null;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

interface AIHealthSummaryCardProps {
  onNavigate?: () => void;
}

const AIHealthSummaryCard = React.memo(function AIHealthSummaryCard({ onNavigate }: AIHealthSummaryCardProps) {
  const { data: readiness, isLoading } = useAIReadinessScore();
  const { data: lastAnalysis } = useLastAIAnalysis();

  if (isLoading || !readiness) {
    return (
      <Card className="rounded-2xl border-border/30 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
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

  const freshness = deriveFreshness(lastAnalysis ?? null);
  const freshConfig = freshnessConfig[freshness.level];

  const metrics = [
    {
      label: "AI Coverage",
      value: readiness.coverage_scored,
      tooltip: `${readiness.coverage_scored.toFixed(1)}% of listings have deal_probability_score`,
    },
    {
      label: "Job Success Rate",
      value: readiness.job_success_rate,
      tooltip: `${readiness.job_success_rate.toFixed(1)}% of recent AI jobs completed successfully`,
    },
  ];

  return (
    <Card
      className={cn(
        "rounded-2xl border-border/30 overflow-hidden cursor-pointer transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        "bg-card/80 backdrop-blur-sm"
      )}
      onClick={onNavigate}
    >
      {/* Gradient top border accent */}
      <div className={cn(
        "h-1 bg-gradient-to-r",
        status === "healthy" && "from-chart-1/60 via-chart-1/30 to-chart-1/60",
        status === "warning" && "from-chart-4/60 via-chart-4/30 to-chart-4/60",
        status === "critical" && "from-destructive/60 via-destructive/30 to-destructive/60",
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Brain className="h-3.5 w-3.5" /> AI System Health
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
        {/* Status banner */}
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

        {/* Freshness indicator + last analysis */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Intel:
            <span className={cn("font-semibold flex items-center gap-1", freshConfig.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full inline-block", freshConfig.dot)} />
              {freshness.label}
            </span>
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastAnalysis ? formatDistanceToNow(lastAnalysis) : "Never"}
          </span>
        </div>

        {/* Footer: total properties */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {readiness.total_properties.toLocaleString()} listings tracked
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

export default AIHealthSummaryCard;
