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
  useDealTimingSignals,
  type DealTimingEntry,
  type DealSignal,
  type TimingConfidence,
} from "@/hooks/useDealTimingSignals";
import {
  Crosshair,
  Layers,
  Pause,
  LogOut,
  ShieldCheck,
  Shield,
  Radio,
  Timer,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const signalConfig: Record<DealSignal, { icon: typeof Crosshair; color: string; bg: string; border: string; label: string }> = {
  STRONG_BUY:   { icon: Crosshair, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Strong Buy" },
  ACCUMULATE:   { icon: Layers, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Accumulate" },
  HOLD:         { icon: Pause, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Hold" },
  EXIT_WARNING: { icon: LogOut, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Exit" },
};

const confConfig: Record<TimingConfidence, { icon: typeof ShieldCheck; color: string; label: string }> = {
  HIGH_CONVICTION:     { icon: ShieldCheck, color: "text-chart-1", label: "High" },
  MODERATE_CONVICTION: { icon: Shield, color: "text-chart-4", label: "Mod" },
  EARLY_SIGNAL:        { icon: Radio, color: "text-muted-foreground", label: "Early" },
};

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return String(price);
}

function SignalRow({ entry }: { entry: DealTimingEntry }) {
  const sc = signalConfig[entry.deal_signal];
  const cc = confConfig[entry.confidence_level];
  const Icon = sc.icon;
  const ConfIcon = cc.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-default", sc.border, sc.bg)}>
            <div className={cn("p-1 rounded-md shrink-0", sc.bg)}>
              <Icon className={cn("h-3.5 w-3.5", sc.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold truncate block">{entry.title}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{entry.city}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] font-medium text-foreground">Rp {formatPrice(entry.price)}</span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] text-muted-foreground">Rank {entry.metrics.investment_rank}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 font-bold", sc.color, sc.bg, sc.border)}>
                {sc.label}
              </Badge>
              <ConfIcon className={cn("h-3 w-3", cc.color)} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[280px] text-[10px] space-y-1.5">
          <p className="font-medium">Strategy:</p>
          <p>{entry.strategic_reasoning}</p>
          <div className="flex gap-2 flex-wrap pt-1">
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Growth: {entry.metrics.growth_score}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Liquidity: {entry.metrics.liquidity_score}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Demand: {entry.metrics.demand_score}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Yield: {entry.metrics.rental_yield}%</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Cycle: {entry.metrics.market_cycle}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const DealTimingSignalCard = React.memo(function DealTimingSignalCard() {
  const { data, isLoading } = useDealTimingSignals(12);
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

  const visible = expanded ? data.signals : data.signals.slice(0, 4);

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        data.exit_count > 0
          ? "from-destructive/40 via-chart-4/20 to-chart-1/20"
          : data.strong_buy_count > 0
            ? "from-chart-1/40 via-primary/25 to-chart-4/20"
            : "from-chart-4/30 via-muted/20 to-chart-4/30"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Timer className="h-3.5 w-3.5" /> Deal Timing Signals
          </span>
          <div className="flex items-center gap-1.5">
            {data.strong_buy_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-1 bg-chart-1/10 border-chart-1/30">
                <Crosshair className="h-3 w-3" /> {data.strong_buy_count}
              </Badge>
            )}
            {data.accumulate_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 text-primary bg-primary/10 border-primary/30">
                {data.accumulate_count} Acc
              </Badge>
            )}
            {data.exit_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-destructive bg-destructive/10 border-destructive/30">
                <LogOut className="h-3 w-3" /> {data.exit_count}
              </Badge>
            )}
            {data.market_cycle && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 text-muted-foreground">
                {data.market_cycle}
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
            {visible.map((e, i) => (
              <SignalRow key={`${e.listing_id}-${i}`} entry={e} />
            ))}
            {!expanded && data.total > 4 && (
              <button onClick={() => setExpanded(true)} className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1">
                +{data.total - 4} more signals
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <Timer className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">No timing signals generated</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default DealTimingSignalCard;
