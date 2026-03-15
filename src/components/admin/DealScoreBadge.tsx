import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { generateDealConfidenceBadge, type DealConfidenceBadgeVariant } from "@/hooks/useDealConfidenceBadge";
import { TrendingUp } from "lucide-react";

const variantColors: Record<DealConfidenceBadgeVariant, string> = {
  hot:     "bg-chart-1/15 text-chart-1 border-chart-1/30",
  strong:  "bg-chart-2/15 text-chart-2 border-chart-2/30",
  stable:  "bg-chart-3/15 text-chart-3 border-chart-3/30",
  caution: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  cold:    "bg-chart-5/15 text-chart-5 border-chart-5/30",
};

interface DealScoreBadgeProps {
  score: number | null | undefined;
  recommendation?: string;
  /** Compact mode for card overlays */
  compact?: boolean;
  className?: string;
}

const DealScoreBadge = ({ score, recommendation, compact = false, className }: DealScoreBadgeProps) => {
  if (score == null) {
    return compact ? null : (
      <span className="text-[10px] text-muted-foreground">—</span>
    );
  }

  const badge = generateDealConfidenceBadge(score);
  const colorClass = variantColors[badge.variant];

  const badgeElement = (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold cursor-default",
        colorClass,
        compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5",
        className,
      )}
    >
      {badge.emoji} {score}
    </Badge>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
        <TooltipContent side="left" className="max-w-[240px] space-y-1 p-3">
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            {badge.label}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Score: {score}/100</span>
            <span>•</span>
            <span className="capitalize">{badge.variant}</span>
          </div>
          {recommendation && (
            <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-1 mt-1">
              {recommendation}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DealScoreBadge;
