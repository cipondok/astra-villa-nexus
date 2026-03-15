import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAISystemHealth } from "@/hooks/useAISystemHealth";
import { Brain, Activity, Clock, CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/utils/dateUtils";

type HealthStatus = "HEALTHY" | "WARNING" | "CRITICAL";
type FreshnessLevel = "FRESH" | "AGING" | "STALE";

const statusConfig: Record<HealthStatus, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  HEALTHY:  { color: "text-chart-1", bg: "bg-chart-1/5", border: "border-chart-1/30", icon: CheckCircle2, label: "All Systems Operational" },
  WARNING:  { color: "text-chart-4", bg: "bg-chart-4/5", border: "border-chart-4/30", icon: AlertTriangle, label: "Partial Degradation" },
  CRITICAL: { color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/30", icon: XCircle, label: "Needs Immediate Attention" },
};

const freshnessConfig: Record<FreshnessLevel, { color: string; dot: string }> = {
  FRESH: { color: "text-chart-1", dot: "bg-chart-1" },
  AGING: { color: "text-chart-4", dot: "bg-chart-4" },
  STALE: { color: "text-destructive", dot: "bg-destructive" },
};

interface AIHealthSummaryCardProps {
  onNavigate?: () => void;
}

const AIHealthSummaryCard = React.memo(function AIHealthSummaryCard({ onNavigate }: AIHealthSummaryCardProps) {
  const { data: health, isLoading } = useAISystemHealth();

  if (isLoading || !health) {
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

  const config = statusConfig[health.ai_health_status];
  const StatusIcon = config.icon;
  const freshConfig = freshnessConfig[health.freshness_state];

  const lastAnalysisDate = health.last_analysis_at ? new Date(health.last_analysis_at) : null;

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
        health.ai_health_status === "HEALTHY" && "from-chart-1/60 via-chart-1/30 to-chart-1/60",
        health.ai_health_status === "WARNING" && "from-chart-4/60 via-chart-4/30 to-chart-4/60",
        health.ai_health_status === "CRITICAL" && "from-destructive/60 via-destructive/30 to-destructive/60",
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
            {health.coverage_rate.toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Status banner */}
        <div className={cn("flex items-center gap-2 p-2 rounded-lg border", config.bg, config.border)}>
          <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
          <span className="text-[10px] font-medium">{config.label}</span>
        </div>

        {/* AI Coverage bar */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1 cursor-default">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">AI Coverage</span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    health.coverage_rate >= 70 ? "text-chart-1" :
                    health.coverage_rate >= 40 ? "text-chart-4" :
                    "text-destructive"
                  )}>
                    {health.coverage_rate.toFixed(0)}%
                  </span>
                </div>
                <Progress value={health.coverage_rate} className="h-1.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-[10px] max-w-[200px]">
              {health.scored_listings.toLocaleString()} of {health.total_listings.toLocaleString()} listings scored
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Freshness + last analysis */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Intel:
            <span className={cn("font-semibold flex items-center gap-1", freshConfig.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full inline-block", freshConfig.dot)} />
              {health.freshness_state}
            </span>
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastAnalysisDate ? formatDistanceToNow(lastAnalysisDate) : "Never"}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {health.total_listings.toLocaleString()} listings tracked
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

export default AIHealthSummaryCard;
