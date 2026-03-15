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
  useDealClosingTimeline,
  type ClosingPrediction,
  type ClosingWindow,
  type NegotiationIntensity,
  type UrgencySignal,
} from "@/hooks/useDealClosingTimeline";
import {
  Clock,
  Zap,
  Timer,
  Hourglass,
  Users,
  Scale,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const closingConfig: Record<ClosingWindow, { icon: typeof Zap; color: string; bg: string; border: string; label: string }> = {
  FAST_CLOSE:     { icon: Zap, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Fast Close" },
  MODERATE_CLOSE: { icon: Timer, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Moderate" },
  SLOW_CLOSE:     { icon: Hourglass, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Slow Close" },
};

const negotiationConfig: Record<NegotiationIntensity, { icon: typeof Users; color: string; label: string }> = {
  COMPETITIVE_BUYER_MARKET: { icon: Users, color: "text-chart-1", label: "Competitive" },
  BALANCED_NEGOTIATION:     { icon: Scale, color: "text-chart-4", label: "Balanced" },
  PRICE_RESISTANCE_RISK:    { icon: ShieldAlert, color: "text-destructive", label: "Resistance" },
};

const urgencyConfig: Record<UrgencySignal, { color: string; label: string }> = {
  IMMEDIATE_FOLLOWUP:  { color: "text-destructive", label: "Immediate" },
  STRATEGIC_NURTURING: { color: "text-chart-4", label: "Nurturing" },
  LONG_TERM_LISTING:   { color: "text-muted-foreground", label: "Long-term" },
};

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return String(price);
}

function PredictionRow({ prediction }: { prediction: ClosingPrediction }) {
  const cc = closingConfig[prediction.closing_window_prediction];
  const nc = negotiationConfig[prediction.negotiation_intensity];
  const uc = urgencyConfig[prediction.urgency_signal];
  const Icon = cc.icon;
  const NIcon = nc.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-default",
            cc.border, cc.bg
          )}>
            <div className={cn("p-1 rounded-md shrink-0", cc.bg)}>
              <Icon className={cn("h-3.5 w-3.5", cc.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold truncate">{prediction.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 font-bold", cc.color, cc.bg, cc.border)}>
                    ~{prediction.estimated_days}d
                  </Badge>
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", cc.color, cc.bg, cc.border)}>
                    {cc.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{prediction.city}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] font-medium text-foreground">Rp {formatPrice(prediction.price)}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <NIcon className={cn("h-2.5 w-2.5", nc.color)} />
                <span className={cn("text-[9px]", nc.color)}>{nc.label}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className={cn("text-[9px] font-medium", uc.color)}>{uc.label}</span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[280px] text-[10px] space-y-1.5">
          <p className="font-medium">Strategy:</p>
          <p>{prediction.strategy_note}</p>
          <div className="flex gap-2 flex-wrap pt-1">
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Deal: {prediction.metrics.deal_score}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Demand: {prediction.metrics.demand_signal}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Inquiries: {prediction.metrics.inquiries}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Views: {prediction.metrics.views}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Active: {prediction.metrics.days_active}d</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const DealClosingTimelineCard = React.memo(function DealClosingTimelineCard() {
  const { data, isLoading } = useDealClosingTimeline(12);
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

  const hasFast = data.fast_close_count > 0;
  const hasPredictions = data.total > 0;
  const visiblePredictions = expanded ? data.predictions : data.predictions.slice(0, 3);

  return (
    <Card className={cn(
      "rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm"
    )}>
      <div className={cn(
        "h-1 bg-gradient-to-r",
        hasFast
          ? "from-chart-1/40 via-chart-4/25 to-destructive/30"
          : hasPredictions
            ? "from-chart-4/40 via-primary/20 to-muted/30"
            : "from-chart-1/40 via-chart-1/20 to-chart-1/40"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Clock className="h-3.5 w-3.5" /> Closing Timeline
          </span>
          <div className="flex items-center gap-1.5">
            {data.fast_close_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-1 bg-chart-1/10 border-chart-1/30">
                <Zap className="h-3 w-3" /> {data.fast_close_count}
              </Badge>
            )}
            {data.moderate_close_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-4 bg-chart-4/10 border-chart-4/30">
                {data.moderate_close_count} Mid
              </Badge>
            )}
            {data.slow_close_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-destructive bg-destructive/10 border-destructive/30">
                {data.slow_close_count} Slow
              </Badge>
            )}
            {data.total > 3 && (
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
        {hasPredictions ? (
          <>
            {visiblePredictions.map((p, i) => (
              <PredictionRow key={`${p.listing_id}-${i}`} prediction={p} />
            ))}
            {!expanded && data.total > 3 && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                +{data.total - 3} more predictions
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <CheckCircle2 className="h-4 w-4 text-chart-1 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">No active predictions available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default DealClosingTimelineCard;
