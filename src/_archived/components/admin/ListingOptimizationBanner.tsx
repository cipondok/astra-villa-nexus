import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useListingOptimizationAlerts } from "@/hooks/useListingOptimizationAlerts";
import {
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const levels = [
  {
    key: "critical" as const,
    label: "Critical",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    barColor: "bg-destructive",
  },
  {
    key: "warning" as const,
    label: "Warning",
    icon: AlertTriangle,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/30",
    barColor: "bg-chart-4",
  },
  {
    key: "healthy" as const,
    label: "Healthy",
    icon: CheckCircle2,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    border: "border-chart-1/30",
    barColor: "bg-chart-1",
  },
] as const;

interface ListingOptimizationBannerProps {
  onViewCritical?: () => void;
}

const ListingOptimizationBanner = React.memo(function ListingOptimizationBanner({
  onViewCritical,
}: ListingOptimizationBannerProps) {
  const { data: alerts, isLoading } = useListingOptimizationAlerts();

  if (isLoading || !alerts) {
    return (
      <div className="space-y-2 mb-4">
        <div className="h-12 bg-muted/50 animate-pulse rounded-xl" />
      </div>
    );
  }

  // Don't show if everything is healthy
  const showBanner = alerts.critical_count > 0 || alerts.warning_count > 0;

  const counts: Record<string, number> = {
    critical: alerts.critical_count,
    warning: alerts.warning_count,
    healthy: alerts.healthy_count,
  };

  const total = alerts.total_listings || 1;

  // Determine dominant alert level for the insight banner
  const dominant =
    alerts.critical_count > 0
      ? levels[0]
      : alerts.warning_count > 0
      ? levels[1]
      : levels[2];
  const DominantIcon = dominant.icon;

  const isPriority = alerts.priority_action.startsWith("PRIORITY");

  return (
    <div className="space-y-2 mb-4">
      {/* Stacked alert level bars */}
      <div className="flex gap-2">
        <TooltipProvider delayDuration={150}>
          {levels.map((level) => {
            const count = counts[level.key];
            const pct = Math.round((count / total) * 100);
            const Icon = level.icon;
            return (
              <Tooltip key={level.key}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-default",
                      level.bg,
                      level.border,
                      level.key === "critical" && count > 0 && "ring-1 ring-destructive/20"
                    )}
                    style={{ flex: Math.max(pct, 15) }}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", level.color)} />
                    <div className="min-w-0">
                      <p className={cn("text-sm font-bold leading-none", level.color)}>
                        {count}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {level.label}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px] max-w-[200px]">
                  {count} of {total} listings ({pct}%) are {level.label.toLowerCase()}
                  {level.key === "critical" &&
                    " — deal score < 30 or SEO score < 40"}
                  {level.key === "warning" &&
                    " — deal score 30–50 or SEO score 40–60"}
                  {level.key === "healthy" &&
                    " — deal score > 50 and SEO score > 60"}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Insight + action banner — only show when issues exist */}
      {showBanner && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border",
            dominant.bg,
            dominant.border
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <DominantIcon className={cn("h-4 w-4 shrink-0", dominant.color)} />
            <p className="text-[11px] text-foreground truncate">
              {alerts.insight_message}
            </p>
          </div>

          {onViewCritical && alerts.critical_count > 0 && (
            <button
              onClick={onViewCritical}
              className={cn(
                "flex items-center gap-1 text-[10px] font-medium shrink-0 px-2 py-1 rounded-lg transition-colors",
                "hover:bg-destructive/20 text-destructive"
              )}
            >
              View Critical
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Priority action hint */}
      {isPriority && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5">
          <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-foreground leading-snug">
            {alerts.priority_action}
          </p>
        </div>
      )}
    </div>
  );
});

export default ListingOptimizationBanner;
