import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useMarketCyclePrediction,
  type MacroCyclePhase,
  type CycleConfidence,
  type InvestmentSignal,
} from "@/hooks/useMarketCyclePrediction";
import {
  TrendingUp,
  Mountain,
  TrendingDown,
  RefreshCw,
  ShieldCheck,
  Shield,
  Radio,
  Activity,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const phaseConfig: Record<MacroCyclePhase, { icon: typeof TrendingUp; color: string; bg: string; border: string; label: string }> = {
  EXPANSION:  { icon: TrendingUp, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Expansion" },
  PEAK_RISK:  { icon: Mountain, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", label: "Peak Risk" },
  CORRECTION: { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Correction" },
  RECOVERY:   { icon: RefreshCw, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Recovery" },
};

const confConfig: Record<CycleConfidence, { icon: typeof ShieldCheck; color: string; label: string }> = {
  HIGH:         { icon: ShieldCheck, color: "text-chart-1", label: "High Confidence" },
  MODERATE:     { icon: Shield, color: "text-chart-4", label: "Moderate" },
  EARLY_SIGNAL: { icon: Radio, color: "text-muted-foreground", label: "Early Signal" },
};

const signalLabels: Record<string, string> = {
  AGGRESSIVE_ACCUMULATION: "Aggressive Buy",
  SELECTIVE_BUY: "Selective Buy",
  MONITOR_AND_PREPARE: "Monitor & Prepare",
  TAKE_PROFIT: "Take Profit",
  REDUCE_EXPOSURE: "Reduce Exposure",
  HEDGE_POSITIONS: "Hedge Positions",
  CAPITAL_PRESERVATION: "Preserve Capital",
  SELECTIVE_VALUE_BUY: "Value Hunt",
  DEFENSIVE_ALLOCATION: "Defensive",
  STRATEGIC_ACCUMULATION: "Strategic Buy",
  GRADUAL_ENTRY: "Gradual Entry",
  WATCH_AND_WAIT: "Watch & Wait",
  BALANCED_HOLD: "Hold",
};

function TrendArrow({ value }: { value: number }) {
  if (value > 3) return <ArrowUp className="h-3 w-3 text-chart-1" />;
  if (value < -3) return <ArrowDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function SignalBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">{label}</span>
        <span className="text-[9px] font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 65 ? "bg-chart-1" : pct >= 40 ? "bg-chart-4" : "bg-destructive"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const MarketCyclePredictionCard = React.memo(function MarketCyclePredictionCard() {
  const { data, isLoading } = useMarketCyclePrediction();

  if (isLoading || !data) {
    return (
      <Card className="rounded-2xl border-border/30 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const pc = phaseConfig[data.market_cycle_phase];
  const cc = confConfig[data.confidence_level];
  const PhaseIcon = pc.icon;
  const ConfIcon = cc.icon;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn("h-1 bg-gradient-to-r", pc.bg, "via-transparent", pc.bg)} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Activity className="h-3.5 w-3.5" /> Market Cycle
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 gap-1 font-bold", pc.color, pc.bg, pc.border)}>
              <PhaseIcon className="h-3 w-3" /> {pc.label}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 gap-1", cc.color)}>
              <ConfIcon className="h-3 w-3" /> {cc.label}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Composite + Investment Signal */}
        <div className={cn("flex items-center justify-between p-2 rounded-lg border", pc.border, pc.bg)}>
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold", pc.color)}>{data.composite_score}</span>
            <span className="text-[9px] text-muted-foreground">Composite</span>
          </div>
          <Badge variant="outline" className={cn("text-[9px] h-5 px-2 font-semibold", pc.color, pc.bg, pc.border)}>
            {signalLabels[data.strategic_investment_signal] || data.strategic_investment_signal}
          </Badge>
        </div>

        {/* Current Signals */}
        <div className="grid grid-cols-2 gap-2">
          <SignalBar label="Demand" value={data.current_signals.demand} />
          <SignalBar label="Growth" value={data.current_signals.growth} />
          <SignalBar label="Liquidity" value={data.current_signals.liquidity} />
          <SignalBar label="Deal Prob" value={data.current_signals.deal_probability} />
        </div>

        {/* Trends */}
        <div className="flex items-center gap-3 flex-wrap">
          {([
            ['Demand', data.trends.demand_momentum],
            ['Growth', data.trends.growth_trend],
            ['Liquidity', data.trends.liquidity_trend],
            ['Deal', data.trends.deal_trend],
          ] as [string, number][]).map(([label, val]) => (
            <div key={label} className="flex items-center gap-1">
              <TrendArrow value={val} />
              <span className="text-[9px] text-muted-foreground">{label}</span>
              <span className={cn("text-[9px] font-medium", val > 0 ? "text-chart-1" : val < 0 ? "text-destructive" : "text-muted-foreground")}>
                {val > 0 ? '+' : ''}{val}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/30 pt-2">
          {data.macro_trend_summary}
        </p>

        {/* Regional Leaders */}
        {data.regional_breakdown.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Top Regions</span>
            <div className="flex gap-1.5 flex-wrap">
              {data.regional_breakdown.slice(0, 5).map((r) => (
                <Badge key={r.city} variant="outline" className="text-[8px] h-4 px-1.5 text-muted-foreground">
                  {r.city} <span className="ml-1 text-chart-1">{r.growth}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default MarketCyclePredictionCard;
