import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

type ConfidenceTier = "hot" | "strong" | "stable" | "caution" | "cold";

function getTier(score: number): { tier: ConfidenceTier; emoji: string; label: string } {
  if (score >= 85) return { tier: "hot", emoji: "🔥", label: "FAST SELLING LISTING" };
  if (score >= 70) return { tier: "strong", emoji: "💎", label: "STRONG BUYER INTEREST" };
  if (score >= 50) return { tier: "stable", emoji: "📊", label: "STABLE MARKET LISTING" };
  if (score >= 30) return { tier: "caution", emoji: "⚠️", label: "NEEDS PRICE ADJUSTMENT" };
  return { tier: "cold", emoji: "❄️", label: "LOW MARKET RESPONSE" };
}

const tierColors: Record<ConfidenceTier, { pill: string; glow: string }> = {
  hot:     { pill: "text-chart-1 border-chart-1/40 shadow-chart-1/20", glow: "shadow-[0_0_8px_hsl(var(--chart-1)/0.25)]" },
  strong:  { pill: "text-chart-2 border-chart-2/40 shadow-chart-2/20", glow: "shadow-[0_0_8px_hsl(var(--chart-2)/0.25)]" },
  stable:  { pill: "text-chart-3 border-chart-3/40 shadow-chart-3/20", glow: "shadow-[0_0_8px_hsl(var(--chart-3)/0.20)]" },
  caution: { pill: "text-chart-4 border-chart-4/40 shadow-chart-4/20", glow: "shadow-[0_0_8px_hsl(var(--chart-4)/0.20)]" },
  cold:    { pill: "text-destructive border-destructive/40 shadow-destructive/20", glow: "shadow-[0_0_8px_hsl(var(--destructive)/0.20)]" },
};

interface DealScoreBadgeProps {
  score: number | null | undefined;
  label?: string;
  recommendation?: string;
  /** Compact mode for card overlays */
  compact?: boolean;
  className?: string;
}

const DealScoreBadge = ({ score, label, recommendation, compact = false, className }: DealScoreBadgeProps) => {
  if (score == null) {
    return compact ? null : (
      <span className="text-[10px] text-muted-foreground">—</span>
    );
  }

  const { tier, emoji, label: tierLabel } = getTier(score);
  const displayLabel = label || tierLabel;
  const colors = tierColors[tier];

  const pill = (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border font-semibold",
        "bg-card/80 backdrop-blur-sm",
        colors.pill,
        colors.glow,
        compact
          ? "text-[9px] px-1.5 py-0.5 leading-tight"
          : "text-[10px] px-2 py-0.5",
        className,
      )}
    >
      <span className="leading-none">{emoji}</span>
      <span>{score}</span>
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="cursor-default focus:outline-none">
            {pill}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={compact ? "bottom" : "left"}
          className="max-w-[240px] space-y-1.5 p-3"
        >
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 shrink-0" />
            {displayLabel}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Score: {score}/100</span>
            <span>•</span>
            <span className="capitalize">{tier}</span>
          </div>
          {recommendation && (
            <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-1.5 mt-1 line-clamp-3">
              {recommendation}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DealScoreBadge;
