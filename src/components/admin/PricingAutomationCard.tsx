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
  usePricingAutomation,
  type PricingAdjustment,
  type PricingSignal,
  type ConfidenceLevel,
} from "@/hooks/usePricingAutomation";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const signalConfig: Record<PricingSignal, { icon: typeof TrendingDown; color: string; bg: string; border: string; label: string }> = {
  REDUCE_PRICE:   { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Reduce" },
  INCREASE_PRICE: { icon: TrendingUp, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Increase" },
  MAINTAIN_PRICE: { icon: Minus, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Maintain" },
};

const confIcons: Record<ConfidenceLevel, typeof ShieldCheck> = {
  HIGH: ShieldCheck,
  MODERATE: Shield,
  LOW: ShieldAlert,
};

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return String(price);
}

function AdjustmentRow({ adj }: { adj: PricingAdjustment }) {
  const sc = signalConfig[adj.pricing_adjustment_signal];
  const Icon = sc.icon;
  const ConfIcon = confIcons[adj.confidence_level];

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-default", sc.border, sc.bg)}>
            {/* Signal icon */}
            <div className={cn("p-1 rounded-md shrink-0", sc.bg)}>
              <Icon className={cn("h-3.5 w-3.5", sc.color)} />
            </div>

            {/* Title + city */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold truncate block">{adj.title}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{adj.city}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] font-medium text-foreground">Rp {formatPrice(adj.price)}</span>
                {adj.days_on_market > 0 && (
                  <>
                    <span className="text-[9px] text-muted-foreground">·</span>
                    <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">{adj.days_on_market}d</span>
                  </>
                )}
              </div>
            </div>

            {/* Signal + confidence badges */}
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 font-bold", sc.color, sc.bg, sc.border)}>
                {sc.label}
              </Badge>
              <ConfIcon className={cn(
                "h-3 w-3",
                adj.confidence_level === 'HIGH' ? "text-chart-1" :
                adj.confidence_level === 'MODERATE' ? "text-chart-4" : "text-muted-foreground"
              )} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[280px] text-[10px] space-y-1.5">
          <p className="font-medium">Market Reasoning:</p>
          <p>{adj.market_reasoning}</p>
          <div className="flex gap-2 flex-wrap pt-1">
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Deal: {adj.metrics.deal_score} (trend: {adj.metrics.deal_trend > 0 ? '+' : ''}{adj.metrics.deal_trend})</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Demand: {adj.metrics.demand_signal} (mom: {adj.metrics.demand_momentum > 0 ? '+' : ''}{adj.metrics.demand_momentum})</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Liquidity: {adj.metrics.liquidity}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Stability: {adj.metrics.stability_index}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const PricingAutomationCard = React.memo(function PricingAutomationCard() {
  const { data, isLoading } = usePricingAutomation(12);
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

  const visible = expanded ? data.adjustments : data.adjustments.slice(0, 4);

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        data.reduce_count > 0
          ? "from-destructive/40 via-chart-4/20 to-chart-1/20"
          : data.increase_count > 0
            ? "from-chart-1/40 via-primary/25 to-chart-4/20"
            : "from-chart-4/30 via-muted/20 to-chart-4/30"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Zap className="h-3.5 w-3.5" /> Pricing Automation
          </span>
          <div className="flex items-center gap-1.5">
            {data.reduce_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-destructive bg-destructive/10 border-destructive/30">
                <TrendingDown className="h-3 w-3" /> {data.reduce_count}
              </Badge>
            )}
            {data.increase_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-1 bg-chart-1/10 border-chart-1/30">
                <TrendingUp className="h-3 w-3" /> {data.increase_count}
              </Badge>
            )}
            {data.maintain_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 text-chart-4 bg-chart-4/10 border-chart-4/30">
                {data.maintain_count} Stable
              </Badge>
            )}
            {data.total > 4 && (
              <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-muted/50 transition-colors">
                {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {data.total > 0 ? (
          <>
            {visible.map((adj, i) => (
              <AdjustmentRow key={`${adj.listing_id}-${i}`} adj={adj} />
            ))}
            {!expanded && data.total > 4 && (
              <button onClick={() => setExpanded(true)} className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1">
                +{data.total - 4} more listings
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <Zap className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">No pricing adjustments detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default PricingAutomationCard;
