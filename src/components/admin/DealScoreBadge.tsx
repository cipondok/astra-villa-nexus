import { memo, useMemo, useState } from "react";
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

const tierStyles: Record<ConfidenceTier, string> = {
  hot:     "text-chart-1 border-chart-1/40",
  strong:  "text-chart-2 border-chart-2/40",
  stable:  "text-chart-3 border-chart-3/40",
  caution: "text-chart-4 border-chart-4/40",
  cold:    "text-destructive border-destructive/40",
};

const tierHoverGlow: Record<ConfidenceTier, string> = {
  hot:     "",
  strong:  "",
  stable:  "",
  caution: "",
  cold:    "",
};

export interface DealScoreBadgeProps {
  score: number | null | undefined;
  label?: string;
  recommendation?: string;
  /** Compact mode for card overlays */
  compact?: boolean;
  className?: string;
}

const DealScoreBadge = memo(function DealScoreBadge({
  score,
  label,
  recommendation,
  compact = false,
  className,
}: DealScoreBadgeProps) {
  // Hooks must be called before early returns
  const [hasHovered, setHasHovered] = useState(false);
  const tierData = useMemo(() => (score != null ? getTier(score) : null), [score]);

  if (score == null || !tierData) {
    return compact ? null : (
      <span className="text-[10px] text-muted-foreground">—</span>
    );
  }

  const { tier, emoji, label: tierLabel } = tierData;
  const displayLabel = label || tierLabel;

  const pill = (
    <div
      className={cn(
        // Layout
        "inline-flex items-center gap-1 rounded-xl border font-semibold",
        // Glass background — works on both light & dark over images
        "bg-card/80 backdrop-blur-sm",
        // Tier color + subtle resting glow
        tierStyles[tier],
        // Hover: slightly brighter glow + micro-scale
        tierHoverGlow[tier],
        "hover:scale-105 active:scale-100",
        // Smooth transitions for glow + scale
        "transition-[transform,box-shadow] duration-200 ease-out",
        // Entrance fade-in via CSS animation
        compact && "animate-in fade-in-0 zoom-in-95 duration-300",
        // Size variants
        compact
          ? "text-[9px] px-1.5 py-0.5 leading-tight"
          : "text-[10px] px-2 py-0.5",
        className,
      )}
    >
      <span className="leading-none" aria-hidden>{emoji}</span>
      <span>{score}</span>
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="cursor-default focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xl"
            onMouseEnter={() => { if (!hasHovered) setHasHovered(true); }}
            onFocus={() => { if (!hasHovered) setHasHovered(true); }}
            aria-label={`AI Deal Score: ${score} — ${displayLabel}`}
          >
            {pill}
          </button>
        </TooltipTrigger>
        {hasHovered && (
          <TooltipContent
            side={compact ? "bottom" : "left"}
            align="end"
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
        )}
      </Tooltip>
    </TooltipProvider>
  );
});

export default DealScoreBadge;
