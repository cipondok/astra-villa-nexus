import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useInvestmentAttractiveness,
  type InvestmentRanking,
  type OpportunityLevel,
  type InvestorAction,
} from "@/hooks/useInvestmentAttractiveness";
import {
  Crown,
  TrendingUp,
  Shield,
  AlertTriangle,
  Gem,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Crosshair,
  Clock,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const oppConfig: Record<OpportunityLevel, { icon: typeof Crown; color: string; bg: string; border: string; label: string }> = {
  PRIME_INVESTMENT:  { icon: Crown, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Prime" },
  HIGH_POTENTIAL:    { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "High Potential" },
  STABLE_OPTION:     { icon: Shield, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Stable" },
  SPECULATIVE_RISK:  { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Speculative" },
};

const actionConfig: Record<InvestorAction, { icon: typeof Crosshair; color: string; label: string }> = {
  ACQUIRE_NOW:     { icon: Crosshair, color: "text-chart-1", label: "Acquire" },
  MONITOR_ENTRY:   { icon: Clock, color: "text-chart-4", label: "Monitor" },
  LONG_TERM_HOLD:  { icon: Bookmark, color: "text-muted-foreground", label: "Hold" },
};

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return String(price);
}

function RankingRow({ ranking, rank }: { ranking: InvestmentRanking; rank: number }) {
  const oc = oppConfig[ranking.opportunity_level];
  const ac = actionConfig[ranking.investor_action_signal];
  const Icon = oc.icon;
  const ActionIcon = ac.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-default",
            oc.border, oc.bg
          )}>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground w-4 text-right">#{rank}</span>
              <div className={cn("p-1 rounded-md", oc.bg)}>
                <Icon className={cn("h-3.5 w-3.5", oc.color)} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold truncate">{ranking.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 font-bold", oc.color, oc.bg, oc.border)}>
                    {ranking.investment_rank_score}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", oc.color, oc.bg, oc.border)}>
                    {oc.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{ranking.city}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] font-medium text-foreground">Rp {formatPrice(ranking.price)}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <ActionIcon className={cn("h-2.5 w-2.5", ac.color)} />
                <span className={cn("text-[9px] font-medium", ac.color)}>{ac.label}</span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[260px] text-[10px] space-y-1.5">
          <p className="font-medium">Key Strength:</p>
          <p>{ranking.key_strength}</p>
          <div className="flex gap-2 flex-wrap pt-1">
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Growth: {ranking.metrics.growth_score}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Deal: {ranking.metrics.deal_score}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Yield: {ranking.metrics.rental_yield}%</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Liquidity: {ranking.metrics.liquidity_score}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const InvestmentAttractivenessCard = React.memo(function InvestmentAttractivenessCard() {
  const { data, isLoading } = useInvestmentAttractiveness(12);
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

  const hasPrime = data.prime_count > 0;
  const hasRankings = data.total > 0;
  const visible = expanded ? data.rankings : data.rankings.slice(0, 4);

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        hasPrime
          ? "from-chart-1/40 via-primary/25 to-chart-4/20"
          : hasRankings
            ? "from-primary/30 via-chart-4/20 to-muted/20"
            : "from-chart-1/40 via-chart-1/20 to-chart-1/40"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Gem className="h-3.5 w-3.5" /> Investment Ranking
          </span>
          <div className="flex items-center gap-1.5">
            {data.prime_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-1 bg-chart-1/10 border-chart-1/30">
                <Crown className="h-3 w-3" /> {data.prime_count}
              </Badge>
            )}
            {data.high_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-primary bg-primary/10 border-primary/30">
                {data.high_count} High
              </Badge>
            )}
            {(data.stable_count + data.speculative_count) > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 text-muted-foreground">
                {data.stable_count + data.speculative_count} Other
              </Badge>
            )}
            {data.total > 4 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-0.5 rounded hover:bg-muted/50 transition-colors"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {hasRankings ? (
          <>
            {visible.map((r, i) => (
              <RankingRow key={`${r.listing_id}-${i}`} ranking={r} rank={i + 1} />
            ))}
            {!expanded && data.total > 4 && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                +{data.total - 4} more listings
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <CheckCircle2 className="h-4 w-4 text-chart-1 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">No rankings available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default InvestmentAttractivenessCard;
