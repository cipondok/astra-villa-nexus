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
  usePricingIntelligenceDetector,
  type PricingSignal,
} from "@/hooks/usePricingIntelligenceDetector";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const signalConfig = {
  REDUCE_PRICE:   { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Reduce" },
  INCREASE_PRICE: { icon: TrendingUp, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Increase" },
  HOLD_PRICE:     { icon: Minus, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Hold" },
} as const;

const confidenceColors = {
  HIGH:   "text-chart-1",
  MEDIUM: "text-chart-4",
  LOW:    "text-muted-foreground",
} as const;

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return String(price);
}

function SignalRow({ signal }: { signal: PricingSignal }) {
  const cfg = signalConfig[signal.pricing_signal];
  const Icon = cfg.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-default",
            cfg.border, cfg.bg
          )}>
            <div className={cn("p-1 rounded-md shrink-0", cfg.bg)}>
              <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold truncate">{signal.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {signal.adjustment_range !== "0%" && (
                    <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 font-bold", cfg.color, cfg.bg, cfg.border)}>
                      {signal.pricing_signal === "REDUCE_PRICE" ? "−" : "+"}{signal.adjustment_range}
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", cfg.color, cfg.bg, cfg.border)}>
                    {cfg.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{signal.city}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] font-medium text-foreground">Rp {formatPrice(signal.price)}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className={cn("text-[9px] font-medium", confidenceColors[signal.confidence_level])}>
                  {signal.confidence_level} confidence
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[250px] text-[10px] space-y-1.5">
          <p className="font-medium">Market Impact:</p>
          <p>{signal.expected_market_impact}</p>
          <div className="flex gap-2 flex-wrap pt-1">
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Deal: {signal.metrics.deal_score}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Demand: {signal.metrics.demand_signal}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Liquidity: {signal.metrics.liquidity_score}</span>
            {signal.metrics.underval_pct > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-chart-1/20 text-[9px] text-chart-1">Underval: {signal.metrics.underval_pct}%</span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PricingIntelligenceCardProps {
  onNavigate?: () => void;
}

const PricingIntelligenceCard = React.memo(function PricingIntelligenceCard({ onNavigate }: PricingIntelligenceCardProps) {
  const { data, isLoading } = usePricingIntelligenceDetector(12);
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

  const hasReduce = data.reduce_count > 0;
  const hasSignals = data.total_signals > 0;
  const visibleSignals = expanded ? data.signals : data.signals.slice(0, 3);

  return (
    <Card
      className={cn(
        "rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm",
        onNavigate && "cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
      )}
      onClick={onNavigate}
    >
      <div className={cn(
        "h-1 bg-gradient-to-r",
        hasReduce
          ? "from-destructive/40 via-chart-4/25 to-chart-1/40"
          : hasSignals
            ? "from-chart-4/40 via-primary/20 to-chart-1/40"
            : "from-chart-1/40 via-chart-1/20 to-chart-1/40"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <DollarSign className="h-3.5 w-3.5" /> Pricing Intel
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
            {data.hold_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-4 bg-chart-4/10 border-chart-4/30">
                {data.hold_count} Hold
              </Badge>
            )}
            {data.total_signals > 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="p-0.5 rounded hover:bg-muted/50 transition-colors"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {hasSignals ? (
          <>
            {visibleSignals.map((s, i) => (
              <SignalRow key={`${s.listing_id}-${s.pricing_signal}-${i}`} signal={s} />
            ))}
            {!expanded && data.total_signals > 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                +{data.total_signals - 3} more signals
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <CheckCircle2 className="h-4 w-4 text-chart-1 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">All listings priced within optimal range</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default PricingIntelligenceCard;
